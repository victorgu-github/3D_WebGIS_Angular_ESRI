'use strict';

// Include module

let LanguageCtrl = require('./language.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.languages', [])
  .controller('LanguageCtrl', ['$scope', '$translate', 'appConfig', LanguageCtrl]);
