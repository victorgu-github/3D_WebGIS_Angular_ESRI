'use strict';

module.exports = function () {
  let self = this;

  const SUB_TYPE = "SubType";

  //////////////////////////////////////////////
  //
  // Shared Function
  //
  //////////////////////////////////////////////

  self.regex = {
    EUIPattern: '^[a-zA-Z0-9]{16}$',
    AddrPattern: '^[a-zA-Z0-9]{8}$',
    GatewayIDPattern: '^[a-zA-Z0-9]{16}$',
    GatewayIPPattern: '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
  };

  //Validate if registerForm include all the required fields
  //Applied For: 1. Lora Device Register; 2. Lora Gateway Register;
  self.validateRegRequiredAttributes = function (registerForm, requiredFields) {
    let validationResult = {
      status: "success",
      errorMessage: ""
    };
    for (let index in requiredFields) {
      let requiredField = requiredFields[index];
      if (registerForm[requiredField] === undefined || registerForm[requiredField] === null || registerForm[requiredField] === "") {
        validationResult.status = "false";
        validationResult.errorMessage = "Fields with * symbol should be valid and not empty.";
        break;
      }
    }
    return validationResult;
  };

  //Register lora device object should not have empty field, otherwise should throw an validation error
  self.validateAttributesNotEmpty = function (obj) {
    let result = true;
    //Obj should not be null and undefined
    if (!obj || Object.keys(obj).length === 0) {
      result = false;
    }
    else {
      //Obj's fields should not be null and undefined
      //SUB_TYPE is the optional attribute in lora device registry, so we need exclude it
      for (let key in obj) {
        if (key !== SUB_TYPE && obj.hasOwnProperty(key)) {
          if (obj[key] === undefined || obj[key] === null || obj[key] === "") {
            result = false;
            break;
          }
        }
      }
    }

    return result;
  };

  self.validDevAddr = function (DevAddr) {
    return typeof DevAddr === "string" && cleanHexInput(DevAddr).length === 8;
  };

  //Determine the type of an object
  self.getObjectType = function (obj) {
    let result = "";
    if (obj === undefined) {
      result = "undefined";
    }
    else if (obj === null) {
      result = "null";
    }
    else if (obj.constructor === String) {
      result = "string";
    }
    else if (obj.constructor === Array) {
      result = "array";
    }
    else if (obj.constructor === Object) {
      result = "object";
    }
    else if (obj.constructor === Number) {
      result = "number";
    }
    else if (obj.constructor === Boolean) {
      result = "boolean";
    }
    else if (obj.constructor === Date) {
      result = "date";
    }
    else if (obj.constructor === Symbol) {
      result = "symbol";
    }
    else {
      result = "unkown";
    }
    return result;
  };

  //Latitude and Longitude will work together. If one of the them is undefined and the other is not, they will not work.
  //1.RefLat = valid value and RefLon = valid value, valid
  //2.RefLat = undefined or null and RefLon = undefined or null, valid
  //3.RefLat = undefined or null and RefLon != undefined and null, invalid
  //4.RefLat != undefined and null and RefLon = undefined or null, invalid
  self.validRefLatAndRefLonForPost = function (registerEntry) {
    let result = true;
    if ((registerEntry.uniqueValues[0].RefLat === undefined || registerEntry.uniqueValues[0].RefLat === null) &&
      (registerEntry.uniqueValues[0].RefLon !== undefined && registerEntry.uniqueValues[0].RefLon !== null)) {
      result = false;
    }
    if ((registerEntry.uniqueValues[0].RefLon === undefined || registerEntry.uniqueValues[0].RefLon === null) &&
      (registerEntry.uniqueValues[0].RefLat !== undefined && registerEntry.uniqueValues[0].RefLat !== null)) {
      result = false;
    }
    return result;
  };

  //Latitude and Longitude will work together. If one of the them is null and the other is not, they will not work.
  //For put:
  //1.RefLat = valid value and RefLon = valid value, valid
  //2.RefLat = null and RefLon = null, valid
  //3.RefLat = null and RefLon != null, invalid
  //4.RefLat != null and RefLon = null, invalid
  self.validRefLatAndRefLonForPut = function (editEntry) {
    let result = true;
    if (editEntry.RefLat === null && editEntry.RefLon !== null || editEntry.RefLat !== null && editEntry.RefLon === null) {
      result = false;
    }
    return result;
  };

  //////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////

  let cleanHexInput = function (inpStr) {
    let outStr = "";
    for (let i = 0; i < inpStr.length; i++) {
      if (inpStr[i] + inpStr[i + 1] === "0x") {
        i++;
      } else if (inpStr[i] !== '_') {
        outStr = outStr + inpStr[i];
      }
    }
    return outStr.toUpperCase();
  };
};
