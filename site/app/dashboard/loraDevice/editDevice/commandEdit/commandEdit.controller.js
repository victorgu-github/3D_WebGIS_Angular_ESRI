'use strict';

module.exports = function ($scope, $routeParams, $window, loraDeviceService, dashboardSharedService, editSharedService, 
    loraDevEditValidateService, dashTableConfig) {
    //private variable
    let cmdEditEntry = {};
    let defaultFPort = 1;
    let defaultDownlinkConfirmed = false;
    let defaultEncryptedMacCmds = "";
    let defaultUnencryptedMacCmds = "";
    let defaultUserPayloadData = "";
    let defaultHasEncryptedMacCmdsDelivered = "00";
    let defaultHasUnencryptedMacCmdsDelivered = "00";
    let defaultHasUserPayloadDataDelivered = "00";
    let loraDeviceTableUrl = dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;

    //scope variable
    $scope.cmdApplicationID = $routeParams.applicationID;
    $scope.cmdDevEUI = $routeParams.devEUI;
    $scope.cmdEditEntry = editSharedService.editSharedEntry;
    $scope.editOriginEntry = editSharedService.editOriginEntry;
    
    //Independant update each of the attributes
    $scope.updateAttribute = function (key) {
        editSharedService.updateAttribute(cmdEditEntry, $scope.cmdEditEntry, $scope.editOriginEntry, key);
    };

    //reset all the params FcmdUp and FcmdDown to default value
    $scope.reset = function () {
        $scope.cmdEditEntry.FPort = defaultFPort;
        $scope.cmdEditEntry.DownlinkConfirmed = defaultDownlinkConfirmed;
        $scope.cmdEditEntry.EncryptedMacCmds = defaultEncryptedMacCmds;
        $scope.cmdEditEntry.UnencryptedMacCmds = defaultUnencryptedMacCmds;
        $scope.cmdEditEntry.UserPayloadData = defaultUserPayloadData;
        $scope.cmdEditEntry.HasEncryptedMacCmdDelivered = defaultHasEncryptedMacCmdsDelivered;
        $scope.cmdEditEntry.HasUnencryptedMacCmdDelivered = defaultHasUnencryptedMacCmdsDelivered;
        $scope.cmdEditEntry.HasUserPayloadDataDelivered = defaultHasUserPayloadDataDelivered;
        
        cmdEditEntry.FPort = defaultFPort;
        cmdEditEntry.DownlinkConfirmed = defaultDownlinkConfirmed;
        cmdEditEntry.EncryptedMacCmds = defaultEncryptedMacCmds;
        cmdEditEntry.UnencryptedMacCmds = defaultUnencryptedMacCmds;
        cmdEditEntry.UserPayloadData = defaultUserPayloadData;
        cmdEditEntry.HasEncryptedMacCmdDelivered = defaultHasEncryptedMacCmdsDelivered;
        cmdEditEntry.HasUnencryptedMacCmdDelivered = defaultHasUnencryptedMacCmdsDelivered;
        cmdEditEntry.HasUserPayloadDataDelivered = defaultHasUserPayloadDataDelivered;
    };

    //submit the update and update the record in system
    $scope.finish = function () {
        let validationResult = loraDevEditValidateService.validatecmdEditAttr(cmdEditEntry);
        if (validationResult.status === "success") {
            update(cmdEditEntry, "update");
        } else {
            $scope.errorMessage = validationResult.message;
            $window.alert(validationResult.message);
        }
    };

    ///////////////////////////////////////////////////
    //
    // Private function
    //
    ///////////////////////////////////////////////////
    //Call web api and finish the command fields edit
    function update(cmdEditEntry, operationType) {
        cmdEditEntry.ApplicationID = $scope.cmdApplicationID;
        cmdEditEntry.DevEUI = $scope.cmdDevEUI;
        loraDeviceService.updateLoraDevice(cmdEditEntry).then(function (response) {
            if (response.status === "success") {
                cmdEditEntry = {};
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
