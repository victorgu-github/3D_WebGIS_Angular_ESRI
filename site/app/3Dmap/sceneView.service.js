'use strict';

module.exports = function ($cookies, esriLoader, AccountService, LayerActionItem, DetectorLayer, StreetlampLayer,
                           MapLayer, PlugBaseFactory, SmokeDetectorLayer, ParkinglotLayer,WindowDoorSensorLayer,IndoorSegmentLayer, PlugBaseLayer,
                           CeilinglightLayer, 3D_WebGIS_Angular_ESRI) {

  let self = this;

  self.data = {
    timerServices: {},
    mapLayers: [],
    animationLayers: {}
  };

  self.authenticate = function () {
    let IdManager;
    let ServerInfo;
    let EsriConfig;
    let serverInfo;

    return esriLoader.require([
      "esri/identity/IdentityManager",
      "esri/identity/ServerInfo",
      "esri/config"
    ]).then(function (modules) {
      IdManager = modules[0];
      ServerInfo = modules[1];
      EsriConfig = modules[2];

      //for accessing secured layers
      EsriConfig.request.corsEnabledServers.push("http://shanghai.3D_WebGIS_Angular_ESRI.com");
      EsriConfig.request.corsEnabledServers.push("https://shanghai.3D_WebGIS_Angular_ESRI.com");
      EsriConfig.request.corsEnabledServers.push("http://www.3D_WebGIS_Angular_ESRI.com.cn");
      EsriConfig.request.corsEnabledServers.push("https://www.3D_WebGIS_Angular_ESRI.com.cn");
      EsriConfig.request.corsEnabledServers.push("http://appgis.3D_WebGIS_Angular_ESRI.com.cn");
      EsriConfig.request.corsEnabledServers.push("https://appgis.3D_WebGIS_Angular_ESRI.com.cn");
      serverInfo = new ServerInfo();

      let esriTokenObj = $cookies.getObject("esriToken");
      if (!esriTokenObj) {
        console.error("esriToken not exists!");
        window.alert("ESRI token invalid, please logout then login to refresh token.");
      }
      if (AccountService.userInfo.settings.featureLayerBaseURL.indexOf("https://services7.arcgis.com") > -1) {
        serverInfo.server = 'http://services7.arcgis.com/gSP83wC6PGs7J2Yu/ArcGIS';  //seems that the value doesn't matter as long as it is filled and match with credentials.server
        serverInfo.tokenServiceUrl = 'https://www.arcgis.com/sharing/generateToken';
      }
      else if (AccountService.userInfo.settings.featureLayerBaseURL.indexOf("http://shanghai.3D_WebGIS_Angular_ESRI.com") > -1) {
        serverInfo.server = 'http://shanghai.3D_WebGIS_Angular_ESRI.com/server';  //seems that the value doesn't matter as long as it is filled and match with credentials.server
        serverInfo.tokenServiceUrl = 'https://shanghai.3D_WebGIS_Angular_ESRI.com/portal/sharing/rest/generateToken';
      }
      else if (AccountService.userInfo.settings.featureLayerBaseURL.indexOf("http://appgis.3D_WebGIS_Angular_ESRI.com.cn") > -1) {
        serverInfo.server = 'http://appgis.3D_WebGIS_Angular_ESRI.com.cn/server';  //seems that the value doesn't matter as long as it is filled and match with credentials.server
        serverInfo.tokenServiceUrl = 'https://appgis.3D_WebGIS_Angular_ESRI.com.cn/portal/sharing/rest/generateToken';
      }
      serverInfo.shortLivedTokenValidity = 720;
      IdManager.registerServers([serverInfo]);
      //get token creation time in epoch
      let creationTime = (new Date).getTime();
      //calculate the token expiration based on short lived token validity
      let expirationTime = esriTokenObj.expires;//creationTime + (serverInfo.shortLivedTokenValidity * 60000);
      //create array of secured services

      let idObject = {};
      idObject.serverInfos = [serverInfo];
      let credentials = {};
      //credentials.userId = username;
      credentials.server = serverInfo.server;
      credentials.token = esriTokenObj.token;
      credentials.expires = expirationTime;
      credentials.ssl = esriTokenObj.ssl;
      credentials.scope = "server";
      credentials.validity = 720;
      credentials.creationTime = creationTime;
      credentials.resources = [];
      idObject.credentials = [credentials];

      IdManager.initialize(idObject);
    });

  };

  self.getScenario = function () {
    let scenarios = AccountService.userInfo.settings.Scenarios;
    let scenarioID = AccountService.userInfo.settings.currentScenario.scenarioID;
    if (scenarioID) {
      let scenario = scenarios.find(s => scenarioID === s.scenarioID);
      if (scenario) {
        return scenario;
      }
    }
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].isDefault) {
        return scenarios[i];
      }
    }
  };

  self.createNewDatatablePopup = function (Popup, longitude, latitude, devEUI, sceneViewController) {
    let newPopup = new Popup();
    newPopup.actions =[]; //for 4.6 has to clear it even though just new it
    newPopup.dockEnabled = true;
    newPopup.dockOptions= {
      // Disables the dock button from the popup
      buttonEnabled: false,
      // Ignore the default sizes that trigger responsive docking
      breakpoint: false,
      position:"top-center"
    };
    //newPopup.location = [longitude, latitude];

    sceneViewController.view.popup.visible = false;
    newPopup.viewModel.on("trigger-action", function (event) {
      sceneViewController.initPopup(event, sceneViewController, devEUI);
    }.bind(sceneViewController));

    return newPopup;
  };

  self.createNewEsriPopup = function (Popup, longitude, latitude, sceneViewController) {
    let newPopup = new Popup();
    //newPopup.location = [longitude, latitude]; not work in 4.6
    sceneViewController.view.popup.visible = false;
    sceneViewController.view.popup = newPopup;
    sceneViewController.view.popup.viewModel.on("trigger-action", function (event) {
      sceneViewController.initPopup(event, sceneViewController);
    }.bind(sceneViewController));
  };

  self.updateLayerList = function (mapLayers, mapView, currentScenarioConfig) {
    // Clear both mapLayers and animations
    clearMapLayers();

    let layerList = _buildLayerList(mapLayers, mapView, currentScenarioConfig);

    Array.prototype.push.apply(self.data.mapLayers, layerList.reverse());

    clearBackgroundService();

    launchBackgroundService();
  };

  function clearMapLayers() {
    self.data.mapLayers.length = 0;

    for (let layer in self.data.animationLayers) {
      if (self.data.animationLayers.hasOwnProperty(layer)) {
        self.data.animationLayers[layer].graphics = [];
      }
    }
  }

  function clearBackgroundService() {
    for (let serviceName in self.data.timerServices) {
      if (self.data.timerServices.hasOwnProperty(serviceName)) {
        if (serviceName !== "Timer Service") {
          window.clearInterval(self.data.timerServices[serviceName]);
        }
      }
    }
  }

  function launchBackgroundService() {
    self.data.mapLayers.filter((layer) => {
      return PlugBaseLayer.isBelongToLayer(layer.id) || layer.id === 3D_WebGIS_Angular_ESRI.DETECTOR || layer.id === 3D_WebGIS_Angular_ESRI.STREET_LAMP ||layer.id === 3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR ||
        layer.id === 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR || layer.id === 3D_WebGIS_Angular_ESRI.PARKING_LOTS || layer.id === 3D_WebGIS_Angular_ESRI.CEILING_LIGHT||layer.id === 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER;
    }).forEach((service) => {
      // Get data first no matter if user opens data table or not.
      window.setTimeout(() => service.isVisible() && service.update());
      self.data.timerServices[service.id] = window.setInterval(function () {
        if (service.isVisible()) {
          service.update();
        }
      }, service.refreshTime);
    });
  }

  function _buildLayerList(mapLayers, mapView, currentScenarioConfig) {
    let layerList = [];

    for (let i = 0; i < mapLayers.items.length; i++) {
      let mapLayer = mapLayers.items[i];
      //don't link hidden layer
      if (mapLayer.listMode === "hide") {
        continue;
      }

      let resizeSymbol = (currentScenarioConfig.actionLayers.ResizeSymbol.indexOf(mapLayer.id) > -1);
      let changeHistoryPoints = (currentScenarioConfig.actionLayers.ChangeHistorySize.indexOf(mapLayer.id) > -1);
      let layer = _buildMapLayer(mapLayer, mapView, resizeSymbol, changeHistoryPoints);
      layerList.push(layer);
    }

    return layerList;
  }

  function _buildSubLayers(layer, mapView, resizeSymbol, changeHistoryPoints, results) {
    if (layer.type === "group" && layer.layers.length > 0) {
      let subLayers = layer.layers.items;
      subLayers.forEach(function (layer) {
        let subLayer = _buildMapLayer(layer, mapView, resizeSymbol, changeHistoryPoints);

        results.push(subLayer);
      });
    }

    return results;
  }

  function _buildMapLayer(layer, mapView, resizeSymbol, changeHistoryPoints) {
    let action = new LayerActionItem("Go to Full Extent", "arrows-alt", layer, mapView);
    let id = layer.id;
    let title = layer.title;
    let opacity = layer.opacity * 100;
    let animationLayer = self.data.animationLayers[id] ? self.data.animationLayers[id] : null;

    if (PlugBaseLayer.isBelongToLayer(id)) {
      return PlugBaseFactory.createLayer(layer, animationLayer, mapView, id, title, action, opacity);
    } else if (id === 3D_WebGIS_Angular_ESRI.STREET_LAMP) {
      return new StreetlampLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    } else if (id === 3D_WebGIS_Angular_ESRI.DETECTOR) {
      return new DetectorLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    } else if (id === 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR) {
      return new SmokeDetectorLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    } else if (id === 3D_WebGIS_Angular_ESRI.PARKING_LOTS) {
      return new ParkinglotLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    } else if (id === 3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR) {
      return new WindowDoorSensorLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    }  
    else if (id === 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER) {
      return new IndoorSegmentLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    }  
    else if (id === 3D_WebGIS_Angular_ESRI.CEILING_LIGHT) {
      return new CeilinglightLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    } else {
      let subLayers = _buildSubLayers(layer, mapView, resizeSymbol, changeHistoryPoints, []);

      return new MapLayer(layer, id, title, [action], subLayers, opacity, resizeSymbol, changeHistoryPoints);
    }

  }

};
