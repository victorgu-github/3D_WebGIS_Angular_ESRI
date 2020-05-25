'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {
  const TIMEOUT  = 30000;
  let self       = this;

  ///////////////////////////////////////////////////////////////
  //
  // Get Mengyang Sheep Info
  //
  ///////////////////////////////////////////////////////////////

  //DASHBOARD OVERVIEW PAGE AND MENGYANG TABLE PAGE AND EDIT MENGYANG PAGE
  //Get Mengyang sheep info
  self.getSheeps = function (pastureIDs) {
    let promises = [];
    for (let index in pastureIDs) {
      let pastureID = pastureIDs[index];
      let url = appConfig.nodeServer + dashTableConfig.Mengyang.url + pastureID + "/sheep";
      promises.push($http.get(url, { timeout: TIMEOUT }));
    }
    return $q.all(promises).then(function (results) {
      let finalSheeps = [];
      for (let index in pastureIDs) {
        let pastureID = pastureIDs[index];
        let sheeps = results[index].data;
        for (let i in sheeps) {
          let sheep = sheeps[i];
          sheep.pastureID = pastureID;
        }
        finalSheeps = finalSheeps.concat(sheeps);
      }
      return HttpResponseHandler.handleResponse(finalSheeps);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, "", TIMEOUT);
    });
  };

  self.getSheep = function (sheepInfo) {
    let pastureID = sheepInfo.pastureID;
    let sheep = getSheepID(sheepInfo);
    let url = appConfig.nodeServer + dashTableConfig.Mengyang.url + pastureID + "/sheep?" + sheep.key + "=" + sheep.value;
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
  // Register Mengyang Sheep
  //
  ///////////////////////////////////////////////////////////////

  //NEW MENGYANG PAGE
  //Register Mengyang sheep
  self.registerSheep = function (pastureID, formData) {
    let url = appConfig.nodeServer + dashTableConfig.Mengyang.url + pastureID + "/sheep";
    return $q(function (resolve) {
      $http.post(url, formData, { timeout: TIMEOUT, transformRequest: angular.identity, headers: { 'Content-Type': undefined } }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  //NEW MENGYANG BATCH REGISTER
  //Batch Register Mengyang sheep
  self.batchRegisterSheeps = function (pastureID, formData) {
    let url = appConfig.nodeServer + dashTableConfig.Mengyang.url + pastureID + "/sheep/csvregister";
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
  // Update Mengyang Sheep
  //
  ///////////////////////////////////////////////////////////////

  //EDIT MENGYANG PAGE
  //Update Mengyang sheep 
  self.updateSheep = function (pastureID, formData) {
    let url = appConfig.nodeServer + dashTableConfig.Mengyang.url + pastureID + "/sheep";
    return $q(function (resolve) {
      $http.put(url, formData, { timeout: TIMEOUT, transformRequest: angular.identity, headers: { 'Content-Type': undefined } }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Delete Mengyang Sheep
  //
  ///////////////////////////////////////////////////////////////

  //DELETE MENGYANG PAGE
  //Delete Mengyang sheep
  self.delSheep = function (sheepInfo) {
    let pastureID = sheepInfo.pastureID;
    let sheep = getSheepID(sheepInfo);
    let url = appConfig.nodeServer + dashTableConfig.Mengyang.url + pastureID + "/sheep?" + sheep.key + "=" + sheep.value;
    return $q(function (resolve) {
      $http.delete(url, { timeout: TIMEOUT }).then(function (response) {
        resolve(HttpResponseHandler.handleResponse(response.data));
      }).catch(function (error) {
        resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
      });
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Private Function
  //
  ///////////////////////////////////////////////////////////////

  function getSheepID(sheepInfo) {
    let sheep = {};
    if (sheepInfo.mengyangID) {
      sheep.key = "mengyangID";
      sheep.value = sheepInfo.mengyangID;
    }
    else if (!sheepInfo.mengyangID && sheepInfo.mengyangID2) {
      sheep.key = "mengyangID2";
      sheep.value = sheepInfo.mengyangID2;
    }
    return sheep;
  }
};