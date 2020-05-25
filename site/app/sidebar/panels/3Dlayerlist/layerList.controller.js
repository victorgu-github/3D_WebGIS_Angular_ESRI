'use strict';

module.exports = function ($scope, $rootScope, $timeout, appConfig, MapLayer, LayerActionItem, LayerListService) {

  $scope.layerList = {
    name: "SIDEBAR.LAYER_LIST",
    visible: true,
    templateUrl: "app/views/sidebar/views/layerList.html",
    layers: LayerListService.data.layers
  };

  $scope.toggleLayerList = function () {
    this.layerList.visible = !this.layerList.visible;
    let mapLayers = $scope.layerList.layers;

    for (let i = 0; i < mapLayers.length; i++) {
      mapLayers[i].toggleLayerVisibility(this.layerList.visible);
    }
  };

  $scope.$watch('realtimeLayer.visible', function (newVal) {
    if (newVal !== undefined) {
      // temporary disable for demo
      // $scope.historyLayer.toggleLayerVisibility(newVal);
    }
  });

  $scope.refreshSlider = function () {
    $timeout(function () {
      $scope.$broadcast('rzSliderForceRender');
    });
  };

};
