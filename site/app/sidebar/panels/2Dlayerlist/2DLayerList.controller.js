'use strict';

module.exports = function ($scope, $rootScope, $timeout, appConfig, MapLayer,
                           LayerActionItem, Leaflet2DService) {
  $scope.layerList = {
    name: "SIDEBAR.LAYER_LIST",
    visible: true,
    mapLayers: Leaflet2DService.data.mapLayers,
    heatLayers: Leaflet2DService.data.heatLayers
  };

  $scope.toggleLayerList = function () {
    $scope.layerList.visible = !$scope.layerList.visible;

    for (let key in $scope.layerList.mapLayers) {
      if ($scope.layerList.mapLayers.hasOwnProperty(key)) {
        let layer = $scope.layerList.mapLayers[key];
        layer.setLayerVisibility($scope.layerList.visible);

        if ($scope.layerList.visible) {
          if (!Leaflet2DService.data.leafletMap.hasLayer(layer.mapLayer)) {
            layer.mapLayer.addTo(Leaflet2DService.data.leafletMap);
          }
        } else {
          if (Leaflet2DService.data.leafletMap.hasLayer(layer.mapLayer)) {
            layer.mapLayer.removeFrom(Leaflet2DService.data.leafletMap);
          }
        }
      }
    }
  };

  $scope.toggleLayerVisibility = function (layer) {
    layer.setLayerVisibility(!layer.visible);
    if (Leaflet2DService.data.leafletMap.hasLayer(layer.mapLayer)) {
      layer.mapLayer.removeFrom(Leaflet2DService.data.leafletMap);
    } else {
      layer.mapLayer.addTo(Leaflet2DService.data.leafletMap);
    }
  };

  $scope.refreshSlider = function () {
    $timeout(function () {
      $scope.$broadcast('rzSliderForceRender');
    });
  };

};

