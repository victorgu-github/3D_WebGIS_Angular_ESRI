'use strict';

module.exports = function ($scope, $routeParams, $timeout, $window, formValidator, appConfig, dashTableConfig,
  AccountService, loraDeviceService, dashboardSharedService, MulticastGroupSharedService) {

  //////////////////////////////////////////////////////////
  //
  // Constant Variable
  //
  //////////////////////////////////////////////////////////

  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING: "editing",
    INVALID: "invalid"
  };
  const defaultErrorMessage = "Fields with * symbol should be valid and not empty.";

  //////////////////////////////////////////////////////////
  //
  // Global Variable
  //
  //////////////////////////////////////////////////////////

  //1.From Account Service
  let userInfo =   AccountService.userInfo;
  let appIDRange = userInfo.appIDs;
  let ClassRange = dashTableConfig.MulticastGroup.systemParams.Class;

  //////////////////////////////////////////////////////////
  //
  // $scope Variable
  //
  //////////////////////////////////////////////////////////

  $scope.applicationIDs = [];
  $scope.applicationIDs = $scope.applicationIDs.concat(appIDRange);
  $scope.bandIDMap = {};
  $scope.subTypeMap = {};
  $scope.formStatus = FORM_STATUS.EDITING;
  $scope.errorMessage = defaultErrorMessage;
  $scope.collapse = true;

  //////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  //////////////////////////////////////////////////////////

  //Init Drop Down List for Registry Form
  initCandidateValues(appIDRange);

  //////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  //////////////////////////////////////////////////////////

  //Close Alert
  $scope.closeAlert = function () {
    $scope.formStatus = FORM_STATUS.EDITING;
    $scope.errorMessage = defaultErrorMessage;
  };

  //Update Sub Types
  $scope.updateSubTypes = function () {
    updateSubTypes();
  };

  // Change collapse sign status
  $scope.changeCollapse = function () {
    $scope.collapse = !$scope.collapse;
  };

  //Register LoRa Multicast Group
  $scope.finish = function (isValid) {
    $scope.closeAlert();
    let registerEntry = {};

    //Init registerEntry fields, if fields exist, include it into the registerEntry
    //Init Required Fields
    if ($scope.ApplicationID !== undefined) {
      registerEntry.ApplicationID = $scope.ApplicationID;
    }

    if ($scope.DevType !== undefined) {
      registerEntry.DevType = $scope.DevType;
    }

    if ($scope.SubType !== undefined) {
      registerEntry.SubType = $scope.SubType;
    }

    if ($scope.Class !== undefined) {
      registerEntry.Class = dashboardSharedService.parseClass($scope.Class, $scope.classes);
    }

    if ($scope.BandID !== undefined) {
      registerEntry.BandID = dashboardSharedService.parseBandID($scope.BandID, $scope.bandIDs);
    }

    if ($scope.Freq !== undefined) {
      registerEntry.Freq = $scope.Freq;
    }

    if ($scope.Dr !== undefined) {
      registerEntry.Dr = $scope.Dr;
    }

    //Init Optional Fields
    //For optional fields, we need extra validate:
    //If you input a number in FCntDown etc. field and then remove it, chrome will assign null to input = number, we need exclude null
    //If you input a text in MulticastAddr etc. field and then remove it, chrome will assign "" to input = text, we need exclude ""
    if ($scope.FCntDown !== undefined && $scope.FCntDown !== null) {
      registerEntry.FCntDown = $scope.FCntDown;
    }

    if ($scope.TxPower !== undefined && $scope.TxPower !== null) {
      registerEntry.TxPower = $scope.TxPower;
    }

    if ($scope.MulticastAddr !== undefined && $scope.MulticastAddr !== "") {
      registerEntry.MulticastAddr = $scope.MulticastAddr;
    }

    if ($scope.NwkSKey !== undefined && $scope.NwkSKey !== "") {
      registerEntry.NwkSKey = $scope.NwkSKey;
    }

    if ($scope.AppSKey !== undefined && $scope.AppSKey !== "") {
      registerEntry.AppSKey = $scope.AppSKey;
    }

    if ($scope.Name !== undefined && $scope.Name !== "") {
      registerEntry.Name = $scope.Name;
    }

    if ($scope.Description !== undefined && $scope.Description !== null) {
      registerEntry.Description = $scope.Description;
    }

    if (isValid || isValid === undefined) {
      // Register lora device under MulticastGroup Mode, use one-step register web api
      MulticastGroupSharedService.registerMulticastGroup(registerEntry).then(function (response) {
        if (response.status === "success") {
          $scope.formStatus = FORM_STATUS.SUBMITTED;
          $window.alert("LoRa Multicast Group has been successfully created!");
          $window.location.href = '/#/dashboard/overview';
        }
      }).catch(function (error) {
        $scope.formStatus = FORM_STATUS.INVALID;
        $scope.errorMessage = MulticastGroupSharedService.parseErrorMessage(error.errors);
        $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      });
    }
    else {
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      $scope.initializing = false;
      $scope.formStatus = FORM_STATUS.INVALID;
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  // Init Candidate Values for Application IDs, Device Types, Band IDs, Classes, Sub Types
  function initCandidateValues() {
    if (dashboardSharedService.candidateValues) {
      initMulticastGroupCandidateValues();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          initMulticastGroupCandidateValues();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initMulticastGroupCandidateValues() {
    $scope.deviceTypes = dashboardSharedService.candidateValues.DevType;
    $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
    //For multicast group register, we can only display the class 1, 2 ('B', 'C') in select dropdown list
    $scope.classes = dashboardSharedService.parseDefaultClasses(ClassRange);
    $scope.subDeviceTypes = dashboardSharedService.candidateValues.subDeviceTypes;
    $scope.subTypeMap = MulticastGroupSharedService.parseSubTypeMap($scope.subDeviceTypes);

    // Init application ids array and its default value
    $scope.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);

    // Init device types array and its default value
    $scope.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);

    // Init band id array and its default value
    $scope.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);

    // Init classes array and its default value
    $scope.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.classes);

    // Init sub types array and it default value
    updateSubTypes();
  }

  function updateSubTypes() {
    //Get the subTypes for current device type
    //1.If device type has subTypes, $scope.subTypes will be subTypes array
    //2.If device type doesn't have subTypes, $scope.subTypes will be empty array
    $scope.subTypes = MulticastGroupSharedService.parseCurrentSubTypes($scope.DevType, $scope.subTypeMap);

    // If device type's sub types is not empty, we should add "" into sub types array
    // We should let the customer choose "" as one option
    MulticastGroupSharedService.addEmptyStringToArray($scope.subTypes);

    // When change the device type:
    // If device type has sub types, we should set the $scope.SubType as the first element of subTypes
    // If device type doesn't sub types, we should set the $scope.SubType as undefined and not include in the register entry
    $scope.SubType = $scope.subTypes.length !== 0 ? $scope.subTypes[0] : undefined;
  }
};
