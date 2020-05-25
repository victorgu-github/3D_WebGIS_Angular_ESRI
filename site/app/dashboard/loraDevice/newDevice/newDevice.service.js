'use strict';

let parse = require('csv-parse');

module.exports = function ($http, dashTableConfig, dashboardSharedService) {
    let self = this;

    ////////////////////////////////////////////////////////
    //
    // Init the Lora Device Register Page
    //
    ////////////////////////////////////////////////////////

    self.addEmptyStringToArray = function (array) {
        if (array.length !== 0 && !array.includes("")) {
            array.unshift("");
        }
    };

    ////////////////////////////////////////////////////////
    //
    // Batch Register
    //
    ////////////////////////////////////////////////////////

    self.setDownLink = function (element, data, name) {
        element.attr({
            href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
            target: '_blank',
            download: name
        });
    };

    self.validCSVFiles = function (files) {
        //Follow ES6 Standard, use array.forEach array.every
        //array.forEach cannot return false when element is not csv file, 
        //so we consider use Array.every(isCSV) to determine if each of the element is csv file
        return Array.from(files).every(isCSV);
    };

    self.parseCSVStringToArray = function (string) {
        return new Promise(function (resolve, reject) {
            //csv-parse options: http://csv.adaltas.com/parse/
            //comment (char): Treat all the characters after this one as a comment. Defaults to '' (disabled).
            //skip_empty_lines (boolean): Don't generate records for empty lines (line matching /\s*/), defaults to false.
            parse(string, { comment: '#', skip_empty_lines: true }, function (err, output) {
                if (err) {
                    reject(err);
                } else {
                    resolve(output);
                }
            });
        });
    };

    //Right now we have parsed the csv file content to array, then we need to validate the arary
    //Notice: we only validate the first row in the array to see if the required fields provided or not, or invalid fields provided or not
    //        we don't validate the other rows of the array, content validation will be done in backend
    //1. validate the array according to device mode: "ABP", "OTAA"
    //2. If device mode is "ABP", we validate the array by "ABP", includeing required fields, not including invalid fields
    //3. If device mode is "OTAA", we validate the array by "OTAA", including required fields, not including invalid fields 
    self.validCSVArrayForABP = function (array) {
        let validationResult = {
            status: "success",
            errorMessage: []
        };
        //1.Condition 1: if array is not empty array, pass. Otherwise, throw error
        if (array.length >= 3) {
            let header = array[1];
            let body   = array.slice(2);
            //2.Condition 2: validate the csv file header, including required fields, not include invalid fields
            let headerValidResult = validateHeaderForABP(header);
            if (headerValidResult.status === "success") {
                let bodyValidResult = validateBodyForRequiredFields(headerValidResult.positions, header, body);
                if (bodyValidResult.status !== "success") {
                    validationResult.status = "false";
                    validationResult.errorMessage = validationResult.errorMessage.concat(bodyValidResult.errorMessage);
                }
            }
            else {
                validationResult.status = "false";
                validationResult.errorMessage = validationResult.errorMessage.concat(headerValidResult.errorMessage);
            }
        }
        else {
            validationResult.status = "false";
            validationResult.errorMessage.push("Cannot use empty csv file to register lora device, csv file should have header and body");
        }
        return validationResult;
    };

    self.validCSVArrayForOTAA = function (array) {
        let validationResult = {
            status: "success",
            errorMessage: []
        };
        //1.Condition 1: if array is not empty array, pass. Otherwise, throw error
        if (array.length >= 3) {
            let header = array[1];
            let body   = array.slice(2);
            //2.Condition 2: validate the csv file header, including required fields, not include invalid fields
            let headerValidResult = validateHeaderForOTAA(header);
            if (headerValidResult.status === "success") {
                let bodyValidResult = validateBodyForRequiredFields(headerValidResult.positions, header, body);
                if (bodyValidResult.status !== "success") {
                    validationResult.status = "false";
                    validationResult.errorMessage = validationResult.errorMessage.concat(bodyValidResult.errorMessage);
                }
            }
            else {

                validationResult.status = "false";
                validationResult.errorMessage = validationResult.errorMessage.concat(headerValidResult.errorMessage);
            }
        }
        else {
            validationResult.status = "false";
            validationResult.errorMessage.push("Cannot use empty csv file to register lora device, csv file should have header and body");
        }
        return validationResult;
    };

    //If csv array header has "MulticastAddr" attribute, all the "MulticastAddr" values should be the same
    self.validateCSVArrayMulticastAddr = function (array, MulticastAddr) {
        let validationResult = {
            status: "success",
            includeMulticastAddr: false,
            errorMessage: []
        };
        let header = array[1];
        //1.Condition 1: If csv file header include "MulticastAddr", the value must be same
        if (header.includes(MulticastAddr)) {
            validationResult.includeMulticastAddr = true;
            let bodyValidResult = validateBody(header, MulticastAddr, array);
            if (bodyValidResult.status !== "success") {
                validationResult.status = "false";
                validationResult.errorMessage = validationResult.errorMessage.concat(bodyValidResult.errorMessage);
            }
        }
        return validationResult;
    };

    //Parse the csv array to get the register body uniqueValue array
    //1.Get all the values for required fields
    //2.Get all the values for optional fields, if csv array include that optional fields
    self.parseCSVArrayToJSONArrayForABP = function (arrays) {
        let jsonArray = [];
        let headers = arrays[1];
        let batchRegistryFile = dashTableConfig.Devices.LoraDevice.batchRegistryFile;
        let validCondition = batchRegistryFile.ABP;
        let requiredFields = validCondition.requiredFields;
        let optionalFields = validCondition.optionalFields;
        return parseCSVArrayToJSONArray(arrays, jsonArray, headers, requiredFields, optionalFields);
    };

    self.parseCSVArrayToJSONArrayForOTAA = function (arrays) {
        let jsonArray = [];
        let headers = arrays[1];
        let batchRegistryFile = dashTableConfig.Devices.LoraDevice.batchRegistryFile;
        let validCondition = batchRegistryFile.OTAA;
        let requiredFields = validCondition.requiredFields;
        let optionalFields = validCondition.optionalFields;
        return parseCSVArrayToJSONArray(arrays, jsonArray, headers, requiredFields, optionalFields);
    };

    self.initClassesAndMulticastAddrArrayCSVNoMulticastAddr = function(classes, batchRegisterForm){
        batchRegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue(classes);
        batchRegisterForm.MulticastAddrArray = "";
        batchRegisterForm.disabledMulticastAddrArray = false;
    };

    self.initClassesAndMulticastAddrArrayCSVHasMulticastAddr = function(multicastAddr, classes, batchRegisterForm){
        batchRegisterForm.Class = dashboardSharedService.setArrAndObjDefaultValue(classes);
        batchRegisterForm.MulticastAddrArray = multicastAddr;
        batchRegisterForm.disabledMulticastAddrArray = true;
    };

    self.mergeCommonAttrToCSVObjArray = function (csvJSONObjectArray, ABPBatchRegisterEntry) {
        let array = [];
        csvJSONObjectArray.forEach(function (csvJSONObject) {
            Object.assign(csvJSONObject, ABPBatchRegisterEntry);
            array.push(csvJSONObject);
        });
        return array;
    };

    self.getBatchFile = function (downloadUrl) {
        return $http({ method: 'GET', url: downloadUrl });
    };

    self.batchFileBrowse = function (input, display) {
        let numFiles = input.get(0).files ? input.get(0).files.length : 1;
        let label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        let log = numFiles > 1 ? numFiles + ' files selected' : label;
        if (display.length) {
            display.val(log);
        } else {
            if (log) alert(log);
        }
    };

    self.prepareMulticastAddrArrayAndSubType = function (subTypeMap, registerForm, registerEntry, ClassRange) {
        // If key is "MulticastAddrArray", we will send MulticastAddrArray when $sccope.Class is valid Class
        // Such as Class 1 or 2
        if (ClassRange.includes(registerEntry.Class)) {
            if (Array.isArray(registerForm.MulticastAddrArray)) {
                registerEntry.MulticastAddrArray = registerForm.MulticastAddrArray;
            }
            else if (typeof registerForm.MulticastAddrArray === "string" && registerForm.MulticastAddrArray !== "") {
                registerEntry.MulticastAddrArray = dashboardSharedService.parseMulticastAddrArray(registerForm.MulticastAddrArray);
            }
            else {
                delete registerEntry.MulticastAddrArray;
            }
        }
        else {
            delete registerEntry.MulticastAddrArray;
        }

        // If key is "SubType", we will send SubType when $sccope.DevType is valid device type
        // Such as "smartswitch" which has SubType
        if (subTypeMap[registerForm.DevType] !== undefined) {
            registerEntry.SubType = registerForm.SubType;
        }
        else {
            delete registerEntry.SubType;
        }
    };

    self.prepareRegisterBody = function (subTypeMap, BatchRegisterForm, BatchRegisterEntry, CSVJSONObjectArray, ClassRange, optionalFields) {
        // If key is "MulticastAddrArray", we will send MulticastAddrArray when $sccope.Class is valid Class
        // Such as Class 1 or 2
        if (ClassRange.includes(BatchRegisterEntry.Class)) {
            if (BatchRegisterForm.MulticastAddrArray !== undefined && BatchRegisterForm.MulticastAddrArray !== null &&
                typeof BatchRegisterForm.MulticastAddrArray === "string") {
                BatchRegisterEntry.MulticastAddrArray = dashboardSharedService.parseMulticastAddrArray(BatchRegisterForm.MulticastAddrArray);
            }
        }
        else {
            delete BatchRegisterEntry.MulticastAddrArray;
        }

        // If key is "SubType", we will send SubType when $sccope.DevType is valid device type
        // Such as "smartswitch" which has SubType
        if (subTypeMap[BatchRegisterForm.DevType] !== undefined) {
            BatchRegisterEntry.SubType = BatchRegisterForm.SubType;
        }
        else {
            delete BatchRegisterEntry.SubType;
        }

        // Add uniqueValues to ABPBatchRegisterEntry
        BatchRegisterEntry.uniqueValues = CSVJSONObjectArray;
        BatchRegisterEntry.uniqueValues = rmEmptyStringForOptionalFields(BatchRegisterEntry.uniqueValues, optionalFields);
        BatchRegisterEntry.uniqueValues = transTextFieldsToNum(BatchRegisterEntry.uniqueValues, dashTableConfig.Devices.LoraDevice.batchRegistryFile.numFields);
    };

    //Parse validationResult.errorMessage array
    self.parseErrorMessage = function (errorMessages) {
        let errorMessageResult = "";
        for (let index in errorMessages) {
            let errorMessage = errorMessages[index];
            let count = parseInt(index) + 1;
            errorMessageResult += count + ": " + errorMessage + "\n";
        }
        return errorMessageResult;
    };

    ////////////////////////////////////////////////////////
    //
    // Private Function
    //
    ////////////////////////////////////////////////////////

    function isCSV(file) {
        return file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
    }

    function parseCSVArrayToJSONArray(arrays, jsonArray, headers, requiredFields, optionalFields) {
        for (let i = 2; i < arrays.length; i++) {
            let jsonObject = {};
            let array = arrays[i];
            for (let j in headers) {
                let header = headers[j];
                //If the header belongs to requiredFields or optionalFields, it is a valid header
                //We will add the value of that column to json object array, and pass it to uniquevalues array
                if (requiredFields.includes(header) || optionalFields.includes(header)) {
                    jsonObject[header] = array[j];
                }
            }
            jsonArray.push(jsonObject);
        }
        return jsonArray;
    }

    //Validate the csv first row
    function validateHeaderForABP(header) {
        return validateHeader(header, dashTableConfig.Devices.LoraDevice.batchRegistryFile.ABP);
    }

    function validateHeaderForOTAA(header) {
        return validateHeader(header, dashTableConfig.Devices.LoraDevice.batchRegistryFile.OTAA);
    }

    function validateHeader(header, validCondition) {
        let requiredFields = validCondition.requiredFields;
        let invalidFields  = validCondition.invalidFields;
        let headerValidResult = {
            status: "success",
            errorMessage: [],
            positions: []
        };
        //Validation
        //1.Condition1: validate if the header include all the required fields
        //              and find all the required fields position in the header
        let requiredFieldExistResult = validateRequiredFields(header, requiredFields);
        if (requiredFieldExistResult.status === "success") {
            headerValidResult.positions = requiredFieldExistResult.positions;
            //2.Condition2: validate if the header not include the invalid fields
            let notIncludeInvalidFieldsResult = validateInvalidFields(header, invalidFields);
            if (notIncludeInvalidFieldsResult.status !== "success") {
                headerValidResult.status = "false";
                headerValidResult.errorMessage = headerValidResult.errorMessage.concat(notIncludeInvalidFieldsResult.errorMessage);
            }
        }
        else {
            headerValidResult.status = "false";
            headerValidResult.errorMessage = headerValidResult.errorMessage.concat(requiredFieldExistResult.errorMessage);
        }
        return headerValidResult;
    }

    //Validate the csv file header include all the required fields
    function validateRequiredFields(header, requiredFields) {
        let requiredFieldExistResult = {
            status: "success",
            errorMessage: [],
            positions: []
        };
        //Iterate required fields array, find all the required field which not exist in the csv file header
        for (let index in requiredFields) {
            let requiredField = requiredFields[index];
            if (header.includes(requiredField)) {
                requiredFieldExistResult.positions.push(header.indexOf(requiredField));
            }
            else {
                requiredFieldExistResult.status = "false";
                requiredFieldExistResult.errorMessage.push("CSV file header doesn't include required field: " + requiredField);
            }
        }
        return requiredFieldExistResult;
    }

    //Validate whether csv file rows include content for required fields
    function validateBodyForRequiredFields(positions, header, body) {
        let bodyIncludeContentForRequiredFieldsResult = {
            status: "success",
            errorMessage: []
        };
        for (let i = 0; i < body.length; i++) {
            let row = body[i];
            for (let j = 0; j < positions.length; j++) {
                let position = positions[j];
                if (!row[position]) {
                    bodyIncludeContentForRequiredFieldsResult.status = "false";
                    bodyIncludeContentForRequiredFieldsResult.errorMessage.push("CSV file row " + (i + 3) + " not include required fields " + "'" + header[position] + "'");
                }
            }
        }
        return bodyIncludeContentForRequiredFieldsResult;
    }

    //Validate the csv file header not include the invalid fields
    function validateInvalidFields(header, invalidFields) {
        let notIncludeInvalidFieldsResult = {
            status: "success",
            errorMessage: []
        };
        //Iterate invalid fields array, find all the invalid field which exist in the csv file header
        for (let index in invalidFields) {
            let invalidField = invalidFields[index];
            if (header.includes(invalidField)) {
                notIncludeInvalidFieldsResult.status = "false";
                notIncludeInvalidFieldsResult.errorMessage.push("CSV file header include the invalid field: " + invalidField);
            }
        }
        return notIncludeInvalidFieldsResult;
    }

    //Validate csv array Body
    //1.Notice: after previous validation, array at least two rows
    function validateBody(header, attribute, array) {
        let validationResult = {
            status: "success",
            errorMessage: []
        };
        let position = header.findIndex((element) => {
            return element === attribute;
        });
        let value = array[2][position];
        for (let i = 2; i < array.length; i++) {
            let row = array[i];
            if (row[position] !== value) {
                validationResult.status = "false";
                validationResult.errorMessage.push("The MulticastAddr value are not the same in csv file");
                break;

            }
        }
        return validationResult;
    }

    //Remove empty string for text fields
    function rmEmptyStringForOptionalFields(array, fields) {
        let result = array.slice();
        if (Array.isArray(fields) && fields.length !== 0) {
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                result.forEach((element) => {
                    if (element[field] === "") {
                        delete element[field];
                    }
                });
            }
        }
        return result;
    }

    //Transfer text fields to number
    function transTextFieldsToNum(array, fields) {
        let result = array.slice();
        if (Array.isArray(fields) && fields.length !== 0) {
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                result.forEach((element) => {
                    element[field] = parseInt(element[field]);
                });
            }
        }
        return result;
    }
};