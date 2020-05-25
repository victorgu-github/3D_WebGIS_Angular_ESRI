'use strict';

module.exports = function (monitor2DMapConfig) {

  const openTip  = "DATATABLE.OPEN";
  const closeTip = "DATATABLE.CLOSE";

  let self = this;
  let getDynamicTable  = () => document.getElementsByClassName('dynamic-data-table')[0];

  self.data = {
    mapLayersData: {},
    dataTableLayers: {},
    dataTableLayersForDisplay: {},
    leafletMap: {},
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
    for (let key in self.data.mapLayersData) {
      if (self.data.mapLayersData.hasOwnProperty(key)) {
        layers.push(self.data.mapLayersData[key]);
      }
    }
    self.data.dataTableLayers = layers;
    self.data.dataTableLayersForDisplay = getDataTableLayersForDisplay(layers, monitor2DMapConfig.loraGateway.datatableHeader);
    self.data.hiddenLayers.length = 0;
    self.data.noTabSelected = self.data.dataTableLayers.length <= 0;
  };

  self.initializeDataTable = function () {
    let layers = self.data.dataTableLayers;
    if (layers.length > 0) {
      self.data.currentTab = layers[0].id;
    }
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
    let latLng = {};
    if (typeof rowData.GpsRefLat === "number" && typeof rowData.GpsRefLon === "number") {
      latLng.lat = rowData.GpsRefLat;
      latLng.lng = rowData.GpsRefLon;
    }
    return latLng;
  };

  self.syncLoraGatewayData = function(sharedData){
    self.data.mapLayersData = sharedData.mapLayersData;
    self.data.dataTableLayers = copyObjectValues(sharedData.mapLayersData);
    self.data.leafletMap = sharedData.leafletMap;
  };

  ////////////////////////////////////////////////////////
  //
  // Private Function
  //
  ////////////////////////////////////////////////////////

  function copyObjectValues(map) {
    let results = [];

    for (let key in map) {
      if (map.hasOwnProperty(key)) {
        results.push(map[key]);
      }
    }

    return results;
  }

  //Get data table for display from layers
  function getDataTableLayersForDisplay(layers, displayFields) {
    //Get an independent object copy, make the layersCopy data structure is the same as layers
    let layersForDisplay = {};
    for (let key in layers) {
      let layer = layers[key];
      layersForDisplay[key] = {};
      layersForDisplay[key].id = layer.id;
      layersForDisplay[key].displayName = layer.displayName;
      layersForDisplay[key].header = displayFields;
      layersForDisplay[key].body = [];
      for (let index in layer.body) {
        let originRowData = layer.body[index];
        let row = [];
        for (let i in displayFields) {
          let displayField = displayFields[i];
          let position = layer.header.findIndex((header) => { return header === displayField; });
          row.push(originRowData[position]);
        }
        layersForDisplay[key].body.push(row);
      }
    }
    return layersForDisplay;
  }
};
