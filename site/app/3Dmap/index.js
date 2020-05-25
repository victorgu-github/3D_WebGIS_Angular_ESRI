'use strict';

// Include module
require('./popup');
require('./datatable');
require('./layer');
require('./localSceneView');

let sceneViewDataService = require('./sceneViewData.service');
let SceneViewService = require('./sceneView.service');
let SceneViewCtrl = require('./sceneView.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.3Dmap', ['3D_WebGIS_Angular_ESRIMap.3Dmap.popup', '3D_WebGIS_Angular_ESRIMap.mapLayer3D', '3D_WebGIS_Angular_ESRIMap.dataTable',
    '3D_WebGIS_Angular_ESRIMap.localSceneView'])
  .service('sceneViewDataService', ['$q', 'esriLoader', sceneViewDataService])
  .service('SceneViewService', ['$cookies', 'esriLoader', 'AccountService', 'LayerActionItem', 'DetectorLayer',
    'StreetlampLayer', 'MapLayer', 'PlugBaseFactory', 'SmokeDetectorLayer', 'ParkinglotLayer','WindowDoorSensorLayer','IndoorSegmentLayer',
    'PlugBaseLayer', 'CeilinglightLayer', '3D_WebGIS_Angular_ESRI', SceneViewService])
  .controller('SceneViewCtrl', ['$scope', '$rootScope', '$translate', 'esriLoader', 'timerService', 'browserDetectionService',
    'SceneViewService', 'layerFactory', 'nodeListFactory', 'widgetFactory', 'externalRenderFactory',
    'dataFactory', 'AccountService', 'CollectionUtils', 'Popup3DService', '3D_WebGIS_Angular_ESRI', SceneViewCtrl]);
