'use strict';

module.exports = function ($scope, $window, $location, $routeParams, dashTableConfig, formValidator, AccountService, 
  loraDeviceService, newLoraDeviceService, dashboardSharedService, GeneralUserAppSharedService) {

  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };
  const defaultErrorMessage = "Fields with * symbol should be valid and not empty.";

  //Variable used to validate required fields of ABP mode and OTAA mode
  let ABP_REQUIRED_FIELDS  = dashTableConfig.GeneralUserApplicationForGenUsr.loraDevRegRequiredFields.ABP;
  let OTAA_REQUIRED_FIELDS = dashTableConfig.GeneralUserApplicationForGenUsr.loraDevRegRequiredFields.OTAA;
  //Variable used to separate the ABP mode and OTAA mode
  let ABP  = "ABP";
  let OTAA = "OTAA";
  //Class range determine which class will need to provide multicastAddrArray
  let ClassRange = dashTableConfig.Devices.LoraDevice.systemParams.Class;

  // TODO: Extract to config file
  $scope.EUIPattern       = formValidator.regex.EUIPattern;
  $scope.AddrPattern      = formValidator.regex.AddrPattern;
  $scope.ABPFormStatus    = FORM_STATUS.EDITING;
  $scope.OTAAFormStatus   = FORM_STATUS.EDITING;
  $scope.shakeError       = false;
  $scope.initializing     = true;
  $scope.ABPErrorMessage  = defaultErrorMessage;
  $scope.OTAAErrorMessage = defaultErrorMessage;

  let loraApplicationID         = AccountService.userInfo.loraApplicationID;
  let generalUserApplicationID  = $routeParams.generalUserApplicationID;
  let EDIT_GENERAL_USER_APP_URL = dashTableConfig.GeneralUserApplicationForGenUsr.EDIT_GENERAL_USER_APP_URL;
  //Determine if user is coming from general user platform
  let isComingFromGeneralUserPlatform = $routeParams.returnUrl ? true : false;

  //$scope.ABPRegisterForm and $scope.OTAARegisterForm cannot assign the value at the same time
  //otherwise, it will cause reference type error, both of them point to the same reference variable
  let registerDefaultValue    = dashTableConfig.Devices.LoraDevice.registerDefaultValue;
  $scope.generalUsrAppEditUrl = isComingFromGeneralUserPlatform ? $routeParams.returnUrl : EDIT_GENERAL_USER_APP_URL + generalUserApplicationID;
  $scope.ABPRegisterForm      = registerDefaultValue.ABP_DEFAULT_VALUES;
  $scope.OTAARegisterForm     = registerDefaultValue.OTAA_DEFAULT_VALUES;
  $scope.ABPCollapse          = true;
  $scope.OTAACollapse         = true;
  $scope.initializing         = false;
  $scope.subTypeMap;
  $scope.csvFileNoValidMulticastAddrClasses;

  //////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  //////////////////////////////////////////////////////////

  initCandidateValues();
  initMulticastAddrArrayForAllMode();

  //////////////////////////////////////////////////////////
  //
  // Close Alert Function
  //
  //////////////////////////////////////////////////////////

  $scope.ABPCloseAlert = function () {
    $scope.ABPFormStatus = FORM_STATUS.EDITING;
    $scope.ABPErrorMessage = defaultErrorMessage;
  };

  $scope.OTAACloseAlert = function () {
    $scope.OTAAFormStatus = FORM_STATUS.EDITING;
    $scope.OTAAErrorMessage = defaultErrorMessage;
  };

  //////////////////////////////////////////////////////////
  //
  // Update SubTypes Array Function
  //
  //////////////////////////////////////////////////////////

  $scope.updateABPSubTypes = function () {
    updateABPSubTypes();
  };

  $scope.updateOTAASubTypes = function () {
    updateOTAASubTypes();
  };

  //////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  //////////////////////////////////////////////////////////

  // Change collapse sign status
  $scope.changeABPCollapse = function () {
    $scope.ABPCollapse = !$scope.ABPCollapse;
  };

  $scope.changeOTAACollapse = function () {
    $scope.OTAACollapse = !$scope.OTAACollapse;
  };

  $scope.showABPMtAddrArr = function () {
    let result;
    if (ClassRange.includes(dashboardSharedService.parseClass($scope.ABPRegisterForm.Class, $scope.ABPClasses))) {
      result = true;
    }
    else {
      result = false;
    }
    return result;
  };

  $scope.showOTAAMtAddrArr = function () {
    let result;
    if (ClassRange.includes(dashboardSharedService.parseClass($scope.OTAARegisterForm.Class, $scope.OTAAClasses))) {
      result = true;
    }
    else {
      result = false;
    }
    return result;
  };

  $scope.returnPreviousPage = function () {
    dashboardSharedService.returnPreviousPage(isComingFromGeneralUserPlatform, $scope.generalUsrAppEditUrl);
  };

  //////////////////////////////////////////////////////////
  //
  // Single Device Register
  //
  //////////////////////////////////////////////////////////

  // Single device register for both ABP Mode and OTAA Mode
  // Separate the submit to two Mode, ABP Mode and OTAA Mode
  // Register a single device under ABP and OTAA Mode
  $scope.finish = function (type) {
    if (type === ABP) {
      $scope.ABPCloseAlert();
      $scope.registerForm = $scope.ABPRegisterForm;
      //1.Validate if user provide all the required fields in the register form
      let validationResult = formValidator.validateRegRequiredAttributes($scope.registerForm, ABP_REQUIRED_FIELDS);
      if (validationResult.status === "success") {
        //2.Assemble the registerEntry according to validated registerForm
        //2.1 Assemble the required fields
        let registerEntry = {
          uniqueValues: [
            {
              Name:      $scope.registerForm.Name,
              DevEUI:    $scope.registerForm.DevEUI,
              DevAddr:   $scope.registerForm.DevAddr,
              RefAlt:    $scope.registerForm.RefAlt,
              RefLat:    $scope.registerForm.RefLat,
              RefLon:    $scope.registerForm.RefLon
            }
          ],
          ApplicationID: loraApplicationID,
          DevType:       $scope.registerForm.DevType,
          ABP:           $scope.registerForm.ABP,
          BandID:        dashboardSharedService.parseBandID($scope.registerForm.BandID, $scope.bandIDs),
          Class:         dashboardSharedService.parseClass($scope.registerForm.Class, $scope.ABPClasses),
        };
        //2.2 Assemble the optional fields
        if ($scope.registerForm.Description !== undefined && $scope.registerForm.Description !== "") {
          registerEntry.uniqueValues[0].Description = $scope.registerForm.Description;
        }
        if ($scope.registerForm.NwkSKey !== undefined && $scope.registerForm.NwkSKey !== "") {
          registerEntry.uniqueValues[0].NwkSKey = $scope.registerForm.NwkSKey;
        }
        if ($scope.registerForm.AppSKey !== undefined && $scope.registerForm.AppSKey !== "") {
          registerEntry.uniqueValues[0].AppSKey = $scope.registerForm.AppSKey;
        }

        newLoraDeviceService.prepareMulticastAddrArrayAndSubType($scope.subTypeMap, $scope.registerForm, registerEntry, ClassRange);

        //3.Register lora device under ABP Mode, use one-step register web api
        let validRefLatAndRefLonVal = formValidator.validRefLatAndRefLonForPost(registerEntry);
        if (validRefLatAndRefLonVal) {
          $scope.ABPFormStatus = FORM_STATUS.SUBMITTED;
          loraDeviceService.regLoraDevice(registerEntry).then(function (response) {
            if (response.status === "success") {
              GeneralUserAppSharedService.getGeneralUsrAppsByGenUsrAppID([generalUserApplicationID]).then(function (app_resp) {
                if (app_resp.status === "success") {
                  let generalApp = app_resp.content[0];
                  let updateEntry = {
                    generalUserApplicationID: parseInt(generalUserApplicationID)
                  };
                  //Generate the updateEntry according to general user application lora exist or not
                  if (generalApp.lora) {
                    updateEntry.lora = {};
                    updateEntry.lora.loraApplicationID = loraApplicationID;
                    updateEntry.lora.devEUIs = [];
                    generalApp.lora.devices.forEach((device) => {
                      updateEntry.lora.devEUIs.push(device.DevEUI);
                    });
                    updateEntry.lora.devEUIs.push($scope.registerForm.DevEUI);
                  }
                  else {
                    updateEntry.lora = {};
                    updateEntry.lora.loraApplicationID = loraApplicationID;
                    updateEntry.lora.devEUIs = [$scope.registerForm.DevEUI];
                  }
                  GeneralUserAppSharedService.updateGeneralUsrApp(updateEntry).then(function (updateApp_resp) {
                    if (updateApp_resp.status === "success") {
                      $window.alert("Device has been successfully created!");
                      dashboardSharedService.returnPreviousPage(isComingFromGeneralUserPlatform, $scope.generalUsrAppEditUrl);
                    }
                    else {
                      $scope.ABPFormStatus = FORM_STATUS.INVALID;
                      $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(updateApp_resp.errors);
                      $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
                    }
                  });
                }
                else {
                  $scope.ABPFormStatus = FORM_STATUS.INVALID;
                  $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(app_resp.errors);
                  $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
                }
              });
            }
          }).catch(function (error) {
            $scope.ABPFormStatus = FORM_STATUS.INVALID;
            $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(error.errors);
            $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
          });
        }
        else {
          $window.alert("Latitude and Longitude works together. If you want to assign value, please assign value for both of them.");
        }
      }
      else {
        $scope.ABPFormStatus = FORM_STATUS.INVALID;
        $scope.ABPErrorMessage = validationResult.errorMessage;
        $window.alert(validationResult.errorMessage);
      }
    }
    else if (type === OTAA) {
      $scope.OTAACloseAlert();
      $scope.registerForm = $scope.OTAARegisterForm;
      //1.Validate if user provide all the required fields in the register form
      let validationResult = formValidator.validateRegRequiredAttributes($scope.registerForm, OTAA_REQUIRED_FIELDS);
      if (validationResult.status === "success") {
        //2.Assemble the registerEntry according to validated registerForm
        //2.1 Assemble the required fields
        let registerEntry = {
          uniqueValues: [
            {
              Name:      $scope.registerForm.Name,
              DevEUI:    $scope.registerForm.DevEUI,
              RefAlt:    $scope.registerForm.RefAlt,
              RefLat:    $scope.registerForm.RefLat,
              RefLon:    $scope.registerForm.RefLon
            }
          ],
          ApplicationID: loraApplicationID,
          DevType:       $scope.registerForm.DevType,
          ABP:           $scope.registerForm.ABP,
          BandID:        dashboardSharedService.parseBandID($scope.registerForm.BandID, $scope.bandIDs),
          Class:         dashboardSharedService.parseClass($scope.registerForm.Class, $scope.OTAAClasses),
        };
        //2.2 Assemble the optional fields
        if ($scope.registerForm.Description !== undefined && $scope.registerForm.Description !== "") {
          registerEntry.uniqueValues[0].Description = $scope.registerForm.Description;
        }
        if ($scope.registerForm.AppKey !== undefined && $scope.registerForm.AppKey !== "") {
          registerEntry.uniqueValues[0].AppKey = $scope.registerForm.AppKey;
        }

        newLoraDeviceService.prepareMulticastAddrArrayAndSubType($scope.subTypeMap, $scope.registerForm, registerEntry, ClassRange);

        //3.Register lora device under ABP Mode, use one-step register web api
        let validRefLatAndRefLonVal = formValidator.validRefLatAndRefLonForPost(registerEntry);
        if (validRefLatAndRefLonVal) {
          $scope.OTAAFormStatus = FORM_STATUS.SUBMITTED;
          loraDeviceService.regLoraDevice(registerEntry).then(function (response) {
            if (response.status === "success") {
              GeneralUserAppSharedService.getGeneralUsrAppsByGenUsrAppID([generalUserApplicationID]).then(function (app_resp) {
                if (app_resp.status === "success") {
                  let generalApp = app_resp.content[0];
                  let updateEntry = {
                    generalUserApplicationID: parseInt(generalUserApplicationID)
                  };
                  //Generate the updateEntry according to general user application lora exist or not
                  if (generalApp.lora) {
                    updateEntry.lora = {};
                    updateEntry.lora.loraApplicationID = loraApplicationID;
                    updateEntry.lora.devEUIs = [];
                    generalApp.lora.devices.forEach((device) => {
                      updateEntry.lora.devEUIs.push(device.DevEUI);
                    });
                    updateEntry.lora.devEUIs.push($scope.registerForm.DevEUI);
                  }
                  else {
                    updateEntry.lora = {};
                    updateEntry.lora.loraApplicationID = loraApplicationID;
                    updateEntry.lora.devEUIs = [$scope.registerForm.DevEUI];
                  }
                  GeneralUserAppSharedService.updateGeneralUsrApp(updateEntry).then(function (updateApp_resp) {
                    if (updateApp_resp.status === "success") {
                      $window.alert("Device has been successfully created!");
                      dashboardSharedService.returnPreviousPage(isComingFromGeneralUserPlatform, $scope.generalUsrAppEditUrl);
                    }
                    else {
                      $scope.ABPFormStatus = FORM_STATUS.INVALID;
                      $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(updateApp_resp.errors);
                      $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
                    }
                  });
                }
                else {
                  $scope.ABPFormStatus = FORM_STATUS.INVALID;
                  $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(app_resp.errors);
                  $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
                }
              });
            }
          }).catch(function (error) {
            $scope.OTAAFormStatus = FORM_STATUS.INVALID;
            $scope.OTAAErrorMessage = dashboardSharedService.parseErrorMessage(error.errors);
            $window.alert("Error occurred due to: \n" + $scope.OTAAErrorMessage);
          });
        }
        else {
          $window.alert("Latitude and Longitude works together. If you want to assign value, please assign value for both of them.");
        }
      }
      else {
        $scope.OTAAFormStatus = FORM_STATUS.INVALID;
        $scope.OTAAErrorMessage = validationResult.errorMessage;
        $window.alert(validationResult.errorMessage);
      }
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  function initCandidateValues() {
    if (dashboardSharedService.candidateValues) {
      initNewDeviceCandidateValues();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          initNewDeviceCandidateValues();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initNewDeviceCandidateValues() {
    let devTypeResp = dashboardSharedService.candidateValues.DevType;
    let bandIDResp = dashboardSharedService.candidateValues.BandID;
    $scope.subDeviceTypes = dashboardSharedService.candidateValues.subDeviceTypes;
    $scope.subTypeMap = dashboardSharedService.getSubTypeMap(dashboardSharedService.candidateValues.subDeviceTypes);

    // Init device types array and its default value
    $scope.deviceTypes = devTypeResp;
    $scope.ABPRegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);
    $scope.OTAARegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);

    // Init band id array and its default value
    $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(bandIDResp);
    $scope.ABPRegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
    $scope.OTAARegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);

    // Init classes array and its default value
    // Why separate ABPClasses, OTAAClasses:
    // 1.For candidate values: deviceTypes, bandIDs, they won't change for different model, so we don't need separate them
    $scope.csvFileNoValidMulticastAddrClasses = dashboardSharedService.parseDefaultClasses();
    $scope.ABPClasses = $scope.csvFileNoValidMulticastAddrClasses;
    $scope.OTAAClasses = $scope.csvFileNoValidMulticastAddrClasses;
    $scope.ABPRegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.ABPClasses);
    $scope.OTAARegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.OTAAClasses);

    // Init sub types array and it default value
    updateABPSubTypes();
    updateOTAASubTypes();
  }

  function updateABPSubTypes() {
    $scope.ABPSubTypes = dashboardSharedService.parseCurrentSubTypes($scope.ABPRegisterForm.DevType, $scope.subDeviceTypes);
    // If device type's sub types is not empty, we should add "" into sub types array
    // We should let the customer choose "" as one option
    newLoraDeviceService.addEmptyStringToArray($scope.ABPSubTypes);
    // Every time when we select a new device type, the default sub type should be reset to ""
    $scope.ABPRegisterForm.SubType = dashboardSharedService.setArrAndObjDefaultValue($scope.ABPSubTypes);
  }

  function updateOTAASubTypes() {
    $scope.OTAASubTypes = dashboardSharedService.parseCurrentSubTypes($scope.OTAARegisterForm.DevType, $scope.subDeviceTypes);
    newLoraDeviceService.addEmptyStringToArray($scope.OTAASubTypes);
    $scope.OTAARegisterForm.SubType = dashboardSharedService.setArrAndObjDefaultValue($scope.OTAASubTypes);
  }

  function initMulticastAddrArrayForAllMode(){
    $scope.ABPMulticastAddrArray = [];
    $scope.OTAAMulticastAddrArray = [];
    dashboardSharedService.initMulticastAddrArrayForAllMode([loraApplicationID]).then(function (resp) {
      $scope.ABPMulticastAddrArray = resp.sort();
      $scope.OTAAMulticastAddrArray = resp.sort();
    });
  }
};
