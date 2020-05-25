'user strict';

// Require controller
let EditMengyangService = require('./editMengyang/editMengyang.service');
let NewMengyangCtrl     = require('./newMengyang/newMengyang.controller');
let EditMengyangCtrl    = require('./editMengyang/editMengyang.controller');
let MengyangTableCtrl   = require('./mengyangTable/mengyangTable.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.mengyang', [])
    .service('EditMengyangService',  [
        EditMengyangService])
    .controller('NewMengyangCtrl',   ["$scope", "$window", "$location", "dashTableConfig", "AccountService", "CollectionUtils",
        "dashboardSharedService", "MengyangSharedService", "newLoraDeviceService",
        NewMengyangCtrl])
    .controller('EditMengyangCtrl',  ["$scope", "$window", "$location", "$routeParams", "dashTableConfig", "AccountService", "CollectionUtils",
        "dashboardSharedService", "MengyangSharedService", "newLoraDeviceService", "EditMengyangService",
        EditMengyangCtrl])
    .controller('MengyangTableCtrl', ["$scope", "$window", "$location", "dashboardConstant", "dashTableConfig", "CollectionUtils",
        "AccountService", "SidebarService", "DashboardTableSharedService", "dashboardSharedService", "MengyangSharedService", 
        "EditMengyangService",
        MengyangTableCtrl]);