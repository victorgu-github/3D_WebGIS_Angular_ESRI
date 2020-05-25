'use strict';

module.exports = function ($q, $compile, $http, appConfig, HttpResponseHandler) {
  const TIME_OUT = 20000;

  // inputs are optional, if gw_mac is null, get all
  // if sensorType is null, get all types
  this.getGWsensorValues = function (gw_mac, sensorType) {
    let url = appConfig.nodeServer + 'api/1/latest_gw_records/sens/' + sensorType;
    let promise = $http.get(url, {timeout: TIME_OUT});

    promise = promise.then(function (resp) {
      return HttpResponseHandler.handleResponse(resp.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };

  this.getTCPdata = function () {
    let url = appConfig.nodeServer + 'api/tcp/latest_tcp_geo_data';
    let timeout = 5000;
    let promise = $http.get(url, {timeout: timeout});

    promise = promise.then(function (resp) {
      return HttpResponseHandler.handleResponse(resp.data);
    }).catch(function (error) {
      return HttpResponseHandler.handleError(error, url, TIME_OUT);
    });

    return promise;
  };
};
