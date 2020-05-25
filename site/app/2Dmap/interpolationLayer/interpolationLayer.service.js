'use strict';

module.exports = function () {
  const d3 = window.d3;

  let InterpolationLayer = function (id, leafletMap, mapLayer, interpolation, attributes, config, updateLayer) {
    this.id = id;
    this.map = leafletMap;
    this.mapLayer = mapLayer;
    this.attributes = attributes;
    this.config = config;
    this.interpolation = interpolation;
    this.updateInterpolationLayer = updateLayer;
  };

  InterpolationLayer.prototype = {
    getAttributes: function () {
      return this.attributes;
    },

    generateInterpolationLayer: function (key) {
      if (key && this.attributes[key]) {
        this.updateInterpolationLayer(this.attributes[key]);
      }
    },

    turnOn: function () {
      if (this.interpolation !== null) {
        this.interpolation.addTo(this.map);
      }
    },

    turnOff: function () {
      if (this.interpolation !== null) {
        this.map.removeLayer(this.interpolation);
        // set null to filter to clear blur filter.
        d3.select("svg").attr("filter", null);
      }
    }

  };

  return InterpolationLayer;

};
