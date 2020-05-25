'user strict';

// Require controller
let EditLoraGatewayCtrl  = require('./editDevice/editLoraGateway.controller.js');
let NewLoraGatewayCtrl   = require('./newDevice/newDevice.controller.js');
let LoraGatewayTableCtrl = require('./loraGatewayTable/loraGatewayTable.controller.js');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.loraGateway', [])
    //module service
    //module controller
    .controller('NewLoraGatewayCtrl', ["$scope", "$window", "dashTableConfig", "formValidator", "AccountService",
        "loraDeviceService", "loraGatewayService", "CollectionUtils", "dashboardSharedService",
        NewLoraGatewayCtrl])
    .controller('EditLoraGatewayCtrl',  ["$scope", "$window", "$routeParams", "dashTableConfig", "formValidator",
        "dashboardSharedService", "loraGatewayService", "loraDeviceService",
        EditLoraGatewayCtrl])
    .controller('LoraGatewayTableCtrl', ["$scope", "$rootScope", "$timeout", "$window", "$location", "3D_WebGIS_Angular_ESRI",
        "dashboardConstant", "dashTableConfig", "AccountService", "SidebarService", "CollectionUtils", "dashboardSharedService",
        "DashboardTableSharedService", "loraDeviceService", "loraGatewayService",
        LoraGatewayTableCtrl]);