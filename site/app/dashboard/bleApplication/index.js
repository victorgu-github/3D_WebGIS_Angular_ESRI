'user strict';

let BleAppTableCtrl   = require('./bleAppTable/bleAppTable.controller');
let NewBleAppCtrl     = require('./newBleApp/newBleApp.controller');
let EditBleAppCtrl    = require('./editBleApp/editBleApp.controller');
let NewBleNodeCtrl    = require('./editBleApp/newBleNode/newBleNode.controller');
let NewBleNodeService = require('./editBleApp/newBleNode/newBleNode.service');
let EditBleNodeCtrl   = require('./editBleApp/editBleNode/editBleNode.controller');

// Create Angularjs Module
module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.bleApp', [])
    //module service
    .service('NewBleNodeService',    [
        NewBleNodeService])
    //module controller
    .controller('BleAppTableCtrl',   ['$scope', '$window', '$location', 'dashboardConstant', 'dashTableConfig', 'CollectionUtils',
        'AccountService', 'SidebarService', 'DashboardTableSharedService', 'dashboardSharedService', 'BLEApplicationSharedService',
        'BLENodeSharedService',
        BleAppTableCtrl])
    .controller('NewBleAppCtrl',     ['$scope', '$window', 'CollectionUtils', 'AccountService', 'dashboardSharedService',
        'BLEApplicationSharedService',
        NewBleAppCtrl])
    .controller('EditBleAppCtrl',    ['$scope', '$window', '$routeParams', '$location', 'dashboardConstant', 'dashTableConfig', 'AccountService', 
        'dashboardSharedService', 'DashboardTableSharedService', 'BLEApplicationSharedService', 'BLENodeSharedService',
        EditBleAppCtrl])
    .controller('NewBleNodeCtrl',    ["$scope", "$window", "$location", "AccountService", "dashboardSharedService", "BLEApplicationSharedService", 
        "BLENodeSharedService", "NewBleNodeService", "newLoraDeviceService",
        NewBleNodeCtrl])
    .controller('EditBleNodeCtrl',   ["$scope", "$window", "$routeParams", "dashTableConfig", "dashboardSharedService", 
        "BLENodeSharedService", "NewBleNodeService",
        EditBleNodeCtrl]);
    
    