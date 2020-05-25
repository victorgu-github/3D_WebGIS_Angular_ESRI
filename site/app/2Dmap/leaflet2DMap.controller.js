'use strict';

module.exports = function ($q, $scope, $rootScope, $timeout, $routeParams, leaflet2DConfig, timerService,
                           PageNameService, dataFactory2D, Leaflet2DService, AccountService, CollectionUtils) {

  let self = this;
  let esriToken = CollectionUtils.getEsriToken();
  $scope.esriTokenExist = esriToken ? true : false;
  $scope.isCellPhone = AccountService.userInfo.isCellPhone;
  self.data = Leaflet2DService.data;
  //set scenario according to current scenario id, first scenario when current is null
  let scenario = leaflet2DConfig.Scenarios.find(scenario => {
    return scenario.scenarioID === AccountService.userInfo.settings.currentScenario.scenarioID;
  });

  self.data.scenario = scenario || leaflet2DConfig.Scenarios[0];

  initLeafletMap(self.data.scenario);

  // Add base map to leafletMap
  let basemap = L.esri.basemapLayer(self.data.scenario.baseMap,{maxNativeZoom:18,maxZoom:22});//esri world map only support to level19, strech out after
  basemap.addTo(self.data.leafletMap);

  // Initialize map layers and heat map data for scenario
  Leaflet2DService.initRealtimeLayer(self.data.scenario);
  Leaflet2DService.initFeatureLayers(self.data.scenario);
    // Launch layer services after feature layer authentication
  Leaflet2DService.launchLayerServices(self.data.mapLayers);

  $scope.$on("$destroy", function () {
    timerService.clearIntervals(self.data.timerServices);
    Leaflet2DService.reset2DMap();
  });

  function initLeafletMap(scenario) {
    Leaflet2DService.data.leafletMap = L.map('leaflet2Dmap',
    { 
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topright'
      }
    }).setView(scenario.scenarioExtent.center, scenario.scenarioExtent.zoom);
    // Maybe it is a leaflet bug, need to adjust height each time when clicking zoom in/out
    // Only found JQuery solution for now, should be replaced with vanilla javascript
    $(window).on("resize", function () {
      $("#leaflet2Dmap").height($(window).height() - 50);
      Leaflet2DService.data.leafletMap.invalidateSize();
    }).trigger("resize");
  }

};
