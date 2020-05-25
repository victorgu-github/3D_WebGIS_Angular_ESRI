'use strict';

module.exports = function ($scope, $routeParams, $window, loraDeviceService, dashboardSharedService, 
    loraDevEditValidateService, editSharedService, dashTableConfig) {

    let loraDeviceTableUrl = dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;
    
    $scope.mtEditEntry;

    ///////////////////////////////////////////
    //
    // Initialize Function
    //
    ///////////////////////////////////////////

    initMtEditEntry();

    ///////////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////////

    //submit the update and update the record in system
    $scope.finish = function () {
        let mtEditEntry = {
            applicationID: $scope.mtEditEntry.ApplicationID,
            devEUI:        $scope.mtEditEntry.DevEUI,
            maintCommand:  $scope.mtEditEntry.CurrentMtStatus ? "enable" : "disable",
            comments:      $scope.mtEditEntry.mtComments
        };
        let validationResult = loraDevEditValidateService.validateMtAttr(mtEditEntry);
        if (validationResult.status === "success") {
            loraDeviceService.updateMtStatus(mtEditEntry).then(function (response) {
                if (response.status === "success") {
                    let successMessage = "Lora device successfully update";
                    $window.alert(successMessage);
                    $window.location.href = loraDeviceTableUrl;
                }
                else {
                    $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: \n" + $scope.errorMessage);
                }
            });
        } else {
            $scope.errorMessage = validationResult.message;
            $window.alert(validationResult.message);
        }
    };

    ///////////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////////

    //Init $scope.mtEditEntry according to editSharedService.editSharedMaintenanceEntry
    function initMtEditEntry() {
        $scope.mtEditEntry = editSharedService.editSharedMaintenanceEntry;
    }
};
