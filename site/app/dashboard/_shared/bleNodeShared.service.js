'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  const TIMEOUT  = 30000;
  let self       = this;

  ///////////////////////////////////////////////////////////////
  //
  // Get Multicast Group Information
  //
  ///////////////////////////////////////////////////////////////

  //EDIT BLE NODE PAGE
  //Get BLE Nodes Under BLE APP
  self.getBleNodes = function (bleAppID) {
    return $q(function (resolve) {
      let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes";
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //EDIT BLE NODE PAGE
  //Get Single BLE Node Under BLE APP
  self.getBleNode = function(bleAppID, macAddress){
    return $q(function (resolve) {
      let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes?macAddress=" + macAddress;
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //EDIT GENERAL USER APPLICATION PAGE
  //Get BLE Nodes For Ble App IDs
  self.getBleNodesForBleApps = function (bleAppIDsArray) {
    let promises = [];
    bleAppIDsArray.forEach((bleAppID) => {
      let url = appConfig.nodeServer + dashTableConfig.BleNode.url + parseInt(bleAppID) + "/nodes";
      promises.push($http.get(url, { timeout: TIMEOUT }));
    });
    return $q.all(promises).then(function (responses) {
      return HttpResponseHandler.handleResponse(responses);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, "", TIMEOUT);
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Register Multicast Group
  //
  ///////////////////////////////////////////////////////////////

  //NEW BLE NODE PAGE
  //Register BLE NODE
  self.registerBleNode = function (bleAppID, registerEntry) {
    let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes";
    return $q(function (resolve) {
      $http.post(url, registerEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //NEW BLE NODES BATCH REGISTER
  //Batch Register BLE NODES
  self.batchRegisterBleNodes = function (bleAppID, formData) {
    let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes/csvregister";
    return $q(function (resolve) {
      $http.post(url, formData, { timeout: TIMEOUT, transformRequest: angular.identity, headers: { 'Content-Type': undefined } }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Update Multicast Group
  //
  ///////////////////////////////////////////////////////////////

  //EDIT BLE NODE PAGE
  //Update BLE NODE 
  self.updateBleNode = function (bleAppID, editEntry) {
    let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes";
    return $q(function (resolve) {
      $http.put(url, editEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Delete Multicast Group
  //
  ///////////////////////////////////////////////////////////////

  //BLE NODE TABLE PAGE
  //Delete BLE NODEs
  self.delBleNodes = function (bleAppID, mac) {
    let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes?macAddress=" + mac.join();
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  self.delAllBleNodes = function (bleAppID) {
    let url = appConfig.nodeServer + dashTableConfig.BleNode.url + bleAppID + "/nodes/all";
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };
};