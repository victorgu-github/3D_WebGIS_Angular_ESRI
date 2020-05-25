'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  let self = this;
  const TIMEOUT = 30000;
  let baseUrl = dashTableConfig.Devices.LoraGateway.baseUrl;

  ////////////////////////////////////////////////////////////
  //
  // Get Lora Gateway Information
  //
  ////////////////////////////////////////////////////////////

  //OVERVIEW PAGE, LORA GATEWAY TABLE PAGE, LORA GATEWAY MONITOR MAP VIEW PAGE
  //Get number of lora gateway in the system
  self.getLoraGatewaysInfo = function () {
    let url = appConfig.nodeServer + baseUrl.urlPrefix;
    return $q(function (resolve) {
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //LORA GATEWAY MONITOR 2D MAP VIEW
  //Get lora gateways info for different layers: 1. Calgary Test; 2. Calgary Pord; 3. Shanghai Test; 4. Shanghai Prod;
  self.getLoraGatewaysForLayers = function (urls) {
    let promises = [];
    for (let index in urls) {
      let url = urls[index];
      let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      }).catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIMEOUT);
      });
      promises.push(promise);
    }
    return $q.all(promises).then(function (responses) {
      let result = { status: "error", content: [], displayOptions:{} };
      for (let index in responses) {
        let response = responses[index];
        if (response.status === "success") {
          result.status = "success";
          result.content = result.content.concat(response.content.result);
          result.displayOptions[index] = true;
        }
      }
      return result;
    });
  };

  //EDIT LORA GATEWAY PAGE
  //Get single lora gateway info
  self.getLoraGateway = function (GatewayMAC) {
    return $q(function (resolve) {
      let url = appConfig.nodeServer + baseUrl.urlPrefix;
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        let gatewayObjArray = response.data.result;
        let gatewayObj = gatewayObjArray.find((element) => { return element.GatewayMAC === GatewayMAC; });
        gatewayObj = gatewayObj ? gatewayObj : null;
        resolve(HttpResponseHandler.handleResponse(gatewayObj));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ////////////////////////////////////////////////////////////
  //
  // Register Lora Gateway
  //
  ////////////////////////////////////////////////////////////

  //LORA GATEWAY NEW GATEWAY PAGE
  //Register new lora gateway
  self.regLoraGateway = function (registerEntry) {
    let url = appConfig.nodeServer + baseUrl.urlPrefix;
    return $q(function (resolve) {
      $http.post(url, registerEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //////////////////////////////////////////////
  //
  // Update Lora Gateway
  //
  //////////////////////////////////////////////

  //EDIT LORA GATEWAY PAGE
  //Update lora gateway information
  self.updateLoraGateway = function (editEntry) {
    let url = appConfig.nodeServer + baseUrl.urlPrefix;
    return $q(function (resolve) {
      $http.put(url, editEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ////////////////////////////////////////////////
  //
  // Delete Lora Gateway Information
  //
  ////////////////////////////////////////////////

  //LORA GATEWAY DEVICE TABLE PAGE
  //Delete lora gateway information
  self.deleteLoraGateway = function (GatewayMAC) {
    let url = appConfig.nodeServer + baseUrl.urlPrefix + "/" + GatewayMAC;
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };
};