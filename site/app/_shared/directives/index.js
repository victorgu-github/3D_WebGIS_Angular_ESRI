'use strict';

// Include module

let fa = require('./fontAwesome.directive');
let resizable = require('./resizable.directive');
let ngRightClick = require('./rightClick.directive');
let fileread = require('./inputFile.directive');
let tableResize = require('./dataTableResizer.directive');
let myCurrentTime = require('./myCurrentTime.directive');
let slideFollow = require('./slideFollow.directive');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.shared.directives', [])
  .directive('fa', [fa])
  .directive('ngRightClick', ['$parse', ngRightClick])
  .directive('resizable', [resizable])
  .directive('tableResize', ['$document', '$window', tableResize])
  .directive('fileread', [fileread])
  .directive('myCurrentTime', ['$interval', 'dateFilter', myCurrentTime])
  .directive('slideFollow', ['$timeout', slideFollow]);
