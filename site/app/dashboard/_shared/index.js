'use strict';

// Include module
let dashboardSharedService      = require('./dashboardShared.service');
let GeneralUserAppSharedService = require('./generalUserAppShared.service.js');
let GeneralUserSharedService    = require('./generalUserShared.service');
let MulticastGroupSharedService = require('./multicastGroupShared.service');
let CompanySharedService        = require('./companyShared.service');
let DashboardTableSharedService = require('./dashboardTableShared.service');
let BLEApplicationSharedService = require('./bleApplicationShared.service');
let BLENodeSharedService        = require('./bleNodeShared.service');
let MengyangSharedService       = require('./mengyangShared.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.shared', [])
  .service('dashboardSharedService',      ['$window', '$location', '3D_WebGIS_Angular_ESRI', 'dashTableConfig', 'formValidator', 'AccountService',
    'DashboardTableSharedService', "MulticastGroupSharedService",
    dashboardSharedService])
  .service('DashboardTableSharedService', ['dashTableConfig', 'formValidator',
    DashboardTableSharedService
  ])
  .service('GeneralUserAppSharedService', ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig',
    'CollectionUtils', 'HttpResponseHandler',
    GeneralUserAppSharedService])
  .service('GeneralUserSharedService',    ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig',
    'CollectionUtils', 'HttpResponseHandler',
    GeneralUserSharedService
  ])
  .service('MulticastGroupSharedService', ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig', 'CollectionUtils',
    'HttpResponseHandler',
    MulticastGroupSharedService])
  .service('BLEApplicationSharedService', ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig', 'CollectionUtils',
    'HttpResponseHandler',
    BLEApplicationSharedService])
  .service('BLENodeSharedService',        ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig', 'CollectionUtils',
    'HttpResponseHandler',
    BLENodeSharedService])
  .service('CompanySharedService',        ['$q', '$http', 'appConfig', 'dashTableConfig', 'HttpResponseHandler',
    CompanySharedService
  ])
  .service('MengyangSharedService',       ['$q', '$http', '$routeParams', 'appConfig', 'dashTableConfig', 'CollectionUtils', 'HttpResponseHandler',
    MengyangSharedService
  ]);

