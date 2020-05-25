'use strict';

module.exports = function ($locationProvider, $routeProvider) {

  const mapFileName = window.staticMap ? window.staticMap.map.js : 'map.bundle.js';
  const interpolationFileName = window.staticMap ? window.staticMap.interpolation.js : 'interpolation.bundle.js';

  $locationProvider.hashPrefix('');
  $routeProvider
    .when('/login', {
      pageName: 'Login',
      templateUrl: './account/loginPage/loginPage.html',
      controller: 'AccountCtrl',
      controllerAs: 'CA'
    })
    .when('/login/profile/:panelName', {
      pageName: 'Dashboard',
      templateUrl: './account/profile/profile.html',
      controller: 'ProfileCtrl'
    })
    .when('/login/profileForGenUsr/:panelName', {
      pageName   : 'Dashboard',
      templateUrl: './account/profile/profileForGenUsr.html',
      controller : 'ProfileForGenUsrCtrl'
    })
    // - Dashboard
    //Redirect to dashboard overview page
    .when('/dashboard/:panelName', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/dashboard.html',
      controller: 'DashboardCtrl'
    })
    //Redirect to dashboard overview page for general user
    .when('/dashboard/generalUserCellPhone/:panelName', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/dashboardForGenUsrCellPhone.html',
      controller : 'DashboardForGenUsrCtrl'
    })
    .when('/dashboard/generalUserDesktop/:panelName', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/dashboardForGenUsrDesktop.html',
      controller : 'DashboardForGenUsrCtrl'
    })
    // - Mengyang
    //Mengyang Table Page
    .when('/dashboard/mengyang/table', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/mengyang/mengyangTable/mengyangTable.html',
      controller: 'MengyangTableCtrl'
    })
    //Mengyang New Page
    .when('/dashboard/mengyang/new', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/mengyang/newMengyang/newMengyang.html',
      controller: 'NewMengyangCtrl'
    })
    //Mengyang Edit page
    .when('/dashboard/mengyang/edit/', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/mengyang/editMengyang/editMengyang.html',
      controller: 'EditMengyangCtrl'
    })
    .when('/dashboard/device/:name', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/deviceTable/device-info.html',
      controller: 'DeviceTableCtrl'
    })
    .when('/dashboard/loraGateway/loraGatewayTable', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/loraGateway/loraGatewayTable/loraGatewayTable.html',
      controller: 'LoraGatewayTableCtrl'
    })
    .when('/dashboard/general/generalUser', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUser/generalUserTable/generalUserTable.html',
      controller: 'GeneralUserTableCtrl'
    })
    .when('/dashboard/general/generalUserApp', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/generalUserAppTable/generalUserAppTable.html',
      controller: 'GeneralUserAppTableCtrl'
    })
    .when('/dashboard/general/generalUserAppForGenUsr', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/generalUserAppTableForGenUsr/generalUserAppTableForGenUsr.html',
      controller: 'GeneralUserAppTableForGenUsrCtrl'
    })
    .when('/dashboard/general/multicastGroup', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/multicastGroup/multicastGroupTable/multicastGroupTable.html',
      controller: 'MulticastGroupTableCtrl'
    })
    //Edit Lora Device for Admin User
    .when('/dashboard/loraDevice/edit/:applicationID/:devEUI', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/loraDevice/editDevice/editLoraDevice.html',
      controller: 'EditLoraDeviceCtrl'
    })
    //Edit Lora Device for General User Application
    .when('/dashboard/loraDeviceForGenUsrApp/edit/:applicationID/:devEUI/:generalUserApplicationID', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/editGeneralUserAppForGenUsr/editLoraDevForGenUsrApp/editLoraDevice.html',
      controller: 'EditLoraDevForGenUsrAppCtrl'
    })
    //Display Lora Device Zmq Payload Data and Channel History Data
    .when('/dashboard/loraDevice/zmqPayloadAndChannelHistoryData/:applicationID/:devEUI/:devType', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/loraDevice/zmqPayloadAndChannelHistoryData/zmqPayloadAndChannelHistoryData.html',
      controller: 'ZmqPayloadAndChannelHistoryDataCtrl'
    })
    .when('/dashboard/multicastGroup/edit/:applicationID/:multicastAddr', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/multicastGroup/editMulticastGroup/editMulticastGroup.html',
      controller: 'EditMulticastGroupCtrl'
    })
    .when('/dashboard/loraGateway/edit/:GatewayMAC', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/loraGateway/editDevice/editLoraGateway.html',
      controller: 'EditLoraGatewayCtrl'
    })
    // -- Ble Application
    //Ble Application Table Page
    .when('/dashboard/ble/bleAppTable', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/bleApplication/bleAppTable/bleAppTable.html',
      controller: 'BleAppTableCtrl'
    })
    //Ble Application Edit Page
    .when('/dashboard/ble/bleApplication/edit/:bleAppID', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/bleApplication/editBleApp/editBleApp.html',
      controller: 'EditBleAppCtrl'
    })
    // - Ble Node
    //Ble Node New Page
    .when('/dashboard/ble/bleNode/edit/:bleAppID/:macAddress', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/bleApplication/editBleApp/editBleNode/editBleNode.html',
      controller: 'EditBleNodeCtrl'
    })
    //Ble Node Edit Page
    .when('/dashboard/ble/bleNode/new', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/bleApplication/editBleApp/newBleNode/newBleNode.html',
      controller: 'NewBleNodeCtrl'
    })
    //userName can be empty string here, so we need add '?' as suffix to pass "" in the url
    //Otherwise, route params cannot recognize the empty string "" and cannot forward to 
    //correct page
    .when('/dashboard/generalUser/edit/:userName?', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUser/editGeneralUser/editGeneralUser.html',
      controller: 'EditGeneralUserCtrl'
    })
    .when('/dashboard/generalUserApp/edit/:generalUserApplicationID', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/editGeneralUserApp/editGeneralUserApp.html',
      controller: 'EditGeneralUserAppCtrl'
    })
    .when('/dashboard/generalUserAppForGenUsr/show/:generalUserApplicationID', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/showGeneralUserAppForGenUsr/showGeneralUserAppForGenUsr.html',
      controller: 'ShowGeneralUserAppForGenUsrCtrl'
    })
    .when('/dashboard/generalUserAppForGenUsr/edit/:generalUserApplicationID', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/editGeneralUserAppForGenUsr/editGeneralUserAppForGenUsr.html',
      controller: 'EditGeneralUserAppForGenUsrCtrl'
    })
    .when('/dashboard/loraDevForGenUsrApp/new/:generalUserApplicationID', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/generalUserApp/editGeneralUserAppForGenUsr/newLoraDevForGenUsrApp/newLoraDevForGenUsrApp.html',
      controller: 'NewLoraDevForGenUsrAppCtrl'
    })
    .when('/dashboard/device/loraDevices/monitorSummary', {
      pageName   : 'Dashboard',
      templateUrl: './dashboard/monitor/summary/monitorSummary.html',
      controller : 'MonitorLoraDeviceSummaryCtrl'
    })
    .when('/dashboard/device/loraDevices/monitorDatatable', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/monitor/datatable/monitorDatatable.html',
      controller: 'MonitorLoraDeviceDatatableCtrl'
    })
    .when('/dashboard/device/loraDevices/monitor2DMap', {
      pageName: 'Dashboard',
      templateUrl: './dashboard/monitor/mapview/monitor2DMap.html',
      controller: 'MonitorLoraDevice2DMapCtrl',
      resolve: {
        lazy: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [`${interpolationFileName}`],
            cache: true
          });
        }]
      }
    })
    .when('/dashboard/device/loraGateways/monitorMapView', {
      pageName   : 'Dashboard',
      templateUrl: './dashboard/monitor/mapview/monitor2DMapForLoraGW.html',
      controller : 'MonitorLoraGateway2DMapCtrl',
      resolve: {
        lazy: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [`${interpolationFileName}`],
            cache: true
          });
        }]
      }
    })
    .when('/dashboard/mengyang/monitorMapView', {
      pageName   : 'Dashboard',
      templateUrl: './dashboard/monitor/mapview/monitor2DMapForMengyang.html',
      controller : 'MonitorMengyang2DMapCtrl',
      resolve: {
        lazy: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [`${interpolationFileName}`],
            cache: true
          });
        }]
      }
    })
    .when('/leaflet2DView', {
      pageName: '2D View',
      templateUrl: './2Dmap/leaflet2DView.html',
      controller: 'leaflet2DMapCtrl',
      resolve: {
        lazy: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [`${interpolationFileName}`],
            cache: true
          });
        }]
      }
    })
    .when('/localSceneView', {
      pageName: 'Under Ground View',
      templateUrl: './3Dmap/localSceneView/localSceneView.html',
      controller: 'LocalSceneViewCtrl',
      controllerAs: 'vm'
    })
    .when('/', {
      pageName: '3D View',
      templateUrl: './3Dmap/sceneView.html',
      controller: 'SceneViewCtrl',
      controllerAs: 'vm',
      resolve: {
        lazy: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [`${mapFileName}`],
            cache: true
          });
        }]
      }
    })
    .otherwise({
      pageName: '404',
      templateUrl: './_shared/errorTemplate/errorTemplate.html',
      controller: 'ErrorCtrl'
    });
  $locationProvider.html5Mode(true);
};
