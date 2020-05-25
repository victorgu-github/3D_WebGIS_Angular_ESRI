'use strict';

module.exports = function () {

  this.handleResponse = function (response) {
    //If response = null, response.error will throw a system error, cannot read property "error" from null
    //If response = 1 or "string" or [] etc., response.error = undefined
    if (response === null || !response.error) {
      return processSuccess(response);
    } else {
      return processError(response);
    }
  };

  this.handleError = function(error, url, timeout) {
    if (error.status < 0) {
      console.warn("Request to " + url + " timeout after " + timeout + "ms");
    } else {
      console.warn("An error occurred due to: " + JSON.stringify(error.data));
    }

    return {
      "status": "error",
      "errors": [{
        message: JSON.stringify(error.data)
      }]
    };
  };

  //Parse validationResult.errorMessage array
  this.parseErrorMessage = function (errorMessages) {
    let errorMessageResult = "";
    for (let index in errorMessages) {
      let errorMessage = errorMessages[index];
      let count = parseInt(index) + 1;
      errorMessageResult += count + ". " + errorMessage.message + "\n";
    }
    return errorMessageResult;
  };

  function processError(response) {
    let errorMessages = [];
    let errors = response.error.errors;
    for (let error in errors) {
      if (errors.hasOwnProperty(error)) {
        errorMessages.push({
          "message": errors[error]
        });
      }
    }
    return {
      "status": "error",
      "errors": errorMessages
    };
  }

  function processSuccess(response) {
    return {
      "status": "success",
      "content": response
    };
  }

};