'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  const TIMEOUT = 30000;
  let self = this;
  let nodeServer =            appConfig.nodeServer;
  let oneStepRegister =       dashTableConfig.Devices.LoraDevice.oneStepRegister;
  let oneStepUrl =            oneStepRegister.devInfoUrlPrefix;
  let zmqPayload =            dashTableConfig.Devices.LoraDevice.zmqPayload;
  let dynamicDataAttributes = dashTableConfig.MonitorAttributes.dataTable.dynamicDataAttributes;

  let candidateValueUrl = oneStepRegister.candidateValueUrl;

  //Attributes from dashTableConfig.MonitorAttributes.dataTable.dynamicDataAttributes[devType]
  let subTypes =           "subTypes";
  let specialControlAttr = "specialControlAttr";
  let currentStatusAttr =  "currentStatusAttr";
  let latestUsageAttr =    "latestUsageAttr";
  let currentstatus =      "currentstatus";
  let latestusage =        "latestusage";

  //Attributes used to control lora device on and off status
  let ON  =      dynamicDataAttributes.datatableDevCtrl.ON.status;
  let OFF =      dynamicDataAttributes.datatableDevCtrl.OFF.status;
  let TURN_ON =  dynamicDataAttributes.datatableDevCtrl.ON.operation;
  let TURN_OFF = dynamicDataAttributes.datatableDevCtrl.OFF.operation;

  ///////////////////////////////////////////////////////////////
  //
  // Get Lora Device Candidate Value
  //
  ///////////////////////////////////////////////////////////////

  //NEW LORA DEVICE PAGE, EDIT LORA DEVICE PAGE, MONITOR SUMMARY PAGE, MONITOR DATATABLE PAGE, NEW MULTICAST GROUP
  //Get lora device type in the system
  self.getDefaultCandidateValues = function () {
    let url = appConfig.nodeServer + candidateValueUrl;
    return $q(function (resolve, reject) {
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Get Lora Device Information
  //
  ///////////////////////////////////////////////////////////////

  //OVERVIEW PAGE
  //Get number of lora device in the system
  self.getLoraDevicesCount = function (appIDRange) {
    let url = getLoraDevicesCountUrl(appIDRange);
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });

    return promise;
  };

  //LORA DEVICE TABLE PAGE, MONITOR SUMMARY PAGE
  //Get device info of lora devices in the system
  self.getLoraDevicesInfo = function (appIDRange) {
    let url = getLoraDevicesInfoUrl(appIDRange);
    let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });

    return promise;
  };

  //EDIT LORA DEVICE PAGE
  //Get lora device info use latest one-step web api
  self.getLoraDevice = function (applicationID, devEUI) {
    return $q(function (resolve, reject) {
      let url = appConfig.nodeServer + oneStepRegister.devInfoUrlPrefix + "?applicationID=" + applicationID;
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        let nodeSessions = response.data.nodeSessions;
        nodeSessions.forEach(function (nodeSession) {
          if (nodeSession.applicationID === applicationID) {
            let loraDeviceArray = nodeSession.data;
            loraDeviceArray.forEach(function (loraDevice) {
              if (loraDevice.DevEUI === devEUI) {
                resolve(HttpResponseHandler.handleResponse(loraDevice));
              }
            });
            //If we cannot find the lora device in the system, we return null to lora device edit page (for admin user and general user)
            resolve(HttpResponseHandler.handleResponse(null));
          }
        });
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Register Single Lora Device and Batch Lora Device
  //
  ///////////////////////////////////////////////////////////////

  //LORA NEW DEVICE SINGLE REGISTER, ABP AND OTAA
  //Register lora device with one-step web api
  self.regLoraDevice = function (registerEntry) {
    let url = appConfig.nodeServer + oneStepUrl;
    return $q(function (resolve, reject) {
      $http.post(url, registerEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //LORA NEW DEVICE BATCH REGISTER, ABP AND OTAA
  //Batch register lora devices in the system
  self.batchRegister = function (batchRegisterEntry) {
    let url = getLoraDeviceBatchRegisterUrl();
    let promise = $http.post(url, batchRegisterEntry, { timeout: TIMEOUT }).then(function (response) {
      return HttpResponseHandler.handleResponse(response.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIMEOUT);
    });

    return promise;
  };

  ///////////////////////////////////////////////////////////////
  //
  // Update Lora Device
  //
  ///////////////////////////////////////////////////////////////

  //UPDATE LORA DEVICE PAGE
  //Update lora device info use latest one-step function
  self.updateLoraDevice = function (editEntry) {
    return $q(function (resolve, reject) {
      let url = appConfig.nodeServer + oneStepUrl;
      $http.put(url, editEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data.nodeSessions));
      }).catch(function (error) {
        reject(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Delete Lora Device
  //
  ///////////////////////////////////////////////////////////////

  //DEVICE TABLE PAGE
  //Delete lora device use latest one-step web api
  self.deleteLoraDevice = function (devEUI, applicationID) {
    let url = appConfig.nodeServer + oneStepUrl + "/" + applicationID + "/" + devEUI;
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //GENERAL USER APPLICATION TABLE FOR GENERAL USER
  //Delete lora devices 
  self.deleteLoraDevices = function (devEUIs, loraApplicationID) {
    let promises = [];
    for (let index in devEUIs) {
      let devEUI = devEUIs[index];
      let url = appConfig.nodeServer + oneStepUrl + "/" + loraApplicationID + "/" + devEUI;
      promises.push($http.delete(url, { timeout: TIMEOUT }));
    }
    return $q.all(promises).then(function (responses) {
      return HttpResponseHandler.handleResponse(responses);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, "", TIMEOUT);
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Get Lora Device Current Status and Latest Usage
  //
  ///////////////////////////////////////////////////////////////

  //MONITOR DATATABLE PAGE
  //Get current status and latest usage for dashboard monitor dynamic data table
  self.getCurrentStatusAndLatestUsage = function (applicationIDArr, deviceType, dynamicDataAttributes, subTypeMap) {
    let promises = {};
    for (let j = 0; j < applicationIDArr.length; j++) {
      //1.Query the current status and latest usage according to the config file, if we don't config them in config file
      //then we don't send the request to the back-end
      //2.If device type don't have sub device type, we use device type to call the web api and get the current status and latest usage
      //  otherwise, we use sub device type to call the web api and get the current status and latest usage
      getPromiseForDevice(promises, applicationIDArr[j], deviceType, subTypeMap, dynamicDataAttributes);
    }

    return $q.all(promises).then(function (responses) {
      return responses;
    }, function (error) {
      return error;
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Change Lora Device Current Status
  //
  ///////////////////////////////////////////////////////////////

  //MONITOR DATATABLE PAGE
  //If device has specialControlAttr in config file, we use specialControlAttr as attribute to turn on turn off device
  self.changeLoraDevStatus = function (rowsValObjArray, dynamicDataAttributes) {
    let promises = [];
    rowsValObjArray.forEach(function (rowValObj) {
      let devType = rowValObj.devType;
      let subType = rowValObj.subType;
      let url;
      if (dynamicDataAttributes[devType] && dynamicDataAttributes[devType][subTypes] && dynamicDataAttributes[devType][subTypes][subType] &&
        dynamicDataAttributes[devType][subTypes][subType][specialControlAttr]) {
        let specialControlAttrKey = dynamicDataAttributes[devType][subTypes][subType][specialControlAttr];
        let specialControlAttrVal = rowValObj[specialControlAttrKey];

        if (rowValObj.status === ON) {
          url = appConfig.nodeServer + "api/lora/" + rowValObj.devType + "/" + rowValObj.applicationID +
            TURN_OFF + specialControlAttrKey + "=" + specialControlAttrVal + "&" + "dev_eui=" + rowValObj.devEUI;
        } else if (rowValObj.status === OFF) {
          url = appConfig.nodeServer + "api/lora/" + rowValObj.devType + "/" + rowValObj.applicationID +
            TURN_ON + specialControlAttrKey + "=" + specialControlAttrVal + "&" + "dev_eui=" + rowValObj.devEUI;
        }
        promises.push($http.get(url, { timeout: TIMEOUT }));
      } else if (dynamicDataAttributes[devType] && !dynamicDataAttributes[devType][subTypes]) {
        if (rowValObj.status === ON) {
          url = appConfig.nodeServer + "api/lora/" + rowValObj.devType + "/" + rowValObj.applicationID +
            TURN_OFF + "dev_eui=" + rowValObj.devEUI;
        } else if (rowValObj.status === OFF) {
          url = appConfig.nodeServer + "api/lora/" + rowValObj.devType + "/" + rowValObj.applicationID +
            TURN_ON + "dev_eui=" + rowValObj.devEUI;
        }
        promises.push($http.get(url, { timeout: TIMEOUT }));
      }
    });
    return $q.all(promises).then(function (response) {
      return response;
    }).catch(function (error) {
      return error;
    });
  };

  //////////////////////////////////////////////////////////
  //
  // Get Lora Device Maintenance Status
  //
  //////////////////////////////////////////////////////////

  self.getMaintenanceComments = function (applicationID, devEUI) {
    let url = "";
    url += nodeServer + oneStepRegister.maintainPrefix + "latest/appid/" + applicationID + "/dev_eui/" + devEUI;
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
  // Update Lora Device Maintenance Status
  //
  //////////////////////////////////////////////////////////

  self.updateMtStatus = function (mtEditEntry) {
    let url = "";
    url += nodeServer + oneStepRegister.maintainPrefix;
    return $q(function (resolve) {
      $http.post(url, mtEditEntry, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //////////////////////////////////////////////////////////
  //
  // Get Zmq Payload Data
  //
  //////////////////////////////////////////////////////////

  self.getZmqPayloadData = function (applicationID, devEUI, duration) {
    let url = "";
    url += nodeServer + zmqPayload.baseUrl + "appid/" + applicationID + "/dev_eui/" + devEUI + "?duration=" + duration;
    return $q(function (resolve) {
      $http.get(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  self.getChannelHistoryData = function (applicationID, devEUI, startTime, endTime) {
    let url = nodeServer + dashTableConfig.Devices.LoraDevice.channelHistory.url +
              "appid/" + applicationID + "/devEUI/" + devEUI + "/start/" + startTime + "/end/" + endTime;
    return $http.get(url, { timeout: TIMEOUT });
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  //Generate the url for get lora devices count
  function getLoraDevicesCountUrl(appIDRange) {
    //Initialize the url according to operationType
    let url = nodeServer + oneStepRegister.devNumUrlPrefix + "/?applicationID=";
    return getLoraDevicesCountAndInfoUrl(appIDRange, url);
  }

  function getLoraDevicesInfoUrl(appIDRange) {
    let url = nodeServer + oneStepRegister.devInfoUrlPrefix + "/?applicationID=";
    return getLoraDevicesCountAndInfoUrl(appIDRange, url);
  }

  function getLoraDevicesCountAndInfoUrl(appIDRange, url) {
    //For old data in datatable, userInfo.appIDs could be undefined and null, we
    //need set an condition to filter out this abnormal situation
    //1.Condition 1: If appIDRange is undefined or null, the url will be something like http://207.34.103.154:8100/api/lora_device/devices/Num?applicationID=
    //               Query result will be error and will be catched by the frontend function
    if (appIDRange !== undefined && appIDRange !== null) {
      //2.Condition 2: appIDs's model in database is array, if appIDs is defined and not null, appIDRange here must be an array
      //               If it is empty array, the url will be something like http://207.34.103.154:8100/api/lora_device/devices/Num?applicationID=
      //               If it is not empty array, the url will be something like  http://207.34.103.154:8100/api/lora_device/devices/Num?applicationID=0000000000000001
      if (appIDRange.length > 0) {
        appIDRange = appIDRange.join(",");
        url += appIDRange;
      }
    }
    return url;
  }

  //Generate the url for ABP and OTAA batch register
  function getLoraDeviceBatchRegisterUrl() {
    let url = "";
    url += nodeServer + oneStepRegister.devInfoUrlPrefix;
    return url;
  }

  function getPromiseForDevice(promises, applicationID, deviceType, subTypeMap, dynamicDataAttributes) {
    //Get subTypes array from subTypeMap
    let subTypes = subTypeMap[deviceType];
    //Get device type config info from dynamicDataAttributes config file
    let devTypeConfigInfo = dynamicDataAttributes[deviceType];
    if (subTypeMap[deviceType].length !== 0) {
      for (let index in subTypes) {
        let subType = subTypes[index];
        //We only query the current status and latest usage for the sub device type config in the config file
        //Before the query, we need to make sure the currentStatusAttr and latestusageAttr are exist for the sub device type
        //Data structure like: {smartswitch: {subTypes:{ceillinglight:{currentStatusAttr:["status", "relayNum"]}}}}
        //Condition here like: a.b && a.b.c && a.b.c.d && a.b.c.d.length !== 0
        //----------------------------------------------------------
        //If devTypeConfigInfo is not defined in the config file, here will throw error "cannot read property hasOwnProperty"
        //So we need to add a condition here to make sure devTypeConfigInfo is not undefined
        if (devTypeConfigInfo && devTypeConfigInfo.hasOwnProperty("subTypes") && devTypeConfigInfo.subTypes.hasOwnProperty(subType)) {
          let subTypeConfigInfo = devTypeConfigInfo["subTypes"][subType];
          if (subTypeConfigInfo.hasOwnProperty(currentStatusAttr) && subTypeConfigInfo.currentStatusAttr.length !== 0) {
            let promise = getCurrStatusAndLatestUsagePromise(subType, applicationID, currentstatus);
            let index = currentstatus + "_" + deviceType + "_" + applicationID + "_" + subType;
            promises[index] = promise;
          }

          if (subTypeConfigInfo.hasOwnProperty(latestUsageAttr) && subTypeConfigInfo.latestUsageAttr.length !== 0) {
            let promise = getCurrStatusAndLatestUsagePromise(subType, applicationID, latestusage);
            let index = latestusage + "_" + deviceType + "_" + applicationID + "_" + subType;
            promises[index] = promise;
          }
        }
      }
    } else {
      if (devTypeConfigInfo && devTypeConfigInfo.hasOwnProperty(currentStatusAttr) && devTypeConfigInfo.currentStatusAttr.length !== 0) {
        let promise = getCurrStatusAndLatestUsagePromise(deviceType, applicationID, currentstatus);
        let index = currentstatus + "_" + deviceType + "_" + applicationID;
        promises[index] = promise;
      }

      if (devTypeConfigInfo && devTypeConfigInfo.hasOwnProperty(latestUsageAttr) && devTypeConfigInfo.latestUsageAttr.length !== 0) {
        let promise = getCurrStatusAndLatestUsagePromise(deviceType, applicationID, latestusage);
        let index = latestusage + "_" + deviceType + "_" + applicationID;
        promises[index] = promise;
      }
    }
  }

  function getCurrStatusAndLatestUsagePromise(deviceType, applicationID, operationType) {
    let promise;
    let currentStatusUrl;
    if (operationType === currentstatus) {
      currentStatusUrl = appConfig.nodeServer + "api/lora/" + deviceType + "/" + applicationID + "/currentstatus";
    } else if (operationType === latestusage) {
      currentStatusUrl = appConfig.nodeServer + "api/lora/" + deviceType + "/" + applicationID + "/latest_usage";
    }
    promise = $http.get(currentStatusUrl, { timeout: TIMEOUT });
    return promise;
  }
};