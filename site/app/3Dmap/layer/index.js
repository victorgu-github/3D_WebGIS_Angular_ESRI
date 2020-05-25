'use strict';

// Base map layer
let MapLayer3D = require('./baseLayer/mapLayer3D.service');

// Layer builder
let MapLayer3DBuilder = require('./baseLayer/mapLayer3DBuilder.service');

// Feature layer, dynamic layer and etc.
let PlugBaseFactory = require('./plugbase/plugbaseFactory.service');

let PlugBaseLayer = require('./plugbase/plugbaseLayer.service');
let DetectorLayer = require('./detectorLayer.service');
let PipelineLayer = require('./pipelineLayer.service');
let StreetlampLayer = require('./streetlampLayer.service');
let SmokeDetectorLayer = require('./smokeDetector/smokeDetectorLayer.service');
let ParkinglotLayer = require('./parkinglotLayer.service');
let WindowDoorSensorLayer = require('./windowDoorSensorLayer.service');
let IndoorSegmentLayer = require('./indoorSegmentLayer.service');
let CeilinglightLayer = require('./ceilinglightLayer.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.mapLayer3D', [])
  .service('MapLayer3D', [MapLayer3D])
  .service('MapLayer3DBuilder', ['AccountService', MapLayer3DBuilder])

  .service('PlugBaseFactory', ['PlugBaseLayer', PlugBaseFactory])

  .service('DetectorLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', '3D_WebGIS_Angular_ESRI', DetectorLayer])
  .service('SmokeDetectorLayer', ['$q', '$translate', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', 'PercentageArea', '3D_WebGIS_Angular_ESRI', SmokeDetectorLayer])
  .service('PipelineLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', PipelineLayer])
  .service('StreetlampLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', '3D_WebGIS_Angular_ESRI', StreetlampLayer])
  .service('PlugBaseLayer', ['$q', '$window', '$translate', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', 'MultiAxis', '3D_WebGIS_Angular_ESRI', PlugBaseLayer])
  .service('ParkinglotLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', ParkinglotLayer])
  .service('WindowDoorSensorLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder','3D_WebGIS_Angular_ESRI', WindowDoorSensorLayer])
  .service('IndoorSegmentLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder','3D_WebGIS_Angular_ESRI', IndoorSegmentLayer])
  .service('CeilinglightLayer', ['$q', 'MapLayer3D', 'esriLoader', 'dataFactory', 'AccountService',
    'MapLayer3DBuilder', '3D_WebGIS_Angular_ESRI', CeilinglightLayer]);
