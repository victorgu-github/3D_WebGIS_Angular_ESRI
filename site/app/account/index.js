'use strict';

// Include module

let AccountCtrl          = require('./account.controller');
let AccountService       = require('./account.service');
let SyncSettings         = require('./accountSettings.service');
let ProfileCtrl          = require('./profile/profile.controller.js');
let ProfileForGenUsrCtrl = require('./profile/profileForGenUsr.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.account', [])
  .service('AccountService',          ['$rootScope', '$location', '$window', '$cookies', '$http', '3D_WebGIS_Angular_ESRI', 'appConfig',
    'dashTableConfig', 'HttpResponseHandler', 'CollectionUtils', 'CompanySharedService',
    AccountService])
  .controller('AccountCtrl',          ['$scope', '$rootScope', '$http', '$cookies', '$location', '$translate', '3D_WebGIS_Angular_ESRI',
    'AccountService', 'CollectionUtils',
    AccountCtrl])
  .controller('ProfileCtrl',          ['$scope', '$routeParams', '$window', 'CollectionUtils', 'AccountService',
    ProfileCtrl])
  .controller('ProfileForGenUsrCtrl', ['$scope', '$window', '$routeParams', 'AccountService', 'CompanySharedService', 'CollectionUtils',
    'dashboardSharedService',
    ProfileForGenUsrCtrl
  ])
  .run(['$http', '$cookies', 'AccountService',
    SyncSettings]);
