'use strict';

module.exports = function (IdleProvider) {
  // configure Idle settings
  let AppConfig = angular.injector(['3D_WebGIS_Angular_ESRIMap.constants']).get('appConfig');

  IdleProvider.idle(AppConfig.TIME_TO_IDLE); // in seconds, then it will enter warning phase
  IdleProvider.timeout(AppConfig.TIME_TO_LOGOUT); // broadcast timeout event after specific seconds
};