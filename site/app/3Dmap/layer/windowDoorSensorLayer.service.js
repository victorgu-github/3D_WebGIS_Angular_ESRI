'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder,3D_WebGIS_Angular_ESRI) {
  const COLOR = {
    SEMI_TRANSPARENT_RED: [255, 0, 0, 0.5],
    SEMI_TRANSPARENT_GRASS: [0, 128, 0, 0.5]
  };
  const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;
  let WindowDoorSensorLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, windowDoorSensorLayerUpdater);

    this.view = _view;
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, windowDoorSensorLayerUpdater, processForDataTable, processForMapView);
  };

  function processForDataTable(response) {
    let header = [];
    let aliasHeader;
    let body = [];
    let staticHeader = [];
    let staticAliasHeader = [];
    let dynamicHeader = ['DYNAMIC_ATTR.WINDOOR_SENSOR.STATUS'];
    let dynamicData = response.dynamicData.deviceInfos;

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

        // Get dynamic data from node server
        let dynamicRow = [];
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          let status = Math.random() * 10 > 5 ? "On" : "Alarm";
          dynamicRow = dynamicRow.concat(status);
        } else {
          for (let j = 0; j < dynamicData.length; j++) {
            if (dynamicData[j].devEUI === devEUI) {
              dynamicRow.push(dynamicData[j].status);
              dynamicData.splice(j, 1);
              break;
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
              let rings = [feature.geometry.paths[0][0],feature.geometry.paths[0][1]];
              let p3 = [feature.geometry.paths[0][1][0],feature.geometry.paths[0][1][1],feature.geometry.paths[0][1][2]+feature.attributes.height];
              rings.push(p3);
              let p4 =  [feature.geometry.paths[0][0][0],feature.geometry.paths[0][0][1],feature.geometry.paths[0][0][2]+feature.attributes.height];
              rings.push(p4);
              rings.push([feature.geometry.paths[0][0][0],feature.geometry.paths[0][0][1],feature.geometry.paths[0][0][2]]);
              let polygon = {
                type: "polygon", // autocasts as new Polygon()
                rings: rings
              };
              g.geometry = polygon;
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
            status: random > 0.5? "On" : "Alarm"
          };
        }
        let color = deviceInfo.status === "Alarm" ? COLOR.SEMI_TRANSPARENT_RED : COLOR.SEMI_TRANSPARENT_GRASS;

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
        let parkinglotPopup = document.querySelector('#winDoor-info');
        if (popup.visible && parkinglotPopup) {
          let status = document.querySelector('#status-value');
         // occupation.innerHTML = deviceInfo.occupied;
          updatePopup(status, g.attributes.objectid, deviceInfo);
        }
        newGraphics.push(g);
      }
    });
    animationLayer.graphics = newGraphics;
  }

  function updatePopup(status, objectid, deviceInfo) {
    let targetId = status.attributes['object-id'];
    if (status && targetId && targetId.value === '' + objectid) {
      status.innerHTML = deviceInfo.status;
    }
  }

  function windowDoorSensorLayerUpdater() {
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

  // WindowDoorSensorLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, WindowDoorSensorLayer);

  return WindowDoorSensorLayer;
};
