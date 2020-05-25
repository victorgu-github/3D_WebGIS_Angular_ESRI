'use strict';

module.exports = function ($scope, $window, dashTableConfig, formValidator, AccountService, loraDeviceService, loraGatewayService, 
  CollectionUtils, dashboardSharedService) {

  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };
 
  let BandID                      = "BandID";
  let InstallationDate            = "InstallationDate";
  let SUCCESS_MSG                 = "Gateway has been successfully created!";
  let LORA_GW_REG_REQUIRED_FIELDS = dashTableConfig.Devices.LoraGateway.registerAttrs.requiredAttrs;
  let LORA_GW_REG_OPTIONAL_FIELDS = dashTableConfig.Devices.LoraGateway.registerAttrs.optionalAttrs;

  $scope.formStatus   = FORM_STATUS.EDITING;
  $scope.initializing = true;
  $scope.registerForm = {};
  $scope.displayStar  = {};
  $scope.collapse     = true;

  ///////////////////////////////////////////////
  //
  // Init Function
  //
  ///////////////////////////////////////////////

  //Init candidate value, such as BandID
  initCandidateValues();
  //Init star sign of required fields in register page
  initReqFieldStar();
  
  $(document).ready(function () {
    //Disabled the scroll function for input [type = number]
    dashboardSharedService.disabledInputNumScroll();
  });

  ///////////////////////////////////////////////
  //
  // Widget Function
  //
  ///////////////////////////////////////////////

  $scope.closeAlert = function () {
    $scope.formStatus = FORM_STATUS.EDITING;
  };

  ///////////////////////////////////////////////
  //
  // Register Lora Gateway
  //
  ///////////////////////////////////////////////

  // Change collapse sign status
  $scope.changeCollapse = function () {
    $scope.collapse = !$scope.collapse;
  };

  //Register Lora Gateway
  $scope.finish = function (isValid) {
    closeAlert();
    //Vlidate if the input field format are valid, for example, input[type='number'] enter text will be invalid
    if (isValid || isValid === undefined) {
      //1.Assemble required fields for lora gateway registry
      let registerEntry = {};
      for (let index in LORA_GW_REG_REQUIRED_FIELDS) {
        let requiredField = LORA_GW_REG_REQUIRED_FIELDS[index];
        if (requiredField === BandID) {
          registerEntry[requiredField] = dashboardSharedService.parseBandID($scope.registerForm[requiredField], $scope.bandIDs);
        }
        else {
          registerEntry[requiredField] = $scope.registerForm[requiredField];
        }
      }

      //2.Assemble optional fields for lora gateway registry
      for (let index in LORA_GW_REG_OPTIONAL_FIELDS) {
        let optionalField = LORA_GW_REG_OPTIONAL_FIELDS[index];
        if ($scope.registerForm[optionalField] !== undefined && $scope.registerForm[optionalField] && $scope.registerForm[optionalField] !== "") {
          if (optionalField === InstallationDate) {
            registerEntry[optionalField] = $scope.registerForm[optionalField].toISOString();
          }
          else {
            registerEntry[optionalField] = $scope.registerForm[optionalField];
          }
        }
      }

      //3.Validate the required fields exist or not, if not send error message
      let validationResult = formValidator.validateRegRequiredAttributes(registerEntry, LORA_GW_REG_REQUIRED_FIELDS);
      if (validationResult.status === "success") {
        $scope.formStatus = FORM_STATUS.SUBMITTED;
        loraGatewayService.regLoraGateway(registerEntry)
          .then(function (response) {
            if (response.status === "success") {
              $scope.formStatus = FORM_STATUS.SUBMITTED;
              $window.alert(SUCCESS_MSG);
              $window.location.href = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
            }
            else {
              $scope.formStatus = FORM_STATUS.INVALID;
              $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
              $window.alert("Error occurred due to: \n" + $scope.errorMessage);
              angular.element(".dashboard__content").scrollTop(0);
            }
          });
      }
      else {
        $scope.formStatus = FORM_STATUS.INVALID;
        $scope.errorMessage = validationResult.errorMessage;
        $window.alert(validationResult.errorMessage);
        angular.element(".dashboard__content").scrollTop(0);
      }
    }
    else {
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      $scope.initializing = false;
      $scope.formStatus = FORM_STATUS.INVALID;
      angular.element(".dashboard__content").scrollTop(0);
    }
  };

  ///////////////////////////////////////////////
  //
  // Private Function
  //
  ///////////////////////////////////////////////

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
    let bandIDResp = dashboardSharedService.candidateValues.BandID;
    // Init band id array and its default value
    $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(bandIDResp);
    $scope.registerForm.BandID = dashboardSharedService.setArrAndObjDefaultValue($scope.bandIDs);
  }

  function initReqFieldStar() {
    for (let index in LORA_GW_REG_REQUIRED_FIELDS) {
      let requiredField = LORA_GW_REG_REQUIRED_FIELDS[index];
      $scope.displayStar[requiredField] = true;
    }
  }

  function closeAlert() {
    $scope.formStatus = FORM_STATUS.EDITING;
  }
};
