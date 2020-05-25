'use strict';

module.exports = function ($scope, PanelService) {

  $scope.controller = PanelService.sceneViewCtrl;

  $scope.$on('MapLayersInitialized', function (event, args) {
    PanelService.sceneViewCtrl = args.controller;
    $scope.controller = PanelService.sceneViewCtrl;
  });

};
