'use strict';

// Include module
require('./_shared');
require('./loraDevice');
require('./loraGateway');
require('./monitor');
require('./deviceTable');
require('./generalUserApp');
require('./generalUser');
require('./multicastGroup');
require('./bleApplication');
require('./mengyang');

let DashboardCtrl          = require('./dashboard.controller');
let DashboardForGenUsrCtrl = require('./dashboardForGenUsr.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard', ['3D_WebGIS_Angular_ESRIMap.dashboard.shared', '3D_WebGIS_Angular_ESRIMap.dashboard.loraDevice',
  '3D_WebGIS_Angular_ESRIMap.dashboard.loraGateway', '3D_WebGIS_Angular_ESRIMap.dashboard.mengyang', '3D_WebGIS_Angular_ESRIMap.dashboard.monitor', 
  '3D_WebGIS_Angular_ESRIMap.dashboard.deviceTable', '3D_WebGIS_Angular_ESRIMap.dashboard.generalUserApp', '3D_WebGIS_Angular_ESRIMap.dashboard.generalUser', 
  '3D_WebGIS_Angular_ESRIMap.shared.validators', '3D_WebGIS_Angular_ESRIMap.dashboard.multicastGroup', '3D_WebGIS_Angular_ESRIMap.dashboard.bleApp'])
  .controller('DashboardCtrl',          ['$scope', '$routeParams', '$window', '$location', 'dashboardConstant', 'dashTableConfig', '3D_WebGIS_Angular_ESRI',
    'CollectionUtils', 'AccountService', 'dataFactory', 'loraDeviceService', 'loraGatewayService', 'dashboardSharedService',
    'GeneralUserAppSharedService', 'CompanySharedService', 'GeneralUserSharedService', 'MulticastGroupSharedService',
    'BLEApplicationSharedService', 'MengyangSharedService',
    DashboardCtrl])
  .controller('DashboardForGenUsrCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'dashboardConstant', 'dashTableConfig',
    'AccountService', 'SidebarService', 'CollectionUtils', 'loraGatewayService', 'dashboardSharedService', 'GeneralUserAppSharedService',
    'GeneralUserSharedService', 'BLEApplicationSharedService', 'MengyangSharedService',
    DashboardForGenUsrCtrl]);
