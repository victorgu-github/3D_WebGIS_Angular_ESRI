'use strict';

module.exports = function ($scope, $rootScope, allNodesService, esriFeatureLayerService, dataTableService,
                           AccountService, PanelService) {

  $scope.scenarios = AccountService.userInfo.settings.Scenarios;

  $scope.$on('MapLayersInitialized', function (event, args) {
    PanelService.sceneViewCtrl = args.controller;
  });

  //Pass through the sceneView.controller as a param, when user click 
  //the scenario will invoke the sceneView.controller's onScenarioClick() function
  //and broadcast 'MapLayersInitialized' event
  $scope.onScenarioClick = function (clicked) {
    $scope.scenarios.forEach(function (scenario) {
      if (scenario.scenarioName === clicked.scenarioName) {
        scenario.isActive = clicked.isActive;
        allNodesService.scenarioID = scenario.scenarioID;
        esriFeatureLayerService.scenarioID = scenario.scenarioID;
        dataTableService.scenarioID = scenario.scenarioID;
      }
    });

    if (PanelService.sceneViewCtrl) {
      PanelService.sceneViewCtrl.onScenarioClick(clicked);
    }
  };

};
