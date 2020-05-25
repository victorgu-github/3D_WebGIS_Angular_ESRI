'use strict';

module.exports = function ($scope, $rootScope, $timeout, appConfig, MapLayer, LayerActionItem, SettingService) {

  $scope.ENVIRONMENT = {
    REAL_TIME: "real",
    DAY_TIME: "dayTime",
    NIGHT_TIME: "nightTime"
  };

  $scope.setting = SettingService.setting;
  $scope.currentEnvironment = SettingService.currentEnvironment;
  //For the first time load the view, set the oldScenario to the user's default scenario

  $scope.$on('MapLayersInitialized', function (event, args) {
    SettingService.controller = args.controller;
    if ($scope.currentEnvironment === $scope.ENVIRONMENT.DAY_TIME) {
      $scope.changeDayTimeViewDisplay();
    } else if ($scope.currentEnvironment === $scope.ENVIRONMENT.NIGHT_TIME) {
      $scope.changeNightViewDisplay();
    } else {
      $scope.changeRealWorldDisplay();
    }
  });

  //[Xin Tu]: when we switch the scenario, setting lighting.date and lighting.cameraTrackingEnabled will 
  //effect only after the view is loaded. So I add a timeout here. And in order to separate the situation
  //"switch to a new scenario" and "stay in the same scenario", I use two varaible oldScenario and newScenario
  $scope.changeRealWorldDisplay = function () {
    SettingService.currentEnvironment = $scope.currentEnvironment;
    SettingService.controller.view.environment.lighting.date = Date.now();
    $scope.currentEnvironment = $scope.ENVIRONMENT.REAL_TIME;
  };

  $scope.changeDayTimeViewDisplay = function () {
    //Daytime for China: "Thu Aug 31 2017 12:00:00 GMT+0800 (China Standard Time)"
    //Daytime for Calgary: "Thu Aug 31 2017 12:00:00 GMT-0600 (MDT)"
    let timezoneSuffix = SettingService.controller.scenario.timezone;
    let timezone = new Date().toDateString() + " 12:00:00 " + timezoneSuffix;
    SettingService.currentEnvironment = $scope.currentEnvironment;
    SettingService.controller.view.environment.lighting.date = new Date(timezone);
    $scope.currentEnvironment = $scope.ENVIRONMENT.DAY_TIME;
  };

  $scope.changeNightViewDisplay = function () {
    //Daytime for China: "Thu Aug 31 2017 23:00:00 GMT+0800 (China Standard Time)"
    //Daytime for Calgary: "Thu Aug 31 2017 23:00:00 GMT-0600 (MDT)"
    let timezoneSuffix = SettingService.controller.scenario.timezone;
    let timezone = new Date().toDateString() + " 23:00:00 " + timezoneSuffix;
    SettingService.currentEnvironment = $scope.currentEnvironment;
    SettingService.controller.view.environment.lighting.date = new Date(timezone);
    $scope.currentEnvironment = $scope.ENVIRONMENT.NIGHT_TIME;
  };
};
