'use strict';

module.exports = function () {
  let MapLayer3D = function (_mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, _isOpen, _collapsed,
                             _displayName, _icon, _refreshTime, _initializing, _autoRefresh, _updateFunc,
                             _parseResponseFunc, _processForMapView) {
    this.mapLayer = _mapLayer;
    this.animationLayer = _animationLayer;
    this.id = _id;
    this.title = _title;
    this.items = _items || [];
    this.layers = _layers || [];
    this.opacity = _opacity || 100;
    this.featureLayerData = null;
    this.isOpen = _isOpen || false;
    this.collapsed = _collapsed || true;

    // Below are attributes from TabTable, remove this annotation once we are done with 3D Layer refactor.
    this.name = _displayName;
    this.icon = _icon;
    this.header = [];
    this.body = [];
    this.refreshTime = _refreshTime;
    this.initializing = _initializing;
    this.autoRefresh = _autoRefresh;
    this.updateFunc = _updateFunc;
    this.processForDataTable = _parseResponseFunc;
    this.processForMapView = _processForMapView;
    this.slideOptions = {
      floor: 0,
      ceil: 100,
      onStart: function (id, newValue) {
        this.opacity = newValue;
        this.mapLayer.opacity = newValue / 100;
      }.bind(this),
      onChange: function (id, newValue) {
        this.opacity = newValue;
        this.mapLayer.opacity = newValue / 100;
      }.bind(this),
      onEnd: function (id, newValue) {
        this.changeLayerOpacity(newValue);
      }.bind(this)
    };
  };

  MapLayer3D.prototype = {
    toggleLayerVisibility: function (visibility) {
      if (visibility !== undefined) {
        this.mapLayer.visible = visibility;
      } else {
        this.mapLayer.visible = !this.mapLayer.visible;
      }
      if (this.animationLayer) {
        this.animationLayer.visible = this.mapLayer.visible;
        if (!this.animationLayer.visible) {
          this.animationLayer.graphics.length = 0;
        }
      }

      for (let i = 0; i < this.layers.length; i++) {
        this.layers[i].toggleLayerVisibility(this.mapLayer.visible);
      }
    },

    changeLayerOpacity: function (opacity) {
      this.opacity = opacity;
      this.mapLayer.opacity = opacity / 100;

      for (let i = 0; i < this.layers.length; i++) {
        this.layers[i].changeLayerOpacity(this.opacity);
      }
    },

    toggleItems: function () {
      this.isOpen = !this.isOpen;
    },

    toggleCollapse: function () {
      this.collapsed = !this.collapsed;
    },

    isVisible: function () {
      return this.mapLayer.visible;
    },

    update: function () {
      if (this.autoRefresh || this.initializing) {
        this.updateFunc()
          .then(this.initHandler.bind(this))
          .then(this.mapViewHandler.bind(this))
          .then(this.dataTableHandler.bind(this));
      }
    },

    mapViewHandler: function (response) {
      this.processForMapView(response);
      return response;
    },

    dataTableHandler: function (response) {
      let data = this.processForDataTable(response);
      this.header = data["header"];//used for passing data between map and datatable
      this.aliasHeader = data["aliasHeader"];//used for showing in table header
      let length = data["body"].length;
      if (length < 5 && length > 0) {
        for (let i = length; i < 5; i++) {
          data["body"].push([]);
        }
      }
      this.body = data["body"];
    },

    initHandler: function (response) {
      this.initializing = false;
      return response;
    }

  };

  return MapLayer3D;

};
