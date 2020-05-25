'use strict';

// Include module
require('./tabs');

let contextMenuService = require('./contextMenu.service');
let dataTableService = require('./dataTable.service');

let DataTableCtrl = require('./dataTable.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dataTable', ['3D_WebGIS_Angular_ESRIMap.dataTable.tabs'])
  .service('dataTableService', ['layerFactory', 'allNodesService', 'esriFeatureLayerService', 'appConfig',
    'SceneViewService', 'PlugBaseLayer', '3D_WebGIS_Angular_ESRI', dataTableService])
  .service('contextMenuService', ['$translate', 'dataTableService', 'CollectionUtils', contextMenuService])

  .controller('DataTableCtrl', ['$q', '$scope', '$rootScope', 'appConfig', 'dataTableService', 'contextMenuService', DataTableCtrl]);
