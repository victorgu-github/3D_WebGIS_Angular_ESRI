'use strict';

// Include module
require('./panels');
require('./model');

let SidebarService = require('./sidebar.service');

let SidebarCtrl = require('./sidebar.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.sidebar', ['3D_WebGIS_Angular_ESRIMap.sidebar.panels', '3D_WebGIS_Angular_ESRIMap.sidebar.model'])
  .service('SidebarService', ['$rootScope', 'PanelItem', 'LinkItem', '3D_WebGIS_Angular_ESRI', 'AccountService', 'CollectionUtils',
    'leaflet2DConfig',
    SidebarService])
  .controller('SidebarCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'SidebarService', 'PageNameService', 'AccountService',
    SidebarCtrl]);