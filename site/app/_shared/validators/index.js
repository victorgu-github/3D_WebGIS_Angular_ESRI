'use strict';

// Include module

let formValidator = require('./formValidator.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.shared.validators', [])
  .service('formValidator', [formValidator]);
