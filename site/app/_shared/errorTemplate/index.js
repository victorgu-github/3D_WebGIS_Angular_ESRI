'use strict';

// Include module
let ErrorCtrl = require("./errorTemplate.controller");

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.error', [])
    .controller('ErrorCtrl', ["$scope", "$location", ErrorCtrl]);