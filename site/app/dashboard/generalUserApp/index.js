'user strict';

// Require service
let NewGeneralUserAppService =            require('./newGeneralUserApp/newGeneralUserApp.service.js');
let EditGeneralUserAppService =           require('./editGeneralUserApp/editGeneralUserApp.service.js');
let EditGeneralUserAppForGenUsrService =  require('./editGeneralUserAppForGenUsr/editGeneralUserAppForGenUsr.service.js');
// Require controller
let NewGeneralUserAppCtrl =               require('./newGeneralUserApp/newGeneralUserApp.controller.js');
let GeneralUserAppTableCtrl =             require('./generalUserAppTable/generalUserAppTable.controller.js');
let EditGeneralUserAppCtrl =              require('./editGeneralUserApp/editGeneralUserApp.controller.js');
let GeneralUserAppTableForGenUsrCtrl =    require('./generalUserAppTableForGenUsr/generalUserAppTableForGenUsr.controller.js');
let ShowGeneralUserAppForGenUsrCtrl =     require('./showGeneralUserAppForGenUsr/showGeneralUserAppForGenUsr.controller.js');
let NewGeneralUserAppCtrlForGenUsr =      require('./newGeneralUserAppForGenUsr/newGeneralUserAppForGenUsr.controller.js');
let EditGeneralUserAppForGenUsrCtrl =     require('./editGeneralUserAppForGenUsr/editGeneralUserAppForGenUsr.controller.js');
let NewLoraDevForGenUsrAppCtrl =          require('./editGeneralUserAppForGenUsr/newLoraDevForGenUsrApp/newLoraDevForGenUsrApp.controller');
let EditLoraDevForGenUsrAppCtrl =         require('./editGeneralUserAppForGenUsr/editLoraDevForGenUsrApp/editLoraDevice.controller');
let EditLoraDevCountForGenUsrAppCtrl =    require('./editGeneralUserAppForGenUsr/editLoraDevForGenUsrApp/countEdit/countEdit.controller');
let EditLoraDevCommandForGenUsrAppCtrl =  require('./editGeneralUserAppForGenUsr/editLoraDevForGenUsrApp/commandEdit/commandEdit.controller');
let EditLoraDevMTForGenUsrAppCtrl =       require('./editGeneralUserAppForGenUsr/editLoraDevForGenUsrApp/maintanence/maintanence.controller');

// Create Angularjs Module
module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.dashboard.generalUserApp', [])
    //module service
    .service('NewGeneralUserAppService',            [
        NewGeneralUserAppService])
    .service('EditGeneralUserAppService',           ["CollectionUtils",
        EditGeneralUserAppService])
    .service('EditGeneralUserAppForGenUsrService',  ["CollectionUtils",
        EditGeneralUserAppForGenUsrService
    ])
    //module controller
    .controller('NewGeneralUserAppCtrl',            ["$scope", "$window", "3D_WebGIS_Angular_ESRI", "dashTableConfig", "dashboardConstant", "AccountService", "loraDeviceService",
        "dashboardSharedService", "DashboardTableSharedService", "GeneralUserAppSharedService", "BLEApplicationSharedService",
        "BLENodeSharedService", "NewGeneralUserAppService", "EditGeneralUserAppService",
        NewGeneralUserAppCtrl])
    .controller('GeneralUserAppTableCtrl',          ["$scope", "$window", "$location", "dashTableConfig", "dashboardConstant", "AccountService",
        "SidebarService", "DashboardTableSharedService", "dashboardSharedService", "GeneralUserAppSharedService",
        GeneralUserAppTableCtrl])
    .controller('EditGeneralUserAppCtrl',           ["$scope", "$window", "$routeParams", "dashTableConfig", "dashboardConstant", "AccountService",
        "loraDeviceService", "dashboardSharedService", "DashboardTableSharedService", "GeneralUserAppSharedService",
        "BLEApplicationSharedService", "BLENodeSharedService", "EditGeneralUserAppService", "NewGeneralUserAppService",
        EditGeneralUserAppCtrl])
    .controller('GeneralUserAppTableForGenUsrCtrl', ["$scope", "$window", "$location", "3D_WebGIS_Angular_ESRI", "dashTableConfig", "dashboardConstant",
        "AccountService", "CollectionUtils", "loraDeviceService", "DashboardTableSharedService", "dashboardSharedService", "GeneralUserSharedService", 
        "GeneralUserAppSharedService", "SidebarService",
        GeneralUserAppTableForGenUsrCtrl])
    .controller('ShowGeneralUserAppForGenUsrCtrl',  ["$scope", "$window", "$routeParams", "dashTableConfig", "dashboardConstant", "AccountService",
        "loraDeviceService", "DashboardTableSharedService", "dashboardSharedService", "GeneralUserAppSharedService", "BLENodeSharedService",
        "BLEApplicationSharedService", "EditGeneralUserAppService", "NewGeneralUserAppService", "SidebarService",
        ShowGeneralUserAppForGenUsrCtrl])
    .controller('NewGeneralUserAppCtrlForGenUsr',   ["$scope", "$rootScope", "$window", "$location", "AccountService", "CollectionUtils", "dashboardSharedService",
        "GeneralUserAppSharedService", "GeneralUserSharedService",
        NewGeneralUserAppCtrlForGenUsr])
    .controller('EditGeneralUserAppForGenUsrCtrl',  ["$scope", "$window", "$route", "$location", "$routeParams", "dashTableConfig",
        "dashboardConstant", "AccountService", "loraDeviceService", "DashboardTableSharedService", "dashboardSharedService", "GeneralUserAppSharedService",
        "EditGeneralUserAppForGenUsrService", "SidebarService",
        EditGeneralUserAppForGenUsrCtrl
    ])
    .controller('NewLoraDevForGenUsrAppCtrl', ["$scope", "$window", "$location", "$routeParams", "dashTableConfig", "formValidator", "AccountService",
        "loraDeviceService", "newLoraDeviceService", "dashboardSharedService", "GeneralUserAppSharedService",
        NewLoraDevForGenUsrAppCtrl
    ])
    .controller('EditLoraDevForGenUsrAppCtrl', ["$scope", "$rootScope", "$window", "$location", "$routeParams", "dashTableConfig", "formValidator",
        "loraDeviceService", "dashboardSharedService", "editSharedService",
        EditLoraDevForGenUsrAppCtrl
    ])
    .controller('EditLoraDevCountForGenUsrAppCtrl', ["$scope", "$routeParams", "$location", "$window", "dashTableConfig", "dashboardSharedService",
        "loraDeviceService", "editSharedService", "loraDevEditValidateService",
        EditLoraDevCountForGenUsrAppCtrl
    ])
    .controller('EditLoraDevCommandForGenUsrAppCtrl', ["$scope", "$routeParams", "$location", "$window", "dashTableConfig", "dashboardSharedService",
        "loraDeviceService", "editSharedService", "loraDevEditValidateService",
        EditLoraDevCommandForGenUsrAppCtrl
    ])
    .controller('EditLoraDevMTForGenUsrAppCtrl', ["$scope", "$routeParams", "$location", "$window", "dashTableConfig", "dashboardSharedService", "loraDeviceService",
        "loraDevEditValidateService", "editSharedService",
        EditLoraDevMTForGenUsrAppCtrl
    ]);
    
