'use strict';

module.exports = function ($scope, $window, $routeParams, dashTableConfig, dashboardSharedService, BLENodeSharedService, NewBleNodeService) {
  //Const used for error message
  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING: "editing",
    INVALID: "invalid"
  };

  $scope.bleAppEditPageUrl = "/#/dashboard/ble/bleApplication/edit/" + $routeParams.bleAppID;  
  $scope.formStatus    = FORM_STATUS.EDITING;
  $scope.initializing  = true;

  ////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  ////////////////////////////////////////////////////////

  initBleNodeEditPage();
  $(document).ready(function () {
    //Disabled the scroll function for input [type = number]
    dashboardSharedService.disabledInputNumScroll();
  });

  ////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  ////////////////////////////////////////////////////////

  // Close the error message
  $scope.closeAlert = function () {
    $scope.formStatus = FORM_STATUS.EDITING;
  };

  $scope.addAForeignKey = function () {
    $scope.editEntry.foreignKeys.push({
      keyName: "",
      keyValue: "",
      description: ""
    });
  };

  $scope.removeAForeignKey = function (index) {
    $scope.editEntry.foreignKeys.splice(index, 1);
  };

  // Submit And Update Ble Node Info
  $scope.submit = function (isValid) {
    $scope.closeAlert();
    if (isValid || isValid === undefined) {
      $scope.editEntry.foreignKeys = NewBleNodeService.getValidForeignKeys($scope.editEntry.foreignKeys);
      BLENodeSharedService.updateBleNode($routeParams.bleAppID, $scope.editEntry).then(function (response) {
        if (response.status === "success") {
          $window.alert("Lora ble tag successfully update");
          $window.location.href = $scope.bleAppEditPageUrl;
          $scope.initializing = false;
          $scope.formStatus = FORM_STATUS.SUBMITTED;
        }
        else {
          $scope.formStatus = FORM_STATUS.INVALID;
          $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
          $window.alert("Error occurred due to: \n" + $scope.errorMessage);
          $scope.initializing = false;
        }
      });
    }
    else {
      $scope.formStatus = FORM_STATUS.INVALID;
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      $scope.initializing = false;
    }
  };

  ////////////////////////////////////////////////////////
  //
  // Private Function
  //
  ////////////////////////////////////////////////////////

  // Init Ble Node Edit Page
  function initBleNodeEditPage(){
    BLENodeSharedService.getBleNode($routeParams.bleAppID, $routeParams.macAddress).then(function (response) {
      if (response.status === "success" && response.content.length !== 0) {
        $scope.editEntry    = response.content[0];
        $scope.formStatus   = FORM_STATUS.EDITING;
        $scope.initializing = false;
      }
      else if (response.status === "success" && response.content.length === 0) {
        $scope.formStatus   = FORM_STATUS.INVALID;
        $scope.errorMessage = "Cannot find this ble tag in the system";
        $window.alert("Error occurred due to: " + $scope.errorMessage);
        $scope.initializing = false;
      }
      else {
        $scope.formStatus   = FORM_STATUS.INVALID;
        $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + $scope.errorMessage);
        $scope.initializing = false;
      }
    });
  }
};
