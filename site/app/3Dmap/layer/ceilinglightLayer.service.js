'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder, 3D_WebGIS_Angular_ESRI) {
  const COLOR = {
    SEMI_TRANSPARENT_RED: [255, 0, 0, 0.5],
    SEMI_TRANSPARENT_GRASS: [0, 128, 0, 0.5],
    LightHigh:[255, 147, 41,1],
    LightMedinum:[255, 197, 143,1],
    LightLow:[255, 214, 170,1],
    LightOff:[0,0,0,0]
  };
  // devEUI key name for ceiling light
  const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;

  let CeilinglightLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, ceilinglightLayerUpdater);

    this.view = _view;
    this.devEUIs = [];
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, ceilinglightLayerUpdater, processForDataTable, processForMapView);
  };

  function processForDataTable(response) {
    let header = [];
    let aliasHeader;
    let body = [];
    let staticHeader = [];
    let staticAliasHeader = [];
    let dynamicHeader = ['DYNAMIC_ATTR.CEILING_LIGHT.STATUS'];
    let dynamicData = response.dynamicData.deviceStatuses;

    if (response.staticData.features.length > 0) {
      for (let i = 0; i < response.staticData.fields.length; i++) {
        staticHeader.push(response.staticData.fields[i].name);
        staticAliasHeader.push(response.staticData.fields[i].alias);
      }
      response.staticData.features.forEach((staticData) => {
        let row = [];

        // Get feature layer static data
        staticHeader.forEach((header) => {
          let val = staticData.attributes[header];
          row.push(val);
        });

        let devEUI = staticData.attributes[DEV_EUI];
        let relay_number = staticData.attributes.relay_number;

        // Get dynamic data from node server
        let dynamicRow = [];
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          let status = "test";
          dynamicRow = dynamicRow.concat(status);
        } else {
            //update status based on deveui and relaynum
          for (let j = 0; j < dynamicData.length; j++) {
            if (dynamicData[j].devEUI === devEUI && dynamicData[j].relayStatuses.length>0) {
                for (let m = 0; m < dynamicData[j].relayStatuses.length; m++)
                {
                   if (dynamicData[j].relayStatuses[m].relayNum.toString() === relay_number)
                   {
                        dynamicRow.push(dynamicData[j].relayStatuses[m].status);
                        break;
                   }
                }
  
            }
          }
          if (dynamicRow.length <= 0) {
            dynamicRow = ["-"];
          }
        }

        row = row.concat(dynamicRow);

        body.push(row);
      });
    }

    header = staticHeader.concat(dynamicHeader);
    aliasHeader= staticAliasHeader.concat(dynamicHeader);
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

    // clear animation graphics if 
    // 1. the correspondign feature layer is off
    // 2. no dynamic data from node server 
    if (!this.mapLayer.visible || (response.dynamicData.deviceStatuses.length <= 0 && !AccountService.isLoRaDemo())) {
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
        "esri/symbols/PolygonSymbol3D",
        "esri/symbols/FillSymbol3DLayer"
      ], function (Graphic, PointSymbol3D, ObjectSymbol3DLayer, Query, QueryTask, PolygonSymbol3D, FillSymbol3DLayer) {
        let deviceData = new Map();
        let deviceStatuses = response.dynamicData.deviceStatuses;
        //for every ceiling light, get status based on deveui and relaynum
        deviceStatuses.forEach(c => {
          for (let i = 0; i < this.featureLayerData.features.length; i++) {
            if (this.featureLayerData.features[i].attributes[DEV_EUI] === c.devEUI) {
              for (let j = 0; j < c.relayStatuses.length; j++) {
                if (c.relayStatuses[j].relayNum.toString() === this.featureLayerData.features[i].attributes.relay_number) {
                  deviceData.set(this.featureLayerData.features[i].attributes.ceilinglight_id, c.relayStatuses[j].status);
                }
              }
            }
          }
        });

        if (this.animationLayer.graphics.length <= 0) {
            queryRelateGeometryForAnimation(this, QueryTask, Query).then(function (features) {
            features.forEach((feature) => {
              let g = new Graphic();
              g.geometry = feature.geometry;
              g.attributes = feature.attributes;
              this.animationLayer.graphics.push(g);
            });

            updateAnimations(this.view.popup, this.animationLayer, deviceData,
              Graphic, PolygonSymbol3D, FillSymbol3DLayer);
          }.bind(this));
        } else {
          updateAnimations(this.view.popup, this.animationLayer, deviceData,
            Graphic, PolygonSymbol3D, FillSymbol3DLayer);
        }

      }.bind(this));
    }
  }

  function updateAnimations(popup, animationLayer, deviceData, Graphic, PolygonSymbol3D, FillSymbol3DLayer) {
    let newGraphics = [];

    animationLayer.graphics.items.forEach((item) => {
       let ceilinglight_id = item.attributes.ceilinglight_id;
       let deviceInfo ={};
       deviceInfo.ceilinglightID=ceilinglight_id;
       deviceInfo.status= deviceData.get(ceilinglight_id);

      if (deviceInfo || AccountService.isLoRaDemo()) {
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          let random = Math.floor(Math.random() * 2);//0-1 random inter
          deviceInfo = {
            ceilinglightID:item.attributes.ceilinglight_id,
            status: random===1?"On":"Off"
          };
        }
        let color = COLOR.LightOff;
        if (deviceInfo.status==="On")
        {
            color = COLOR.LightHigh;
        }
        else if (deviceInfo.status==="Waiting")
        {
            color = COLOR.LightLow;
        }
        let g = new Graphic();
        g.geometry = item.geometry;
        g.attributes = item.attributes;

         g.symbol=  new PolygonSymbol3D({
          symbolLayers: [new FillSymbol3DLayer({
            material: { color: [227, 139, 79, 0] },
            outline: { // autocasts as new SimpleLineSymbol()
              color: color,
               size: "10px"
            }
          })]
        }); 

        // Update Popup detector value dynamically
        let ceilinglightPopup = document.querySelector('#ceilinglight-info');
        if (popup.visible && ceilinglightPopup) {
          let status = document.querySelector('#status-value');
          updatePopup(status, g.attributes.ceilinglight_id, deviceInfo);
        }
        newGraphics.push(g);
      }
    });
    animationLayer.graphics = newGraphics;
  }

  function updatePopup(status, ceilinglight_id, deviceInfo) {
    let targetId = status.attributes['object-id'];
    if (status && targetId && targetId.value === '' + ceilinglight_id) {
        status.innerHTML = deviceInfo.status;
    }
  }

  function ceilinglightLayerUpdater() {
    let staticQuery = esriLoader.require([
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ]).then((modules) => {
      return featureLayerQuery(this, modules[1], modules[0]);
    });

    // This is to return something inside response so as to render animation.
    // Should be replaced with real dynamic requests after web api is done.
    let defer = $q.defer();
    defer.resolve({"deviceStatuses": []});

    let dynamicQuery = defer.promise;

    // Only send request when there are devEUIs, for performance.
    if (this.devEUIs.length > 0) {
      let longDevEUI = this.devEUIs.join(",");
      dynamicQuery = dataFactory.getLORAdeviceStatus("ceilinglight", longDevEUI).then((response) => {
        return response.status === "success" ? response.content : {"deviceStatuses": []};
      });
    }

    return $q.all({staticData: staticQuery, dynamicData: dynamicQuery}).then(function (response) {
      return response;
    });
  }

  function featureLayerQuery(self, QueryTask, Query) {
    if (self.featureLayerData ) {
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
      if (self.mapLayer.definitionExpression) {
        params.where = self.mapLayer.definitionExpression;
      }
      else {
        params.where = "1=1";
      }
      return qTask.execute(params).then(function (response) {
        self.featureLayerData = response;
        self.featureLayerData.features.forEach(feature => {
          let devEUI = feature.attributes[DEV_EUI];
          if (devEUI) {
            self.devEUIs.push(devEUI);
          }
        });
        return self.featureLayerData;
      });
    }
  }

  function queryRelateGeometryForAnimation(self, QueryTask, Query) {

    let qTask = new QueryTask({
      url: self.animationLayer.geometrySource
    });
    let params = new Query({
      returnGeometry: true,
      returnZ: true,
      outFields: ["*"]
    });
    if (self.mapLayer.definitionExpression) {
      params.where = self.mapLayer.definitionExpression;
    }
    else {
      params.where = "1=1";
    }
    return qTask.execute(params).then(function (response) {
      return response.features;
    });

  }

  // CeilinglightLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, CeilinglightLayer);

  return CeilinglightLayer;
};
