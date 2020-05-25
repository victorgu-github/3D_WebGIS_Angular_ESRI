"use strict";

describe("Sidebar Service", function () {
  let SidebarService;
  let PanelItem;
  let LinkItem;
  let AccountService;
  let Leaflet2DConfig;
  let scenario;
  let layerList;
  let baseMap;
  let nodeList;
  let dashboard;
  let leaflet2DMap;
  let localSceneView;
  let $rootScope;

  beforeEach(module('3D_WebGIS_Angular_ESRIMap'));
  beforeEach(inject(function ($injector) {
    SidebarService = $injector.get('SidebarService');
    $rootScope = $injector.get('$rootScope');
    PanelItem = $injector.get('PanelItem');
    AccountService = $injector.get('AccountService');
    LinkItem = $injector.get('LinkItem');
    Leaflet2DConfig = $injector.get('leaflet2DConfig');
  }));

  beforeEach(function () {
    scenario = new PanelItem("Scenario", "map-marker", "app/views/sidebar/views/scenario.html", false);
    layerList = new PanelItem("LayerList", "list", "app/views/sidebar/views/layerList.html", false);
    baseMap = new PanelItem("BaseMap", "image", "app/views/sidebar/views/basemap.html", false);
    nodeList = new PanelItem("NodeList", "clock-o", "app/views/sidebar/views/nodelist.html", false);
    dashboard = new LinkItem("Dashboard", "tachometer", "/#/dashboard/overview");
    leaflet2DMap = new LinkItem("2D Map", "map-o", "/#/leaflet2DView");
    localSceneView = new LinkItem("Under Ground", "arrow-circle-down", "/#/localSceneView"); 
  });

  describe('.getSidebarItems', function () {
    it('should return 3D view items when in SceneView and bleAppID exists', function () {
      $rootScope.pageName = "3D View";
      Leaflet2DConfig.Scenarios = [{
        scenarioName: "Shanghai",
        scenarioID: 3,
        scenario2DId: 3,
        undergroundLayers: {
          dynamicLayers: []
        }
      }];
      AccountService.userInfo.settings.currentScenario.bleAppID = "1";
      AccountService.userInfo.settings.currentScenario.scenarioID = "3";
      AccountService.userInfo.settings.Scenarios = [{
        scenarioID: 3, scenarioName: "上海花园坊", scenario2DId: 3, undergroundLayers: {
          dynamicLayers: []
        }
      }];

      let itemNames = [];

      SidebarService.getSidebarItems("3D View");
      SidebarService.sidebar.items.forEach((item) => {
        itemNames.push(item.name);
      });

      expect(itemNames).to.eql(["SIDEBAR.SCENARIO", "SIDEBAR.LAYER_LIST", "SIDEBAR.BASEMAP", "SIDEBAR.NODELIST", "SIDEBAR.UNDERGROUND", "SIDEBAR.2DMAP", "SIDEBAR.DASHBOARD", "SIDEBAR.SETTINGS"]);
    });

    it('should return 3D view items when in SceneView and bleAppID not exists', function () {
      $rootScope.pageName = "3D View";
      Leaflet2DConfig.Scenarios = [{
        scenarioName: "Shanghai",
        scenarioID: 3,
        scenario2DId: 3,
        undergroundLayers: {
          dynamicLayers: []
        }
      }];
      AccountService.userInfo.settings.currentScenario.bleAppID = null;
      AccountService.userInfo.settings.currentScenario.scenarioID = "3";
      AccountService.userInfo.settings.Scenarios = [{
        scenarioID: 3, scenarioName: "上海花园坊", scenario2DId: 3, undergroundLayers: {
          dynamicLayers: []
        }
      }];

      let itemNames = [];

      SidebarService.getSidebarItems("3D View");
      SidebarService.sidebar.items.forEach((item) => {
        itemNames.push(item.name);
      });

      expect(itemNames).to.eql(["SIDEBAR.SCENARIO", "SIDEBAR.LAYER_LIST", "SIDEBAR.BASEMAP", "SIDEBAR.UNDERGROUND", "SIDEBAR.2DMAP", "SIDEBAR.DASHBOARD", "SIDEBAR.SETTINGS"]);
    });

    it('should return 2D view items when in Leaflet 2D', function () {
      $rootScope.pageName = "2D View";

      let itemNames = [];

      SidebarService.getSidebarItems("2D View");
      SidebarService.sidebar.items.forEach((item) => {
        itemNames.push(item.name);
      });

      expect(itemNames).to.eql(["SIDEBAR.LAYER_LIST", "SIDEBAR.HEATMAP", "SIDEBAR.INTRPL", "SIDEBAR.3DMAP", "SIDEBAR.DASHBOARD"]);
    });

    it('should return default items when in dashboard', function () {
      $rootScope.pageName = "Dashboard";

      let itemNames = [];

      SidebarService.getSidebarItems("Dashboard");
      SidebarService.sidebar.items.forEach((item) => {
        itemNames.push(item.name);
      });

      expect(itemNames).to.eql(["SIDEBAR.3DMAP"]);
    });

  });

  describe('.togglePanel', function () {

    beforeEach(function () {
      SidebarService.sidebar.items = [scenario, layerList, baseMap, nodeList, dashboard, leaflet2DMap, localSceneView];
    });

    it('should open scenario panel when I clicked and set active to scenario in sidebar', function () {
      SidebarService.togglePanel(scenario.name);

      expect(SidebarService.sidebar.currentPanel).to.equal(scenario.name);
      expect(SidebarService.sidebar.menuChecked).to.be.true;
      expect(scenario.isActive).to.be.true;
    });

    it('should switch to layerList panel when current active is scenario', function () {
      SidebarService.sidebar.menuChecked = true;
      SidebarService.sidebar.currentPanel = scenario.name;
      scenario.isActive = true;
      SidebarService.togglePanel(layerList.name);

      expect(SidebarService.sidebar.currentPanel).to.equal(layerList.name);
      expect(SidebarService.sidebar.menuChecked).to.be.true;
      expect(layerList.isActive).to.be.true;
    });

    it('should close current panel when I click active item', function () {
      SidebarService.sidebar.menuChecked = true;
      SidebarService.sidebar.currentPanel = layerList.name;
      layerList.isActive = true;
      SidebarService.togglePanel(layerList.name);

      expect(SidebarService.sidebar.currentPanel).to.be.empty;
      expect(SidebarService.sidebar.menuChecked).to.be.false;
      expect(layerList.isActive).to.be.false;
    });

  });

  describe('.toggleSidebar', function () {
    beforeEach(function () {
      SidebarService.sidebar.items = [scenario, layerList, baseMap, nodeList, leaflet2DMap, dashboard];
    });

    it('should open sidebar when sidebar is closed', function () {
      SidebarService.sidebar.menuChecked = false;
      SidebarService.sidebar.checked = false;
      SidebarService.sidebar.currentPanel = "";
      SidebarService.sidebar.items.forEach(function (item) {
        item.isActive = false;
      });

      SidebarService.toggleSidebar();

      expect(SidebarService.sidebar.checked).to.be.true;
      expect(SidebarService.sidebar.menuChecked).to.be.false;
      expect(SidebarService.sidebar.currentPanel).to.be.empty;
    });

    it('should close sidebar when sidebar is open and panel is slided', function () {
      SidebarService.sidebar.menuChecked = true;
      SidebarService.sidebar.checked = true;
      SidebarService.sidebar.currentPanel = scenario.name;
      scenario.isActive = true;

      SidebarService.toggleSidebar();

      expect(SidebarService.sidebar.checked).to.be.false;
      expect(SidebarService.sidebar.menuChecked).to.be.false;
      expect(SidebarService.sidebar.currentPanel).to.be.empty;
    });

  });

  describe('.closePanel', function () {
    it('should close panel when there is an open panel', function () {
      SidebarService.sidebar.checked = true;
      SidebarService.sidebar.menuChecked = true;
      SidebarService.sidebar.currentPanel = scenario.name;

      SidebarService.closePanel();

      expect(SidebarService.sidebar.checked).to.be.true;
      expect(SidebarService.sidebar.menuChecked).to.be.false;
      expect(SidebarService.sidebar.currentPanel).to.be.empty;
      expect(scenario.isActive).to.be.false;
    });

    it('should close panel even when there is no panel open', function () {
      SidebarService.sidebar.checked = true;
      SidebarService.sidebar.menuChecked = false;
      SidebarService.sidebar.currentPanel = "";

      SidebarService.closePanel();

      expect(SidebarService.sidebar.checked).to.be.true;
      expect(SidebarService.sidebar.menuChecked).to.be.false;
      expect(SidebarService.sidebar.currentPanel).to.be.empty;
    });
  });

});
