'use strict';

module.exports = function () {
  let HeatLayer = function (name, leafletMap, mapLayer, heat, attributes, heatConfig, updateHeatLayer) {
    this.name = name;
    this.map = leafletMap;
    this.mapLayer = mapLayer;
    this.attributes = attributes;
    this.heatConfig = heatConfig;
    this.heat = heat;
    this.radius = 30; // Default radius
    this.blur = 40; // Default blur
    this.updateHeatLayer = updateHeatLayer;
    this.radiusOptions = {
      floor: 10,
      ceil: 50,
      onStart: function (id, newValue) {
        this.radius = newValue;
        if (this.heat) {
          this.heat.setOptions({
            radius: this.radius,
          });
        }
      }.bind(this),
      onChange: function (id, newValue) {
        this.radius = newValue;
        if (this.heat) {
          this.heat.setOptions({
            radius: this.radius,
          });
        }
      }.bind(this),
      onEnd: function (id, newValue) {
        this.radius = newValue;
        if (this.heat) {
          this.heat.setOptions({
            radius: this.radius,
          });
        }
      }.bind(this)
    };
    this.blurOptions = {
      floor: 10,
      ceil: 50,
      onStart: function (id, newValue) {
        this.blur = newValue;
        if (this.heat) {
          this.heat.setOptions({
            blur: this.blur,
          });
        }
      }.bind(this),
      onChange: function (id, newValue) {
        this.blur = newValue;
        if (this.heat) {
          this.heat.setOptions({
            blur: this.blur,
          });
        }
      }.bind(this),
      onEnd: function (id, newValue) {
        this.blur = newValue;
        if (this.heat) {
          this.heat.setOptions({
            blur: this.blur,
          });
        }
      }.bind(this)
    };
  };

  HeatLayer.prototype = {
    getAttributes: function () {
      return this.attributes;
    },

    generateHeatLayer: function (key) {
      if (key && this.attributes[key]) {
        this.updateHeatLayer(this.attributes[key]);
      }
    },

    turnOn: function () {
      if (this.heat !== null) {
        this.heat.addTo(this.map);
      }
    },

    turnOff: function () {
      if (this.heat !== null) {
        this.map.removeLayer(this.heat);
      }
    }

  };

  return HeatLayer;

};
