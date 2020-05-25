'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder) {
  const COLOR = {
    SEMI_TRANSPARENT_RED: [255, 0, 0, 0.5],
    SEMI_TRANSPARENT_GRASS: [0, 128, 0, 0.5]
  };
  //const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;
  let IndoorSegmentLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, indoorSegmentLayerUpdater);

    this.view = _view;
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, indoorSegmentLayerUpdater, processForDataTable, processForMapView);
  };

  function processForDataTable(response) {
    let header = [];
    let aliasHeader=[];
    let body = [];

    if (response) {
      // TODO: ADD handling
    }
    
    return {
      "header": header,
      "aliasHeader": aliasHeader,
      "body": body
    };
  }

  function processForMapView(response) {

    if (this.animationLayer) {
      this.animationLayer.visible = this.mapLayer.visible;
    }
    else //test a new animation way 
    {
      updateLayerRenderer(this.mapLayer);
      return;
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
          featureLayerQuery(this, QueryTask, Query).then(function (response) {
            // convert polyline to polygon 
            response.features.forEach((feature) => {
              let g = new Graphic();
              g.geometry = feature.geometry;
              //reset z value to make sure animation graphic always below feature
              // for (let i=0;i<g.geometry.rings[0].length;i++)
              // {
              //   g.geometry.rings[0][i][2]= g.geometry.rings[0][i][2]-0.1;
              // }
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
 //a new way to show animation. don't use graphic layer but feature layer render. 
 // can apply to scenelayer render as well
  function updateLayerRenderer(layer){
    let renderer = {
      type: "unique-value",  // autocasts as new UniqueValueRenderer()
      field: categorizeByObjectID,  // values returned by this function will
                         // be used to render features by type
      uniqueValueInfos: [
        {
          value: "low",  
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: [0, 128, 0, 0.7]
          }  // will be assigned sym1
        }, {
          value: "high",  
          symbol:  {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: [255, 0, 0, 0.7]
          }  // will be assigned sym2
        }
      ]
    };
    //layer would not be render, if no change in uniqueValueInfos (only change group would not work)
    //test
    if (layer.renderer&&layer.renderer.uniqueValueInfos)
    {
      if (layer.renderer.uniqueValueInfos[0].symbol.color.a>0)
      {
        renderer.uniqueValueInfos[0].symbol.color[3]=layer.renderer.uniqueValueInfos[0].symbol.color.a-0.1;
        renderer.uniqueValueInfos[1].symbol.color[3]=layer.renderer.uniqueValueInfos[1].symbol.color.a-0.1;
      }
      else
      {
        layer.renderer.uniqueValueInfos[0].symbol.color[3] = 1;
        layer.renderer.uniqueValueInfos[1].symbol.color[3] = 1;
      }
      layer.renderer = renderer;
    }
    else
    {
      layer.renderer = renderer;
    }

    

  }

  function categorizeByObjectID(feature){
    // a number field representing total population
    if (feature) 
    {
       // TODO: regroup based on dynamic values
    }
    //let objectid = feature.attributes.objectid;
    // var used to classify features by population
    let type;
  
    if (Math.random() < 0.5){
      type = "low";
    } else {
      type = "high";
    }
  
    return type;
  }

  function updateAnimations(popup, animationLayer, deviceData, Graphic, SimpleFillSymbol) {
    let newGraphics = [];

    animationLayer.graphics.items.forEach((item) => {
      let deviceInfo;
      if (deviceInfo || AccountService.isLoRaDemo()) {
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          deviceInfo = {
            bodyCount: Math.random() * 500 + 5
          };
        }
        let color = deviceInfo.bodyCount >250 ? COLOR.SEMI_TRANSPARENT_RED : COLOR.SEMI_TRANSPARENT_GRASS;

        let g = new Graphic();
        g.geometry = item.geometry;
  
        g.attributes = item.attributes;
        g.symbol = new SimpleFillSymbol({
            color: color,
            outline: { // autocasts as new SimpleLineSymbol()
              color: color,
              width: 10 //filled style is not supported in 3d. increase width to mimic
            }
        });

        // Update Popup detector value dynamically
        let indoorSegPopup = document.querySelector('#indoorSeg-info');
        if (popup.visible && indoorSegPopup) {
          let bodyCount = document.querySelector('#bodyCount-value');
         // occupation.innerHTML = deviceInfo.occupied;
          updatePopup(bodyCount, g.attributes.objectid, deviceInfo);
        }
        newGraphics.push(g);
      }
    });
    animationLayer.graphics = newGraphics;
  }

  function updatePopup(bodyCount, objectid, deviceInfo) {
    let targetId = bodyCount.attributes['object-id'];
    if (bodyCount && targetId && targetId.value === '' + objectid) {
      bodyCount.innerHTML = deviceInfo.bodyCount;
    }
  }

  function indoorSegmentLayerUpdater() {
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
        self.featureLayerData = response;
        return self.featureLayerData;
      });
    }
  }

  // IndoorSegmentLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, IndoorSegmentLayer);

  return IndoorSegmentLayer;
};
