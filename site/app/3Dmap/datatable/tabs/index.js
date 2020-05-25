'use strict';

// Include module

let allNodesService = require('./allNodes.service');
let esriFeatureLayerService = require('./esriFeatureLayer.service');
let TabTable = require('./tabTable.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dataTable.tabs', [])
  .service('TabTable', [TabTable])
  .service('esriFeatureLayerService', ['dataFactory', 'nodeServerParser', 'TabTable', 'esriLoader',
    'AccountService', esriFeatureLayerService])
  .service('allNodesService', ['dataFactory', 'AccountService', 'nodeServerParser', 'TabTable', allNodesService]);
