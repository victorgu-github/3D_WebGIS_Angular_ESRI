'use strict';

// Include module
require('../model');

let LayerListService = require('./3Dlayerlist/layerList.service');
let SettingService = require('./setting/setting.service');
let PanelService = require('./panel.service.js');

let _2DLayerListCtrl = require('./2Dlayerlist/2DLayerList.controller');
let BaseMapCtrl = require('./basemap/baseMap.controller');
let HeatMapCtrl = require('./heatmap/heatMap.controller');
let InterpolationCtrl = require('./interpolation/interpolation.controller');
let LayerListCtrl = require('./3Dlayerlist/layerList.controller');
let NodeListCtrl = require('./nodelist/nodeList.controller');
let ScenarioCtrl = require('./scenario/scenario.controller');
let SettingCtrl = require('./setting/setting.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.sidebar.panels', ['3D_WebGIS_Angular_ESRIMap.sidebar.model'])
  .service('LayerListService', ['SceneViewService', LayerListService])
  .service('SettingService', ['LayerActionItem', 'MapLayer', SettingService])
  .service('PanelService', [PanelService])

  .controller('_2DLayerListCtrl', ['$scope', '$rootScope', '$timeout', 'appConfig', 'MapLayer',
    'LayerActionItem', 'Leaflet2DService', _2DLayerListCtrl])
  .controller('BaseMapCtrl', ['$scope', '$rootScope', '$timeout', 'esriLoader', BaseMapCtrl])
  .controller('HeatMapCtrl', ['$scope', '$timeout', '$window', 'Leaflet2DService', HeatMapCtrl])
  .controller('InterpolationCtrl', ['$scope', '$timeout', '$window', 'Leaflet2DService', InterpolationCtrl])
  .controller('LayerListCtrl', ['$scope', '$rootScope', '$timeout', 'appConfig', 'MapLayer',
    'LayerActionItem', 'LayerListService', LayerListCtrl])
  .controller('NodeListCtrl', ['$scope', 'PanelService', NodeListCtrl])
  .controller('ScenarioCtrl', ['$scope', '$rootScope', 'allNodesService', 'esriFeatureLayerService',
    'dataTableService', 'AccountService', 'PanelService', ScenarioCtrl])
  .controller('SettingCtrl', ['$scope', '$rootScope', '$timeout', 'appConfig', 'MapLayer',
    'LayerActionItem', 'SettingService', SettingCtrl]);


