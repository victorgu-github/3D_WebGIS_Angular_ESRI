'use strict';

// Include module
require('./datatable');

let dataFactory2D = require('./dataFactory.service');
let Leaflet2DService = require('./leaflet2D.service');
let leaflet2DMapCtrl = require('./leaflet2DMap.controller');
let MapLayer2D = require('./layer/mapLayer2D.service');
let MapLayer2DBuilder = require('./layer/mapLayer2DBuilder.service');
let HeatLayer = require('./heatLayer/heatLayer.service.js');
let GateWayHeatLayer = require('./heatLayer/gatewayHeatLayer.service');
let Popup2DService = require('./popup/popup2D.service');

// Interpolation layer
let InterpolationLayer = require('./interpolationLayer/interpolationLayer.service');
let GatewayInterpolationLayer = require('./interpolationLayer/gatewayInterpolation.service');

let FakeLayer = require('./interpolationLayer/fakeLayer.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.2Dmap', ['3D_WebGIS_Angular_ESRIMap.2Dmap.datatable'])
  .service('dataFactory2D', ['$q', '$compile', '$http', 'appConfig', 'HttpResponseHandler', dataFactory2D])
  .service('Leaflet2DService', ['$q', '$http', '$cookies', 'MapLayer2DBuilder', 'dataFactory2D', 'dataFactory', 'GateWayHeatLayer',
    'GatewayInterpolationLayer', 'FakeLayer', 'Popup2DService', 'AccountService', 'CollectionUtils', '3D_WebGIS_Angular_ESRI', Leaflet2DService])
  .service('MapLayer2D', ['Popup2DService', MapLayer2D])
  .service('MapLayer2DBuilder', ['MapLayer2D', MapLayer2DBuilder])
  .service('HeatLayer', [HeatLayer])
  .service('GateWayHeatLayer', ['$rootScope', 'HeatLayer', 'dataFactory2D', GateWayHeatLayer])
  .service('InterpolationLayer', [InterpolationLayer])
  .service('GatewayInterpolationLayer', ['$rootScope', 'InterpolationLayer', 'dataFactory2D', GatewayInterpolationLayer])
  .service('FakeLayer', ['$rootScope', 'InterpolationLayer', FakeLayer])
  .service('Popup2DService', [Popup2DService])

  .controller('leaflet2DMapCtrl', ['$q', '$scope', '$rootScope', '$timeout', '$routeParams', 'leaflet2DConfig',
    'timerService', 'PageNameService', 'dataFactory2D', 'Leaflet2DService', 'AccountService', 'CollectionUtils', leaflet2DMapCtrl]);
