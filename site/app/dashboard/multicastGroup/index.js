'user strict';
// Require service
let MulticastGroupTableService = require('./multicastGroupTable/multicastGroupTable.service.js');
// Require controller
let MulticastGroupTableCtrl    = require('./multicastGroupTable/multicastGroupTable.controller.js');
let NewMulticastGroupCtrl      = require('./newMulticastGroup/newMulticastGroup.controller.js');
let EditMulticastGroupCtrl     = require('./editMulticastGroup/editMulticastGroup.controller.js');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.multicastGroup', [])
    //module service
    .service('MulticastGroupTableService', [
        MulticastGroupTableService])
    //module controller
    .controller('NewMulticastGroupCtrl',   ["$scope", "$routeParams", "$timeout", "$window", "formValidator", "appConfig",
        "dashTableConfig", "AccountService", "loraDeviceService", "dashboardSharedService", "MulticastGroupSharedService",
        NewMulticastGroupCtrl])
    .controller('EditMulticastGroupCtrl',  ["$scope", "$window", "$routeParams", "dashTableConfig", "dashboardSharedService",
        "MulticastGroupSharedService",
        EditMulticastGroupCtrl])
    .controller('MulticastGroupTableCtrl', ['$scope', '$window', '$location', 'dashTableConfig', 'dashboardConstant', 'AccountService',
        'SidebarService', 'loraDeviceService', 'DashboardTableSharedService', 'dashboardSharedService', 'MulticastGroupSharedService',
        'MulticastGroupTableService',
        MulticastGroupTableCtrl]);