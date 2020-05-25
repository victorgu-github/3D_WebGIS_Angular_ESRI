'use strict';

module.exports = function (Popup2DService) {
  let MapLayer2D = function (_mapLayer, _isCluster, _id, _displayName, _icon, _visibility, _isRealTime,
                             _refreshTime, _initializing, _autoRefresh, _updateFunc, _processForMapView,
                             _processForDataTable, _updateDuration, _clusterSize, _popupEnabled, _popupTemplate) {
    this.mapLayer = _mapLayer || null;
    this.isCluster = _isCluster || false;
    this.id = _id || "Default ID";
    this.displayName = _displayName || "Default name";
    this.icon = _icon || "signal";
    this.visible = _visibility;
    this.isRealTime = _isRealTime || false;
    this.header = [];
    this.body = [];
    this.refreshTime = _refreshTime || 3000;
    this.initializing = _initializing || false;
    this.autoRefresh = _autoRefresh || false;
    this.updateFunc = _updateFunc || function(){};
    this.processForMapView = _processForMapView || function(){};
    this.processForDataTable = _processForDataTable || function(){};
    this.updateDuration = _updateDuration || 400;
    this.lastUpdate = +new Date();
    this.isOpen = false;
    this.opacity = 100;
    this.clusterSize = _clusterSize || 50;
    this.clusterOptions = {
      floor: 10,
      ceil: 500,
      onStart: function (id, newValue) {
        this.updateClusterSize(newValue);
      }.bind(this),
      onChange: function (id, newValue) {
        this.updateClusterSize(newValue);
      }.bind(this),
      onEnd: function (id, newValue) {
        this.updateClusterSize(newValue);
      }.bind(this)
    };
    this.popupEnabled = _popupEnabled || false;
    this.popupTemplate = _popupTemplate || {
        title: "Title",
        titleValue: "Title",
        staticFields: [],
        dynamicFields: []
      };
  };

  MapLayer2D.prototype = {
    setLayerVisibility: function (visibility) {
      this.visible = visibility;
    },

    update: function () {
      if (this.autoRefresh || this.initializing) {
        let now = +new Date();
        if ((now - this.lastUpdate) >= this.updateDuration || this.initializing) {
          this.updateFunc()
            .then(this.initHandler.bind(this))
            .then(this.dataTableHandler.bind(this))
            .then(this.mapViewHandler.bind(this));

          this.lastUpdate = now;
        }
      }
    },

    initHandler: function (response) {
      this.initializing = false;
      return response;
    },

    mapViewHandler: function (response) {
      this.processForMapView(response);
      if (this.popupEnabled) {
        // Bind popup to feature layer
        if (!this.isCluster) {
          this.mapLayer.bindPopup(function (layer) {
            let popupTemplate = Popup2DService.createFeatureLayerPopup(this.popupTemplate);
            return L.Util.template(popupTemplate, layer.feature.properties);
          }.bind(this));
        } else {
          // TODO cluster mode popup
        }
      }
      return response;
    },

    dataTableHandler: function (response) {
      let data = this.processForDataTable(response, this.id);
      this.header = data["header"];
      this.body = data["body"];
      return response;
    },

    updateClusterSize: function (newValue) {
      this.clusterSize = newValue;
      this.mapLayer.Cluster.Size = parseInt(this.clusterSize);
      let now = +new Date();
      if ((now - this.lastUpdate) >= this.updateDuration) {
        this.mapLayer.ProcessView();
        this.lastUpdate = now;
      }
    },

    isVisible: function () {
      return this.visible;
    },

    setMapLayer: function (layer) {
      this.mapLayer = layer;
    },

    toggleItems: function () {
      this.isOpen = !this.isOpen;
    },

    changeLayerOpacity: function (opacity) {
      this.opacity = opacity;
      this.mapLayer.opacity = opacity / 100;
    }

  };

  return MapLayer2D;

};
