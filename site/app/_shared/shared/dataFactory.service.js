'use strict';

module.exports = function ($q, $compile, $http, appConfig, dashTableConfig, HttpResponseHandler, AccountService) {
  // 5 seconds to timeout
  const TIME_OUT = 30000;
  const DEFAULT_BLE_APP_ID = "0"; // There is no BLE device in application 0
  const DEFAULT_LORA_APP_ID = "0000000000000000"; // There is no lora device in application 0

  // Based on user config
  this.getActiveNodes = function () {
    let bleAppID = AccountService.currentBLEAppID() || DEFAULT_BLE_APP_ID;
    let url = appConfig.nodeServer + 'api/' + bleAppID + '/activenodes';
    let promise = $http.get(url, {timeout: TIME_OUT});

    promise = promise.then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function(error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  // OVERVIEW PAGE
  // Based app config, used for Dashboard and Device Table
  this.getAllActiveNodesCount = function () {
    let bleAppIDArr = [];
    let promises = [];
    // Get all the bleAppID belong to different scenario
    let scenarios = AccountService.userInfo.settings.Scenarios;
    scenarios.forEach(function (scenario) {
      if (scenario.bleAppID && !bleAppIDArr.includes(scenario.bleAppID)) {
        bleAppIDArr.push(scenario.bleAppID);
      }
    });

    // Create different promises according to different bleAppID, and handle the error situation 
    // in each of the promise
    bleAppIDArr.forEach(function (bleAppID) {
      let url = appConfig.nodeServer + 'api/' + bleAppID + '/activenodes/count';
      let promise = $http.get(url, { timeout: TIME_OUT }).then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      }).catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });
      promises.push(promise);
    });

    return $q.all(promises).then(function (response) {
      return response;
    });
  };

  this.getAllActiveNodes = function () {
    let bleAppIDArr = [];
    let promises = [];
    // Get all the bleAppID belong to different scenario
    let scenarios = AccountService.userInfo.settings.Scenarios;
    scenarios.forEach(function (scenario) {
      if (scenario.bleAppID && !bleAppIDArr.includes(scenario.bleAppID)) {
        bleAppIDArr.push(scenario.bleAppID);
      }
    });

    // Create different promises according to different bleAppID, and handle the error situation 
    // in each of the promise
    bleAppIDArr.forEach(function (bleAppID) {
      let url = appConfig.nodeServer + 'api/' + bleAppID + '/activenodes';
      let promise = $http.get(url, { timeout: TIME_OUT }).then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      }).catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });
      promises.push(promise);
    });

    return $q.all(promises).then(function (response) {
      return response;
    });
  };

  // Only used in data table, so follow user config
  this.getPos4AllNodes = function () {
    let bleAppID = AccountService.currentBLEAppID() || DEFAULT_BLE_APP_ID;
    let url = appConfig.nodeServer + 'api/' + bleAppID + '/latest_ape_records';
    //hard code the solution for mengyang now
    if (AccountService.currentScenarioID()===8)
    {
      url = appConfig.nodeServer + "api/ble/applications/1/nodes/location";
    }
    let promise = $http.get(url, {timeout: TIME_OUT});
    promise = promise.then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  // Only used in timer service
  this.getPos4AllDisplayingNodes = function (controller) {
    let bleAppID = AccountService.currentBLEAppID() || DEFAULT_BLE_APP_ID;
    if (controller.nodeQueryChanged) {
      controller.nodeMacQuery = 'api/' + bleAppID + '/latest_ape_records?';
      controller.nodeList.forEach(function (element) {
        if (element.display) {
          controller.nodeMacQuery += 'mac=' + element.nodeData.node_mac + '&';
        }
      });

      controller.nodeQuerychanged = false;
    }
    let url = appConfig.nodeServer + controller.nodeMacQuery;

    //hard code the solution for mengyang now
    if (AccountService.currentScenarioID()===8)
    {
      url = appConfig.nodeServer+ "api/ble/applications/1/nodes/location";
    }

    let promise = $http.get(url, {timeout: TIME_OUT});
    promise = promise.then(function (response) {
      let data = HttpResponseHandler.handleResponse(response.data);
      controller.updateNodes(data);
      return data;
    }).catch(function(error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  //get gateway sensor values for one gw, used in 3D map
  this.getGWsensorValues = function (gw_mac) {
    //Right now, we need hard code bleAppID to 1 instead of 9, because bleAppID 9 doesn't have data inside
    //let bleAppID = AccountService.currentBLEAppID() || DEFAULT_BLE_APP_ID;
    let bleAppID = 1;
    let url = appConfig.nodeServer + 'api/' + bleAppID + '/latest_gw_records/mac/' + gw_mac;

    let promise = $http.get(url, {timeout: TIME_OUT});
    promise = promise.then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function(error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  //get history gateway sensor values for one gw, used in 3D map
  this.getGWsensorHistoryData = function (gw_mac) {
    //let bleAppID = AccountService.currentBLEAppID() || DEFAULT_BLE_APP_ID;
    let bleAppID = 1;
    let url = appConfig.nodeServer + 'api/' + bleAppID + '/recent_gw_records/mac/' + gw_mac;

    let promise = $http.get(url, {timeout: TIME_OUT});
    promise = promise.then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function(error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  // Base on user config, get all gateway sensor values
  this.getScenarioGWSensorValues = function () {
    let bleAppID = AccountService.currentBLEAppID() || DEFAULT_BLE_APP_ID;
    let url = appConfig.nodeServer + 'api/' + bleAppID + '/latest_gw_records';

    let promise = $http.get(url, {timeout: TIME_OUT});
    promise = promise.then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function(error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  // OVERVIEW PAGE, DEVICE TABLE PAGE
  // Base on app config, retrieve all gateway data
  this.getAllGWSensorValues = function () {
    let bleAppIDArr = [];
    let promises = [];
    // Get all the bleAppID belong to different scenario
    let scenarios = AccountService.userInfo.settings.Scenarios;
    scenarios.forEach(function (scenario) {
      if (scenario.bleAppID && !bleAppIDArr.includes(scenario.bleAppID)) {
        bleAppIDArr.push(scenario.bleAppID);
      }
    });

    // Create different promises according to different bleAppID, and handle the error situation 
    // in each of the promise
    bleAppIDArr.forEach(function (bleAppID) {
      let url = appConfig.nodeServer + 'api/' + bleAppID + '/latest_gw_records';
      let promise = $http.get(url, { timeout: TIME_OUT }).then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      }).catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });
      promises.push(promise);
    });

    return $q.all(promises).then(function (response) {
      return response;
    });
  };

  //get LORA device status
  this.getLORAdeviceStatus = function (deviceType, deviceEUI) {
    let loraAppID = AccountService.userInfo.settings.currentScenario.loraAppID || DEFAULT_LORA_APP_ID;
    let url = appConfig.nodeServer + "api/lora/" + deviceType + "/" + loraAppID + "/currentstatus";
    if (deviceEUI) {
      url = url + "?dev_eui=" + deviceEUI;
    }
    let promise = $http.get(url, {timeout: TIME_OUT});
    promise = promise.then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  this.getLoRaDeviceLatestUsage = function (deviceType, deviceEUI) {
    let loraAppID = AccountService.userInfo.settings.currentScenario.loraAppID || DEFAULT_LORA_APP_ID;
    let url = appConfig.nodeServer + "api/lora/" + deviceType + "/" + loraAppID + "/latest_usage";
    if (deviceEUI) {
      url = url + "?dev_eui=" + deviceEUI;
    }

    return $http.get(url, {timeout: TIME_OUT})
      .then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      })
      .catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });
  };

  // get lora device aggregrated data
  // by default duration is lasthour
  this.getLoRaDeviceAggregatedData = function (deviceType, deviceEUI) {
    let loraAppID = AccountService.userInfo.settings.currentScenario.loraAppID || DEFAULT_LORA_APP_ID;
    let url = appConfig.nodeServer + "api/lora/devicetype/" + deviceType + "/application_id/" + loraAppID + "/aggregated_data";
    if (deviceEUI) {
      url = url + "?deveui=" + deviceEUI;
    }

    return $http.get(url, {timeout: TIME_OUT})
      .then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      })
      .catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });
  };

  // Unit of duration is minute
  // mode must be either 'continuous' or 'scatter'
  this.getLoRaDeviceRecentUsage = function (deviceType, deviceEUI, duration, mode) {
    let loraAppID = AccountService.userInfo.settings.currentScenario.loraAppID || DEFAULT_LORA_APP_ID;
    let url = appConfig.nodeServer + "api/lora/" + deviceType + "/" + loraAppID + "/recent_usage?dev_eui=" + deviceEUI;

    if (duration) {
      url += `&dur=${duration}`;
    }

    if (mode) {
      url += `&mode=${mode}`;
    }

    return $http.get(url, {timeout: TIME_OUT})
      .then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      })
      .catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });
  };

  //turn on/off street lamp
  this.controlLoraDevice = function (deviceType, operation, deviceEUI,relayNum) {
    let loraAppID = AccountService.userInfo.settings.currentScenario.loraAppID || DEFAULT_LORA_APP_ID;
    let url = appConfig.nodeServer + "api/lora/" + deviceType + "/" + loraAppID + "/" + operation + "?dev_eui=" + deviceEUI;
    if (relayNum)
    {
      url = url + "&relayNum=" + relayNum;
    }
    let promise = $http.get(url, {timeout: TIME_OUT});

    promise = promise.then(function (response) {
        return HttpResponseHandler.handleResponse(response.data);
      })
      .catch(function (error) {
        return HttpResponseHandler.handleError(error, url, TIME_OUT);
      });

    return promise;
  };
};