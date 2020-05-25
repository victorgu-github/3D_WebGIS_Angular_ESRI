'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder) {
  const COLOR = {
    RED: [255, 0, 0, 1],
    BLUE:[0,0,255,1]
  };

  let PipelineLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, pipelineLayerUpdater, true);

    this.view = _view;
    this.flowNum = 0;
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, pipelineLayerUpdater, processForDataTable, processForMapView);
  };

  function pipelineLayerUpdater() {
    let staticQuery = esriLoader.require([
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ]).then(function (modules) {
      return featureLayerQuery(this, modules[1], modules[0]);
    }.bind(this));

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
      let queryURL = self.animationLayer.geometrySource;
      let qTask = new QueryTask({
        url: queryURL
      });
      let params = new Query({
        returnGeometry: true,
        outFields: ["*"],
        returnZ: true
      });
      params.where = "1=1";
    
      return qTask.execute(params).then(function (response) {
        self.featureLayerData = response.features;
        return self.featureLayerData;
      });
    }
  }

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

    // TODO: Generate dummy data for demo, remove after final release.
    if (!this.mapLayer.visible || (response.dynamicData.deviceInfos.length <= 0 && !AccountService.isLoRaDemo())) {
      if (this.animationLayer) {
        this.animationLayer.allGraphics = [];
      }
    } else {
      esriLoader.require([
        "esri/Graphic",
        "esri/symbols/LineSymbol3D",
        "esri/symbols/PathSymbol3DLayer",
        "esri/tasks/support/Query",
        "esri/tasks/QueryTask",
      ], function (Graphic, LineSymbol3D, PathSymbol3DLayer, Query, QueryTask) {
        //change switcher graphic symbol based on new value from nodeserver
        // let deviceConsumptions = new Map();
        // let consumptions = response.dynamicData.deviceInfos;
        //
        // consumptions.forEach(function (c) {
        //   deviceConsumptions.set(c.devEUI, c);
        // });

        if (this.animationLayer.allGraphics.length <= 0) {
          featureLayerQuery(this, QueryTask, Query).then(function (features) {
            features.forEach(feature => {
              let g = new Graphic();
              g.geometry = feature.geometry;
              g.attributes = feature.attributes;
              this.animationLayer.allGraphics.push(g);
            });

            updateAnimations(this.animationLayer, this.flowNum, LineSymbol3D, PathSymbol3DLayer, Graphic);
          }.bind(this));
        } else {
          updateAnimations(this.animationLayer, this.flowNum, LineSymbol3D, PathSymbol3DLayer, Graphic);
        }
        this.flowNum++;

      }.bind(this));
    }
  }

  function updateAnimations(animationLayer, flowNum, LineSymbol3D, PathSymbol3DLayer, Graphic) {
    let lineSymbol = new LineSymbol3D({
      symbolLayers: [new PathSymbol3DLayer({
        size: 3,  // 100,000 meters in height
        material: {color: COLOR.BLUE}
      })]
    });

    let newGraphics = [];
    let threshold = flowNum % 5;

    let graphicArray = animationLayer.allGraphics;
    for (let i = 0; i < graphicArray.length; i++) {
      if (i % 5 !== threshold) {
        let thisLineSymbol;
        if (lineSymbol) {
          thisLineSymbol = lineSymbol;
        }
        else {
          thisLineSymbol = new LineSymbol3D({
            symbolLayers: [new PathSymbol3DLayer({
              size: 3,  // 100,000 meters in height
              material: {color: COLOR.BLUE}
            })]
          });
        }

        let line = graphicArray[i].geometry;
        let g = new Graphic({
          geometry: line,
          symbol: thisLineSymbol
        });

        g.attributes = graphicArray[i].attributes;
        newGraphics.push(g);
      }
    }
    animationLayer.graphics = newGraphics;
  }

  // PipelineLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, PipelineLayer);

  return PipelineLayer;
};
