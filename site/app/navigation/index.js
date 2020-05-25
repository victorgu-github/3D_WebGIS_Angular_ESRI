'use strict';

// Include module

let NavigationCtrl = require('./navigation.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.navigation', [])
  .controller('NavigationCtrl', ['$scope', '$rootScope', '$window', '$location', '3D_WebGIS_Angular_ESRI', 'AccountService', 'SidebarService',
    'CollectionUtils', 'dashboardSharedService', 'GeneralUserAppSharedService',
    NavigationCtrl]);
