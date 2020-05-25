'use strict';

module.exports = function ($scope, $window, $routeParams, dashTableConfig, formValidator, dashboardSharedService,
  loraGatewayService, loraDeviceService) {
  //Const used for error message
  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };

  let updatedAttributes = dashTableConfig.Devices.LoraGateway.updatedAttributes;
  let BandID            = "BandID";
  let InstallationDate  = "InstallationDate";

  $scope.loraGatewayTableUrl = dashTableConfig.Devices.LoraGateway.LoraGatewayTableCommonUrl;
  $scope.formStatus          = FORM_STATUS.EDITING;
  $scope.editEntry           = {};
  $scope.editLoraGateway     = {};

  //////////////////////////////////////////////////
  //
  // Init Function
  //
  //////////////////////////////////////////////////

  //Init lora gateway information
  initLoraGatewayPage();

  $(document).ready(function () {
    //Disabled the scroll function for input [type = number]
    dashboardSharedService.disabledInputNumScroll();
  });

  /////////////////////////////////////////////////////
  //
  // Widget Function
  //
  /////////////////////////////////////////////////////

  $scope.closeAlert = function () {
    $scope.formStatus = FORM_STATUS.EDITING;
  };

  //////////////////////////////////////////////
  //
  // Update Lora Gateway
  //
  //////////////////////////////////////////////

  $scope.finish = function (isValid) {
    closeAlert();
    if (isValid || isValid === undefined) {
      let editEntry = {};
      //Assemble the editEntry, only send the defined attributes to backend server
      for (let key in $scope.editEntry) {
        if (updatedAttributes.includes(key)) {
          if (key === BandID) {
            editEntry[key] = dashboardSharedService.parseBandID($scope.editEntry[key], $scope.bandIDs);
          }
          else if (key === InstallationDate) {
            editEntry[key] = $scope.editEntry[key].toISOString();
          }
          else {
            editEntry[key] = $scope.editEntry[key];
          }
        }
      }

      loraGatewayService.updateLoraGateway(editEntry).then(function (response) {
        if (response.status === "success") {
          $window.alert("Gateway has been successfully updated!");
          $window.location.href = $scope.loraGatewayTableUrl;
        } else {
          $scope.formStatus   = FORM_STATUS.INVALID;
          $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
          $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        }
      });
    }
    else {
      $scope.formStatus   = FORM_STATUS.INVALID;
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      angular.element(".dashboard-edit-page-container").scrollTop(0);
    }
  };

  //////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////

  function initLoraGatewayPage() {
    if (dashboardSharedService.candidateValues) {
      initLoraGatewayInfo();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          initLoraGatewayInfo();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initLoraGatewayInfo() {
    $scope.deviceTypes = dashboardSharedService.candidateValues.DevType;
    $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
    //get the loraGateway info from web api, and then initialize the edit page
    loraGatewayService.getLoraGateway($routeParams.GatewayMAC).then(function (response) {
      if (response.status === "success" && response.content !== null) {
        for (let key in response.content) {
          if (key === BandID) {
            $scope.editEntry[key] = dashboardSharedService.getMapValue(response.content[key], $scope.bandIDs);
          }
          else if (key === InstallationDate) {
            $scope.editEntry[key] = new Date(response.content[key]);
          }
          else {
            $scope.editEntry[key] = response.content[key];
          }
        }
      }
      else if (response.status === "success" && response.content === null) {
        $scope.errorMessage = "Cannot find this lora gateway in the system";
        $window.alert($scope.errorMessage);
        $scope.initializing = false;
        $scope.formStatus = FORM_STATUS.INVALID;
      }
      else {
        $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + $scope.errorMessage);
        $scope.initializing = false;
        $scope.formStatus = FORM_STATUS.INVALID;
      }
    });
  }

  function closeAlert() {
    $scope.formStatus = FORM_STATUS.EDITING;
  }
};