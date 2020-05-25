'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  const TIMEOUT  = 30000;
  let self       = this;

  ///////////////////////////////////////////////////////////////
  //
  // Get Multicast Group Information
  //
  ///////////////////////////////////////////////////////////////

  //DASHBOARD EDIT BLE APPLICATION PAGE
  //Get BLE Application By BLE Application ID
  self.getBleApplication = function (bleAppID) {
    return $q(function (resolve) {
      let url = appConfig.nodeServer + dashTableConfig.BleApplication.url + "/?bleAppID=" + bleAppID;
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  self.getBleApplications = function (bleAppIDsArray) {
    let bleAppIDs = bleAppIDsArray.join();
    return $q(function (resolve) {
      let url = appConfig.nodeServer + dashTableConfig.BleApplication.url + "/?bleAppID=" + bleAppIDs;
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //DASHBOARD OVERVIEW PAGE AND BLE APPLICATION TABLE PAGE
  //Get Ble Applications By CreatedBy
  self.getBleApplicationsByCurrentUser = function () {
    return $q(function (resolve) {
      let url = appConfig.nodeServer + dashTableConfig.BleApplication.createdByUrl;
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

  //NEW BLE APPLICATION PAGE
  //Register BLE APPLICATION
  self.registerBleApplication = function (registerEntry) {
    let url = appConfig.nodeServer + dashTableConfig.BleApplication.url;
    return $q(function (resolve) {
      $http.post(url, registerEntry, { timeout: TIMEOUT }).then(function (response) {
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

  //EDIT BLE APPLICATION PAGE
  //Update Ble Application 
  self.updateBleApplication = function (editEntry) {
    let url = appConfig.nodeServer + dashTableConfig.BleApplication.url;
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

  //BLE APPLICATION TABLE PAGE
  //Delete Ble Application
  self.delBleApplication = function (bleAppID) {
    let url = appConfig.nodeServer + dashTableConfig.BleApplication.url + "/?bleAppID=" + bleAppID;
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };
};