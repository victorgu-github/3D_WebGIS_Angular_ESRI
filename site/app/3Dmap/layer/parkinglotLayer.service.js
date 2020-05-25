'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder) {
  const COLOR = {
    SEMI_TRANSPARENT_RED: [255, 0, 0, 0.5],
    SEMI_TRANSPARENT_GRASS: [0, 128, 0, 0.5]
  };

  let ParkinglotLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, parkinglotLayerUpdater);

    this.view = _view;
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, parkinglotLayerUpdater, processForDataTable, processForMapView);
  };

  function processForDataTable(response) {
    let header = [];
    let body = [];

    if (response) {
      // TODO: ADD handling
    }

    return {
      "header": header,
      "body": body
    };
  }

  function processForMapView(response) {

    if (this.animationLayer) {
      this.animationLayer.visible = this.mapLayer.visible;
    }

    // clear animation graphics if 
    // 1. the correspondign feature layer is off
    // 2. no dynamic data from node server 
    if (!this.mapLayer.visible || (response.dynamicData.deviceInfos.length <= 0 && !AccountService.isLoRaDemo())) {
      if (this.animationLayer) {
        this.animationLayer.graphics = [];
      }
    } else {
      esriLoader.require([
        "esri/Graphic",
        "esri/symbols/PointSymbol3D",
        "esri/symbols/ObjectSymbol3DLayer",
        "esri/tasks/support/Query",
        "esri/tasks/QueryTask",
        "esri/symbols/SimpleFillSymbol"
      ], function (Graphic, PointSymbol3D, ObjectSymbol3DLayer, Query, QueryTask,SimpleFillSymbol) {
        let deviceData = new Map();
        let deviceInfos = response.dynamicData.deviceInfos;

        deviceInfos.forEach(c => {
          deviceData.set(c.devEUI, c);
        });

        if (this.animationLayer.graphics.length <= 0) {
          featureLayerQuery(this, QueryTask, Query).then(function (features) {
            features.forEach((feature) => {
              let g = new Graphic();
              g.geometry = feature.geometry;
              //reset z value to make sure animation graphic always below feature
              for (let i=0;i<g.geometry.rings[0].length;i++)
              {
                g.geometry.rings[0][i][2]= g.geometry.rings[0][i][2]-0.1;
              }
              g.attributes = feature.attributes;
              this.animationLayer.graphics.push(g);
            });

            updateAnimations(this.view.popup, this.animationLayer, deviceData,
              Graphic, SimpleFillSymbol);
          }.bind(this));
        } else {
          updateAnimations(this.view.popup, this.animationLayer, deviceData,
            Graphic, SimpleFillSymbol);
        }

      }.bind(this));
    }
  }

  function updateAnimations(popup, animationLayer, deviceData, Graphic, SimpleFillSymbol) {
    let newGraphics = [];

    animationLayer.graphics.items.forEach((item) => {
      let deviceInfo;
      if (deviceInfo || AccountService.isLoRaDemo()) {
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          let random = Math.random();
          deviceInfo = {
            parkinglot_id:item.attributes.parkinglot_id,
            occupied: random > 0.5
          };
        }
        let color = deviceInfo.occupied ? COLOR.SEMI_TRANSPARENT_RED : COLOR.SEMI_TRANSPARENT_GRASS;

        let g = new Graphic();
        g.geometry = item.geometry;
  
        g.attributes = item.attributes;
        g.symbol = new SimpleFillSymbol({
            color: color,
            outline: { // autocasts as new SimpleLineSymbol()
              color: color,
              width: 5
            }
        });

        // Update Popup detector value dynamically
        let parkinglotPopup = document.querySelector('#parkinglot-info');
        if (popup.visible && parkinglotPopup) {
          let occupation = document.querySelector('#occupation-value');
         // occupation.innerHTML = deviceInfo.occupied;
          updatePopup(occupation, g.attributes.parkinglot_id, deviceInfo);
        }
        newGraphics.push(g);
      }
    });
    animationLayer.graphics = newGraphics;
  }

  function updatePopup(occupation, parkinglot_id, deviceInfo) {
    let targetId = occupation.attributes['object-id'];
    if (occupation && targetId && targetId.value === '' + parkinglot_id) {
        occupation.innerHTML = deviceInfo.occupied;
    }
  }

  function parkinglotLayerUpdater() {
    let staticQuery = esriLoader.require([
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ]).then((modules) => {
      return featureLayerQuery(this, modules[1], modules[0]);
    });

    // This is to return something inside response so as to render animation.
    // Should be replaced with real dynamic requests after web api is done.
    let defer = $q.defer();
    defer.resolve({
      "deviceInfos": [{
        name: "pipe"
      }]
    });
    let dynamicQuery = defer.promise;

    return $q.all({staticData: staticQuery, dynamicData: dynamicQuery}).then(function (response) {
      return response;
    });
  }

  function featureLayerQuery(self, QueryTask, Query) {
    if (self.featureLayerData) {
      let defer = $q.defer();
      defer.resolve(self.featureLayerData);
      return defer.promise;
    } else {
      let qTask = new QueryTask({
        url: self.mapLayer.parsedUrl.path
      });
      let params = new Query({
        returnGeometry: true,
        returnZ: true,
        outFields: ["*"]
      });
      if (self.mapLayer.definitionExpression)
      {
        params.where = self.mapLayer.definitionExpression;
      }
      else
      {
        params.where = "1=1";
      }
      return qTask.execute(params).then(function (response) {
        self.featureLayerData = response.features;
        return self.featureLayerData;
      });
    }
  }

  // ParkinglotLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, ParkinglotLayer);

  return ParkinglotLayer;
};
