'use strict';

module.exports = function ($scope, $window, CollectionUtils, AccountService, dashboardSharedService, BLEApplicationSharedService) {

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
  // $scope Variable
  //
  //////////////////////////////////////////////////////////

  $scope.formStatus      = FORM_STATUS.EDITING;
  $scope.errorMessage    = defaultErrorMessage;
  $scope.overviewPageUrl = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);

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

  $scope.getNewBleAppFormClass = function () {
    if (AccountService.userInfo.isCellPhone) {
      return "col-sm-12 col-md-12 col-lg-12 dashboard-content-body-form-mobile";
    }
    else {
      return "col-sm-12 col-md-12 col-lg-12 dashboard-content-body-form";
    }
  };

  //Register Ble Application
  $scope.finish = function (isValid) {
    $scope.closeAlert();
    //$scope.registerEngry.relatedCompanyID is input type="number", if you delete the input,
    //$scope.registerEngry.relatedCompanyID will be null and backend will throw error
    if ($scope.registerEntry && $scope.registerEntry.relatedCompanyID === null) {
      delete $scope.registerEntry.relatedCompanyID;
    }
    if (isValid || isValid === undefined) {
      BLEApplicationSharedService.registerBleApplication($scope.registerEntry).then(function (response) {
        if (response.status === "success") {
          $scope.formStatus = FORM_STATUS.SUBMITTED;
          $window.alert("Ble Application has been successfully created!");
          $window.location.href = $scope.overviewPageUrl;
        }
        else {
          $scope.formStatus = FORM_STATUS.INVALID;
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
};
