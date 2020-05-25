'use strict';

module.exports = function ($rootScope, InterpolationLayer) {
  const d3 = window.d3;
  const SvgFilter = window.SvgFilter;

  const COLORS = {
    "qual_sensor": {
      color: ["2E7D32", "FFEE58", "FB8C00", "C62828", "980043", "67001F", "67001F", "67001F"],
      range: [0, 12.1, 35.5, 55.5, 150.5, 250.5, 1e4, 10000.1]
    }
  };

  let FakeInterpolationLayer = function (id, map, mapLayer, config) {
    this.id = id;
    this.map = map;
    this.mapLayer = mapLayer;
    this.config = config;
    this.attributes = {
      "Air Quality": "qual_sensor"
    };
    this.interpolation = null;
  };

  function buildDataFunc(currentFeature) {
    let feature = {};
    if (currentFeature) {
      if (currentFeature.properties.lat && currentFeature.properties.lng) {
        feature.lat = currentFeature.properties.lat;
        feature.lng = currentFeature.properties.lng;
      } else {
        feature.lat = currentFeature.geometry.coordinates[1];
        feature.lng = currentFeature.geometry.coordinates[0];
      }
    }
    return feature;
  }

  function buildLayerFunc(devices) {
    return devices.map(device => {
      return {
        current: {
          value: Math.random() * 80
        },
        location: {
          coordinates: [device.lng, device.lat]
        }
      };
    });
  }

  function dynamicUpdateHeatLayer(attribute, devices, self) {
    return window.setInterval(function () {
      let layerData = buildLayerFunc(devices);

      renderInterpolationMap(self, layerData, attribute);
    }, 3000);
  }

  function renderInterpolationMap(self, response, attribute) {
    let southwest = self.map.getBounds().getSouthWest();
    let northeast = self.map.getBounds().getNorthEast();

    let interpolationExtent = [[southwest.lng + 180, southwest.lat], [northeast.lng + 180, northeast.lat]];
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

  FakeInterpolationLayer.prototype = {
    createInterpolationLayer: function () {
      return new InterpolationLayer(this.id, this.map, this.mapLayer, this.interpolation, this.attributes, this.config, this.updateInterpolationLayer);
    },

    updateInterpolationLayer: function (attribute) {
      let self = this;
      this.mapLayer.query()
        .where("1=1")
        .run((error, featureCollection) => {
          let deviceData = featureCollection.features.map(feature => buildDataFunc(feature));

          let layerData = buildLayerFunc(deviceData);

          renderInterpolationMap(self, layerData, attribute);

          let interval = dynamicUpdateHeatLayer(attribute, deviceData, self);
          // broadcast to change heat map panel status to applied.
          $rootScope.$broadcast('InterpolationApplied', {
            interval: interval
          });

        });
    }

  };

  return FakeInterpolationLayer;

};
