'user strict';

let EditGeneralUserService = require('./editGeneralUser/editGeneralUser.service.js');
let EditGeneralUserCtrl = require('./editGeneralUser/editGeneralUser.controller.js');
let GeneralUserTableCtrl = require('./generalUserTable/generalUserTable.controller.js');

// Create Angularjs Module
module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.generalUser', [])
    //module service
    .service('EditGeneralUserService',  [
        EditGeneralUserService])
    //module controller
    .controller('EditGeneralUserCtrl',  ['$scope', '$routeParams', '$window', 'dashTableConfig', 'AccountService',
        'dashboardSharedService', 'GeneralUserAppSharedService', 'GeneralUserSharedService', 'DashboardTableSharedService',
        'EditGeneralUserService',
        EditGeneralUserCtrl])
    .controller('GeneralUserTableCtrl', ['$scope', '$window', '$location', 'dashTableConfig', 'dashboardConstant', 'AccountService',
        'SidebarService', 'DashboardTableSharedService', 'dashboardSharedService', 'CompanySharedService', 'GeneralUserSharedService',
        GeneralUserTableCtrl]);