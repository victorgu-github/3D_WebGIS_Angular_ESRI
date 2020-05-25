'use strict';

module.exports = function ($scope, $timeout, $window, Leaflet2DService) {
  const LOADING = "SIDEBAR.HEAT_MAP.LOADING";
  const INVALID_ATTR = "SIDEBAR.HEAT_MAP.INVALID_LAYER";
  const ATTR_WARNING = "SIDEBAR.HEAT_MAP.PLEASE_SELECT_LAYER";
  const SELECT_LAYER = "SIDEBAR.HEAT_MAP.SELECT_AN_LAYER";
  const SELECT_ATTRIBUTE = "SIDEBAR.HEAT_MAP.SELECT_AN_ATTR";
  const HEAT_STATUS = {
    APPLIED: "applied",
    APPLYING: "applying"
  };

  let currentLayer = null;
  let timerService;

  $scope.layerDropdown = false;
  $scope.heatLayerMap = Leaflet2DService.data.heatLayers;

  $scope.selectedLayer = SELECT_LAYER;
  $scope.selectedAttribute = SELECT_ATTRIBUTE;
  $scope.heatLayers = [LOADING];
  $scope.layerAttributes = [ATTR_WARNING];
  $scope.status = HEAT_STATUS.APPLIED;

  $scope.$watchCollection('heatLayerMap', function (newVal) {
    if (newVal && Object.keys(newVal).length > 0) {
      $scope.heatLayers = Object.keys(newVal);
    }
  });

  $scope.onChangeLayer = function (layer) {
    $scope.selectedLayer = layer;
    if ($scope.heatLayerMap[layer]) {
      let attributes = $scope.heatLayerMap[layer].getAttributes();
      $scope.layerAttributes = Object.keys(attributes);
      refreshSlider();
    } else {
      $scope.layerAttributes = [INVALID_ATTR];
    }
  };

  $scope.onChangeAttribute = function (attr) {
    $scope.selectedAttribute = attr;
  };

  $scope.drawHeatMap = function() {
    if ($scope.status === HEAT_STATUS.APPLIED) {
      let heatLayer = $scope.heatLayerMap[$scope.selectedLayer];
      let attribute = $scope.selectedAttribute;
      if (heatLayer) {
        if (attribute !== INVALID_ATTR && attribute !== ATTR_WARNING && attribute !== SELECT_ATTRIBUTE) {
          $scope.status = HEAT_STATUS.APPLYING;
          // Turn Off current heat layer first.
          clearTimerService();
          turnOffCurrentHeatLayer();
          heatLayer.generateHeatLayer(attribute);
          currentLayer = heatLayer;
        }
      }
    } else {
      $window.alert("Rendering Heat Map...Please wait a few seconds...");
    }
  };

  $scope.turnOnHeatLayer = function() {
    if (currentLayer !== null) {
      currentLayer.turnOn();
    }
  };

  $scope.turnOffHeatLayer = turnOffCurrentHeatLayer;

  $scope.clearAll = function() {
    if ($scope.status === HEAT_STATUS.APPLIED) {
      $scope.selectedLayer = SELECT_LAYER;
      $scope.selectedAttribute = SELECT_ATTRIBUTE;

      clearTimerService();
      turnOffCurrentHeatLayer();
    }
  };

  $scope.$on('HeatLayerApplied', function (event, args) {
    if (args.error) {
      $window.alert("Fetching heat data failed. Please try again.");
      $scope.status = HEAT_STATUS.APPLIED;
    } else {
      $scope.status = HEAT_STATUS.APPLIED;
    }
    timerService = args.interval;
  });

  $scope.$on("$destroy", function() {
    clearTimerService();
  });

  function refreshSlider() {
    $timeout(function () {
      $scope.$broadcast('rzSliderForceRender');
    });
  }

  function turnOffCurrentHeatLayer() {
    if (currentLayer !== null) {
      currentLayer.turnOff();
    }
  }

  function clearTimerService() {
    if (timerService) {
      window.clearInterval(timerService);
    }
  }

};
