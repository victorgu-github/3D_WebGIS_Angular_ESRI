'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  const TIMEOUT = 30000;
  let self = this;
  let nodeServer = appConfig.nodeServer;
  let baseUrl = dashTableConfig.MulticastGroup.baseUrl;

  ///////////////////////////////////////////////////////////////
  //
  // Get Multicast Group Information
  //
  ///////////////////////////////////////////////////////////////

  //DASHBOARD OVERVIEW PAGE AND LORA MULTICAST GROUP TABLE PAGE AND EDIT MULTICAST GROUP PAGE
  //Get Multicast Group By ApplicationIDs
  self.getMulticastGroups = function (appIDRange) {
    let url = nodeServer + baseUrl + "/?applicationID=";
    if (appIDRange !== undefined && appIDRange !== null) {
      url += appIDRange.join(",");
    }
    return $q(function (resolve) {
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Register Multicast Group
  //
  ///////////////////////////////////////////////////////////////

  //NEW LORA MULTICAST GROUP PAGE
  //Register LoRa Multicast Group
  self.registerMulticastGroup = function (registerEntry) {
    let url = nodeServer + baseUrl;
    return $q(function (resolve, reject) {
      $http.post(url, registerEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Update Multicast Group
  //
  ///////////////////////////////////////////////////////////////

  //EDIT LORA MULTICAST GROUP PAGE
  //Update LoRa Multicast Group
  self.updateMulticastGroup = function (editEntry) {
    let url = nodeServer + baseUrl;
    return $q(function (resolve, reject) {
      $http.put(url, editEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Delete Multicast Group
  //
  ///////////////////////////////////////////////////////////////

  //MULTICAST GROUP TABLE PAGE
  //Delete LoRa Multicast Group
  self.deleteMulticastGroup = function (applicationID, multicastAddr) {
    let url = nodeServer + baseUrl + "/" + applicationID + "/" + multicastAddr;
    return $q(function (resolve, reject) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Shared Function
  // (Put here, because it will be shared by register and update) 
  //
  ///////////////////////////////////////////////////////////////

  // Get subTypes Map
  self.parseSubTypeMap = function (subDeviceTypes) {
    let subTypeMap = {};
    for (let index in subDeviceTypes) {
      let subDeviceType = subDeviceTypes[index];
      subTypeMap[subDeviceType.parentDeviceType] = subDeviceType.subDeviceTypes;
    }
    return subTypeMap;
  };

  // Get subTypes array according to current device type and sub device types from candidate values
  self.parseCurrentSubTypes = function (deviceType, subTypeMap) {
    let result = [];
    if (subTypeMap[deviceType] !== undefined) {
      result = subTypeMap[deviceType];
    }
    return result;
  };

  // Add empty string to array, which is not empty array and not include empty string
  self.addEmptyStringToArray = function (array) {
    if (array.length !== 0 && !array.includes("")) {
      array.unshift("");
    }
  };

  self.parseErrorMessage = function (responseErrorMessage) {
    let finalErrorMessage = "";
    for (let i = 0; i < responseErrorMessage.length; i++) {
      if (responseErrorMessage[i].message && responseErrorMessage[i].message !== null) {
        let errorMessageJSON = JSON.parse(responseErrorMessage[i].message);
        if (errorMessageJSON.error.hasOwnProperty("errors")) {
          for (let j = 0; j < errorMessageJSON.error.errors.length; j++) {
            finalErrorMessage += j + 1 + ". " + errorMessageJSON.error.errors[j].message + ";\n";
          }
        } else {
          finalErrorMessage += errorMessageJSON.error.message + ";\n";
        }
      }
    }
    return finalErrorMessage;
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

};