'use strict';

module.exports = function ($rootScope, InterpolationLayer, dataFactory2D) {
  const turf = window.turf;
  const d3 = window.d3;
  const SvgFilter = window.SvgFilter;

  const COLORS = {
    "qual_sensor": {
      color: ["2E7D32", "FFEE58", "FB8C00", "C62828", "980043", "67001F", "67001F", "67001F"],
      range: [0, 12.1, 35.5, 55.5, 150.5, 250.5, 1e4, 10000.1]
    },
    "temp_sensor": {
      color: ["303F9F", "03A9F4", "B3E5FC", "4CAF50", "388E3C", "FFEB3B", "FF5722", "D32F2F"],
      range: [-100, -20, 0, 15, 20, 25, 30, 35, 40]
    },
    "humid_sensor": {
      color: ["B3E5FC", "03A9F4", "0288D1", "448AFF", "1976D2", "3F51B5", "303F9F"],
      range: [0, 20, 35.5, 40, 55, 80, 100]
    }
  };

  let GateWayInterpolationLayer = function (id, map, mapLayer, config) {
    this.id = id;
    this.map = map;
    this.mapLayer = mapLayer;
    this.config = config;
    this.attributes = {
      "Air Quality": "qual_sensor",
      "Temperature": "temp_sensor",
      "Humidity": "humid_sensor"
    };
    this.interpolation = null;
  };

  function buildDataFunc(currentFeature) {
    let feature = {};
    if (currentFeature) {
      feature.mac_address = currentFeature.properties.mac_address;
      feature.lat = currentFeature.geometry.coordinates[1];
      feature.lng = currentFeature.geometry.coordinates[0];
    }
    return feature;
  }

  function buildLayerFunc(devices, data, attribute) {
    return devices.map(device => {
      let macID = device.mac_address.replace(/-/g, ":");
      let matched = data.gw_sensor_recs.find(function (record) {
        return record.gw_mac === macID;
      });

      if (matched) {
        return {
          current: {
            value: matched[attribute].value
          },
          location: {
            coordinates: [device.lng, device.lat]
          }
        };
      }
    });
  }

  function dynamicUpdateHeatLayer(attribute, devices, self) {
    if (self.config && self.config.isRealtime) {
      return window.setInterval(function () {
        dataFactory2D.getGWsensorValues('', attribute).then(function (response) {
          if (response.status === 'success') {
            let layerData = buildLayerFunc(devices, response.content, attribute);

            renderInterpolationMap(self, layerData, attribute);
          } else {
            console.error("Error occurred: " + response.errors[0].message);
          }
        });
      }, self.config.refreshTime);
    }
  }

  function renderInterpolationMap(self, response, attribute) {
    let boundaryBox = turf.bbox({
      type: "FeatureCollection",
      features: response.map(r => {
        return {
          type: "Feature",
          geometry: {
            coordinates: r.location.coordinates,
            type: "Point"
          }
        };
      })
    });
    let interpolationExtent = [[boundaryBox[0] + 180, boundaryBox[1]], [boundaryBox[2] + 180, boundaryBox[3]]];
    let voronoi = d3.voronoi()
      .x(point => point.location.coordinates[0] + 180)
      .y(point => point.location.coordinates[1])
      .extent(interpolationExtent).polygons(response);

    for (let i = 0; i < response.length; i++) {
      let polygons;
      if (voronoi[i]) {
        polygons = JSON.parse(JSON.stringify(voronoi[i]));
        response[i].voronoiPolygon = polygons.map(n => {
          n[0] -= 180;
          return n;
        });
        response[i].voronoiPolygon.push(response[i].voronoiPolygon[0]);
      }
    }

    // Some points have no voronoi data, filter out them
    let points = response.filter(r => r.voronoiPolygon !== undefined);

    let geoJsonLayer = L.geoJson({
      type: "FeatureCollection",
      features: points.map(point => {
        return {
          type: "Feature",
          properties: point,
          geometry: {
            type: "Polygon",
            coordinates: [point.voronoiPolygon]
          }
        };
      })
    }, {
      interactive: false,
      style: () => {
        return {
          stroke: false,
          color: "transparent",
          weight: 0,
          fillOpacity: .75,
          fillColor: "transparent",
          opacity: 0,
          className: "d3voronoi-polygon"
        };
      }
    });

    let colors = COLORS[attribute].color;
    let range = COLORS[attribute].range;
    // linearColor is the function that generates color
    let linearColor = d3.scaleLinear().domain(range).range(colors.map(function (n) {
      return "#" + n;
    }));

    if (self.interpolation !== null) {
      self.map.removeLayer(self.interpolation);
    }
    self.interpolation = geoJsonLayer;
    self.interpolation.addTo(self.map);

    let svgFilter = new SvgFilter();
    let filter = svgFilter.append("blur");
    filter.attr("stdDeviation", 25);
    d3.select("svg").attr("filter", svgFilter);

    self.interpolation.eachLayer(layer => {
      let value = layer.feature.properties.current.value;
      let color = linearColor(value);
      layer.setStyle({
        fillColor: color
      });
      layer.matchingObservation = value;
    });
  }

  GateWayInterpolationLayer.prototype = {
    createInterpolationLayer: function () {
      return new InterpolationLayer(this.id, this.map, this.mapLayer, this.interpolation, this.attributes, this.config, this.updateInterpolationLayer);
    },

    updateInterpolationLayer: function (attribute) {
      let self = this;
      this.mapLayer.query()
        .where("1=1")
        .run((error, featureCollection) => {

          let deviceData = [];
          deviceData = featureCollection.features.map(feature => buildDataFunc(feature));

          dataFactory2D.getGWsensorValues('', attribute).then(function (response) {
            if (response.status === 'success') {
              let layerData = buildLayerFunc(deviceData, response.content, attribute);

              renderInterpolationMap(self, layerData, attribute);

              let interval = dynamicUpdateHeatLayer(attribute, deviceData, self);
              // broadcast to change heat map panel status to applied.
              $rootScope.$broadcast('InterpolationApplied', {
                interval: interval
              });
            } else {
              console.error("Error occurred: " + response.errors[0].message);
              // broadcast to change heat map panel status to applied.
              let interval = dynamicUpdateHeatLayer(attribute, deviceData, self);
              $rootScope.$broadcast('InterpolationApplied', {
                interval: interval,
                error: response.errors
              });
            }

          });

        });
    }

  };

  return GateWayInterpolationLayer;

};
