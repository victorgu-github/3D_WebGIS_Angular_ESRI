'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  const TIMEOUT = 30000;

  let self = this;

  let nodeServer          = appConfig.nodeServer;
  let baseUrl             = dashTableConfig.GeneralUserApplication.baseUrl;
  let baseUrlForLora      = dashTableConfig.GeneralUserApplication.baseUrlForLora;
  let baseUrlForGenUsr    = dashTableConfig.GeneralUserApplicationForGenUsr.baseUrl;
  let createdByUrlV2      = dashTableConfig.GeneralUserApplication.createdByUrlV2;
  let urlForExistDeviceV2 = dashTableConfig.GeneralUserApplicationForGenUsr.urlForExistDeviceV2;
  let urlV2               = dashTableConfig.GeneralUserApplication.urlV2;

  ////////////////////////////////////////////////////////////
  //
  // Get New Application Information
  //
  ////////////////////////////////////////////////////////////

  //EDIT PAGE
  //Get general user application info according to general user application id
  self.getGeneralUsrApp = function (generalUsrAppID) {
    let url = nodeServer + baseUrl + "?generalUserApplicationID=" + generalUsrAppID;
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });
    return promise;
  };

  //OVERVIEW PAGE, DEVICE TABLE PAGE
  //Get general user applications info according to lora application id
  self.getGeneralUsrApps = function (appIDArr) {
    let appIDStr = appIDArr.join();
    let url = nodeServer + baseUrlForLora + "?loraAppID=" + appIDStr;
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });
    return promise;
  };

  //GENERAL USER APPLICATIONS PAGE(NOT ADMIN USER GENERAL_USER_APP)
  //Get applications info for general user
  self.getGeneralUsrAppsByGenUsrAppID = function (generalAppIDs) {
    let generalAppIDsStr = generalAppIDs.join();
    let url = nodeServer + baseUrlForGenUsr + "?generalUserApplicationID=" + generalAppIDsStr;
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });
    return promise;
  };

  //EDIT PAGE
  //Get general user application info according to general user application id
  self.getGeneralUsrAppByV2 = function (generalUsrAppID) {
    let url = nodeServer + urlV2 + "?generalUserApplicationID=" + generalUsrAppID;
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });
    return promise;
  };

  //GENERAL USER APPLICATIONS PAGE(NOT ADMIN USER GENERAL_USER_APP)
  //Get applications info for general user
  self.getGeneralUsrAppsForExistDeviceV2 = function (generalAppIDs) {
    let generalAppIDsStr = generalAppIDs.join();
    let url = nodeServer + urlForExistDeviceV2 + "?generalUserApplicationID=" + generalAppIDsStr;
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });
    return promise;
  };

  //OVERVIEW PAGE, GENERAL USER APPLICATION TABLE PAGE
  //Get general user applications info according to createdBy userName and accessRole
  self.getGeneralUsrAppsCreatedByV2 = function (username, accessRole) {
    let url = nodeServer + createdByUrlV2 + "?username=" + username + "&accessRole=" + accessRole;
    return $q(function (resolve) {
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //////////////////////////////////////////////////////////
  //
  // Register General User Application
  //
  //////////////////////////////////////////////////////////

  //Register general user application in the system
  self.registerGeneralUsrApp = function (registerBody) {
    let url = "";
    url += nodeServer + baseUrl;
    return $q(function (resolve) {
      $http.post(url, registerBody, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  self.registerGeneralUsrAppByV2 = function (registerBody) {
    let url = "";
    url += nodeServer + urlV2;
    return $q(function (resolve) {
      $http.post(url, registerBody, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //////////////////////////////////////////////////////////
  //
  // Update General User Application
  //
  //////////////////////////////////////////////////////////

  //Update general user application in the system
  self.updateGeneralUsrApp = function (updateBody) {
    let url = "";
    url += nodeServer + baseUrl;
    return $q(function (resolve) {
      $http.put(url, updateBody, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //Update general user application in the system
  self.updateGeneralUsrAppByV2 = function (updateBody) {
    let url = "";
    url += nodeServer + urlV2;
    return $q(function (resolve) {
      $http.put(url, updateBody, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //////////////////////////////////////////////////////////
  //
  // Delete General User Application
  //
  //////////////////////////////////////////////////////////

  //Delete general user application in the system
  self.deleteGeneralUsrApp = function (generalUsrAppID) {
    let url = "";
    url += nodeServer + baseUrl + "?generalUserApplicationID=" + generalUsrAppID;
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };
};
