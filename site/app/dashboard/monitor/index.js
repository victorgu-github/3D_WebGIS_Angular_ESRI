'user strict';

// Include module
// Require service
let monitorLoraDeviceSummaryService   = require('./summary/monitorSummary.service.js');
let monitorLoraDeviceDatatableService = require('./datatable/monitorDatatable.service.js');
let Monitor2DMapDatatableService      = require('./mapview/monitorMapDatatable/monitorMapDatatable.service');
let Monitor2DMapSharedService         = require('./mapview/monitor2DMapShared.service.js');
// Require controller
let MonitorLoraDeviceSummaryCtrl      = require('./summary/monitorSummary.controller.js');
let MonitorLoraDeviceDatatableCtrl    = require('./datatable/monitorDatatable.controller.js');
let MonitorLoraDevice2DMapCtrl        = require('./mapview/monitor2DMap.controller.js');
let MonitorLoraGateway2DMapCtrl       = require('./mapview/monitor2DMapForLoraGW.controller.js');
let Monitor2DMapDatatableCtrl         = require('./mapview/monitorMapDatatable/monitorMapDatatable.controller');
let MonitorMengyang2DMapCtrl          = require('./mapview/monitor2DMapForMengyang.controller.js');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.monitor', [])
    //module service
    .service('monitorLoraDeviceSummaryService',   ["$http", "appConfig", "dashTableConfig", "CollectionUtils", "PieChart",
        "MultiAxisForMonitor", "HistoryChart", "HttpResponseHandler", "Gauge", "fakeDataForMonitorSummary",
        monitorLoraDeviceSummaryService])
    .service('monitorLoraDeviceDatatableService', ["dashTableConfig",
        monitorLoraDeviceDatatableService])
    .service('Monitor2DMapDatatableService',      ["monitor2DMapConfig",
        Monitor2DMapDatatableService])
    .service('Monitor2DMapSharedService',         ["$q", "$cookies", "CollectionUtils", "SemiCircle","appConfig",
        Monitor2DMapSharedService])
    //module controller
    .controller('MonitorLoraDeviceSummaryCtrl',   ["$scope", "$timeout", "$window", "$log", "$routeParams",
        "monitorLoraDeviceSummaryService", "dashTableConfig", "loraDeviceService", "AccountService",
        "loraDeviceService",
        MonitorLoraDeviceSummaryCtrl])
    .controller('MonitorLoraDeviceDatatableCtrl', ["$scope", "$timeout", "$window", "$log", "$routeParams", "dashTableConfig",
        "monitorLoraDeviceDatatableService", "AccountService", "loraDeviceService", "dashboardSharedService",
        MonitorLoraDeviceDatatableCtrl])
    .controller('MonitorLoraDevice2DMapCtrl',     ["monitor2DMapConfig", "AccountService", "CollectionUtils",
        "Monitor2DMapSharedService",
        MonitorLoraDevice2DMapCtrl])
    .controller('MonitorLoraGateway2DMapCtrl',    ['$scope', 'appConfig' , 'monitor2DMapConfig', 'CollectionUtils', 'AccountService' , 'loraGatewayService',
        'dashboardSharedService', 'Monitor2DMapSharedService', 'Monitor2DMapDatatableService',
        MonitorLoraGateway2DMapCtrl])
    .controller('Monitor2DMapDatatableCtrl',      ["$scope", "3D_WebGIS_Angular_ESRI", "monitor2DMapConfig", "CollectionUtils", "ContextMenu2DService",
        "Popup2DService", "Monitor2DMapDatatableService",
        Monitor2DMapDatatableCtrl])
    .controller('MonitorMengyang2DMapCtrl',       ['$scope', '$rootScope', '$translate', 'monitor2DMapConfig', 'CollectionUtils', 'AccountService', 'AreaSpline', 
        'Monitor2DMapSharedService',
        MonitorMengyang2DMapCtrl]);