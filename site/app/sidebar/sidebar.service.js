'use strict';

module.exports = function ($rootScope, PanelItem, LinkItem, 3D_WebGIS_Angular_ESRI, AccountService, CollectionUtils, Leaflet2DConfig) {

  let self = this;
  // Only one baseMap instance should be kept
  let baseMap = createBaseMap();

  this.sidebar = {
    currentPanel: "",
    checked: true,
    menuChecked: false,
    sidebarSize: "85px",
    menuSize: "300px",
    items: []
  };

  this.togglePanel = function (name) {
    let currentPanel = findPanel(this.sidebar.currentPanel),
      clickedPanel = findPanel(name);

    if (clickedPanel) {
      if (currentPanel) {
        if (currentPanel.name === clickedPanel.name) {
          this.sidebar.menuChecked = false;
          currentPanel.isActive = false;
          this.sidebar.currentPanel = "";
        } else {
          this.sidebar.menuChecked = true;
          currentPanel.isActive = false;
          clickedPanel.isActive = true;
          this.sidebar.currentPanel = clickedPanel.name;
        }
      } else {
        this.sidebar.menuChecked = true;
        clickedPanel.isActive = true;
        this.sidebar.currentPanel = clickedPanel.name;
      }
    }
  };

  this.closePanel = function () {
    this.sidebar.menuChecked = false;
    this.sidebar.currentPanel = "";
    this.sidebar.items.forEach(item => {
      item.isActive = false;
    });
  };

  this.getSidebarItems = function (pageName) {
    let sidebarItems = [];

    let scenario = createScenario();
    let layerList = createLayerList();
    let _2DLayerList = create2DLayerList();
    let heatMap = createHeatMap();
    let interpolation = createInterpolation();
    let nodeList = createNodeList();
    let dashboard = createDashboard();
    let leaflet2DMap = create2DMap();
    let sceneView3DMap = create3DMap();
    let setting = createSetting();
    let localSceneView = createLocalSceneView();
    let currentScenarioID = AccountService.currentScenarioID();
    let scenarios = AccountService.userInfo.settings.Scenarios;
    let currentScenario = findCurrentScenario(currentScenarioID, scenarios);

    if (pageName === '3D View') {
      sidebarItems = [scenario, layerList, baseMap];
      // depend on bleAppID
      if (AccountService.userInfo.settings.currentScenario.bleAppID !== null) {
        if (AccountService.userInfo.settings.currentScenario.scenarioID!==8)//don't add nodelist button for mengyang
         {
          sidebarItems.push(nodeList);
         } 
      }
      // depend on currentScenario, add to sidebar if there is undergroundLayers config.
      if (currentScenario.undergroundLayers) {
        sidebarItems.push(localSceneView);
      }

      add2DMapByConfig(currentScenario.scenario2DId, leaflet2DMap, sidebarItems);
      sidebarItems = sidebarItems.concat([dashboard, setting]);
    } else if (pageName === '2D View') {
      sidebarItems = [_2DLayerList, heatMap, interpolation, sceneView3DMap, dashboard];
    } else if (pageName === 'Under Ground View') {
      sidebarItems = [layerList, sceneView3DMap, dashboard];
    } else {
      sidebarItems = [sceneView3DMap];
    }

    this.sidebar.items = sidebarItems;
  };

  this.toggleSidebar = function () {
    this.sidebar.checked = !this.sidebar.checked;
    if (!this.sidebar.checked) {
      this.sidebar.menuChecked = false;
      this.sidebar.currentPanel = "";
      this.sidebar.items.forEach(function (item) {
        item.isActive = false;
      });
    }
  };

  function add2DMapByConfig(scenario2DId, leaflet2DMap, sidebarItems) {
    if (scenario2DId) {
      let scenario2D = Leaflet2DConfig.Scenarios.find(s => s.scenarioID === scenario2DId);
      if (scenario2D) {
        sidebarItems.push(leaflet2DMap);
      }
    }
  }

  function findPanel(name) {
    return self.sidebar.items.find(item => item.name === name);
  }

  function findCurrentScenario(currentScenarioID, scenarios) {
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].scenarioID === currentScenarioID) {
        return scenarios[i];
      }
    }
    return scenarios[0];
  }

  function createScenario() {
    return new PanelItem("SIDEBAR.SCENARIO", "map-marker", "sidebar/panels/scenario/scenario.html", false);
  }

  function createLayerList() {
    return new PanelItem("SIDEBAR.LAYER_LIST", "list", "sidebar/panels/3Dlayerlist/layerList.html", false);
  }

  function create2DLayerList() {
    return new PanelItem("SIDEBAR.LAYER_LIST", "list", "sidebar/panels/2Dlayerlist/2DLayerList.html", false);
  }

  function createBaseMap() {
    return new PanelItem("SIDEBAR.BASEMAP", "image", "sidebar/panels/basemap/basemap.html", false);
  }

  function createHeatMap() {
    return new PanelItem("SIDEBAR.HEATMAP", "area-chart", "sidebar/panels/heatmap/heatmap.html", false);
  }

  function createInterpolation() {
    return new PanelItem("SIDEBAR.INTRPL", "line-chart", "sidebar/panels/interpolation/interpolation.html", false);
  }

  function createNodeList() {
    return new PanelItem("SIDEBAR.NODELIST", "clock-o", "sidebar/panels/nodelist/nodelist.html", false);
  }

  function createDashboard() {
    let overviewPageUrl = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
    return new LinkItem("SIDEBAR.DASHBOARD", "tachometer", overviewPageUrl);
  }

  function create2DMap() {
    return new LinkItem("SIDEBAR.2DMAP", "map-o", "/leaflet2DView");
  }

  function create3DMap() {
    return new LinkItem("SIDEBAR.3DMAP", "globe", "/");
  }

  function createSetting() {
    return new PanelItem("SIDEBAR.SETTINGS", "gear", "sidebar/panels/setting/setting.html", false);
  }

  function createLocalSceneView() {
    return new LinkItem("SIDEBAR.UNDERGROUND", "arrow-circle-down", "/localSceneView");
  }

};
