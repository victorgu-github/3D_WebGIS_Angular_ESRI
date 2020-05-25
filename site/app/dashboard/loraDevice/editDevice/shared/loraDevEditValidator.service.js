'use strict';

module.exports = function () {
    let self = this;

    //Validate the update body for special fields (such as FCntUp and FCntDown) of lora device count edit
    self.validateCntEditAttr = function (cntEditEntry) {
        let validationResult = {
            status: "success",
            message: ""
        };
        if (cntEditEntry.hasOwnProperty("FCntUp")) {
            validationResult = isInteger(cntEditEntry.FCntUp);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cntEditEntry.hasOwnProperty("FCntDown")) {
            validationResult = isInteger(cntEditEntry.FCntDown);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        return validationResult;
    };


    //Validate the update body for special fields (such as EncryptedMacCmds and UnencryptedMacCmds) of lora device count edit
    self.validatecmdEditAttr = function (cmdEditEntry) {
        let validationResult = {
            status: "success",
            message: ""
        };
        if (cmdEditEntry.hasOwnProperty("FPort")) {
            validationResult = isInteger(cmdEditEntry.FPort);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("DownlinkConfirmed")) {
            validationResult = isBoolean(cmdEditEntry.DownlinkConfirmed);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("EncryptedMacCmds")) {
            validationResult = isString(cmdEditEntry.EncryptedMacCmds);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("UnencryptedMacCmds")) {
            validationResult = isString(cmdEditEntry.UnencryptedMacCmds);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("UserPayloadData")) {
            validationResult = isString(cmdEditEntry.UserPayloadData);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("HasEncryptedMacCmdDelivered")) {
            validationResult = isSpecialNumber(cmdEditEntry.HasEncryptedMacCmdDelivered);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("HasUnencryptedMacCmdDelivered")) {
            validationResult = isSpecialNumber(cmdEditEntry.HasUnencryptedMacCmdDelivered);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        if (cmdEditEntry.hasOwnProperty("HasUserPayloadDataDelivered")) {
            validationResult = isSpecialNumber(cmdEditEntry.HasUserPayloadDataDelivered);
            if (validationResult.status !== "success") {
                return validationResult;
            }
        }
        return validationResult;
    };

    //Only validate maintanence status
    self.validateMtAttr = function (mtEditEntry) {
        let validationResult = {
            status: "success",
            message: ""
        };
        let maintCommand = mtEditEntry.maintCommand;
        if (maintCommand === undefined || maintCommand === null) {
            validationResult.status = "error";
            validationResult.message = "Must provide maintanence status";
        }
        else {
            if (maintCommand !== "enable" && maintCommand !== "disable") {
                validationResult.status = "error";
                validationResult.message = "Maintenance status must be a valid string";
            }
        }
        return validationResult;
    };

    ///////////////////////////////////////////////
    //
    // Private Function
    //
    //////////////////////////////////////////////
    function isInteger(attribute) {
        let validationResult = {
            status: "success",
            message: ""
        };
        if (!Number.isInteger(attribute)) {
            validationResult.status = "error";
            validationResult.message = attribute + " is not a valid Integer";
        }
        return validationResult;
    }

    function isBoolean(attribute) {
        let validationResult = {
            status: "success",
            message: ""
        };
        if (typeof attribute !== 'boolean') {
            validationResult.status = "error";
            validationResult.message = attribute + " is not a boolean true or false";
        }
        return validationResult;
    }

    function isString(attribute) {
        let validationResult = {
            status: "success",
            message: ""
        };
        if (typeof attribute !== 'string') {
            validationResult.status = "error";
            validationResult.message = attribute + " is not a string";
        }
        return validationResult;
    }

    function isSpecialNumber(attribute) {
        let validationResult = {
            status: "success",
            message: ""
        };
        if (attribute !== '01' && attribute !== '00') {
            validationResult.status = "error";
            validationResult.message = attribute + " is not a '01' or '00'";
        }
        return validationResult;
    }
};
