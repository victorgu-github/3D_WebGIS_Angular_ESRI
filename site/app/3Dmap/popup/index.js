'use strict';

// Include module

let layerFactory = require('./layerFactory.factory');

let DefaultPopupService = require('./defaultPopup.service');
let GatewayPopupService = require('./gatewayPopup.service');
let StreetlampPopupService = require('./streetlampPopup.service');
let SceneViewPopupService = require('./sceneViewPopup.service');
let DetectorPopupService = require('./detectorPopup.service.js');
let PlugBasePopupService = require('./plugbasePopup.service.js');
let WaterSensorPopupService = require('./waterSensorPopup.service');
let WaterTankPopupService = require('./waterTankPopup.service');
let CeilingLightPopupService = require('./ceilingLightPopup.service');
let LoraGatewayPopupService = require('./loraGatewayPopup.service');
let SmokeDetectorPopupService = require('./smokeDetectorPopup.service');
let RealTimePopupService = require('./realtimePopup.service');
let Power3DPopupService = require('./power3DPopup.service');
let WinDoorSensorPopupService = require('./winDoorSensorPopup.service');

let Popup3DService = require('./service/popup3D.service');
let DataTablePopupWrapper = require('./service/dataTablePopupWrapper.service');
let MapClickPopupWrapper = require('./service/mapClickPopupWrapper.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.3Dmap.popup', [])
  .factory('layerFactory', ['esriLoader', 'AccountService', 'SceneViewService', 'Popup3DService', '3D_WebGIS_Angular_ESRI', layerFactory])

  // Popup layer service manager
  .service('Popup3DService', ['PlugBasePopupService', 'DetectorPopupService', 'SceneViewPopupService',
    'DefaultPopupService', 'StreetlampPopupService', 'WaterSensorPopupService', 'WaterTankPopupService', 'CeilingLightPopupService',
    'LoraGatewayPopupService', 'SmokeDetectorPopupService', 'RealTimePopupService', 'GatewayPopupService', 'Power3DPopupService','WinDoorSensorPopupService',
    'DataTablePopupWrapper', 'MapClickPopupWrapper', '3D_WebGIS_Angular_ESRI', Popup3DService])
  .service('DataTablePopupWrapper', [DataTablePopupWrapper])
  .service('MapClickPopupWrapper', [MapClickPopupWrapper])

  .service('PlugBasePopupService', ['$translate', 'sceneViewDataService', 'dataFactory', 'PlugBaseLayer', 'CollectionUtils',
    'AccountService', PlugBasePopupService])
  .service('DetectorPopupService', ['$translate', 'CollectionUtils', DetectorPopupService])
  .service('SceneViewPopupService', ['$translate', 'esriLoader', SceneViewPopupService])
  .service('DefaultPopupService', ['CollectionUtils', DefaultPopupService])
  .service('StreetlampPopupService', ['$translate', 'CollectionUtils', StreetlampPopupService])
  .service('WaterSensorPopupService', ['$translate', 'CollectionUtils', WaterSensorPopupService])
  .service('WaterTankPopupService', ['$translate', 'CollectionUtils', WaterTankPopupService])
  .service('CeilingLightPopupService', ['$translate', 'dataFactory','CollectionUtils', CeilingLightPopupService])
  .service('LoraGatewayPopupService', ['$translate', 'CollectionUtils', LoraGatewayPopupService])
  .service('SmokeDetectorPopupService', ['$translate', 'CollectionUtils', SmokeDetectorPopupService])
  .service('RealTimePopupService', ['$translate', RealTimePopupService])
  .service('Power3DPopupService', ['CollectionUtils', Power3DPopupService])
  .service('WinDoorSensorPopupService', ['$translate', 'CollectionUtils', WinDoorSensorPopupService])
  .service('GatewayPopupService', ['$translate', 'dataFactory', 'CollectionUtils', GatewayPopupService]);
