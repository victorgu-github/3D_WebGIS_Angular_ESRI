'use strict';

module.exports = function ($scope, $window, $location, AccountService, dashboardSharedService, BLEApplicationSharedService, 
  BLENodeSharedService, NewBleNodeService, newLoraDeviceService) {

  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };

  const bleApplicationEditPageUrl = "/#/dashboard/ble/bleApplication/edit/";

  let query = $location.search();

  $scope.registerEntry = {
    foreignKeys: []
  };
  $scope.bleAppMap     = {};
  $scope.initializing  = true;

  //////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  //////////////////////////////////////////////////////////

  initBleAppIDs();
  initMacAddress();

  //////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  //////////////////////////////////////////////////////////

  $scope.closeAlert = function () {
    $scope.formStatus = FORM_STATUS.EDITING;
  };

  $scope.batchCloseAlert = function () {
    $scope.batchFormStatus = FORM_STATUS.EDITING;
  };

  $scope.addAForeignKey = function () {
    $scope.registerEntry.foreignKeys.push({
      keyName: "",
      keyValue: "",
      description: ""
    });
  };

  $scope.removeAForeignKey = function (index) {
    $scope.registerEntry.foreignKeys.splice(index, 1);
  };

  $scope.updateReturnUrl = function () {
    updateReturnUrl();
  };

  $scope.getBleNodeRegisterFormClass = function () {
    if (AccountService.userInfo.isCellPhone) {
      return "col-sm-12 col-md-12 col-lg-12 dashboard-content-body-form-mobile";
    }
    else {
      return "col-sm-12 col-md-12 col-lg-12 dashboard-content-body-form";
    }
  };

  $scope.getBatchFile = function () {
    let csvContent = "";
    let csvHeader  = ["MacAddress", "DeviceType", "Name", "KeyName0", "KeyValue0", "Description0"];
    let csvBody    = ["0C61CFE9AAAA", "Some Device", "Some Name", "", "", "Some Description"];
    let csvFile    = [csvHeader, csvBody];
    csvFile.forEach(function (rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); 
    let blob = new Blob([csvContent], {type: 'text/csv'});
    let hiddenElement = document.createElement('a');
    hiddenElement.href = window.URL.createObjectURL(blob);
    hiddenElement.target = '_blank';
    hiddenElement.download = "ble_nodes_batch_register.csv";
    hiddenElement.click();
    hiddenElement.remove();
  };

  //////////////////////////////////////////////////////////
  //
  // Single Device Register
  //
  //////////////////////////////////////////////////////////

  //Register Ble Node
  $scope.finish = function (isValid) {
    $scope.closeAlert();
    if (isValid || isValid === undefined) {
      let registerEntry = Object.assign({}, $scope.registerEntry);
      registerEntry.bleAppID    = getValidBleAppID();
      registerEntry.foreignKeys = NewBleNodeService.getValidForeignKeys($scope.registerEntry.foreignKeys);
      getValidDeviceType(registerEntry);
      BLENodeSharedService.registerBleNode(parseInt(registerEntry.bleAppID), registerEntry).then(function (response) {
        if (response.status === "success") {
          $scope.formStatus = FORM_STATUS.SUBMITTED;
          $window.alert("Ble Node has been successfully created!");
          $window.location.href = $scope.bleAppEditPageUrl;
        }
        else {
          $scope.formStatus   = FORM_STATUS.INVALID;
          $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
          $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        }
      });
    }
    else {
      $scope.formStatus = FORM_STATUS.INVALID;
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Batch Register
  //
  //////////////////////////////////////////////////////////

  $scope.batchReset = function () {
    $scope.batchCloseAlert();
    angular.element("#BatchFile").val("");
    angular.element("#BatchFileInfo").val("");
    $scope.file = null;
  };

  $scope.batchUpload = function () {
    $scope.batchCloseAlert();
    let files = angular.element("#BatchFile")[0].files;
    if (files.length === 1) {
      //1.Condition 1: validate if a file is csv file
      if (newLoraDeviceService.validCSVFiles(files)) {
        $scope.file = files[0];
        $window.alert("Batch files init success!");
      }
      else {
        $scope.batchFormStatus = FORM_STATUS.INVALID;
        $scope.batchErrorMessage = "Batch files should be csv files!";
      }
    }
    else {
      $scope.batchFormStatus = FORM_STATUS.INVALID;
      $scope.batchErrorMessage = "Need to upload a batch file at least! And We only support one batch file at this time!";
    }
  };

  $scope.batchFinish = function () {
    $scope.batchCloseAlert();
    // 1.Condition 1: If $scope.file exist, continue. Otherwise, need info user to upload the csv file.
    if ($scope.file) {
      let fd = new FormData();
      fd.append('file', $scope.file);
      let bleAppID = getValidBleAppID();

      // One-step batch register under  mode
      BLENodeSharedService.batchRegisterBleNodes(parseInt(bleAppID), fd).then(function (response) {
        if (response.status === "success") {
          $scope.file = null;
          let resultMsg = "Register Summary Info: \r\n";
          resultMsg += "1.Success register ble nodes: " + response.content.numInserted + " \r\n";
          resultMsg += "2.Duplicated ble nodes: " + response.content.numDuplicatesNotInserted + " \r\n";
          resultMsg += "3.Duplicated ble nodes' mac address: " + response.content.duplicateMACs;
          $window.alert(resultMsg);
          $window.location.href = $scope.bleAppEditPageUrl;
        }
        else {
          $scope.batchFormStatus = FORM_STATUS.INVALID;
          $scope.batchErrorMessage = dashboardSharedService.parseErrorMessage(response.errors);
        }
      });
    }
    else {
      $scope.batchFormStatus = FORM_STATUS.INVALID;
      $scope.batchErrorMessage = "Batch files should be uploaded!";
    }
  };

  $scope.batchBrowse = function () {
    let input = angular.element("#BatchFile");
    let display = angular.element("#BatchFileInfo");
    newLoraDeviceService.batchFileBrowse(input, display);
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  function initBleAppIDs() {
    BLEApplicationSharedService.getBleApplicationsByCurrentUser().then(function (response) {
      if (response.status === "success") {
        let bleApplications = response.content;
        //If query.bleAppID exist, display input = text disabled
        //1. init bleAppMap
        //2. init $scope.registerEntry.bleAppID, its value come from bleAppMap
        if (query.bleAppID) {
          let bleApplication = bleApplications.find((element) => { return element.bleAppID === parseInt(query.bleAppID); });
          $scope.bleAppMap[bleApplication.bleAppID] = bleApplication.bleAppName;
          $scope.registerEntry.bleAppID = query.bleAppID + ": " + $scope.bleAppMap[query.bleAppID];
          $scope.queryBleAppIDExist = true;
        }
        //If query.bleAppID not exist, only init bleAppMap
        else {
          for (let index in bleApplications) {
            let bleApplication = bleApplications[index];
            $scope.bleAppMap[bleApplication.bleAppID] = bleApplication.bleAppID + ": " + bleApplication.bleAppName;
          }
          $scope.queryBleAppIDExist = false;
        }
        updateReturnUrl();
      }
      else {
        $scope.formStatus = FORM_STATUS.INVALID;
        $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + $scope.errorMessage);
        $scope.initializing = false;
      }
    });
  }

  function initMacAddress() {
    if (query.macAddress) {
      $scope.registerEntry.macAddress = query.macAddress;
      $scope.disabledBleMacAddress = true;
    }
    else {
      $scope.disabledBleMacAddress = false;
    }
  }

  function updateReturnUrl() {
    if ($scope.queryBleAppIDExist) {
      $scope.bleAppEditPageUrl = bleApplicationEditPageUrl + query.bleAppID;
    }
    else {
      $scope.bleAppEditPageUrl = bleApplicationEditPageUrl + $scope.registerEntry.bleAppID;
    }
  }

  //1.If query.bleAppID exist, we can use it directly. And $scope.registerEntry.bleAppID is the string ('bleAppName' after conversion)
  //2.If query.bleAppID not exit, $scope.registerEntry.bleAppID is the number ('bleAppID' no conversion)
  function getValidBleAppID() {
    let result;
    if (query.bleAppID) {
      result = query.bleAppID;
    }
    else {
      result = $scope.registerEntry.bleAppID;
    }
    return result;
  }

  function getValidDeviceType(registerEntry) {
    if (registerEntry.deviceType !== undefined && (registerEntry.deviceType === null || registerEntry.deviceType === "")) {
      delete registerEntry.deviceType;
    }
  }
};
