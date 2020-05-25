'use strict';

// Include module

let ContextMenu2DService = require('./contextMenu2D.service.js');
let DataTable2DService = require('./dataTable2D.service.js');
let DataTable2DCtrl = require('./dataTable2D.controller.js');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.2Dmap.datatable', [])
  .service('DataTable2DService', ['Leaflet2DService', 'leaflet2DConfig', '3D_WebGIS_Angular_ESRI', DataTable2DService])
  .service('ContextMenu2DService', ['$translate', 'DataTable2DService', ContextMenu2DService])

  .controller('DataTable2DCtrl', ['$q', '$scope', '$rootScope', 'DataTable2DService',
    'ContextMenu2DService', 'Leaflet2DService', 'Popup2DService', '3D_WebGIS_Angular_ESRI', DataTable2DCtrl]);
