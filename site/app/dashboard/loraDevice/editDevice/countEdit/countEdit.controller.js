'use strict';

module.exports = function ($scope, $routeParams, $window, loraDeviceService, dashboardSharedService, editSharedService, 
    loraDevEditValidateService, dashTableConfig) {
    //private variable
    let cntEditEntry = {};
    let defaultFCntUp = 0;
    let defaultFCntDown = 0;
    let loraDeviceTableUrl = dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;

    //scope variable
    $scope.cntApplicationID = $routeParams.applicationID;
    $scope.cntDevEUI = $routeParams.devEUI;
    $scope.cntEditEntry = editSharedService.editSharedEntry;
    $scope.editOriginEntry = editSharedService.editOriginEntry;

    //Independant update each of the attributes
    $scope.updateAttribute = function (key) {
        editSharedService.updateAttribute(cntEditEntry, $scope.cntEditEntry, $scope.editOriginEntry, key);
    };

    //reset all the params FCntUp and FCntDown to default value
    $scope.reset = function () {
        $scope.cntEditEntry.FCntUp = defaultFCntUp;
        $scope.cntEditEntry.FCntDown = defaultFCntDown;
        cntEditEntry.FCntUp = defaultFCntUp;
        cntEditEntry.FCntDown = defaultFCntDown;
    };

    //submit the update and update the record in system
    $scope.finish = function (isValid) {
        if (isValid || isValid === undefined) {
            let validationResult = loraDevEditValidateService.validateCntEditAttr(cntEditEntry);
            if (validationResult.status === "success") {
                update(cntEditEntry, "update");
            } else {
                $scope.errorMessage = validationResult.message;
                $window.alert(validationResult.message);
            }
        }
        else {
            $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
            $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        }
    };

    ///////////////////////////////////////////////////
    //
    // Private function
    //
    ///////////////////////////////////////////////////
    function update(cntEditEntry, operationType) {
        cntEditEntry.ApplicationID = $scope.cntApplicationID;
        cntEditEntry.DevEUI = $scope.cntDevEUI;
        loraDeviceService.updateLoraDevice(cntEditEntry).then(function (response) {
            if (response.status === "success") {
                cntEditEntry = {};
                let successMessage = (operationType === "update") ? "Lora device successfully update" : "Lora device successfully reset to default values";
                $window.alert(successMessage);
                $window.location.href = loraDeviceTableUrl;
            }
        }).catch(function (error) {
            $scope.errorMessage = dashboardSharedService.parseErrorMessage(error.errors);
            $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        });
    }
};
