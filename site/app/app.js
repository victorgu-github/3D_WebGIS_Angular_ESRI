// import CSS
require('./styles');

// Lazy load module
require('oclazyload');

// Make sure account module is the first module to load because of other modules depend on account userInfo
require('./account');
require('./config');

require('./languages');
require('./sidebar');
require('./dashboard');
require('./navigation');
require('./2Dmap');
require('./3Dmap');
require('./_shared');
require('./interceptors');

let routes = require('./routes');
let hook = require('./hook');
let idle = require('./idle');
let translate = require('./translate');

// Put dependencies and third-party modules/libraries here
angular.module('3D_WebGIS_Angular_ESRIMap.thirdParties', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ngCookies', 'esri.map',
  'anguFixedHeaderTable', 'ui.bootstrap', 'ui.bootstrap.contextMenu', 'ui.select', 'pageslide-directive',
  'rzModule', 'ui.tree', 'multiStepForm', 'ngIdle', 'pascalprecht.translate', 'nzToggle', 'ui.toggle',
  'dndLists', 'oc.lazyLoad', 'btorfs.multiselect']);

let 3D_WebGIS_Angular_ESRI = angular.module('3D_WebGIS_Angular_ESRIMap', ['3D_WebGIS_Angular_ESRIMap.httpFilter', '3D_WebGIS_Angular_ESRIMap.constants', '3D_WebGIS_Angular_ESRIMap.languages', '3D_WebGIS_Angular_ESRIMap.sidebar',
    '3D_WebGIS_Angular_ESRIMap.dataTable', '3D_WebGIS_Angular_ESRIMap.dashboard', '3D_WebGIS_Angular_ESRIMap.account', '3D_WebGIS_Angular_ESRIMap.navigation', '3D_WebGIS_Angular_ESRIMap.2Dmap',
    '3D_WebGIS_Angular_ESRIMap.3Dmap', '3D_WebGIS_Angular_ESRIMap.shared', '3D_WebGIS_Angular_ESRIMap.thirdParties']);

3D_WebGIS_Angular_ESRI.config(['$locationProvider', '$routeProvider', 'dashTableConfig', routes])
  .config(['IdleProvider', idle])
  .config(['$translateProvider', translate])
  .run(['$rootScope', '$location', '$cookies', '$route', '$window', 'Idle', 'PageNameService', hook]);

module.exports = 3D_WebGIS_Angular_ESRI;
