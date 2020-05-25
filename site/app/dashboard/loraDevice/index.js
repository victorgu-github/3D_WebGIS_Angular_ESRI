'use strict';

// Include module
// Require service
let newLoraDeviceService = require('./newDevice/newDevice.service.js');
let countEditService = require('./editDevice/countEdit/countEdit.service.js');
let commandEditService = require('./editDevice/commandEdit/commandEdit.service.js');
let maintainEditService = require('./editDevice/maintanence/maintanence.service.js');
let editSharedService = require('./editDevice/shared/editShared.service.js');
let loraDevEditValidateService = require('./editDevice/shared/loraDevEditValidator.service.js');
let EditLoraDeviceService = require("./editDevice/editLoraDevice.service.js");
// Require controller
let NewDeviceCtrl = require('./newDevice/newDevice.controller.js');
let EditLoraDeviceCtrl = require('./editDevice/editLoraDevice.controller.js');
let CountEditCtrl = require('./editDevice/countEdit/countEdit.controller.js');
let CommandEditCtrl = require('./editDevice/commandEdit/commandEdit.controller.js');
let MaintainEditCtrl = require('./editDevice/maintanence/maintanence.controller.js');
let ZmqPayloadAndChannelHistoryDataCtrl = require('./zmqPayloadAndChannelHistoryData/zmqPayloadAndChannelHistoryData.controller');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.loraDevice', [])
    //module service
    .service('newLoraDeviceService', ["$http", "dashTableConfig", "dashboardSharedService",
        newLoraDeviceService])
    .service('countEditService',           [
        countEditService])
    .service('commandEditService',         [
        commandEditService])
    .service('maintainEditService',        [
        maintainEditService])
    .service('editSharedService',          [
        editSharedService])
    .service('loraDevEditValidateService', [
        loraDevEditValidateService])
    .service('EditLoraDeviceService',      [
        EditLoraDeviceService])
    //module controller
    .controller('NewDeviceCtrl',           ["$scope", "$rootScope", "$window", "appConfig", "dashTableConfig", "formValidator",
        "AccountService", "loraDeviceService", "dashboardSharedService", "newLoraDeviceService",
        NewDeviceCtrl])
    .controller('EditLoraDeviceCtrl',      ["$scope", "$rootScope", "$window", "$routeParams", "dashTableConfig", "formValidator", 
        "AccountService", "loraDeviceService", "dashboardSharedService", "editSharedService", 
        "EditLoraDeviceService",
        EditLoraDeviceCtrl])
    .controller('CountEditCtrl',           ['$scope', '$routeParams', '$window', 'loraDeviceService', 'dashboardSharedService',
        'editSharedService', 'loraDevEditValidateService', 'dashTableConfig',
        CountEditCtrl])
    .controller('CommandEditCtrl',         ['$scope', '$routeParams', '$window', 'loraDeviceService', 'dashboardSharedService',
        'editSharedService', 'loraDevEditValidateService', 'dashTableConfig',
        CommandEditCtrl])
    .controller('MaintainEditCtrl',        ['$scope', '$routeParams', '$window', 'loraDeviceService', 'dashboardSharedService',
        'loraDevEditValidateService', 'editSharedService', 'dashTableConfig',
        MaintainEditCtrl])
    .controller('ZmqPayloadAndChannelHistoryDataCtrl', ['$scope', '$window', '$location', '$routeParams', 'dashTableConfig', 'loraDeviceService',
        'dashboardSharedService', 'DashboardTableSharedService',
        ZmqPayloadAndChannelHistoryDataCtrl
    ]);
