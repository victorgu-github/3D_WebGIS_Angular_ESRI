'use strict';

module.exports = function ($scope, $rootScope, $window, appConfig, dashTableConfig, formValidator, AccountService, 
  loraDeviceService, dashboardSharedService, newLoraDeviceService) {

  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };
  const defaultErrorMessage = "Fields with * symbol should be valid and not empty.";

  let singleRegistryAttr = dashTableConfig.Devices.LoraDevice.singleRegistryAttr;
  //Variable used to validate required fields of ABP mode and OTAA mode
  let ABP_REQUIRED_FIELDS =  singleRegistryAttr.ABP.ABP_REQUIRED_FIELDS;
  let OTAA_REQUIRED_FIELDS = singleRegistryAttr.OTAA.OTAA_REQUIRED_FIELDS;
  //Variable used to separate the ABP mode and OTAA mode
  let ABP =           "ABP";
  let OTAA =          "OTAA";
  let MulticastAddr = "MulticastAddr";
  //Class range determine which class will need to provide multicastAddrArray
  let ClassRange = dashTableConfig.Devices.LoraDevice.systemParams.Class;

  // TODO: Extract to config file
  $scope.EUIPattern = formValidator.regex.EUIPattern;
  $scope.AddrPattern = formValidator.regex.AddrPattern;
  $scope.applicationIDs = [];
  $scope.ABPFormStatus = FORM_STATUS.EDITING;
  $scope.OTAAFormStatus = FORM_STATUS.EDITING;
  $scope.shakeError = false;
  $scope.initializing = true;
  $scope.ABPErrorMessage = defaultErrorMessage;
  $scope.OTAAErrorMessage = defaultErrorMessage;
  $scope.ABPBatchErrorMessage = defaultErrorMessage;
  $scope.OTAABatchErrorMessage = defaultErrorMessage;
  $scope.ABPCSVMulticastAddrExist  = false;
  $scope.OTAACSVMulticastAddrExist = false;

  let userInfo = AccountService.userInfo;
  let appIDRange = userInfo.appIDs;

  //Batch File Download
  let nodeServer = appConfig.nodeServer;
  let ABPCSVTempUrl = dashTableConfig.Devices.LoraDevice.csvTempDownLoad.ABPUrl;
  let OTAACSVTempUrl = dashTableConfig.Devices.LoraDevice.csvTempDownLoad.OTAAUrl;
  let ABPCSVTempDownload = nodeServer + ABPCSVTempUrl;
  let OTAACSVTempDownload = nodeServer + OTAACSVTempUrl;
  let ABPBatchFileLinkArray = ABPCSVTempDownload.split('/');
  let OTAABatchFileLinkArray = OTAACSVTempDownload.split('/');
  //Get the remote csv file name as the user download file filename
  let ABPBatchFileName = ABPBatchFileLinkArray[ABPBatchFileLinkArray.length - 1];
  let OTAABatchFileName = OTAABatchFileLinkArray[OTAABatchFileLinkArray.length - 1];

  //$scope.ABPRegisterForm and $scope.OTAARegisterForm cannot assign the value at the same time
  //otherwise, it will cause reference type error, both of them point to the same reference variable
  let registerDefaultValue = dashTableConfig.Devices.LoraDevice.registerDefaultValue;
  $scope.ABPRegisterForm = registerDefaultValue.ABP_DEFAULT_VALUES;
  $scope.OTAARegisterForm = registerDefaultValue.OTAA_DEFAULT_VALUES;
  $scope.ABPBatchRegisterForm = {};
  $scope.ABPBatchRegisterForm.ABP = registerDefaultValue.ABP_DEFAULT_VALUES.ABP;
  $scope.OTAABatchRegisterForm = {};
  $scope.OTAABatchRegisterForm.ABP = registerDefaultValue.OTAA_DEFAULT_VALUES.ABP;
  $scope.initializing = false;
  $scope.subTypeMap;
  $scope.ABPBatchRegisterForm.disabledMulticastAddrArray = false;
  $scope.OTAABatchRegisterForm.disabledMulticastAddrArray = false;
  $scope.csvFileNoValidMulticastAddrClasses;
  //For batch register, if batch file has valid multicast addr, we can only display the class 1, 2 ('B', 'C') in select dropdown list
  $scope.csvFileHasValidMulticastAddrClasses = dashboardSharedService.parseDefaultClasses([1, 2]);
  $scope.ABPCollapse  = true;
  $scope.OTAACollapse = true;

  //////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  //////////////////////////////////////////////////////////

  // Init AppIDs array for ApplicationID, and candidate values for Device Types, Band ID, Class
  initAppIDs(appIDRange);
  initCandidateValues();

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

  $scope.ABPBatchCloseAlert = function () {
    $scope.ABPBatchFormStatus = FORM_STATUS.EDITING;
    $scope.ABPBatchErrorMessage = defaultErrorMessage;
  };

  $scope.OTAABatchCloseAlert = function () {
    $scope.OTAABatchFormStatus = FORM_STATUS.EDITING;
    $scope.OTAABatchErrorMessage = defaultErrorMessage;
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

  $scope.updateABPBatchSubTypes = function () {
    updateABPBatchSubTypes();
  };

  $scope.updateOTAABatchSubTypes = function () {
    updateOTAABatchSubTypes();
  };

  //////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  //////////////////////////////////////////////////////////

  //Get ABP Batch File
  newLoraDeviceService.getBatchFile(ABPCSVTempDownload).then(function (response) {
    let element = angular.element("#ABPBatchFileDownload");
    newLoraDeviceService.setDownLink(element, response.data, ABPBatchFileName);
  }).catch(function (error) {
    $window.alert(error);
  });

  //Get OTAA Batch File
  newLoraDeviceService.getBatchFile(OTAACSVTempDownload).then(function (response) {
    let element = angular.element("#OTAABatchFileDownload");
    newLoraDeviceService.setDownLink(element, response.data, OTAABatchFileName);
  }).catch(function (error) {
    $window.alert(error);
  });

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

  $scope.showABPBatchMtAddrArr = function () {
    let result;
    if (ClassRange.includes(dashboardSharedService.parseClass($scope.ABPBatchRegisterForm.Class, $scope.ABPBatchClasses))) {
      result = true;
    }
    else {
      result = false;
    }
    return result;
  };

  $scope.showOTAABatchMtAddrArr = function () {
    let result;
    if (ClassRange.includes(dashboardSharedService.parseClass($scope.OTAABatchRegisterForm.Class, $scope.OTAABatchClasses))) {
      result = true;
    }
    else {
      result = false;
    }
    return result;
  };

  //Init multicast address array when changing applicationID
  $scope.updateABPMulticastAddrArray = function () {
    initABPMulticastAddrArray();
    $rootScope.$broadcast("updateButtonText");
  };

  $scope.updateOTAAMulticastAddrArray = function () {
    initOTAAMulticastAddrArray();
    $rootScope.$broadcast("updateButtonText");
  };

  $scope.updateABPBatchMulticastAddrArray = function () {
    initABPBatchMulticastAddrArray();
    $rootScope.$broadcast("updateButtonText");
  };

  $scope.updateOTAABatchMulticastAddrArray = function () {
    initOTAABatchMulticastAddrArray();
    $rootScope.$broadcast("updateButtonText");
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
          ApplicationID: $scope.registerForm.ApplicationID,
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
              $window.alert("Device has been successfully created!");
              $window.location.href = '/#/dashboard/overview';
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
          ApplicationID: $scope.registerForm.ApplicationID,
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
              $window.alert("Device has been successfully created!");
              $window.location.href = '/#/dashboard/overview';
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
  // ABP Batch Register
  //
  //////////////////////////////////////////////////////////

  $scope.ABPCSVJSONObjectArray;

  $scope.ABPBatchReset = function () {
    angular.element("#ABPBatchFile").val("");
    angular.element("#ABPBatchFileInfo").val("");
    $scope.ABPCSVJSONObjectArray = [];
    $scope.ABPBatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
    newLoraDeviceService.initClassesAndMulticastAddrArrayCSVNoMulticastAddr($scope.ABPBatchClasses, $scope.ABPBatchRegisterForm);
    $scope.ABPCSVMulticastAddrExist = false;
    $scope.ABPBatchRegisterForm.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);
    $scope.ABPBatchRegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);
    $scope.ABPBatchRegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
    updateABPBatchSubTypes();
    $scope.ABPBatchCloseAlert();
  };

  //BatchUpload cannot merge at this time
  //1.File reader is a async funtion which is not monitored by angularjs, we need directly apply
  //  $scope.ABPCSVJSONObjectArray, $scope.ABPBatchFormStatus, $scope.ABPBatchErrorMessage in function
  //  and use $scope.$apply() to monitoring the variable change
  //2.If we want to change the $scope.ABPCSVJSONObjectArray, $scope.ABPBatchFormStatus, $scope.ABPBatchErrorMessage 
  //  variable by passing a formal parameter. It is impossible
  $scope.ABPBatchUpload = function () {
    let files = angular.element("#ABPBatchFile")[0].files;
    if (files.length === 1) {
      //1.Condition 1: validate if a file is csv file
      if (newLoraDeviceService.validCSVFiles(files)) {
        let string = "";
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
          string = evt.target.result;
          newLoraDeviceService.parseCSVStringToArray(string).then(function (response) {
            let array = response;
            //2.Condition 2: after parse the csv file to csv array, validate csv array 
            let validationResult = newLoraDeviceService.validCSVArrayForABP(array);
            if (validationResult.status === "success") {
              //3. Condition 3: If array has "MulticastAddr" attribute, need to make sure all values are the same
              let validateCSVArrayMulticastAddrResult = newLoraDeviceService.validateCSVArrayMulticastAddr(array, MulticastAddr);
              if (!validateCSVArrayMulticastAddrResult.includeMulticastAddr && validateCSVArrayMulticastAddrResult.status === "success") {
                $window.alert("Batch files init success!");
                $scope.ABPBatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
                $scope.ABPBatchRegisterForm.disabledMulticastAddrArray = false;
                $scope.ABPCSVMulticastAddrExist = false;
                $scope.ABPCSVJSONObjectArray = newLoraDeviceService.parseCSVArrayToJSONArrayForABP(array);
                $scope.ABPBatchFormStatus = FORM_STATUS.EDITING;
                $scope.ABPBatchErrorMessage = defaultErrorMessage;
                $scope.$apply();
              }
              else if (validateCSVArrayMulticastAddrResult.includeMulticastAddr && validateCSVArrayMulticastAddrResult.status === "success") {
                $window.alert("Batch files init success!");
                $scope.ABPBatchClasses = $scope.csvFileHasValidMulticastAddrClasses;
                //If CSV file include "MulticastAddr" and can pass validation, we can get multicastAddr from CSV file
                let multicastAddr = getMulticastAddrFromCSVFile(array, MulticastAddr);
                newLoraDeviceService.initClassesAndMulticastAddrArrayCSVHasMulticastAddr(multicastAddr, $scope.ABPBatchClasses, $scope.ABPBatchRegisterForm);
                $scope.ABPCSVMulticastAddrExist = true;
                $scope.ABPCSVJSONObjectArray = newLoraDeviceService.parseCSVArrayToJSONArrayForABP(array);
                $scope.ABPBatchFormStatus = FORM_STATUS.EDITING;
                $scope.ABPBatchErrorMessage = defaultErrorMessage;
                $scope.$apply();
              }
              else if (validateCSVArrayMulticastAddrResult.status !== "success") {
                $scope.ABPBatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
                $scope.ABPBatchRegisterForm.disabledMulticastAddrArray = false;
                $scope.ABPCSVMulticastAddrExist = false;
                let errorMessage = newLoraDeviceService.parseErrorMessage(validateCSVArrayMulticastAddrResult.errorMessage);
                $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
                $scope.ABPBatchErrorMessage = errorMessage;
                $scope.$apply();
              }
            }
            else {
              $scope.ABPBatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
              $scope.ABPBatchRegisterForm.disabledMulticastAddrArray = false;
              $scope.ABPCSVMulticastAddrExist = false;
              let errorMessage = newLoraDeviceService.parseErrorMessage(validationResult.errorMessage);
              $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
              $scope.ABPBatchErrorMessage = errorMessage;
              $scope.$apply();
            }
            // CSV parser parse error
          }).catch(function (error) {
            $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
            $scope.ABPBatchErrorMessage = error.message;
            $scope.$apply();
          });
        };
        // Reader load file error
        reader.onerror = function (evt) {
          $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
          $scope.ABPBatchErrorMessage = evt.target.result;
        };
      }
      else {
        $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
        $scope.ABPBatchErrorMessage = "Batch files should be csv files!";
      }
    }
    else {
      $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
      $scope.ABPBatchErrorMessage = "Need to upload a batch file at least! And We only support one batch file at this time!";
    }
  };

  $scope.ABPBatchFinish = function () {
    $scope.ABPBatchCloseAlert();
    // If user clear the files after upload, we need to check the if there is any files at this time
    let files = angular.element("#ABPBatchFile")[0].files;
    $scope.ABPCSVJSONObjectArray = files.length ? $scope.ABPCSVJSONObjectArray : [];

    // 1.Condition 1: If files.length === 0, means user don't update file, send error message
    if (Array.isArray($scope.ABPCSVJSONObjectArray) && $scope.ABPCSVJSONObjectArray.length > 0) {
      // Create ABPBatchRegisterEntry for ABP batch register
      let ABPBatchRegisterEntry = {
        ApplicationID: $scope.ABPBatchRegisterForm.ApplicationID,
        DevType:       $scope.ABPBatchRegisterForm.DevType,
        BandID:        dashboardSharedService.parseBandID($scope.ABPBatchRegisterForm.BandID, $scope.bandIDs),
        Class:         dashboardSharedService.parseClass($scope.ABPBatchRegisterForm.Class, $scope.ABPBatchClasses),
        ABP:           $scope.ABPBatchRegisterForm.ABP
      };

      //Prepare batch register body
      newLoraDeviceService.prepareRegisterBody($scope.subTypeMap, $scope.ABPBatchRegisterForm, ABPBatchRegisterEntry, 
        $scope.ABPCSVJSONObjectArray, ClassRange, dashTableConfig.Devices.LoraDevice.batchRegistryFile.ABP.optionalFields);
      newLoraDeviceService.prepareMulticastAddrArrayAndSubType($scope.subTypeMap, $scope.ABPBatchRegisterForm, ABPBatchRegisterEntry, ClassRange);

      // If ABPBatchRegisterEntry.MulticastAddrArray exist, need to validate MulticastAddrArray is under current application id or not
      if (Array.isArray(ABPBatchRegisterEntry.MulticastAddrArray) && ABPBatchRegisterEntry.MulticastAddrArray.length !== 0) {
        let loraApplicationID = [$scope.ABPBatchRegisterForm.ApplicationID];
        dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
          $scope.ABPBatchMulticastAddrArray = resp.sort();
          let validateMulticastAddrResult = elementContainedInAnotherArray(ABPBatchRegisterEntry.MulticastAddrArray, $scope.ABPBatchMulticastAddrArray);
          if (validateMulticastAddrResult.status === "success") {
            batchRegisterLoraDevice(ABPBatchRegisterEntry);
          }
          else {
            let errorMessage = newLoraDeviceService.parseErrorMessage(validateMulticastAddrResult.errorMessage);
            $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
            $scope.ABPBatchErrorMessage = errorMessage;
          }
        });
      }
      else {
        batchRegisterLoraDevice(ABPBatchRegisterEntry);
      }
    }
    else {
      $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
      $scope.ABPBatchErrorMessage = "Batch files should be uploaded!";
    }
  };

  $scope.ABPBatchBrowse = function () {
    let input = angular.element("#ABPBatchFile");
    let display = angular.element("#ABPBatchFileInfo");
    newLoraDeviceService.batchFileBrowse(input, display);
  };

  //////////////////////////////////////////////////////////
  //
  // OTAA Batch Register
  //
  //////////////////////////////////////////////////////////

  $scope.OTAACSVJSONObjectArray;

  $scope.OTAABatchReset = function () {
    angular.element("#OTAABatchFile").val("");
    angular.element("#OTAABatchFileInfo").val("");
    $scope.OTAACSVJSONObjectArray = [];
    $scope.OTAABatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
    newLoraDeviceService.initClassesAndMulticastAddrArrayCSVNoMulticastAddr($scope.OTAABatchClasses, $scope.OTAABatchRegisterForm);
    $scope.OTAACSVMulticastAddrExist = false;
    $scope.OTAABatchRegisterForm.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);
    $scope.OTAABatchRegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);
    $scope.OTAABatchRegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
    updateOTAABatchSubTypes();
    $scope.OTAABatchCloseAlert();
  };

  $scope.OTAABatchUpload = function () {
    let files = angular.element("#OTAABatchFile")[0].files;
    if (files.length === 1) {
      if (newLoraDeviceService.validCSVFiles(files)) {
        let string = "";
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
          string += evt.target.result;
          newLoraDeviceService.parseCSVStringToArray(string).then(function (response) {
            let array = response;
            let validationResult = newLoraDeviceService.validCSVArrayForOTAA(array);
            if (validationResult.status === "success") {
              let validateCSVArrayMulticastAddrResult = newLoraDeviceService.validateCSVArrayMulticastAddr(array, MulticastAddr);
              if (!validateCSVArrayMulticastAddrResult.includeMulticastAddr && validateCSVArrayMulticastAddrResult.status === "success") {
                $window.alert("Batch files init success!");
                $scope.OTAABatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
                $scope.OTAABatchRegisterForm.disabledMulticastAddrArray = false;
                $scope.OTAACSVMulticastAddrExist = false;
                $scope.OTAACSVJSONObjectArray = newLoraDeviceService.parseCSVArrayToJSONArrayForOTAA(array);
                $scope.OTAABatchFormStatus = FORM_STATUS.EDITING;
                $scope.OTAABatchErrorMessage = defaultErrorMessage;
                $scope.$apply();
              }
              else if (validateCSVArrayMulticastAddrResult.includeMulticastAddr && validateCSVArrayMulticastAddrResult.status === "success") {
                $window.alert("Batch files init success!");
                $scope.OTAABatchClasses = $scope.csvFileHasValidMulticastAddrClasses;
                //If CSV file include "MulticastAddr" and can pass validation, we can get multicastAddr from CSV file
                let multicastAddr = getMulticastAddrFromCSVFile(array, MulticastAddr);
                newLoraDeviceService.initClassesAndMulticastAddrArrayCSVHasMulticastAddr(multicastAddr, $scope.OTAABatchClasses, $scope.OTAABatchRegisterForm);
                $scope.OTAACSVMulticastAddrExist = true;
                $scope.OTAACSVJSONObjectArray = newLoraDeviceService.parseCSVArrayToJSONArrayForOTAA(array);
                $scope.OTAABatchFormStatus = FORM_STATUS.EDITING;
                $scope.OTAABatchErrorMessage = defaultErrorMessage;
                $scope.$apply();
              }
              else if (validateCSVArrayMulticastAddrResult.status !== "success") {
                $scope.OTAABatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
                $scope.OTAABatchRegisterForm.disabledMulticastAddrArray = false;
                $scope.OTAACSVMulticastAddrExist = false;
                let errorMessage = newLoraDeviceService.parseErrorMessage(validateCSVArrayMulticastAddrResult.errorMessage);
                $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
                $scope.OTAABatchErrorMessage = errorMessage;
                $scope.$apply();
              }
            }
            else {
              $scope.OTAABatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
              $scope.OTAABatchRegisterForm.disabledMulticastAddrArray = false;
              $scope.OTAACSVMulticastAddrExist = false;
              let errorMessage = newLoraDeviceService.parseErrorMessage(validationResult.errorMessage);
              $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
              $scope.OTAABatchErrorMessage = errorMessage;
              $scope.$apply();
            }
            //CSV parser parse error
          }).catch(function (error) {
            $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
            $scope.OTAABatchErrorMessage = error.message;
            $scope.$apply();
          });
        };
        //Reader load file error
        reader.onerror = function (evt) {
          $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
          $scope.OTAABatchErrorMessage = evt.target.result;
        };
      }
      else {
        $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
        $scope.OTAABatchErrorMessage = "Batch files should be csv files!";
      }
    }
    else {
      $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
      $scope.OTAABatchErrorMessage = "Need to upload a batch file at least! And We only support one batch file at this time!";
    }
  };

  $scope.OTAABatchFinish = function () {
    $scope.OTAABatchCloseAlert();

    // If user clear the files after upload, we need to check the if there is any files at this time
    let files = angular.element("#OTAABatchFile")[0].files;
    $scope.OTAACSVJSONObjectArray = files.length ? $scope.OTAACSVJSONObjectArray : [];

    if (Array.isArray($scope.OTAACSVJSONObjectArray) && $scope.OTAACSVJSONObjectArray.length > 0) {
      // Create OTAABatchRegisterEntry for OTAA batch register
      let OTAABatchRegisterEntry = {
        ApplicationID: $scope.OTAABatchRegisterForm.ApplicationID,
        DevType: $scope.OTAABatchRegisterForm.DevType,
        BandID: dashboardSharedService.parseBandID($scope.OTAABatchRegisterForm.BandID, $scope.bandIDs),
        Class: dashboardSharedService.parseClass($scope.OTAABatchRegisterForm.Class, $scope.OTAABatchClasses),
        ABP: $scope.OTAABatchRegisterForm.ABP
      };

      //Prepare batch register body
      newLoraDeviceService.prepareRegisterBody($scope.subTypeMap, $scope.OTAABatchRegisterForm, OTAABatchRegisterEntry, 
        $scope.OTAACSVJSONObjectArray, ClassRange, dashTableConfig.Devices.LoraDevice.batchRegistryFile.OTAA.optionalFields);
      newLoraDeviceService.prepareMulticastAddrArrayAndSubType($scope.subTypeMap, $scope.OTAABatchRegisterForm, OTAABatchRegisterEntry, ClassRange);

      // If OTAABatchRegisterEntry.MulticastAddrArray exist, need to validate MulticastAddrArray is under current application id or not
      if (Array.isArray(OTAABatchRegisterEntry.MulticastAddrArray) && OTAABatchRegisterEntry.MulticastAddrArray.length !== 0) {
        let loraApplicationID = [$scope.OTAABatchRegisterForm.ApplicationID];
        dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
          $scope.OTAABatchMulticastAddrArray = resp;
          let validateMulticastAddrResult = elementContainedInAnotherArray(OTAABatchRegisterEntry.MulticastAddrArray, $scope.OTAABatchMulticastAddrArray);
          if (validateMulticastAddrResult.status === "success") {
            batchRegisterLoraDevice(OTAABatchRegisterEntry);
          }
          else {
            let errorMessage = newLoraDeviceService.parseErrorMessage(validateMulticastAddrResult.errorMessage);
            $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
            $scope.OTAABatchErrorMessage = errorMessage;
          }
        });
      }
      else {
        batchRegisterLoraDevice(OTAABatchRegisterEntry);
      }
    }
    else {
      $scope.OTAABatchFormStatus = FORM_STATUS.INVALID;
      $scope.OTAABatchErrorMessage = "Batch files should be uploaded!";
    }
  };

  $scope.OTAABatchBrowse = function () {
    let input = angular.element("#OTAABatchFile");
    let display = angular.element("#OTAABatchFileInfo");
    newLoraDeviceService.batchFileBrowse(input, display);
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  function initAppIDs(appIDRange) {
    $scope.applicationIDs = $scope.applicationIDs.concat(appIDRange);
  }

  //Get the MulticastAddr from csv file
  //1. array[1] is the header of csv file, defined the fields "MulticastAddr" there
  //2. array[2] is the begining of body of csv file, defined the exact value of "MulticastAddr" there
  //For example:
  // [row1]      DevEUI          Name                 MulticastAddr
  //             --------------------------------------------------
  // [row2]      AAAAAAB         calgary test         A181920
  //Before we get the multicast address from row 2, we have already finish the validation
  //a. body must have content there
  //b. csv file has multicast address, the multicast must be the same
  function getMulticastAddrFromCSVFile(array, MulticastAddr) {
    let position = array[1].findIndex((element) => {
      return element === MulticastAddr;
    });
    return array[2][position];
  }

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

    // Init application ids array and its default value
    $scope.ABPRegisterForm.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);
    $scope.OTAARegisterForm.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);
    $scope.ABPBatchRegisterForm.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);
    $scope.OTAABatchRegisterForm.ApplicationID = dashboardSharedService.setArrAndObjDefaultValue($scope.applicationIDs);
    // Init MulticastAddrArray after initialization of application id
    initMulticastAddrArrayForAllMode();

    // Init device types array and its default value
    $scope.deviceTypes = devTypeResp;
    $scope.ABPRegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);
    $scope.OTAARegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);
    $scope.ABPBatchRegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);
    $scope.OTAABatchRegisterForm.DevType = dashboardSharedService.setArrAndObjDefaultValue($scope.deviceTypes);

    // Init band id array and its default value
    $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(bandIDResp);
    $scope.ABPRegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
    $scope.OTAARegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
    $scope.ABPBatchRegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
    $scope.OTAABatchRegisterForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);

    // Init classes array and its default value
    // Why separate ABPClasses, OTAAClasses, ABPBatchClasses, OTAAClasses:
    // 1.For candidate values: deviceTypes, bandIDs, they won't change for different model, so we don't need separate them
    // 2.But for classes, it will change when batch register file has valid multicastAddr attribute. So we need to separate it;
    //   Batch file has valid multicastAddr: classes is {1: 'B', 2: 'C'}
    //   Batch file don't have valid multicastAddr: classes is {0: 'A', 1: 'B', 2: 'C'}
    $scope.csvFileNoValidMulticastAddrClasses = dashboardSharedService.parseDefaultClasses();
    $scope.ABPClasses = $scope.csvFileNoValidMulticastAddrClasses;
    $scope.OTAAClasses = $scope.csvFileNoValidMulticastAddrClasses;
    $scope.ABPBatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
    $scope.OTAABatchClasses = $scope.csvFileNoValidMulticastAddrClasses;
    $scope.ABPRegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.ABPClasses);
    $scope.OTAARegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.OTAAClasses);
    $scope.ABPBatchRegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.ABPBatchClasses);
    $scope.OTAABatchRegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue($scope.OTAABatchClasses);

    // Init sub types array and it default value
    updateABPSubTypes();
    updateOTAASubTypes();
    updateABPBatchSubTypes();
    updateOTAABatchSubTypes();
  }

  // Init multicast addr array for all modes
  function initMulticastAddrArrayForAllMode() {
    let loraApplicationID = [$scope.ABPRegisterForm.ApplicationID];
    $scope.ABPMulticastAddrArray = [];
    $scope.OTAAMulticastAddrArray = [];
    $scope.ABPBatchMulticastAddrArray = [];
    $scope.OTAABatchMulticastAddrArray = [];
    dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
      $scope.ABPMulticastAddrArray = resp.sort();
      $scope.OTAAMulticastAddrArray = resp.sort();
      $scope.ABPBatchMulticastAddrArray = resp.sort();
      $scope.OTAABatchMulticastAddrArray = resp.sort();
    });
  }

  // Init multicast addr array according to application id
  function initABPMulticastAddrArray() {
    $scope.ABPMulticastAddrArray = [];
    let loraApplicationID = [$scope.ABPRegisterForm.ApplicationID];
    dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
      $scope.ABPMulticastAddrArray = resp.sort();
    });
  }

  function initOTAAMulticastAddrArray() {
    $scope.OTAAMulticastAddrArray = [];
    let loraApplicationID = [$scope.OTAARegisterForm.ApplicationID];
    dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
      $scope.OTAAMulticastAddrArray = resp.sort();
    });
  }

  function initABPBatchMulticastAddrArray() {
    $scope.ABPBatchMulticastAddrArray = [];
    let loraApplicationID = [$scope.ABPBatchRegisterForm.ApplicationID];
    dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
      $scope.ABPBatchMulticastAddrArray = resp.sort();
    });
  }

  function initOTAABatchMulticastAddrArray() {
    $scope.OTAABatchMulticastAddrArray = [];
    let loraApplicationID = [$scope.OTAABatchRegisterForm.ApplicationID];
    dashboardSharedService.initMulticastAddrArrayForAllMode(loraApplicationID).then(function (resp) {
      $scope.OTAABatchMulticastAddrArray = resp.sort();
    });
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

  function updateABPBatchSubTypes() {
    $scope.ABPBatchSubTypes = dashboardSharedService.parseCurrentSubTypes($scope.ABPBatchRegisterForm.DevType, $scope.subDeviceTypes);
    newLoraDeviceService.addEmptyStringToArray($scope.ABPBatchSubTypes);
    $scope.ABPBatchRegisterForm.SubType = dashboardSharedService.setArrAndObjDefaultValue($scope.ABPBatchSubTypes);
  }

  function updateOTAABatchSubTypes() {
    $scope.OTAABatchSubTypes = dashboardSharedService.parseCurrentSubTypes($scope.OTAABatchRegisterForm.DevType, $scope.subDeviceTypes);
    newLoraDeviceService.addEmptyStringToArray($scope.OTAABatchSubTypes);
    $scope.OTAABatchRegisterForm.SubType = dashboardSharedService.setArrAndObjDefaultValue($scope.OTAABatchSubTypes);
  }

  function batchRegisterLoraDevice(batchRegisterEntry) {
    // One-step batch register under ABP mode
    loraDeviceService.batchRegister(batchRegisterEntry).then(function (response) {
      if (response.status === "success") {
        $window.alert("Device has been successfully created!");
        $window.location.href = '/#/dashboard/overview';
      }
      else {
        let errors = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: \n" + errors);
        $scope.ABPBatchFormStatus = FORM_STATUS.INVALID;
        $scope.ABPBatchErrorMessage = dashboardSharedService.parseErrorMessage(response.errors);
      }
    });
  }

  // Determine if element in array1 included in array2
  function elementContainedInAnotherArray(array1, array2) {
    let validationResult = {
      status: "success",
      errorMessage: []
    };
    if (Array.isArray(array1) && array1.length !== 0) {
      for (let i = 0; i < array1.length; i++) {
        let element = array1[i];
        if (!array2.includes(element)) {
          validationResult.status = "false";
          validationResult.errorMessage.push("Multicast Address " + element + " doesn't belong to current lora application id");
        }
      }
    }
    return validationResult;
  }
};
