'use strict';

module.exports = function ($scope, $routeParams, $window, $location, dashboardConstant, dashTableConfig, 3D_WebGIS_Angular_ESRI, CollectionUtils, 
  AccountService, dataFactory, loraDeviceService, loraGatewayService, dashboardSharedService, GeneralUserAppSharedService, 
  CompanySharedService, GeneralUserSharedService, MulticastGroupSharedService, BLEApplicationSharedService, 
  MengyangSharedService) {

  const correctRouteParamsArray = ["overview", "overviewMengyang", "newBleApp", "newLoraDev", "newLoraMulticastGroup", "newLoraGateway", "newGeneralUserApp"];

  //URL forward to lora device and lora gateway monitor page
  //OVERVIEW_URL will stay at the current page
  let LORA_DEV_MONITOR_URL  = "/#/dashboard/device/loraDevices/monitorSummary";
  let LORA_GW_MONITOR_URL   = "/#/dashboard/device/loraGateways/monitorMapView";
  let MENGYANG_MONITOR_URL  = "/#/dashboard/mengyang/monitorMapView";
  let OVERVIEW_URL          = "/#/dashboard/overview";
  let MENGYANG_OVERVIEW_URL = "/#/dashboard/overviewMengyang";

  let userInfo             = AccountService.userInfo;
  let appIDRange           = userInfo.appIDs;
  //Admin user return userInfo.username, general user return userInfo.userName
  let username             = userInfo.username ? userInfo.username : userInfo.userName;
  let accessRole           = userInfo.currentUserType === "ACCOUNT.ADMIN" ? "admin" : "general";

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
  let NewLoraDevice = {
    name: "newLoraDev",
    displayName: "DASHBOARD.NEW_LORA_DEVICE",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/loraDevice/newDevice/new-device.html"
  };
  let NewMulticastGroup = {
    name: "newLoraMulticastGroup",
    displayName: "DASHBOARD.MULTICAST_GROUP",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/multicastGroup/newMulticastGroup/newMulticastGroup.html"
  };
  let NewLoraGateway = {
    name: "newLoraGateway",
    displayName: "DASHBOARD.NEW_LORA_GATEWAY",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/loraGateway/newDevice/new-device.html"
  };
  let NewGeneralUserApp = {
    name: "newGeneralUserApp",
    displayName: "DASHBOARD.NEW_APPLICATION",
    icon: "plus",
    isActive: false,
    templateUrl: "dashboard/generalUserApp/newGeneralUserApp/newGeneralUserApp.html"
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

  let gateways = {
    name: "DASHBOARD.BLE_GATEWAYS",
    icon: "wifi",
    isLoading: true,
    isDisabled: true,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.BLE_GATEWAYS_DESCRIPTION",
    value: "--",
    url: dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.Gateway.BLE_GATEWAY_ID,
    monitorUrl: OVERVIEW_URL
  };
  let loraDevices = {
    name: "DASHBOARD.LORA_DEVICES",
    icon: "microchip",
    isLoading: true,
    isDisabled: false,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.LORA_DEVICES_DESCRIPTION",
    value: "--",
    url: dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID,
    monitorUrl: LORA_DEV_MONITOR_URL
  };
  let multicastGroups = {
    name: "DASHBOARD.MULTICAST_GROUPS",
    icon: "podcast",
    isLoading: true,
    isDisabled: true,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.MULTICAST_GROUPS_DESCRIPTION",
    value: "--",
    url: dashTableConfig.MulticastGroup.MulticastGroupTableCommonUrl,
    monitorUrl: OVERVIEW_URL
  };
  let loraGateways = {
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
  let generalUserApplication = {
    name: "DASHBOARD.GENERAL_USER_APPLICATION",
    icon: "window-restore",
    isLoading: true,
    isDisabled: true,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.GENERAL_USER_APPLICATION_DESCRIPTION",
    value: "--",
    url: dashTableConfig.GeneralUserApplication.GernalUserAppTableCommonUrl,
    monitorUrl: OVERVIEW_URL
  };
  let generalUser = {
    name: "DASHBOARD.GENERAL_USER",
    icon: "user-circle",
    isLoading: true,
    isDisabled: true,
    contentLoaded: false,
    displayFooter: true,
    description: "DASHBOARD.GENERAL_USER_DESCRIPTION",
    value: "--",
    url: dashTableConfig.GeneralUser.GeneralUserTableCommonUrl,
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
    monitorUrl: "/dashboard/mengyang/new"
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
  // Admin User Info
  //
  //////////////////////////////////////////////////

  //If admin user associated companyID === "4", display '蒙羊‘ panel, otherwise not display '蒙羊' panel
  let panels = [];
  if (userInfo.companyID === dashTableConfig.Mengyang.companyID) {
    panels = [Overview, OverviewForMengyang, NewBleApplication, NewLoraDevice, NewMulticastGroup, NewLoraGateway, NewGeneralUserApp];
  }
  else {
    panels = [Overview, NewBleApplication, NewLoraDevice, NewMulticastGroup, NewLoraGateway, NewGeneralUserApp];
  }
  
  Overview.cards  = [gateways, bleApplication, loraDevices, multicastGroups, loraGateways, generalUserApplication, generalUser];
  OverviewForMengyang.cards = [mengyang, pasture];

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
    $location.url("/dashboard/" + panel.name);
  };

  /////////////////////////////////////////////////////////
  //
  // Private Function
  //
  /////////////////////////////////////////////////////////

  //If url is valid, init the page. Otherwise, display 404 not found
  //1.If $routeParams.panelName = "overview", display overview page content, and make async call 
  //  for all the cards under overview page
  //2.If $routeParams.panelName = "overviewMengyang", display mengyang overview page content, and make async call
  //  for all the cards under mengyang overview page
  //3.Do the routing within the controller
  function checkUrlAndInitPage() {
    let panelName = $routeParams.panelName;
    let isCorrectRouteParams = CollectionUtils.isCorrectRouteParams(panelName, correctRouteParamsArray);
    if (!isCorrectRouteParams) {
      $scope.displayPageNotFoundTemplate = true;
    }
    else {
      initPanels();
      navigateTo($routeParams.panelName);
      if ($routeParams.panelName === "overview") {
        getLoraDevicesCount();
        getLoraGatewaysCount();
        getGatewayCount();
        getGeneralUserApplicationCount();
        getGeneralUserCount();
        getMulticastGroupCount();
        getBleApplicationCount();
        initCandidateValue();
      }
      else if (panelName === "overviewMengyang") {
        getMengyangSheepCount();
        getPastureCount();
      }
      $scope.displayPageNotFoundTemplate = false;
    }
  }

  //Init panels and nav bar
  function initPanels() {
    $scope.panels = panels;
  }

  //Navigate to panel and display panel cards
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

  //Get lora device number from web api
  function getLoraDevicesCount() {
    loraDeviceService.getLoraDevicesCount(appIDRange).then(function (response) {
      if (response.status === "success") {
        let nodeSessionsNumber = response.content.nodeSessionsNumber;
        let count = 0;
        nodeSessionsNumber.forEach(function (nodeSession) {
          count += nodeSession.numberOfDevice;
        });
        loraDevices.value = count;
      } else {
        $window.alert("Error occurred due to: " + response.errors[0].message);
      }
      loraDevices.isLoading = false;
    });
  }

  //Get lora gateway number from web api
  function getLoraGatewaysCount() {
    loraGatewayService.getLoraGatewaysInfo().then(function (response) {
      if (response.status === "success") {
        let resp = response.content.result;
        loraGateways.value = resp.length;
      } else {
        $window.alert("Error occurred due to: " + response.errors[0].message);
      }
      loraGateways.isLoading = false;
    });
  }

  //Get ble gateway number from web api
  function getGatewayCount() {
    dataFactory.getAllGWSensorValues().then(function (responses) {
      let count = 0;
      responses.forEach(function (response) {
        if (response.status === "success") {
          let record = response.content["gw_sensor_recs"];
          count += record.length;
        } else {
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
      gateways.value = count;
      gateways.isLoading = false;
    });
  }

  //Get general user application number from web api
  function getGeneralUserApplicationCount() {
    GeneralUserAppSharedService.getGeneralUsrAppsCreatedByV2(username, accessRole).then(function (response) {
      if (response.status === "success") {
        generalUserApplication.value = response.content.length;
      }
      else {
        let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + errMsg);
      }
      generalUserApplication.isLoading = false;
    });
  }

  //Get general user number from web api
  function getGeneralUserCount() {
    CompanySharedService.getCompanys().then(function (response) {
      if (response.status === "success") {
        let loraApplicationIDs = appIDRange ? appIDRange : [];
        let companys    = response.content.filter((company) => { return loraApplicationIDs.includes(company.loraApplicationID); });
        let companysArr = [];
        companys.forEach((company) => { companysArr.push(company.companyID); });
        if (companysArr.length !== 0) {
          GeneralUserSharedService.getGeneralUsersByCompanyID(companysArr).then(function (resp) {
            if (resp.status === "success") {
              generalUser.value = resp.content.length;
            }
            else {
              $window.alert("Error occurred due to: " + resp.errors[0].message);
            }
          });
        }
      }
      else {
        $window.alert("Error occurred due to: " + response.errors[0].message);
      }
      generalUser.isLoading = false;
    });
  }

  //Get lora multicast group number from web api
  function getMulticastGroupCount() {
    MulticastGroupSharedService.getMulticastGroups(appIDRange).then(function (response) {
      if (response.status === "success") {
        let multicastSessions = response.content.multicastSessions;
        let count = 0;
        for (let index in multicastSessions) {
          let multicastSession = multicastSessions[index];
          let data = multicastSession.data;
          count += data.length;
        }
        multicastGroups.value = count;
      }
      else {
        $window.alert("Error occurred due to: " + response.errors[0].message);
      }
      multicastGroups.isLoading = false;
    });
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

  //Init candidateValues for DevType, BandID, subDeviceTypes, Class
  function initCandidateValue() {
    loraDeviceService.getDefaultCandidateValues().then(function (response) {
      if (response.status === "success") {
        dashboardSharedService.candidateValues = response.content.candidateValues;
      }
      else {
        $window.alert("Error occurred due to: " + response.errors[0].message);
      }
    });
  }
};