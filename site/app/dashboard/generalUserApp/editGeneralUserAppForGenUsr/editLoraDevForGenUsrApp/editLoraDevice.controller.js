'use strict';

module.exports = function ($scope, $rootScope, $window, $location, $routeParams, dashTableConfig, formValidator, loraDeviceService,
  dashboardSharedService, editSharedService) {
  //Const used for error message
  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING: "editing",
    INVALID: "invalid"
  };
  const defaultErrorMessage = "Fields with * symbol should be valid and not empty.";
  const GEO_JSON  = "GeoJSON";
  const REF_LAT   = "RefLat";
  const REF_LON   = "RefLon";

  let updatedAttributes         = dashTableConfig.Devices.LoraDevice.updatedAttributes;
  //Class range determine which class will need to provide multicastAddrArray
  let ClassRange                = dashTableConfig.Devices.LoraDevice.systemParams.Class;
  //Return to edit general user application page
  let generalUserApplicationID  = $routeParams.generalUserApplicationID;
  let EDIT_GENERAL_USER_APP_URL = dashTableConfig.GeneralUserApplicationForGenUsr.EDIT_GENERAL_USER_APP_URL;
  //Edit Lora Device Error Message Map, use map to change error message,
  let EditLoraDevErrMsgMap = dashTableConfig.CommonMapAttr.EditLoraDevErrMsgMap;
  //Determine if user coming from general user platform
  let isComingFromGeneralUserPlatform = $routeParams.returnUrl ? true : false;

  $scope.loraDeviceTableUrl   = dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;
  $scope.generalUsrAppEditUrl = isComingFromGeneralUserPlatform ? $routeParams.returnUrl : EDIT_GENERAL_USER_APP_URL + generalUserApplicationID;
  $scope.applicationID        = $routeParams.applicationID;
  $scope.devEUI               = $routeParams.devEUI;
  $scope.formStatus           = FORM_STATUS.EDITING;
  $scope.errorMessage         = defaultErrorMessage;
  $scope.initializing         = true;
  $scope.editEntry            = {};
  $scope.editDevice           = {};
  $scope.subTypeMap;
  $scope.disabledMulticastAddrArray;

  ////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  ////////////////////////////////////////////////////////
  
  initEditLoraDevicePage();

  ////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  ////////////////////////////////////////////////////////

  // Close the error message
  $scope.closeAlert = function () {
    $scope.formStatus = FORM_STATUS.EDITING;
    $scope.errorMessage = defaultErrorMessage;
  };

  // Update Sub Types
  $scope.updateSubTypes = function () {
    // Every time when we select a new device type, the default sub type should be reset to ""
    $scope.editEntry.SubType = "";
    $scope.subTypes = getSubTypes($scope.subTypeMap, $scope.editEntry);
  };

  $scope.returnPreviousPage = function () {
    dashboardSharedService.returnPreviousPage(isComingFromGeneralUserPlatform, $scope.generalUsrAppEditUrl);
  };

  ////////////////////////////////////////////////////////
  //
  // Update Function
  //
  ////////////////////////////////////////////////////////

  // Finish and update lora device info
  $scope.finish = function (isValid) {
    closeAlert();
    $scope.formStatus = FORM_STATUS.SUBMITTED;
    let editEntry = {};
    // Prepare the put request body
    // 1.Disabled fields which must be sent:          "ApplicationID", "DevEUI"
    // 2.Disabled fields which must not be sent:      "AppEUI", "BandID", "DevAddr", "PingOffsetClassB", "PktLossRate", "UserPayloadDataLen", 
    //                                                "ValidMulticastAddrNum", "IsClassC", "ABP"
    // 3.Disabled fields which sent or not depending: "SubType"            -- send under valid "DevType", such as "smartswitch"
    //                                                "MulticastAddrArray" -- send under valid "Class", such as Class 1/2
    // 4.Normal fields will send
    for (let key in $scope.editEntry) {
      //If key is normal key value, we will send it as previous, which also including "ApplicationID" and "DevEUI"
      if (updatedAttributes.includes(key)) {
        editEntry[key] = $scope.editEntry[key];
      }
    }

    // Convert special fields
    // The fields below need to do value transformation, because there is a hidden login in web service
    // Get web service: return RelaxFCnt field as true or false
    // Put web service: require RelaxFCnt field send 1 or 0
    if (editEntry.RelaxFCnt !== undefined) {
      editEntry.RelaxFCnt = editEntry.RelaxFCnt === true ? 1 : 0;
    }
    if (editEntry.Class !== undefined) {
      editEntry.Class = dashboardSharedService.parseClass(editEntry.Class, $scope.classes);
    }

    // If key is "SubType", we will send editEntry.SubType when $sccope.editEntry.DevType is valid device type
    // Such as "smartswitch" which has SubType
    if ($scope.subTypeMap[$scope.editEntry.DevType] !== undefined) {
      editEntry.SubType = $scope.editEntry.SubType;
    } else {
      delete editEntry.SubType;
    }

    // 1.If Class is 0, don't send editEntry.MulticastAddrArray
    // 2.If Class is 1 or 2, and never change $scope.editEntry.MulticastAddrArray, $scope.editEntry.MulticastAddrArray will be
    //   an array as we fetch it from backend. It is not a string so that we cannot parse it, just use it origin value
    if (ClassRange.includes(dashboardSharedService.parseClass($scope.editEntry.Class, $scope.classes))) {
      editEntry.MulticastAddrArray = $scope.editEntry.MulticastAddrArray;
    }
    else {
      delete editEntry.MulticastAddrArray;
    }

    // Don't validate here, all validation put on backend
    if (isValid || isValid === undefined) {
      // Latitude and Longitude work together, if you want to set latitude and longitude null in database
      // please set both of them empty
      let validRefLatAndRefLonVal = formValidator.validRefLatAndRefLonForPut(editEntry);
      if (validRefLatAndRefLonVal) {
        loraDeviceService.updateLoraDevice(editEntry).then(function (response) {
          if (response.status === "success") {
            $window.alert("Lora device successfully update");
            dashboardSharedService.returnPreviousPage(isComingFromGeneralUserPlatform, $scope.generalUsrAppEditUrl);
          }
        }).catch(function (error) {
          $scope.formStatus = FORM_STATUS.INVALID;
          // Notice: Right now we restrict update 5 multicast address for lora device, if the number is more than 5
          //         backend will throw error. But right now the back end error has some problem, it has been separated
          //         to 3 sections.
          $scope.errorMessage = dashboardSharedService.parseErrorMessage(error.errors);
          for (let key in EditLoraDevErrMsgMap) {
            if ($scope.errorMessage.includes(key)) {
              $scope.errorMessage = $scope.errorMessage.replace(key, EditLoraDevErrMsgMap[key]);
            }
          }
          $window.alert("Error occurred due to: \n" + $scope.errorMessage);
          angular.element(".dashboard-edit-page-container").scrollTop(0);
        });
      }
      else {
        $window.alert("Latitude and Longitude works together. If you want to assign value, please assign value for both of them. If you want to clear value, please remove value for both of them.");
      }
    }
    else {
      $scope.formStatus = FORM_STATUS.INVALID;
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      angular.element(".dashboard-edit-page-container").scrollTop(0);
    }
  };

  ////////////////////////////////////////////////////////
  //
  // Private Function
  //
  ////////////////////////////////////////////////////////

  function closeAlert() {
    $scope.formStatus = FORM_STATUS.EDITING;
    $scope.errorMessage = defaultErrorMessage;
  }

  function initEditLoraDevicePage() {
    if (dashboardSharedService.candidateValues) {
      initLoraDeviceInfo();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          initLoraDeviceInfo();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initLoraDeviceInfo() {
    $scope.deviceTypes = dashboardSharedService.candidateValues.DevType;
    $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
    $scope.classes = dashboardSharedService.parseDefaultClasses();
    $scope.subTypeMap = dashboardSharedService.getSubTypeMap(dashboardSharedService.candidateValues.subDeviceTypes);

    //Get lora device info use latest one-step web api
    loraDeviceService.getLoraDevice($routeParams.applicationID, $routeParams.devEUI).then(function (resp) {
      if (resp.status === "success" && resp.content !== null) {
        //Get lora device info and init $scope.editEntry, editSharedService.editSharedEntry and editSharedService.editOriginEntry
        //editSharedService.editSharedEntry and editSharedService.editOriginEntry is shared object can be used for count edit, command edit and maintenance status edit
        for (let key in resp.content) {
          if (key === "BandID") {
            $scope.editEntry[key] = dashboardSharedService.getMapValue(resp.content[key], $scope.bandIDs);
          }
          else if (key === "Class") {
            //If lora device class is 0, disabled multicastAddrArray
            //If lora device class is 1, 2, enable multicastAddrArray
            $scope.disabledMulticastAddrArray = !ClassRange.includes(resp.content[key]) ? true : false;
            $scope.editEntry[key] = dashboardSharedService.getMapValue(resp.content[key], $scope.classes);
            if (!$scope.disabledMulticastAddrArray) {
              initMulticastAddrArray();
            }
          }
          //GeoJSON object should be transfered to RefLat and RefLon to display
          else if (key === GEO_JSON && resp.content[key] !== null) {
            $scope.editEntry[REF_LAT] = resp.content[key].coordinates[0];
            $scope.editEntry[REF_LON] = resp.content[key].coordinates[1];
          }
          else if (key === GEO_JSON && resp.content[key] === null) {
            $scope.editEntry[REF_LAT] = null;
            $scope.editEntry[REF_LON] = null;
          }
          else {
            $scope.editEntry[key] = resp.content[key];
          }
          editSharedService.editSharedEntry[key] = resp.content[key];
          editSharedService.editOriginEntry[key] = resp.content[key];
        }
        $scope.subTypes = getSubTypes($scope.subTypeMap, $scope.editEntry);
        //Using ApplicationID and DevEUI, init editSharedService.editSharedMaintenanceEntry
        loraDeviceService.getMaintenanceComments($scope.editEntry.ApplicationID, $scope.editEntry.DevEUI).then(function (response) {
          if (response.status === "success") {
            editSharedService.editSharedMaintenanceEntry.ApplicationID   = $scope.editEntry.ApplicationID;
            editSharedService.editSharedMaintenanceEntry.DevEUI          = $scope.editEntry.DevEUI;
            editSharedService.editSharedMaintenanceEntry.InitialMtStatus = $scope.editEntry.InMaintenance;
            editSharedService.editSharedMaintenanceEntry.CurrentMtStatus = $scope.editEntry.InMaintenance;
            //If lora device is in maintenance status, init mtStartTime and mtPreviousComments, and display them in edit maintenance status page
            if (editSharedService.editSharedEntry.InMaintenance) {
              editSharedService.editSharedMaintenanceEntry.mtStartTime = new Date(response.content.startTime);
              editSharedService.editSharedMaintenanceEntry.mtStartTime = editSharedService.editSharedMaintenanceEntry.mtStartTime.toString().slice(0, 24);
              editSharedService.editSharedMaintenanceEntry.mtPreviousComments = response.content.comments;
            }
          }
          $scope.initializing = false;
        }).catch(function (error) {
          $scope.formStatus = FORM_STATUS.INVALID;
          $scope.errorMessage = error.errors[0].message;
          $window.alert($scope.errorMessage);
          $scope.initializing = false;
        });
      }
      else if (resp.status === "success" && resp.content === null) {
        $scope.formStatus = FORM_STATUS.INVALID;
        $scope.errorMessage = "this device cannot be found in the system";
        $window.alert($scope.errorMessage);
        $scope.initializing = false;
      }
    }).catch(function (error) {
      $scope.formStatus = FORM_STATUS.INVALID;
      $scope.errorMessage = error.errors[0].message;
      $window.alert($scope.errorMessage);
      $scope.initializing = false;
    });
  }

  function getSubTypes(subTypeMap, editEntry) {
    let subTypes = [];
    subTypes = subTypeMap[editEntry.DevType];
    if (subTypes !== undefined && subTypes !== null) {
      if (subTypes.length !== 0 && !subTypes.includes("")) {
        subTypes.unshift("");
      }
    }
    return subTypes;
  }

  // Init multicast addr array according to application id
  function initMulticastAddrArray() {
    $scope.multicastAddrArray = [];
    dashboardSharedService.initMulticastAddrArrayForAllMode([$routeParams.applicationID]).then(function (resp) {
      $scope.multicastAddrArray = resp.sort();
      $rootScope.$broadcast("initLoraDevMulticastAddrArrayForGenUsr", {
        MulticastAddrArray: $scope.editEntry.MulticastAddrArray
      });
    });
  }
};
