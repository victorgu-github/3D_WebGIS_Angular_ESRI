'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder, 3D_WebGIS_Angular_ESRI) {
  const MAX_PEOPLE = 100;
  const COLOR = {
    SEMI_TRANSPARENT_RED: [255, 0, 0, 0.5],
    SEMI_TRANSPARENT_GRASS: [0, 128, 0, 0.5]
  };
  // devEUI key name for body sensor/detector
  const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;

  let DetectorLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, detectorLayerUpdater);

    this.view = _view;
    this.devEUIs = [];
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, detectorLayerUpdater, processForDataTable, processForMapView);
  };

  function processForDataTable(response) {
    let header = [];
    let aliasHeader;
    let body = [];
    let staticHeader = [];
    let staticAliasHeader = [];
    let dynamicHeader = ['DYNAMIC_ATTR.DETECTOR.IS_PEOPLE_NEARBY', 'DYNAMIC_ATTR.DETECTOR.HUMIDITY', 'DYNAMIC_ATTR.DETECTOR.TEMPERATURE'];
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
          let humidity = Math.random() * 15 + 12;
          let temperature = Math.random() * 10 + 15;
          let isPeopleNearBy = Math.random() * 500 + 5;
          dynamicRow = dynamicRow.concat(isPeopleNearBy, humidity, temperature);
        } else {
          for (let j = 0; j < dynamicData.length; j++) {
            if (dynamicData[j].devEUI === devEUI) {
              dynamicRow.push(dynamicData[j].bodyCount);
              dynamicRow.push(dynamicData[j].humidity);
              dynamicRow.push(dynamicData[j].temperature);
              dynamicData.splice(j, 1);
              break;
            }
          }
          if (dynamicRow.length <= 0) {
            dynamicRow = ["-", "-", "-"];
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

    // TODO: Generate dummy data for demo, remove after final release.
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
      ], function (Graphic, PointSymbol3D, ObjectSymbol3DLayer, Query, QueryTask) {
        let deviceData = new Map();
        let deviceInfos = response.dynamicData.deviceInfos;

        deviceInfos.forEach(c => {
          deviceData.set(c.devEUI, c);
        });

        if (this.animationLayer.graphics.length <= 0) {
          featureLayerQuery(this, QueryTask, Query).then(function (response) {
            let features = response.features;
            features.forEach((feature) => {
              let g = new Graphic();
              g.geometry = feature.geometry;
              g.geometry.z = g.geometry.z - 1.5;
              g.attributes = feature.attributes;
              this.animationLayer.graphics.push(g);
            });

            updateAnimations(this.view.popup, this.animationLayer, deviceData,
              Graphic, PointSymbol3D, ObjectSymbol3DLayer);
          }.bind(this));
        } else {
          updateAnimations(this.view.popup, this.animationLayer, deviceData,
            Graphic, PointSymbol3D, ObjectSymbol3DLayer);
        }

      }.bind(this));
    }
  }

  function updateAnimations(popup, animationLayer, deviceData, Graphic, PointSymbol3D, ObjectSymbol3DLayer) {
    let newGraphics = [];

    animationLayer.graphics.items.forEach((item) => {
      let devEUI = item.attributes[DEV_EUI];
      let deviceInfo = deviceData.get(devEUI);

      if (deviceInfo || AccountService.isLoRaDemo()) {
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          deviceInfo = {
            humidity: Math.random() * 15 + 12,
            temperature: Math.random() * 10 + 15,
            bodyCount: Math.random() * 500 + 5
          };
        }
        let height = deviceInfo.bodyCount!=null?deviceInfo.bodyCount/MAX_PEOPLE*5:0;
        height = height>5?5:height;
        //let isPeopleNearby = deviceInfo.bodyCount > 0;
        //let color = isPeopleNearby ? COLOR.SEMI_TRANSPARENT_RED : COLOR.SEMI_TRANSPARENT_GRASS;
        let color = height>3 ? COLOR.SEMI_TRANSPARENT_RED : COLOR.SEMI_TRANSPARENT_GRASS;
        let g = new Graphic();
        g.geometry = item.geometry;
        g.attributes = item.attributes;
        // g.symbol = new PointSymbol3D({
        //   symbolLayers: [new ObjectSymbol3DLayer({
        //     width: 0.4,
        //     height: 0.4,
        //     material: {
        //       color: color
        //     }
        //   })]
        // });
        g.symbol = new PointSymbol3D({
          symbolLayers: [new ObjectSymbol3DLayer({
            width: 5,
            height: height,
            resource: {
              primitive: "cone"
            },
            material: {
              color: color
            }
          })]
        });

        // Update Popup detector value dynamically
        let detectorPopup = document.querySelector('#detector-info');
        if (popup.visible && detectorPopup) {
          let humidity = document.querySelector('#humidity-value');
          let temperature = document.querySelector('#temperature-value');
          let count = document.querySelector('#count-value');
          updatePopup(humidity, temperature,count, g.attributes.objectid, deviceInfo);
        }
        newGraphics.push(g);
      }
    });
    animationLayer.graphics = newGraphics;
  }

  function updatePopup(humidity, temperature, count,detectorID, deviceInfo) {
    let targetId = humidity.attributes['object-id'];
    if (humidity && targetId && targetId.value === '' + detectorID) {
      humidity.innerHTML = deviceInfo.humidity + '%';
    }
    if (temperature && targetId && targetId.value === '' + detectorID) {
      temperature.innerHTML = deviceInfo.temperature + '°C';
    }
    if (count && targetId && targetId.value === '' + detectorID) {
      count.innerHTML = deviceInfo.bodyCount;
    }
  }

  function detectorLayerUpdater() {
    let staticQuery = esriLoader.require([
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ]).then((modules) => {
      return featureLayerQuery(this, modules[1], modules[0]);
    });

    // TODO: Generate dummy data for demo, remove after final release.
    let defer = $q.defer();
    defer.resolve({"deviceInfos": []});

    let dynamicQuery = defer.promise;
    let countQuery = defer.promise;
    // Only send request when there are devEUIs, for performance.
    if (this.devEUIs.length > 0) {
      let longDevEUI = this.devEUIs.join(",");
      dynamicQuery = dataFactory.getLoRaDeviceLatestUsage("bodysensor", longDevEUI).then((response) => {
        return response.status === "success" ? response.content : {"deviceInfos": []};
      });
      countQuery = dataFactory.getLoRaDeviceAggregatedData("bodysensor", longDevEUI).then((response) => {
        return response.status === "success" ? response.content : {"deviceInfos": []};
      });
    }

    return $q.all({staticData: staticQuery, dynamicData: dynamicQuery, aggregratedCout:countQuery}).then(function (response) {
      // Add count into dynamic status into feature layer object
      for (let i=0; i< response.dynamicData.deviceInfos.length;i++)
      {
        for (let j=0;j<response.aggregratedCout.aggregatedData.length;j++)
        {
           if (response.dynamicData.deviceInfos[i].devEUI === response.aggregratedCout.aggregatedData[j].devEUI )
           {
            response.dynamicData.deviceInfos[i].bodyCount = response.aggregratedCout.aggregatedData[j].bodyCount;
            break;
           }
        }
      }
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

  // PlugBaseLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, DetectorLayer);

  return DetectorLayer;
};
