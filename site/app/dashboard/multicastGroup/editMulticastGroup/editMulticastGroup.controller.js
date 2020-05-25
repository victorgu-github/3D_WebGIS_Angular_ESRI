'use strict';

module.exports = function ($scope, $window, $routeParams, dashTableConfig, dashboardSharedService, MulticastGroupSharedService) {
  //Const used for error message
  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING: "editing",
    INVALID: "invalid"
  };
  const DEFAULT_ERROR_MESSAGE = "";

  let notUpdateAttributes = dashTableConfig.MulticastGroup.updateAttributes.notUpdateAttributes;

  $scope.multicastGroupTableUrl = dashTableConfig.MulticastGroup.MulticastGroupTableCommonUrl;
  $scope.applicationID = $routeParams.applicationID;
  $scope.multicastAddr = $routeParams.multicastAddr;
  $scope.formStatus = FORM_STATUS.EDITING;
  $scope.initializing = true;
  $scope.editEntry = {};

  ////////////////////////////////////////////////////////
  //
  // Initialization Process
  //
  ////////////////////////////////////////////////////////

  initMulticastGroupEditPage();
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
    closeAlert();
  };

  // Submit And Update Multicast Group Info
  $scope.submit = function (isValid) {
    closeAlert();
    let editEntry = {};
    //1.Disabled attributes not included into update request body, except "ApplicationID" and "MulticastAddr"
    //2.Hide attributes not included into update request body
    for (let key in $scope.editEntry) {
      if (!notUpdateAttributes.includes(key)) {
        editEntry[key] = $scope.editEntry[key];
      }
    }
    if (isValid || isValid === undefined) {
      //Update multicast group using web api
      MulticastGroupSharedService.updateMulticastGroup(editEntry).then(function (response) {
        if (response.status === "success") {
          $window.alert("Lora multicast group successfully update");
          $window.location.href = $scope.multicastGroupTableUrl;
          $scope.initializing = false;
          $scope.formStatus = FORM_STATUS.SUBMITTED;
        }
      }).catch(function (error) {
        $scope.errorMessage = MulticastGroupSharedService.parseErrorMessage(error.errors);
        $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        $scope.initializing = false;
        $scope.formStatus = FORM_STATUS.INVALID;
      });
    }
    else {
      $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      $scope.initializing = false;
      $scope.formStatus = FORM_STATUS.INVALID;
    }
  };

  ////////////////////////////////////////////////////////
  //
  // Private Function
  //
  ////////////////////////////////////////////////////////

  // Init Multicast Group Edit Page
  function initMulticastGroupEditPage(){
    MulticastGroupSharedService.getMulticastGroups([$scope.applicationID]).then(function(response){
      if (response.status === "success") {
        let multicastGroups = response.content.multicastSessions[0].data;
        $scope.editEntry = multicastGroups.find((element) => {
          return element.MulticastAddr === $scope.multicastAddr;
        });
        if ($scope.editEntry) {
          $scope.initializing = false;
          $scope.formStatus = FORM_STATUS.EDITING;
        }
        else {
          $scope.errorMessage = "Cannot find this multicast group under given application";
          $window.alert($scope.errorMessage);
          $scope.initializing = false;
          $scope.formStatus = FORM_STATUS.INVALID;
        }
      }
    }).catch(function(error){
      $scope.errorMessage = MulticastGroupSharedService.parseErrorMessage(error.errors);
      $window.alert("Error occurred due to: \n" + $scope.errorMessage);
      $scope.initializing = false;
      $scope.formStatus = FORM_STATUS.INVALID;
    });
  }

  // Close Error Message
  function closeAlert() {
    $scope.formStatus = FORM_STATUS.EDITING;
    $scope.errorMessage = DEFAULT_ERROR_MESSAGE;
  }
};
