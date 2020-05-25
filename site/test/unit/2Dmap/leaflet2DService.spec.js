"use strict";

describe("Leaflet 2D map service", function () {
  let Leaflet2DService;
  let MapLayer2DBuilder;
  let $q;
  let $rootScope;
  let $cookies;
  let $httpBackend;

  beforeEach(function () {
    module('3D_WebGIS_Angular_ESRIMap');

    inject(function ($injector, _$q_, _$cookies_, _$rootScope_, _$httpBackend_) {
      Leaflet2DService = $injector.get('Leaflet2DService');
      MapLayer2DBuilder = $injector.get('MapLayer2DBuilder');
      $q = _$q_;
      $cookies = _$cookies_;
      $rootScope = _$rootScope_;
      Leaflet2DService.data.leafletMap = {
        addLayer: function (layer) {
          return layer;
        }
      };
      let esriAuthInfo = {
        "token": "token",
        "expires": new Date().getTime() + 864000,
        "ssl": false
      };
      $cookies.putObject("esriToken", {}, {expires: new Date(esriAuthInfo.expires)});
      $httpBackend = _$httpBackend_;
      $httpBackend
        .when('POST', 'https://www.arcgis.com/sharing/generateToken')
        .respond({
          token: "123456"
        });
    });

  });

  describe('.initFeatureLayers', function () {
    it('should not build map layers when 2D layers', function () {
      let scenario = {scenario2Dlayers: {featureLayers: []}};

      Leaflet2DService.initFeatureLayers(scenario);

      expect(Leaflet2DService.data.mapLayers).to.be.empty;
      expect(Leaflet2DService.data.heatLayers).to.be.empty;
    });

    it('should not build map layers when no feature layer in config', function () {
      let scenario = {
        scenario2Dlayers: {
          featureLayers: [{
            id: "gateway20170616",
            url: "",
            heatMapEnabled: true,
            heatMapattribute: "Altitude",
          },
            {
              id: "camera",
              url: "",
            }]
        }
      };

      Leaflet2DService.initFeatureLayers(scenario);

      expect(Leaflet2DService.data.mapLayers).to.be.empty;
      expect(Leaflet2DService.data.heatLayers).to.be.empty;
    });

    it('should not build map layers without heatmap when heatmap not enabled', function () {
      let scenario = {
        scenario2Dlayers: {
          featureLayers: [
            {
              id: "gateway20170616",
              url: "",
              type: "FeatureLayer"
            }]
        }
      };

      Leaflet2DService.initFeatureLayers(scenario);

      expect(Leaflet2DService.data.mapLayers["gateway20170616"]).to.not.be.undefined;
    });

    it('should not build heat map layer when layer is not gateway', function () {
      let scenario = {
        scenario2Dlayers: {
          featureLayers: [{
            id: "detector",
            url: "",
            type: "FeatureLayer"
          }]
        }
      };

      Leaflet2DService.initFeatureLayers(scenario);

      expect(Leaflet2DService.data.mapLayers["detector"]).to.not.be.undefined;
      expect(Leaflet2DService.data.heatLayers).to.be.empty;
    });

    it('should build heat map layer when layer is gateway', function () {
      let scenario = {
        scenario2Dlayers: {
          featureLayers: [
            {
              id: "gateway20170616",
              url: "",
              heatMapEnabled: true,
              type: "FeatureLayer"
            }]
        }
      };

      Leaflet2DService.initFeatureLayers(scenario);

      expect(Leaflet2DService.data.mapLayers["gateway20170616"]).to.not.be.undefined;
      expect(Leaflet2DService.data.heatLayers["gateway20170616"]).to.not.be.undefined;
      expect(Leaflet2DService.data.heatLayers["gateway20170616"].attributes).to.deep.equal({
        "Air Quality": "qual_sensor",
        "Humidity": "humid_sensor",
        "Temperature": "temp_sensor"
      });
    });

  });

  describe('.initRealtimeLayer', function () {
    it('should not build realtime layer when no realtime layer in config', function () {
      let scenario = {
        scenario2Dlayers: {
          realtimeLayers: []
        }
      };

      Leaflet2DService.initRealtimeLayer(scenario);

      expect(Leaflet2DService.data.mapLayers).to.be.empty;
    });

    it('should build one realtime layer without cluster when no cluster defined in config', function () {
      let scenario = {
        scenario2Dlayers: {
          realtimeLayers: [{
            id: "realtime",
            title: "Realtime Layer",
            type: "realtime",
            isRealTime: true,
            refreshTime: 1000, // Milliseconds
            autoRefresh: true,
            isVisible: true,
            updateDuration: 400, // Milliseconds
            dataTableIcon: "icon-time"
          }]
        }
      };

      Leaflet2DService.initRealtimeLayer(scenario);

      let realtimeLayer = Leaflet2DService.data.mapLayers["realtime"];
      expect(realtimeLayer.displayName).to.equal("Realtime Layer");
      expect(realtimeLayer.isCluster).to.be.false;
    });

    it('should set default cluster according to config file', function () {
      let scenario = {
        scenario2Dlayers: {
          realtimeLayers: [{
            id: "realtime",
            title: "Realtime Layer",
            type: "realtime",
            isRealTime: true,
            refreshTime: 1000, // Milliseconds
            autoRefresh: true,
            isVisible: true,
            updateDuration: 400, // Milliseconds
            dataTableIcon: "icon-time",
            cluster: {
              defaultSize: 60
            }
          }]
        }
      };

      Leaflet2DService.initRealtimeLayer(scenario);

      let realtimeLayer = Leaflet2DService.data.mapLayers["realtime"];
      expect(realtimeLayer).to.not.be.undefined;
      expect(realtimeLayer.displayName).to.equal("Realtime Layer");
      expect(realtimeLayer.isCluster).to.be.true;
      expect(realtimeLayer.clusterSize).to.equal(60);
    });

  });

  describe('.launchLayerServices', function () {
    let clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      clock.restore();
      Leaflet2DService.data.timerServices.forEach(function (interval) {
        clearInterval(interval);
      });
      Leaflet2DService.data.timerServices.length = 0;
    });

    it('should launch realtime layer service when it is visible', function () {
      let output = "before";
      let deferred = $q.defer();

      let realtimeLayer = new MapLayer2DBuilder("realtime")
        .withIsRealtime(true)
        .withVisible(true)
        .withRefreshTime(100)
        .withInitializing(true)
        .withUpdateFunc(function () {
          output = "update";

          return deferred.promise;
        })
        .withProcessForDataTable(function(response, name) {
          return {
            header: [name],
            body: [response]
          };
        })
        .build();
      let layers = {
        "realtime": realtimeLayer
      };

      deferred.resolve(true);
      Leaflet2DService.launchLayerServices(layers);
      $rootScope.$apply();
      clock.tick(101);
      expect(output).to.equal("update");
      expect(Leaflet2DService.data.timerServices.length).to.equal(1);
    });

    it('should not launch realtime layer service when it is not visible', function () {
      let output = "before";
      let deferred = $q.defer();

      let realtimeLayer = new MapLayer2DBuilder("realtime")
        .withIsRealtime(true)
        .withVisible(false)
        .withRefreshTime(100)
        .withInitializing(true)
        .withUpdateFunc(function () {
          output = "update";
          return deferred.promise;
        })
        .withProcessForDataTable(function(response, name) {
          return {
            header: [name],
            body: [response]
          };
        })
        .build();
      let layers = {
        "realtime": realtimeLayer
      };

      Leaflet2DService.launchLayerServices(layers);
      clock.tick(101);
      expect(output).to.equal("before");
      expect(Leaflet2DService.data.timerServices.length).to.equal(1);
    });

    it('should launch feature layer service no matter if it is visible or not', function () {
      let output = "before";
      let deferred = $q.defer();
      let realtimeLayer = new MapLayer2DBuilder("realtime")
        .withIsRealtime(false)
        .withInitializing(true)
        .withUpdateFunc(function () {
          output = "update";
          return deferred.promise;
        })
        .withProcessForDataTable(function(response, name) {
          return {
            header: [name],
            body: [response]
          };
        })
        .build();
      let layers = {
        "realtime": realtimeLayer
      };

      deferred.resolve(true);
      Leaflet2DService.launchLayerServices(layers);
      $rootScope.$apply();

      expect(output).to.equal("update");
    });

  });

});
