'use strict';

module.exports = function ($q, $scope, $rootScope, DataTable2DService, ContextMenu2DService, Leaflet2DService,
                           Popup2DService, 3D_WebGIS_Angular_ESRI) {

  $scope.rootScope = $rootScope;
  $scope.data = DataTable2DService.data;
  $scope.menuOptions = ContextMenu2DService.generateMenuOptions();
  DataTable2DService.closeView();

  $scope.slide = function () {
    DataTable2DService.slide();
    if ($scope.data.isOpen) {
      DataTable2DService.updateLayers();
      $scope.menuOptions = ContextMenu2DService.generateMenuOptions();
      DataTable2DService.initializeDataTable();
    }
  };

  $scope.closeView = function() {
    DataTable2DService.closeView();
  };

  $scope.switchTab = function (id) {
    DataTable2DService.switchTab(id);
  };

  $scope.closeTab = function (id) {
    DataTable2DService.closeTab(id);
  };

  $scope.onLeftClick = function (row) {
    let leafletMap = Leaflet2DService.data.leafletMap;
    let layerID = DataTable2DService.data.currentTab;
    let scenario = Leaflet2DService.data.scenario;
    let layerType;
    let zoomLevel;
    let layers;
    let popupTemplate;
    let popupContent;

    //Use layerID and scenario to parse the layerType
    layerType = DataTable2DService.parseLayerType(layerID, scenario);

    //Use layerID layerType and scenario to get zoom level
    zoomLevel = DataTable2DService.getZoomLevel(layerID, layerType, scenario);

    //Parse row data, get the necessary data for zoom to and popup
    let rowData = DataTable2DService.parseRowData(layerID, row);

    //Get latitude and longitude from rowData
    let {lat, lng} = DataTable2DService.getLatLng(layerID, rowData);

    //Zoom to feature, use leafletMap.setView zoom to device
    leafletMap.setView([lat, lng], zoomLevel);

    let popup = L.popup();
    //Get the correct layers from scenario, according to layerType
    if (layerType === 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER_TYPE) {
      layers = scenario.scenario2Dlayers.realtimeLayers;
    } else if (layerType === 3D_WebGIS_Angular_ESRI.FEATURE_LAYER_TYPE) {
      layers = scenario.scenario2Dlayers.featureLayers;
    }
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].id === layerID) {
        popupTemplate = layers[i].popupTemplate;
      }
    }
    //Parse popup content according to popupTemplate and rowData
    popupContent = Popup2DService.getPopupContent(popupTemplate, rowData);
    //Popup
    popup.setLatLng([lat, lng]).setContent(popupContent).openOn(leafletMap);
  };
};
