'use strict';

module.exports = function ($scope, $timeout, $window, Leaflet2DService) {
  const LOADING = "SIDEBAR.INTERPOLATION.LOADING";
  const INVALID_ATTR = "SIDEBAR.INTERPOLATION.INVALID_LAYER";
  const ATTR_WARNING = "SIDEBAR.INTERPOLATION.PLEASE_SELECT_LAYER";
  const SELECT_LAYER = "SIDEBAR.INTERPOLATION.SELECT_AN_LAYER";
  const SELECT_ATTRIBUTE = "SIDEBAR.INTERPOLATION.SELECT_AN_ATTR";
  const INTERPOLATION_STATUS = {
    APPLIED: "applied",
    APPLYING: "applying"
  };

  let currentLayer = null;
  let timerService;

  $scope.layerDropdown = false;
  $scope.interpolationMap = Leaflet2DService.data.interpolationLayers;

  $scope.selectedLayer = SELECT_LAYER;
  $scope.selectedAttribute = SELECT_ATTRIBUTE;
  $scope.interpolationLayers = [LOADING];
  $scope.layerAttributes = [ATTR_WARNING];
  $scope.status = INTERPOLATION_STATUS.APPLIED;

  $scope.$watchCollection('interpolationMap', function (newVal) {
    if (newVal && Object.keys(newVal).length > 0) {
      $scope.interpolationLayers = Object.keys(newVal);
    }
  });

  $scope.onChangeLayer = function (layer) {
    $scope.selectedLayer = layer;
    if ($scope.interpolationMap[layer]) {
      let attributes = $scope.interpolationMap[layer].getAttributes();
      $scope.layerAttributes = Object.keys(attributes);
      refreshSlider();
    } else {
      $scope.layerAttributes = [INVALID_ATTR];
    }
  };

  $scope.onChangeAttribute = function (attr) {
    $scope.selectedAttribute = attr;
  };

  $scope.renderInterpolationMap = function() {
    if ($scope.status === INTERPOLATION_STATUS.APPLIED) {
      let interpolationLayer = $scope.interpolationMap[$scope.selectedLayer];
      let attribute = $scope.selectedAttribute;
      if (interpolationLayer) {
        if (attribute !== INVALID_ATTR && attribute !== ATTR_WARNING && attribute !== SELECT_ATTRIBUTE) {
          $scope.status = INTERPOLATION_STATUS.APPLYING;
          // Turn Off current heat layer first.
          clearTimerService();
          turnOffCurrentHeatLayer();
          interpolationLayer.generateInterpolationLayer(attribute);
          currentLayer = interpolationLayer;
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
    if ($scope.status === INTERPOLATION_STATUS.APPLIED) {
      $scope.selectedLayer = SELECT_LAYER;
      $scope.selectedAttribute = SELECT_ATTRIBUTE;

      clearTimerService();
      turnOffCurrentHeatLayer();
    }
  };

  $scope.$on('InterpolationApplied', function (event, args) {
    // Use timeout to make sure that digest status in next $digest circle.
    $timeout(()  => { $scope.status = INTERPOLATION_STATUS.APPLIED;});
    if (args.error) {
      $window.alert("Fetching interpolation data failed. Please try again.");
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
