'use strict';

// Include module
require('./directives');
require('./validators');
require('./highcharts');
require('./shared');
require('./errorTemplate');

let AlertController = require('./alert.controller');
let chartCtrl = require('./chart.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.shared', ['3D_WebGIS_Angular_ESRIMap.shared.directives', '3D_WebGIS_Angular_ESRIMap.shared.highcharts',
    '3D_WebGIS_Angular_ESRIMap.shared.services', '3D_WebGIS_Angular_ESRIMap.error'])
  .controller('chartCtrl', ['$q', '$scope', '$window', '$translate', 'dataFactory', 'AccountService', 'LabelLine',
    'MultiAxis', 'SmokeDetectorLayer', 'PlugBaseLayer', '3D_WebGIS_Angular_ESRI', chartCtrl])
  .controller('AlertController', ['$scope', AlertController]);
