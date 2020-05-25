'use strict';

module.exports = function (MapLayer2D) {
  let MapLayer2DBuilder = function (_id) {
    this.id = _id;
  };

  MapLayer2DBuilder.prototype = {
    withMapLayer: function (mapLayer) {
      this.mapLayer = mapLayer;
      return this;
    },

    withIsCluster: function (isCluster) {
      this.isCluster = isCluster;
      return this;
    },

    withName: function (displayName) {
      this.name = displayName;
      return this;
    },

    withIcon: function (icon) {
      this.icon = icon;
      return this;
    },

    withVisible: function (visibility) {
      this.visible = visibility;
      return this;
    },

    withIsRealtime: function (isRealtime) {
      this.isRealTime = isRealtime;
      return this;
    },

    withRefreshTime: function (refreshTime) {
      this.refreshTime = refreshTime;
      return this;
    },

    withInitializing: function (initializing) {
      this.initializing = initializing;
      return this;
    },

    withAutoRefresh: function (autoRefresh) {
      this.autoRefresh = autoRefresh;
      return this;
    },

    withUpdateFunc: function (updateFunc) {
      this.updateFunc = updateFunc;
      return this;
    },

    withProcessForMapView: function (processForMapView) {
      this.processForMapView = processForMapView;
      return this;
    },

    withProcessForDataTable: function (processForDataTable) {
      this.processForDataTable = processForDataTable;
      return this;
    },

    withUpdateDuration: function (updateDuration) {
      this.updateDuration = updateDuration || 400;
      return this;
    },

    withClusterSize: function (clusterSize) {
      this.clusterSize = clusterSize;
      return this;
    },

    withPopupTemplate: function (popupTemplate) {
      this.popupTemplate = popupTemplate;
      return this;
    },

    withPopupUpEnabled: function (popupEnabled) {
      this.popupEnabled = popupEnabled;
      return this;
    },

    build: function () {
      return new MapLayer2D(this.mapLayer, this.isCluster, this.id, this.name, this.icon, this.visible,
        this.isRealTime, this.refreshTime, this.initializing, this.autoRefresh, this.updateFunc,
        this.processForMapView, this.processForDataTable, this.updateDuration, this.clusterSize,
        this.popupEnabled, this.popupTemplate);
    }

  };

  return MapLayer2DBuilder;

};
