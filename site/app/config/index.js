'use strict';

// import configs based on env
let env = process.env.NODE_ENV === 'prod' ? 'prod' : 'dev';

let appConfig                 = require(`./${env}/appConfig.${env}`);
let dashTableConfig           = require(`./${env}/dashTableConfig.${env}`);
let dashboardConstant         = require(`./${env}/dashboardConstant.${env}`);
let leaflet2DConfig           = require(`./${env}/leaflet2DConfig.${env}`);
let fakeDataForMonitorSummary = require(`./${env}/fakeDataForMonitorSummary.${env}`);
let monitor2DMapConfig        = require(`./${env}/monitor2DMapConfig.${env}`);

// Please put all constants into this file.
let 3D_WebGIS_Angular_ESRI           = require('./3D_WebGIS_Angular_ESRI.constant.js');
let 3D_WebGIS_Angular_ESRI_LAYER_URL = require('./3D_WebGIS_Angular_ESRI.layer.url.js');

// Scenarios config
let scenarioConfig1 = require(`./${env}/scenarioConfigFiles/scenario1.config`);
let scenarioConfig2 = require(`./${env}/scenarioConfigFiles/scenario2.config`);
let scenarioConfig3 = require(`./${env}/scenarioConfigFiles/scenario3.config`);
let scenarioConfig4 = require(`./${env}/scenarioConfigFiles/scenario4.config`);
let scenarioConfig5 = require(`./${env}/scenarioConfigFiles/scenario5.config`);
let scenarioConfig6 = require(`./${env}/scenarioConfigFiles/scenario6.config`);
let scenarioConfig7 = require(`./${env}/scenarioConfigFiles/scenario7.config`);
let scenarioConfig8 = require(`./${env}/scenarioConfigFiles/scenario8.config`);

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.constants', [])
  .constant('3D_WebGIS_Angular_ESRI', 3D_WebGIS_Angular_ESRI)
  .constant('3D_WebGIS_Angular_ESRI_LAYER_URL', 3D_WebGIS_Angular_ESRI_LAYER_URL)
  .constant('dashTableConfig', dashTableConfig)
  .constant('fakeDataForMonitorSummary', fakeDataForMonitorSummary)
  .constant('monitor2DMapConfig', monitor2DMapConfig)
  .constant('dashboardConstant', dashboardConstant)

  .service('appConfig', ['$injector',
    appConfig])
  .service('leaflet2DConfig', ['3D_WebGIS_Angular_ESRI', '3D_WebGIS_Angular_ESRI_LAYER_URL',
    leaflet2DConfig])
  //scenarios config service for dev and prod
  .service('scenarioConfig1', ['3D_WebGIS_Angular_ESRI', '3D_WebGIS_Angular_ESRI_LAYER_URL',
    scenarioConfig1])
  .service('scenarioConfig2', ['3D_WebGIS_Angular_ESRI',
    scenarioConfig2])
  .service('scenarioConfig3', ['3D_WebGIS_Angular_ESRI', '3D_WebGIS_Angular_ESRI_LAYER_URL',
    scenarioConfig3])
  .service('scenarioConfig4', ['3D_WebGIS_Angular_ESRI',
    scenarioConfig4])
  .service('scenarioConfig5', ['3D_WebGIS_Angular_ESRI',
    scenarioConfig5])
  .service('scenarioConfig6', ['3D_WebGIS_Angular_ESRI',
    scenarioConfig6])
  .service('scenarioConfig7', ['3D_WebGIS_Angular_ESRI', '3D_WebGIS_Angular_ESRI_LAYER_URL',
    scenarioConfig7])
  .service('scenarioConfig8', ['3D_WebGIS_Angular_ESRI',
    scenarioConfig8]);