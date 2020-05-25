'use strict';

module.exports = function (Leaflet2DService, leaflet2DConfig, 3D_WebGIS_Angular_ESRI) {

  const openTip = "DATATABLE.OPEN";
  const closeTip = "DATATABLE.CLOSE";

  let self = this;
  let getDynamicTable = () => document.getElementsByClassName('dynamic-data-table')[0];

  self.data = {
    mapLayers: Leaflet2DService.data.mapLayers,
    dataTableLayers: copyObjectValues(Leaflet2DService.data.mapLayers),
    hiddenLayers: [],
    pageSize: 100,
    pageNumber: 1,
    pageCount: 0,
    isOpen: false,
    noTabSelected: false,
    noData: false,
    currentPageData: [],
    tooltip: openTip,
    currentTab: ""
  };

  self.slide = function () {
    let dynamicTable = getDynamicTable();
    if (parseInt(dynamicTable.style.bottom) >= 0) {
      self.closeView();
    } else {
      self.data.isOpen = true;
      dynamicTable.style.bottom = "50px";
      self.data.tooltip = closeTip;
    }
  };

  self.closeView = function () {
    let dynamicTable = getDynamicTable();
    dynamicTable.style.bottom = -(dynamicTable.clientHeight + 50) + 'px';
    self.data.tooltip = openTip;
    self.data.isOpen = false;
  };

  self.switchTab = function (id) {
    if (id !== self.data.currentTab) {
      self.data.currentTab = id;
      for (let i = 0; i < self.data.dataTableLayers.length; i++) {
        if (id === self.data.dataTableLayers[i].id) {
          self.data.dataTableLayers[i].initializing = true;
          self.data.dataTableLayers[i].update();
        }
      }
    }
  };

  self.closeTab = function (id) {
    for (let i = 0; i < self.data.dataTableLayers.length; i++) {
      let layer = self.data.dataTableLayers[i];
      if (layer.id === id) {
        self.data.hiddenLayers.push(layer);
        self.data.dataTableLayers.splice(i, 1);
        break;
      }
    }

    if (id === self.data.currentTab) {
      if (self.data.dataTableLayers.length > 0) {
        self.data.currentTab = self.data.dataTableLayers[0].id;
      } else {
        self.data.noTabSelected = true;
      }
    }

  };

  self.updateLayers = function () {
    let layers = [];
    for (let key in self.data.mapLayers) {
      if (self.data.mapLayers.hasOwnProperty(key) && self.data.mapLayers[key].isVisible()) {
        layers.push(self.data.mapLayers[key]);
      }
    }
    self.data.dataTableLayers = layers;
    self.data.hiddenLayers.length = 0;
    self.data.noTabSelected = self.data.dataTableLayers.length <= 0;
  };

  self.initializeDataTable = function () {
    let layers = self.data.dataTableLayers;
    if (layers.length > 0) {
      self.data.currentTab = layers[0].id;
    }

    for (let i = 0; i < layers.length; i++) {
      // Make sure each time when user opens table, the data will be updated automatically
      if (!layers[i].isRealTime && !layers[i].initializing) {
        layers[i].initializing = true;
        layers[i].update();
      }
    }
  };

  self.getDefaultScenario = function () {
    let defaultScenario;
    //set default scenario
    for (let i = 0; i < leaflet2DConfig.Scenarios.length; i++) {
      if (leaflet2DConfig.Scenarios[i].isDefault) {
        defaultScenario = leaflet2DConfig.Scenarios[i];
      }
    }
    return defaultScenario;
  };

  self.parseLayerType = function (layerID, scenario) {
    let realtimeLayers = scenario.scenario2Dlayers.realtimeLayers;
    let featureLayers = scenario.scenario2Dlayers.featureLayers;
    //If we can find the layerID in realtimeLayer, should return layerType as "realtimeLayer"
    for (let i = 0; i < realtimeLayers.length; i++) {
      if (realtimeLayers[i].id === layerID) {
        return 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER_TYPE;
      }
    }
    //If we can find the layerID in featureLayer, should return layerType as "featureLayer"
    for (let i = 0; i < featureLayers.length; i++) {
      if (featureLayers[i].id === layerID) {
        return 3D_WebGIS_Angular_ESRI.FEATURE_LAYER_TYPE;
      }
    }
    //Return default layerType as "featureLayer"
    return 3D_WebGIS_Angular_ESRI.FEATURE_LAYER_TYPE;
  };
  
  self.getZoomLevel = function (layerID, layerType, defaultScenario) {
    let zoomLevel = defaultScenario.scenarioExtent.zoom;
    let layers = [];
    if (layerType === 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER_TYPE) {
      layers = defaultScenario.scenario2Dlayers.realtimeLayers;
    } else if (layerType === 3D_WebGIS_Angular_ESRI.FEATURE_LAYER_TYPE) {
      layers = defaultScenario.scenario2Dlayers.featureLayers;
    }
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].id === layerID) {
        zoomLevel = layers[i].zoom;
      }
    }
    return zoomLevel;
  };

  self.parseRowData = function (layerID, row) {
    let dataTableLayers = self.data.dataTableLayers;
    let rowDataObject = {};
    for (let i = 0; i < dataTableLayers.length; i++) {
      if (dataTableLayers[i].id === layerID) {
        let header = dataTableLayers[i].header;
        for (let j = 0; j < header.length; j++) {
          rowDataObject[header[j]] = row[j];
        }
      }
    }
    return rowDataObject;
  };

  self.getLatLng = function (layerID, rowData) {
    // If row data contains lat/lng, then it is a polygon or realtime data.
    // then we don't need to get from feature layer.
    if (rowData.lat && rowData.lng) {
      return rowData;
    }

    let mapLayer = self.data.mapLayers[layerID].mapLayer;
    let latLng;
    if (rowData.objectid) {
      latLng = mapLayer.getFeature(rowData.objectid).getLatLng();
    } else {
      latLng = Leaflet2DService.data.leafletMap.getCenter();
    }

    return latLng;
  };

  function copyObjectValues(map) {
    let results = [];

    for (let key in map) {
      if (map.hasOwnProperty(key)) {
        results.push(map[key]);
      }
    }

    return results;
  }

};
