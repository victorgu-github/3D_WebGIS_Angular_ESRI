'use strict';

// Include module

let browserDetectionService = require('./browserDetection.service');
let CollectionUtils = require('./collectionUtils.service');
let dataFactory = require('./dataFactory.service');
let externalRenderFactory = require('./externalRenderFactory.service');
let loraDeviceService = require('./loraDevice.service');
let loraGatewayService = require('./loraGateway.service');
let nodeListFactory = require('./nodeList.factory');
let nodeServerParser = require('./nodeServerParser.service');
let pathService = require('./path.service');
let timerService = require('./timer.service');
let PageNameService = require('./pageName.service');
let widgetFactory = require('./widget.factory');
let HttpResponseHandler = require('./httpResponseHandler.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.shared.services', ['esri.core'])
  .factory('nodeListFactory', ['dataFactory', nodeListFactory])
  .factory('widgetFactory', ['esriLoader', 'appConfig', 'AccountService', widgetFactory])

  .service('pathService', [
    pathService])
  .service('CollectionUtils', ["$cookies", "3D_WebGIS_Angular_ESRI", "formValidator",
    CollectionUtils])
  .service('nodeServerParser', ['3D_WebGIS_Angular_ESRI',
    nodeServerParser])
  .service('PageNameService', [
    PageNameService])
  .service('HttpResponseHandler', [
    HttpResponseHandler])
  .service('browserDetectionService', [
    browserDetectionService])
  .service('timerService', ['dataFactory', 'sceneViewDataService',
    timerService])
  .service('dataFactory', ['$q', '$compile', '$http', 'appConfig', 'dashTableConfig', 'HttpResponseHandler', 'AccountService',
    dataFactory])
  .service('loraDeviceService', ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig', 'CollectionUtils',
    'HttpResponseHandler',
    loraDeviceService])
  .service('loraGatewayService', ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig', 'CollectionUtils',
    'HttpResponseHandler',
    loraGatewayService])
  .service('externalRenderFactory', [
    externalRenderFactory]);
