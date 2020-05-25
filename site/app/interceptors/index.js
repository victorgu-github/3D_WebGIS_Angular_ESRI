'use strict';

// Include module
require('../config');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.httpFilter', ['3D_WebGIS_Angular_ESRIMap.constants'])
  .config(['$httpProvider', ($httpProvider) => {

    let tokenInterceptor = function ($cookies, appConfig) {
      return {
        request: function ($config) {
          // If the requests belong to node server, add 'x-access-token'
          if ($config.url.startsWith(appConfig.nodeServer)) {
            $config.headers['x-access-token'] = $cookies.get("authToken");
          }
          return $config;
        }
      };
    };

    $httpProvider.interceptors.push(['$cookies', 'appConfig', tokenInterceptor]);
  }]);
