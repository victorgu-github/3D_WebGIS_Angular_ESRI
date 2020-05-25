'use strict';

// Include module

let BasicBar = require('./basicBar.service');
let Gauge = require('./gauge.service');
let LabelLine = require('./labelLine.service');
let PieChart = require('./pieChart.service');
let SolidGauge = require('./solidGauge.service');
let MultiAxis = require('./multiAxis.service');
let MultiAxisForMonitor = require('./multiAxisForMonitor.service');
let HistoryChart = require('./historyChart.service');
let SplineChart = require('./splineChart.service');
let PercentageArea = require('./percentageArea.service');
let SemiCircle = require('./semiCircle.service');
let AreaSpline = require('./areaSpline.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.shared.highcharts', [])
  .service('BasicBar', [BasicBar])
  .service('LabelLine', [LabelLine])
  .service('PieChart', [PieChart])
  .service('MultiAxis', ['$translate', MultiAxis])
  .service('MultiAxisForMonitor', [MultiAxisForMonitor])
  .service('HistoryChart', [HistoryChart])
  .service('SolidGauge', [SolidGauge])
  .service('SplineChart', [SplineChart])
  .service('PercentageArea', [PercentageArea])
  .service('Gauge', [Gauge])
  .service('SemiCircle', [SemiCircle])
  .service('AreaSpline', [AreaSpline]);
