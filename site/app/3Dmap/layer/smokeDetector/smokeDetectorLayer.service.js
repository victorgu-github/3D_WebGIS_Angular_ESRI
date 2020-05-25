'use strict';

module.exports = function ($q, $translate, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder,
                           PercentageArea, 3D_WebGIS_Angular_ESRI) {
  // devEUI key name for smoke detector
  const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;

  let SmokeDetectorLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, smokeDetectorLayerUpdater);

    this.view = _view;
    this.devEUIs = [];
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, smokeDetectorLayerUpdater, processForDataTable, processForMapView);
  };

  function smokeDetectorLayerUpdater() {
    let staticQuery = esriLoader.require([
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ]).then(function (modules) {

      return featureLayerQuery(this, modules[1], modules[0]);
    }.bind(this));

    let defer = $q.defer();
    defer.resolve({"deviceInfos": []});

    let dynamicQuery = defer.promise;

    // Only send request when there are devEUIs, for performance.
    if (this.devEUIs.length > 0) {
      let longDevEUI = this.devEUIs.join(",");
      dynamicQuery = dataFactory.getLoRaDeviceLatestUsage("smokedetector", longDevEUI).then((response) => {
        return response.status === "success" ? response.content : {"deviceInfos": []};
      });
    }

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

  function processForDataTable(response) {
    let header;
    let aliasHeader;
    let body = [];
    let staticHeader = [];
    let staticAliasHeader=[];
    let dynamicHeader = ['DYNAMIC_ATTR.SMOKE_DETECTOR.BATTERY_LEVEL', 'DYNAMIC_ATTR.SMOKE_DETECTOR.FLAG'];
    let dynamicData = response.dynamicData.deviceInfos;

    if (response.staticData.features.length > 0) {
      for (let i = 0; i < response.staticData.fields.length; i++) {
        staticHeader.push(response.staticData.fields[i].name);
        staticAliasHeader.push(response.staticData.fields[i].alias);
      }
      for (let i = 0; i < response.staticData.features.length; i++) {
        let row = [];

        // Get feature layer static data
        for (let j = 0; j < staticHeader.length; j++) {
          let val = response.staticData.features[i].attributes[staticHeader[j]];
          row.push(val);
        }

        let devEUI = response.staticData.features[i].attributes[DEV_EUI];

        // Get dynamic data from node server
        let dynamicRow = [];
        // TODO: Generate dummy data for demo, remove after final release.
        if (AccountService.isLoRaDemo()) {
          let battLevel = (Math.random() * 100 + 1) % 100;
          let packetFlag = Math.random() * 10 > 5 ? "KeepAlive" : "Alarm";
          dynamicRow = dynamicRow.concat(battLevel, packetFlag);
        } else {
          for (let j = 0; j < dynamicData.length; j++) {
            if (dynamicData[j].devEUI === devEUI) {
              dynamicRow.push(dynamicData[j].battLevel || "n/a");
              dynamicRow.push(dynamicData[j].packetFlag || "n/a");
              dynamicData.splice(j, 1);
              break;
            }
          }
          if (dynamicRow.length <= 0) {
            dynamicRow = ["-", "-"];
          }
        }

        row = row.concat(dynamicRow);

        body.push(row);
      }
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
        "esri/tasks/support/Query",
        "esri/tasks/QueryTask",
      ], function (Graphic, Query, QueryTask) {
        //change smoke graphic symbol based on new value from nodeserver
        let deviceData = new Map();
        let consumptions = response.dynamicData.deviceInfos;

        consumptions.forEach(consumption => {
          deviceData.set(consumption.devEUI, consumption);
        });

        if (this.animationLayer.graphics.length <= 0) {
          //create graphics in smoke detector layer
          featureLayerQuery(this, QueryTask, Query).then(function (response) {
            let features = response.features;
            for (let i = 0; i < features.length; i++) {
              let g = new Graphic();
              g.geometry = features[i].geometry;
              g.attributes = features[i].attributes;
              this.animationLayer.graphics.push(g);
            }

            updateAnimations(this.animationLayer, deviceData, Graphic);
          }.bind(this));
        } else {
          updateAnimations(this.animationLayer, deviceData, Graphic);
        }

      }.bind(this));
    }
  }

  function updateAnimations(animationLayer, deviceData, Graphic) {
    let newGraphics = [];
    for (let i = 0; i < animationLayer.graphics.length; i++) {
      let item = animationLayer.graphics.items[i];
      let devEUI = item.attributes[DEV_EUI];
      let deviceInfo = deviceData.get(devEUI);

      if (!deviceInfo) {
        // TODO: Generate dummy data for demo, remove after final release.
        if (!AccountService.isLoRaDemo()) {
          continue;
        } else {
          deviceInfo = {
            battLevel: (Math.random() * 100 + 1) % 100,
            packetFlag: Math.random() * 10 > 5 ? "KeepAlive" : "Alarm"
          };
        }
      }

      let g = new Graphic();
      g.geometry = item.geometry;
      g.attributes = item.attributes;
      g.attributes.status = deviceInfo.packetFlag === "Alarm" ? 1 : 0;
      newGraphics.push(g);
    }
    animationLayer.graphics = newGraphics;
  }

  // SmokeDetectorLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, SmokeDetectorLayer);

  SmokeDetectorLayer.buildHistoryChart = function(container, title, devEUI) {
    let yAxis =  [{
      name: $translate.instant('DYNAMIC_ATTR.SMOKE_DETECTOR.BATTERY_LEVEL'),
      data: []
    }];
    let timestamps = [];

    let setWarningColor = function (series) {
      // To set warning color when battery level is too low
      if (series.data.length > 0) {
        let currentLvl = series.data[series.data.length - 1];
        if (currentLvl >= 40) {
          series.color = '#1fff2d';
        } else if (currentLvl >= 20) {
          series.color = '#f9ff3d';
        } else {
          series.color = '#ff0002';
        }
      }
    };

    // TODO: Generate dummy data for demo, remove after final release.
    if (AccountService.isLoRaDemo()) {
      let batteryLevels = [];

      let now = new Date();
      for (let i = 0; i < 10; i++) {
        batteryLevels.push(parseInt((Math.random() * 100).toFixed(2)));
        let date = new Date(now.getTime() - 3600 * 1000 * 3* i);
        let hour = ("0" + date.getHours()).slice(-2);
        let minute = ("0" + date.getMinutes()).slice(-2);
        timestamps.push(hour + ":" + minute);
      }

      yAxis[0].data = batteryLevels;

      setWarningColor(yAxis[0]);

      let chart = new PercentageArea(container, title, yAxis, timestamps);

      chart.draw();
    } else {
      const duration = 60 * 6; // last 6 hours data
      dataFactory.getLoRaDeviceRecentUsage('smokedetector', devEUI, duration, 3D_WebGIS_Angular_ESRI.SCATTER_MODE).then(function (response) {
        if (response.status === "success") {
          response.content.deviceInfos = response.content.deviceInfos.reverse();
          let batteryLevels = [];

          response.content.deviceInfos.map(deviceInfo => {
            batteryLevels.push(deviceInfo.battLevel);
            let date = new Date(deviceInfo.timestamp);
            let hour = ("0" + date.getHours()).slice(-2);
            let minute = ("0" + date.getMinutes()).slice(-2);
            timestamps.push(hour + ":" + minute);
          });

          yAxis[0].data = batteryLevels;

          setWarningColor(yAxis[0]);

        } else {
          window.alert("An error occurred when loading data, try close and reopen chart.");
        }
      }).then(function () {
        let chart = new PercentageArea(container, title, yAxis, timestamps);

        chart.draw();
      });
    }

  };

  return SmokeDetectorLayer;
};
