'user strict';

// Include module
let DeviceTableCtrl    = require('./deviceTable.controller.js');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.deviceTable', [])
    .controller('DeviceTableCtrl', ['$scope', '$window', '$location', '$routeParams', 'appConfig', 'dashTableConfig',
        'dataFactory', 'CollectionUtils', 'AccountService', 'SidebarService', 'loraDeviceService', 'loraDevEditValidateService',
        'dashboardSharedService', 'DashboardTableSharedService',
        DeviceTableCtrl]);