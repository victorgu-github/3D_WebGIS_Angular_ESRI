'use strict';

// Local Scene View Service
let LocalSceneViewService = require('./localSceneView.service');

// Local Scene View Controller
let localSceneViewCtrl = require('./localSceneView.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.localSceneView', [])
  .service('LocalSceneViewService', ['MapLayer3D', 'PipelineLayer', 'LayerActionItem', 'LayerListService',
    '3D_WebGIS_Angular_ESRI', LocalSceneViewService])
  .controller('LocalSceneViewCtrl', ['$q', '$scope', '$rootScope', 'esriLoader', 'LocalSceneViewService',
    'MapLayer3DBuilder', 'AccountService', '3D_WebGIS_Angular_ESRI', localSceneViewCtrl]);