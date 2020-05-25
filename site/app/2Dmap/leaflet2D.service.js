'use strict';

// Need depend on exports loader to export variables in prunecluster to global
let PruneCluster = require('exports-loader?PruneCluster!prunecluster');
let PruneClusterForLeaflet = require('exports-loader?PruneClusterForLeaflet!prunecluster');

module.exports = function ($q, $http, $cookies, MapLayer2DBuilder, dataFactory2D, dataFactory, GateWayHeatLayer, GatewayInterpolationLayer,
                           FakeLayer, Popup2DService, AccountService, CollectionUtils, 3D_WebGIS_Angular_ESRI) {
  let self = this;

  this.data = {
    markers: [],
    timerServices: [],
    mapLayers: {},
    heatLayers: {},
    interpolationLayers: {}
  };

  this.initRealtimeLayer = function (scenario) {
    let layerConfigs = scenario.scenario2Dlayers.realtimeLayers;

    for (let i = 0; i < layerConfigs.length; i++) {
      let layerConfig = layerConfigs[i];
      let isCluster = false;
      let clusterSize = 50;

      if (layerConfig.cluster) {
        isCluster = true;
        clusterSize = layerConfig.cluster.defaultSize;
      }

      let clusterView = new PruneClusterForLeaflet(clusterSize);
      let realtimeLayer = new MapLayer2DBuilder(layerConfig.id)
        .withMapLayer(clusterView)
        .withIsCluster(isCluster)
        .withName(layerConfig.title)
        .withIcon(layerConfig.dataTableIcon)
        .withVisible(layerConfig.isVisible)
        .withIsRealtime(layerConfig.isRealTime)
        .withRefreshTime(layerConfig.refreshTime)
        .withAutoRefresh(layerConfig.autoRefresh)
        .withInitializing(true)
        .withUpdateFunc(dataFactory2D.getTCPdata)
        .withProcessForMapView(processForMapView)
        .withProcessForDataTable(processForDataTable)
        .withUpdateDuration(layerConfig.updateDuration)
        .withClusterSize(clusterSize)
        .withPopupUpEnabled(layerConfig.popupEnabled)
        .withPopupTemplate(layerConfig.popupTemplate)
        .build();

      self.data.leafletMap.addLayer(clusterView);
      self.data.mapLayers[realtimeLayer.id] = realtimeLayer;
    }
  };

  this.launchLayerServices = function (layers) {
    for (let key in layers) {
      if (layers.hasOwnProperty(key)) {
        let layer = layers[key];
        if (layer.isRealTime) {
          let interval = window.setInterval(function () {
            if (layer.isVisible()) {
              layer.update();
            }
          }, layer.refreshTime);
          self.data.timerServices.push(interval);
        } else {
          layer.update();
        }
      }
    }
  };

  this.initFeatureLayers = function (scenario) {
    //Add account service in leaflet 2D map
    let userInfo = AccountService.userInfo;
    let featureLayerBaseURL = userInfo.settings.featureLayerBaseURL;
    let layerLength = scenario.scenario2Dlayers.featureLayers.length;
    for (let i = 0; i < layerLength; i++) {
      let scenario2DLayer = scenario.scenario2Dlayers.featureLayers[i];

      if (scenario2DLayer.type === "FeatureLayer") {
        let esriToken = CollectionUtils.getEsriToken();
        let featureLayer = L.esri.featureLayer({
          url: featureLayerBaseURL + scenario2DLayer.url,
          token: esriToken
        }).addTo(self.data.leafletMap);
        let featureMapLayer = new MapLayer2DBuilder(scenario2DLayer.id)
          .withMapLayer(featureLayer)
          .withName(scenario2DLayer.title)
          .withIcon(scenario2DLayer.dataTableIcon)
          .withVisible(scenario2DLayer.isVisible)
          .withIsRealtime(scenario2DLayer.isRealTime)
          .withInitializing(true)
          .withUpdateFunc(updateFeatureLayer(featureLayerBaseURL + scenario2DLayer.url, esriToken))
          .withProcessForDataTable(dataTableHandler)
          .withPopupUpEnabled(scenario2DLayer.popupEnabled)
          .withPopupTemplate(scenario2DLayer.popupTemplate)
          .build();

        self.data.mapLayers[featureMapLayer.id] = featureMapLayer;

        if (scenario2DLayer.heatMapEnabled) {
          if (scenario2DLayer.id === 3D_WebGIS_Angular_ESRI.GATEWAY) {
            let gateWayHeatLayer = new GateWayHeatLayer(scenario2DLayer.id, self.data.leafletMap, featureLayer, scenario2DLayer.heatConfig);
            // Assign HeatLayer to self.data.heatLayers
            self.data.heatLayers[scenario2DLayer.id] = gateWayHeatLayer.createHeatLayer();

            let gateWayInterpolationLayer = new GatewayInterpolationLayer(scenario2DLayer.id, self.data.leafletMap, featureLayer, scenario2DLayer.heatConfig);
            self.data.interpolationLayers[scenario2DLayer.id] = gateWayInterpolationLayer.createInterpolationLayer();
          }
        }
      }
    }
    // TODO: remove fake interpolation layer, this is just for demo interpolation map.
    if (self.data.mapLayers["streetLamp"]) {
      let fakeLayer = new FakeLayer("Fake layer", self.data.leafletMap, self.data.mapLayers["streetLamp"].mapLayer);
      self.data.interpolationLayers[fakeLayer.id] = fakeLayer.createInterpolationLayer();
    }
    if (self.data.mapLayers["waterTank"]) {
      let fakeLayer = new FakeLayer("Fake layer", self.data.leafletMap, self.data.mapLayers["waterTank"].mapLayer);
      self.data.interpolationLayers[fakeLayer.id] = fakeLayer.createInterpolationLayer();
    }
  };

  this.reset2DMap = function () {
    self.data.markers.length = 0;
    self.data.timerServices.length = 0;
    CollectionUtils.clearObject(self.data.mapLayers);
    CollectionUtils.clearObject(self.data.heatLayers);
    CollectionUtils.clearObject(self.data.interpolationLayers);
  };

  // Below are for real time layer functions

  function processForDataTable(data) {
    let header = ['userID', 'name', 'lat', 'lng'];
    let body = [];
    if (data.status === "success") {
      let response = data.content.result;
      for (let i = 0; i < response.length; i++) {
        let userId = response[i].userID;
        let name = response[i].name;
        let lng = response[i].geoJSON.coordinates[0];
        let lat = response[i].geoJSON.coordinates[1];
        body.push([userId, name, lat, lng]);
      }
    }
    return {
      header: header,
      body: body
    };
  }

  function processForMapView(data) {
    if (data.status === "success") {
      let realtimeLayer = self.data.mapLayers[3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER];
      if (realtimeLayer) {
        updateMarkerToView(data.content.result, self.data.markers, realtimeLayer.mapLayer,
          realtimeLayer.popupEnabled, realtimeLayer.popupTemplate);
      }
    }
    return data;
  }

  // Remove all the markers
  // Update marker pos add new marker
  function updateMarkerToView(data, markers, clusterView, popupEnabled, popupTemplate) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      // Find marker whose ID matches corresponding user_id
      let marker = markers.find(function (marker) {
        return item.userID === marker.data.id;
      });

      // If marker exists
      if (marker) {
        marker.position.lat = item.geoJSON.coordinates[1];
        marker.position.lng = item.geoJSON.coordinates[0];
      } else {
        let marker = new PruneCluster.Marker(item.geoJSON.coordinates[1], item.geoJSON.coordinates[0]);
        marker.data.name = item.name;
        marker.data.id = item.userID;
        if (popupEnabled) {
          marker.data.popup = Popup2DService.createRealTimePopup(popupTemplate, item);
        }
        markers.push(marker);
        clusterView.RegisterMarker(marker);
      }
    }
    clusterView.ProcessView();
  }

  function updateFeatureLayer(url, token) {
    function featureLayerQuery() {
      let query = L.esri.query({url: url});
       query.token(token);
      let deferred = $q.defer();
      query.where("1=1").run(function (error, featureCollection, response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }

    return featureLayerQuery;
  }

  function dataTableHandler(response) {
    let header = [];
    let body = [];

    if (response.features.length > 0) {

      // handle when response format is json not geojson
      if (response.features[0].properties) {
        header = Object.keys(response.features[0].properties);

        for (let i = 0; i < response.features.length; i++) {
          let properties = response.features[i].properties;
          let values = [];

          for (let i = 0; i < header.length; i++) {
            values.push(properties[header[i]]);
          }

          body.push(values);
        }
      } else {
        header = Object.keys(response.features[0].attributes);

        for (let i = 0; i < response.features.length; i++) {
          let properties = response.features[i].attributes;
          let values = [];

          for (let i = 0; i < header.length; i++) {
            values.push(properties[header[i]]);
          }

          body.push(values);
        }
      }

    }

    return {
      header: header,
      body: body
    };

  }
};
