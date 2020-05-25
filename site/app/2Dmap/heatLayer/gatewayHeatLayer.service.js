'use strict';

module.exports = function ($rootScope, HeatLayer, dataFactory2D) {
  let GateWayHeatLayer = function (name, map, mapLayer, heatConfig) {
    this.name = name;
    this.map = map;
    this.mapLayer = mapLayer;
    this.heatConfig = heatConfig;
    this.attributes = {
      "Air Quality": "qual_sensor",
      "Temperature": "temp_sensor",
      "Humidity": "humid_sensor"
    };
    this.heat = null;
  };

  function buildHeatDataFunc(currentFeature) {
    let feature = {};
    if (currentFeature) {
      feature.mac_address = currentFeature.properties.mac_address;
      feature.lat = currentFeature.geometry.coordinates[1];
      feature.lng = currentFeature.geometry.coordinates[0];
    }
    return feature;
  }

  function buildLayerFunc(heatMapData, data, attribute) {
    let heatMapDataLength = heatMapData.length;
    let results = [];

    for (let i = 0; i < heatMapDataLength; i++) {
      let node = heatMapData[i];
      let macID = node.mac_address.replace(/-/g, ":");
      let matched = data.gw_sensor_recs.find(function (record) {
        return record.gw_mac === macID;
      });

      if (matched) {
        node.value = matched[attribute].value;
        results.push([node.lat, node.lng, node.value]);
      }
    }

    return results;
  }

  function dynamicUpdateHeatLayer(attribute, heatMapData, heatLayer, heatConfig) {
    if (heatConfig && heatConfig.isRealtime) {
      return window.setInterval(function () {
        dataFactory2D.getGWsensorValues('', attribute).then(function (response) {
          if (response.status === 'success') {
            let layerData = buildLayerFunc(heatMapData, response.content, attribute);

            heatLayer.setLatLngs(layerData);
          } else {
            console.error("Error occurred: " + response.errors[0].message);
          }
        });
      }, heatConfig.refreshTime);
    }
  }

  GateWayHeatLayer.prototype = {
    createHeatLayer: function () {
      return new HeatLayer(this.name, this.map, this.mapLayer, this.heat, this.attributes, this.heatConfig, this.updateHeatLayer);
    },

    updateHeatLayer: function (attribute) {
      let self = this;
      this.mapLayer.query()
        .where("1=1")
        .run(function (error, featureCollection) {
          let heatMapData = [];
          featureCollection.features.forEach(function (feature) {
            let heatData = buildHeatDataFunc(feature);
            heatMapData.push(heatData);
          });
          //query nodeserver for intensity value

          dataFactory2D.getGWsensorValues('', attribute).then(function (response) {
            if (response.status === 'success') {
              let layerData = buildLayerFunc(heatMapData, response.content, attribute);

              if (self.heat !== null) {
                self.map.removeLayer(self.heat);
              }
              self.heat = L.heatLayer(layerData, {radius: self.radius, blur: self.blur, maxZoom: 17});
              self.heat.addTo(self.map);

              let interval = dynamicUpdateHeatLayer(attribute, heatMapData, self.heat, self.heatConfig);
              // broadcast to change heat map panel status to applied.
              $rootScope.$broadcast('HeatLayerApplied', {
                interval: interval
              });
            } else {
              console.error("Error occurred: " + response.errors[0].message);
              // broadcast to change heat map panel status to applied.
              let interval = dynamicUpdateHeatLayer(attribute, heatMapData, self.heat, self.heatConfig);
              $rootScope.$broadcast('HeatLayerApplied', {
                interval: interval,
                error: response.errors
              });
            }


          });

        });
    }

  };

  return GateWayHeatLayer;

};
