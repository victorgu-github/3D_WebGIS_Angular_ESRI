'use strict';

module.exports = function ($scope, $rootScope, $routeParams, $window, $location, dashboardConstant, dashTableConfig, AccountService, 
  SidebarService, CollectionUtils, loraGatewayService, dashboardSharedService, GeneralUserAppSharedService, GeneralUserSharedService,
  BLEApplicationSharedService, MengyangSharedService) {

  const PUBLIC_ACCESS      = "Public Access";
  const correctRouteParamsArray = ["overview", "overviewMengyang", "newLoraGateway", "newApplication", "newBleApp"];

  //URL forward to lora device and lora gateway monitor page
  //OVERVIEW_URL will stay at the current page
  let LORA_GW_MONITOR_URL   = "/#/dashboard/device/loraGateways/monitorMapView";
  let MENGYANG_MONITOR_URL  = "/#/dashboard/mengyang/monitorMapView";
  let OVERVIEW_URL          = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
  let MENGYANG_OVERVIEW_URL = CollectionUtils.getMengyangOverviewPageUrl(AccountService.userInfo);
  
  let userInfo             = AccountService.userInfo;
  $scope.isCellPhone       = userInfo.isCellPhone;

  //Control sidebar in dashboard overview page
  $scope.dashboardSidebar  = dashboardSharedService.dashboardSidebar;

  //////////////////////////////////////////////////
  //
  // Overview Page Panels
  //
  //////////////////////////////////////////////////

  let Overview = {
    name: "overview",
    displayName: "DASHBOARD.OVERVIEW",
    icon: "tachometer",
    isActive: true,
    templateUrl: "dashboard/overview/overview.html",
    cards: []
  };
  let OverviewForMengyang = {
    name: "overviewMengyang",
    displayName: "蒙羊",
    icon: "home",
    isActive: false,
    templateUrl: "dashboard/overview/overview.html",
    cards: []
  };
  let NewLoraGateway = {
    name: "newLoraGateway",
    displayName: "DASHBOARD.NEW_LORA_GATEWAY",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/loraGateway/newDevice/new-device.html"
  };
  let NewApplication = {
    name: "newApplication",
    displayName: "DASHBOARD.NEW_APPLICATION_FOR_GENUSR",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/generalUserApp/newGeneralUserAppForGenUsr/newGeneralUserAppForGenUsr.html"
  };
  let NewBleApplication = {
    name: "newBleApp",
    displayName: "DASHBOARD.NEW_BLE_APPLICATION",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/bleApplication/newBleApp/newBleApp.html"
  };

  //////////////////////////////////////////////////
  //
  // Overview Page Cards
  //
  //////////////////////////////////////////////////

  let loraGatewaysForGenUsr = {
    name: "DASHBOARD.LORA_GATEWAYS",
    icon: "upload",
    isLoading: true,
    isDisabled: false,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.LORA_GATEWAYS_DESCRIPTION",
    value: "--",
    url: dashTableConfig.Devices.LoraGateway.LoraGatewayTableCommonUrl,
    monitorUrl: LORA_GW_MONITOR_URL
  };
  let generalUsrApp = {
    name: "DASHBOARD.GENERAL_USR.APPLICATION",
    icon: "window-restore",
    isLoading: true,
    isDisabled: true,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.GENERAL_USR.APPLICATION_DESCRIPTION",
    value: "--",
    url: dashTableConfig.GeneralUserApplicationForGenUsr.generalUsrAppTableUrl,
    monitorUrl: OVERVIEW_URL
  };
  let bleApplication = {
    name: "DASHBOARD.BLE_APPLICATION",
    icon: "fab fa-bluetooth-b",
    isLoading: true,
    isDisabled: true,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.BLE_APPLICATION_DESCRIPTION",
    value: "--",
    url: dashboardConstant.BLE_APPLICATION.OVERVIEW_TABLE_URL,
    monitorUrl: OVERVIEW_URL
  };
  let mengyang = {
    name: "羊只管理",
    icon: "cubes",
    isLoading: true,
    isDisabled: false,
    contentLoaded: false,
    displayFooter: true,
    description: "羊只数量: ",
    lTitle: "编辑",
    rTitle: "新建",
    lIcon: "pencil-square-o",
    rIcon: "pencil-square-o",
    value: "--",
    url: "/dashboard/mengyang/table",
    monitorUrl: "/dashboard/mengyang/new",
  };
  let pasture = {
    name: "蒙羊牧场",
    icon: "align-justify",
    isLoading: true,
    isDisabled: false,
    contentLoaded: false,
    displayFooter: true,
    description: "牧场数量: ",
    lTitle: "--",
    rTitle: "监控",
    lIcon: "pencil-square-o",
    rIcon: "desktop",
    value: "--",
    url: MENGYANG_OVERVIEW_URL,
    monitorUrl: MENGYANG_MONITOR_URL,
  };

  //////////////////////////////////////////////////
  //
  // General User Info
  //
  //////////////////////////////////////////////////

  //Init panels
  //1. Public access user and non public access user have different panels
  //2. If user's companyID === "4", display '蒙羊' panel. Otherwise, not display '蒙羊' panel
  let generalUsrForPublic = {};
  let generalUsr = {};
  if (userInfo.companyID === dashTableConfig.Mengyang.companyID) {
    generalUsrForPublic.panels = [Overview, OverviewForMengyang, NewBleApplication, NewLoraGateway, NewApplication];
    generalUsr.panels = [Overview, OverviewForMengyang];
  }
  else {
    generalUsrForPublic.panels = [Overview, NewBleApplication, NewLoraGateway, NewApplication];
    generalUsr.panels = [Overview];
  }

  //Init cards
  //1. Overview page and mengyang overview page have different cards
  //2. If user use cell phone, not allow user to view mengyang monitor page
  Overview.cards = [bleApplication, loraGatewaysForGenUsr, generalUsrApp];
  OverviewForMengyang.cards = [mengyang, pasture];
  if (userInfo.isCellPhone) {
    pasture.isDisabled = true;
    pasture.monitorUrl = MENGYANG_OVERVIEW_URL;
  }

  /////////////////////////////////////////////////////////
  //
  // Initialize Variable And Function
  //
  /////////////////////////////////////////////////////////

  checkUrlAndInitPage();

  /////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  /////////////////////////////////////////////////////////

  $scope.navigateTo = function (panel) {
    if (AccountService.userInfo.isCellPhone) {
      $location.url("/dashboard/generalUserCellPhone/" + panel.name);
    }
    else {
      $location.url("/dashboard/generalUserDesktop/" + panel.name);
    }
  };

  $scope.getDashboardNavigationClass = function () {
    let Class = "dashboard__navigation-for-gen-usr";
    if (SidebarService.sidebar.checked) {
      Class = "dashboard__navigation-for-gen-usr-exist";
    }
    return Class;
  };

  /////////////////////////////////////////////////////////
  //
  // Private Function
  //
  /////////////////////////////////////////////////////////

  function checkUrlAndInitPage() {
    let panelName = $routeParams.panelName;
    let isCorrectRouteParams = CollectionUtils.isCorrectRouteParams(panelName, correctRouteParamsArray);
    if (!isCorrectRouteParams) {
      $scope.displayPageNotFoundTemplate = true;
    }
    else {
      initPanelsAndCards(userInfo.companyName, panelName);
      if ($routeParams.panelName === "overview") {
        getLoraGatewaysForGenUsrCount();
        getGeneralUsrAppCount();
        getBleApplicationCount();
      }
      else if ($routeParams.panelName === "overviewMengyang") {
        getMengyangSheepCount();
        getPastureCount();
      }
      $scope.displayPageNotFoundTemplate = false;
    }
  }

  //Init panels and nav bars for general user
  function initPanelsAndCards(companyName, panelName) {
    if (companyName === PUBLIC_ACCESS) {
      $scope.panels = generalUsrForPublic.panels;
    }
    else {
      $scope.panels = generalUsr.panels;
    }
    navigateTo(panelName);
  }

  //Navigate to a specific panel
  function navigateTo(panelName) {
    if (panelName === "overview") {
      $scope.displayOverviewTitle = true;
    }
    else if (panelName === "overviewMengyang") {
      $scope.displayOverviewTitle = false;
    }
    $scope.panels.forEach(function (panel) {
      if (panel.name !== panelName) {
        panel.isActive = false;
      }
      else {
        panel.isActive = true;
        $scope.cards = panel.cards;
      }
    });
  }

  //Get lora gateway number from web api
  function getLoraGatewaysForGenUsrCount() {
    loraGatewayService.getLoraGatewaysInfo().then(function (response) {
      if (response.status === "success") {
        let resp = response.content.result;
        loraGatewaysForGenUsr.value = resp.length;
      } else {
        $window.alert("Error occurred due to: " + response.errors[0].message);
      }
      loraGatewaysForGenUsr.isLoading = false;
    });
  }

  //Get applications number for general user
  function getGeneralUsrAppCount() {
    //1.Get generalAppIDs from AccountService
    let generalAppIDs = userInfo.generalAppIDs ? userInfo.generalAppIDs : [];
    generalUsrApp.value = generalAppIDs.length;
    generalUsrApp.isLoading = false;
  }

  //Get ble applications number from web api
  function getBleApplicationCount() {
    BLEApplicationSharedService.getBleApplicationsByCurrentUser().then(function (response) {
      if (response.status === "success") {
        bleApplication.value = response.content.length;
      }
      else {
        let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + errMsg);
      }
      bleApplication.isLoading = false;
    });
  }

  //Get mengyang sheep number from web api
  function getMengyangSheepCount() {
    MengyangSharedService.getSheeps(dashTableConfig.Mengyang.pastureIDs).then(function (response) {
      if (response.status === "success") {
        mengyang.value = response.content.length;
      }
      else {
        let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("错误原因: " + errMsg);
      }
      mengyang.isLoading = false;
    });
  }

  //Get mengyang sheep number from web api
  function getPastureCount() {
    pasture.value = 4;
    pasture.isLoading = false;
  }
};