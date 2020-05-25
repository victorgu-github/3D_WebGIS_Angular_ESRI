'use strict';

module.exports = function ($q, $window, $translate, MapLayer3D, esriLoader, dataFactory, AccountService,
                           MapLayer3DBuilder, MultiAxis, 3D_WebGIS_Angular_ESRI) {
  const MAX_POWER = 1500;
  const COLOR = {
    RED: [255, 0, 0, 1],
    ORANGE: [255, 165, 0, 1],
    YELLOW: [255, 255, 0, 1],
    GREEN: [0, 255, 0, 1]
  };
  // devEUI key name for all types of plug
  const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;

  let PlugBaseLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _deviceType, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, plugBaseLayerUpdater);

    this.view = _view;
    this.devEUIs = [];
    this.deviceType = _deviceType;
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, plugBaseLayerUpdater, processForDataTable, processForMapView);
  };

  function plugBaseLayerUpdater() {
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
      dynamicQuery = dataFactory.getLoRaDeviceLatestUsage(this.deviceType, longDevEUI).then((response) => {
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
    let staticAliasHeader = [];
    let dynamicHeader = ['DYNAMIC_ATTR.PLUGBASE.VOLTAGE', 'DYNAMIC_ATTR.PLUGBASE.CURRENT', 'DYNAMIC_ATTR.PLUGBASE.POWER'];
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
          let voltage = Math.random() * (110 - 1) + 1;
          let current = Math.random() * 12;
          let power = Math.random() * 1500;
          dynamicRow = dynamicRow.concat(voltage, current, power);
        } else {
          for (let j = 0; j < dynamicData.length; j++) {
            if (dynamicData[j].devEUI === devEUI) {
              dynamicRow.push(dynamicData[j].voltage || "-");
              dynamicRow.push(dynamicData[j].current || "-");
              dynamicRow.push(dynamicData[j].power || "-");
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
      }
    }

    header = staticHeader.concat(dynamicHeader);
    aliasHeader= staticAliasHeader.concat(dynamicHeader);
    return {
      "header": header,
      "aliasHeader":aliasHeader,
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
        //change switcher graphic symbol based on new value from nodeserver
        let deviceConsumptions = new Map();
        let consumptions = response.dynamicData.deviceInfos;

        consumptions.forEach(function (c) {
          deviceConsumptions.set(c.devEUI, c);
        });

        if (this.animationLayer.graphics.length <= 0) {
          //create graphics in switcherPowerlayer
          featureLayerQuery(this, QueryTask, Query).then(function (response) {
            let features = response.features;
            for (let i = 0; i < features.length; i++) {
              let g = new Graphic();
              g.geometry = features[i].geometry;
              g.attributes = features[i].attributes;
              this.animationLayer.graphics.push(g);
            }

            updateAnimations(this.animationLayer, this.view, deviceConsumptions, this.id, Graphic, PointSymbol3D, ObjectSymbol3DLayer);
          }.bind(this));
        } else {
          updateAnimations(this.animationLayer, this.view, deviceConsumptions, this.id, Graphic, PointSymbol3D, ObjectSymbol3DLayer);
        }

      }.bind(this));
    }
  }

  function updateAnimations(animationLayer, view, deviceConsumptions, id, Graphic, PointSymbol3D, ObjectSymbol3DLayer) {
    let newGraphics = [];
    for (let i = 0; i < animationLayer.graphics.length; i++) {
      let item = animationLayer.graphics.items[i];
      let value = 0;

      let energyConsumption = deviceConsumptions.get(item.attributes[DEV_EUI]);
      if (!energyConsumption) {
        // TODO: Generate dummy data for demo, remove after final release.
        if (!AccountService.isLoRaDemo()) {
          continue;
        } else {
          energyConsumption = {
            power: Math.random() * 1500
          };
        }
      }

      value = energyConsumption.power / MAX_POWER;

      let color;
      if (value < 0.3) {
        color = COLOR.GREEN;
      } else if (value < 0.5) {
        color = COLOR.YELLOW;
      } else if (value < 0.8) {
        color = COLOR.ORANGE;
      } else {
        color = COLOR.RED;
      }
      let g = new Graphic();
      let height = value > 1 ? 1 : value;
      g.geometry = item.geometry;
      g.attributes = item.attributes;
      g.symbol = new PointSymbol3D({
        symbolLayers: [new ObjectSymbol3DLayer({
          width: 0.49,
          height: height,
          resource: {
            primitive: "cylinder"
          },
          material: {
            color: color
          }
        })]
      });

      // Update Popup energy consumption value dynamically
      let energyPopup = document.querySelector('#energy-consumption');
      if (view.popup.visible && energyPopup &&
        energyPopup.getAttribute('device-type') === PlugBaseLayer.getDeviceType(id)) {
        updateEnergyConsumption(energyPopup, g.attributes.objectid, energyConsumption.power);
      }
      newGraphics.push(g);
    }
    animationLayer.graphics = newGraphics;
  }

  // Dynamically Update Popup
  function updateEnergyConsumption(energyPopup, objectId, value) {
    let targetId = energyPopup.attributes['object-id'];
    if (energyPopup && targetId && targetId.value === '' + objectId) {
      if (value) {
        energyPopup.innerHTML = value + 'W';
      } else {
        energyPopup.innerHTML = '-';
      }
    }
  }

  // PlugBaseLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, PlugBaseLayer);

  const DEVICE_TYPES = {
    [3D_WebGIS_Angular_ESRI.BUILTIN_PLUG]: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG_TYPE,
    [3D_WebGIS_Angular_ESRI.PLUG_BASE_CN]: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN_TYPE,
    [3D_WebGIS_Angular_ESRI.PLUG_BASE]: 3D_WebGIS_Angular_ESRI.PLUG_BASE_TYPE
  };

  PlugBaseLayer.getDeviceType = function (deviceName) {
    return DEVICE_TYPES[deviceName] || 3D_WebGIS_Angular_ESRI.PLUG_BASE_TYPE;
  };

  PlugBaseLayer.isBelongToLayer = function (name) {
    return DEVICE_TYPES[name] !== undefined;
  };

  PlugBaseLayer.buildHistoryChart = function (container, title, devEUI, deviceType) {
    let yAxis = [{
      title: $translate.instant('DYNAMIC_ATTR.PLUGBASE.VOLTAGE'),
      suffix: " V",
      format: "{value}V",
      isOpposite: true,
      data: []
    }, {
      title: $translate.instant('DYNAMIC_ATTR.PLUGBASE.CURRENT'),
      suffix: " A",
      format: "{value}A",
      gridLineWidth: 0,
      isOpposite: true,
      data: []
    }, {
      title: $translate.instant('DYNAMIC_ATTR.PLUGBASE.POWER'),
      suffix: " W",
      format: "{value}W",
      gridLineWidth: 0,
      isOpposite: false,
      data: []
    }];
    let timestamps = [];
    let legend = {
      x: 0,
      y: -18
    };

    // TODO: Generate dummy data for demo, remove after final release.
    if (AccountService.isLoRaDemo()) {
      let voltageData = [];
      let currentData = [];
      let powerData = [];

      let now = new Date();
      for (let i = 0; i < 60; i++) {
        voltageData.push(Math.random() * 110);
        currentData.push(Math.random() * 10);
        powerData.push(Math.random() * 1500);
        let date = new Date(now.getTime() - 60 * 1000 * i);
        let hour = ("0" + date.getHours()).slice(-2);
        let minute = ("0" + date.getMinutes()).slice(-2);
        timestamps.push(hour + ":" + minute);
      }

      yAxis[0].data = voltageData;
      yAxis[1].data = currentData;
      yAxis[2].data = powerData;

      let chart = new MultiAxis(container, title, yAxis, timestamps, legend);

      chart.draw();
    } else {
      const duration = 60 * 6; // last 6 hours data
      dataFactory.getLoRaDeviceRecentUsage(deviceType, devEUI, duration, 3D_WebGIS_Angular_ESRI.SCATTER_MODE).then(function (response) {
        if (response.status === "success") {
          let voltageData = [];
          let currentData = [];
          let powerData = [];

          if (response.content.deviceInfos.filter(d => d.power !== null).length > 0) {
            buildData(response.content.deviceInfos, voltageData, currentData, powerData, timestamps);
            yAxis[0].data = voltageData;
            yAxis[1].data = currentData;
            yAxis[2].data = powerData;

            let chart = new MultiAxis(container, title, yAxis, timestamps, legend);
            chart.draw();
          } else {
            dataFactory.getLoRaDeviceLatestUsage(deviceType, devEUI).then(usage => {
              if (usage.status === "success") {

                buildData(usage.content.deviceInfos, voltageData, currentData, powerData, timestamps);

                yAxis[0].data = voltageData;
                yAxis[1].data = currentData;
                yAxis[2].data = powerData;

                let chart = new MultiAxis(container, title, yAxis, timestamps, legend);
                chart.draw();
              } else {
                $window.alert("An error occurred when loading latest data, try close and reopen chart.");
              }
            });
          }

        } else {
          $window.alert("An error occurred when loading data, try close and reopen chart.");
        }
      });
    }

  };

  let buildData = function (deviceInfos, voltageData, currentData, powerData, timestamps) {

    let now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    const threeHours = 3 * 60 * 60 * 1000;
    const threeHourAgo = new Date(now - threeHours).getTime();

    // From Oldest to latest
    deviceInfos.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let startPoint = {
      "timestamp": null,
      "voltage": null,
      "current": null,
      "power": null
    };
    let i = 0;
    while (deviceInfos[i] && (new Date(deviceInfos[i].timestamp).getTime() <= threeHourAgo)) {
      startPoint = deviceInfos[i];
      i++;
    }
    startPoint.timestamp = new Date(threeHourAgo).toISOString();

    let startTime = new Date(startPoint.timestamp).getTime();

    let history = [];
    let prevRecord = startPoint;

    const oneMinute = 1000 * 60;
    for (let time = startTime; time <= now ; time += oneMinute) {

      let key = new Date(time).toISOString();

      let found = deviceInfos.find(e => e.timestamp === key);

      if (found) {
        history.push(found);
        prevRecord = found;
      } else {
        history.push({
          "timestamp": new Date(time).toISOString(),
          "voltage": prevRecord.voltage,
          "current": prevRecord.current,
          "power": prevRecord.power
        });
      }
    }

    history.reverse().forEach(point => {
      voltageData.push(point.voltage);
      currentData.push(point.current);
      powerData.push(point.power);
      buildTimeStamp(point.timestamp, timestamps);
    });
  };

  let buildTimeStamp = function (timestamp, array) {
    let date = new Date(timestamp);
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    array.push(hour + ":" + minute);
  };

  return PlugBaseLayer;
};
