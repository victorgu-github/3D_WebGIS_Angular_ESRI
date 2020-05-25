'use strict';

module.exports = function ($scope, $window, $routeParams, dashTableConfig, dashboardConstant, AccountService, 
    loraDeviceService, DashboardTableSharedService, dashboardSharedService, GeneralUserAppSharedService, 
    BLENodeSharedService, BLEApplicationSharedService, EditGeneralUserAppService, NewGeneralUserAppService, 
    SidebarService) {

    const TH_CLASS_SCENARIO_SIDEBAR       = "edit-gen-usr-app-table-header-scenario-sidebar";
    const TH_CLASS_SCENARIO_NO_SIDEBAR    = "edit-gen-usr-app-table-header-scenario-no-sidebar";
    const TH_CLASS_NO_SCENARIO_SIDEBAR    = "edit-gen-usr-app-table-header-no-scenario-sidebar";
    const TH_CLASS_NO_SCENARIO_NO_SIDEBAR = "edit-gen-usr-app-table-header-no-scenario-no-sidebar";
    const DEVICE_ATTRIBUTES  = dashboardConstant.GENERAL_USER_APPLICATION_FOR_GEN_USR.DEVICE_ATTRIBUTES;

    let editGenUsrAppConst   = dashTableConfig.GeneralUserApplication.editGenUsrAppConst;
    let EXIST_ROW_CLASS      = editGenUsrAppConst.EXIST_ROW_CLASS;
    let NOT_EXIST_ROW_CLASS  = editGenUsrAppConst.NOT_EXIST_ROW_CLASS;
    let DEVICE_NOT_EXIST_MSG = editGenUsrAppConst.DEVICE_NOT_EXIST_MSG;
    let EMPTY_SCENARIO_ID    = editGenUsrAppConst.EMPTY_SCENARIO_ID;
    let EMPTY_LORA_APP_ID    = editGenUsrAppConst.EMPTY_LORA_APP_ID;
    let DEVEUI               = DEVICE_ATTRIBUTES.DEV_EUI.KEY;
    let DESCRIPTION          = DEVICE_ATTRIBUTES.DESCRIPTION.KEY;   
    
    let devFromGwApp;
    let displayTableHeader  = [];
    let displayTableBody    = [];
    let completeTableHeader = [];
    let completeTableBody   = [];

    $scope.generalUsrAppTableUrl =  dashTableConfig.GeneralUserApplicationForGenUsr.generalUsrAppTableUrl;
    $scope.generalUsrAppID =        parseInt($routeParams.generalUserApplicationID);
    $scope.generalUsrAppName;
    $scope.scenarioID;
    $scope.scenarioIDsMap =     {};
    $scope.displayScenarioID;
    $scope.lora;
    $scope.checkedRows =        [];
    $scope.initializing =       true;

    $scope.loraAppCollapse = true;
    $scope.bleAppIDs       = [];
    let defaultBleApp = {
        id: 1,
        bleAppID: "--",
        collapse: true,
        initializing: false,
        tableHeader: [],
        tableBody: [],
        completeTableHeader: [],
        completeTableBody: [],
        checkedRows: [],
        bleNodesAllSign: true,
        bleNodes: [],
        existBleNodeSessions: []
    };
    $scope.bleApps = [];
    $scope.data = {
        existBleApplicationsArray: [],
        notExistBleApplicationsArray: []
    };

    ///////////////////////////////////////
    //
    // Main Function
    //
    ///////////////////////////////////////

    initScenIDsMap();
    initEditData();

    ///////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////

    //Check and assign different style for exist device and not exsit device
    $scope.checkTableRowClass = function (row) {
        let result = EXIST_ROW_CLASS;
        let position = $scope.tableHeader.findIndex((element) => { return element === DESCRIPTION; });
        result = (row[position] && row[position].includes(DEVICE_NOT_EXIST_MSG)) ? NOT_EXIST_ROW_CLASS : EXIST_ROW_CLASS;
        return result;
    };

    //1.DevEUI here is the keywords attribute in node session: "DevEUI"
    //2.devEUI is the actual value of each line element: "AAAAAAAAAAAAAAAB"
    //3.With these two value we can find the exact node session from node sessions collection
    $scope.showDeviceInfo = function (index) {
        let devEUI  = DashboardTableSharedService.findKeyIndexVal(completeTableHeader, DEVEUI, completeTableBody[index]);
        let rowInfo = DashboardTableSharedService.findRowInfo(devFromGwApp, DEVEUI, devEUI);
        $scope.popupRowInfo = DashboardTableSharedService.getPopupRowInfo(rowInfo);
        angular.element('#generalInfoModal').modal();
    };

    $scope.showBleDeviceInfo = function (bleAppsIndex, index) {
        let macAddress  = DashboardTableSharedService.findKeyIndexVal($scope.bleApps[bleAppsIndex].completeTableHeader, "macAddress", $scope.bleApps[bleAppsIndex].completeTableBody[index]);
        let rowInfo = DashboardTableSharedService.findRowInfo($scope.bleApps[bleAppsIndex].bleNodes, "macAddress", macAddress);
        $scope.popupRowInfo = DashboardTableSharedService.getPopupRowInfo(rowInfo);
        angular.element('#generalInfoModal').modal();
    };

    //Dynamically modify class for well and table
    $scope.getWellClass = function () {
        let result = 'edit-general-userapp-row-appID';
        if (!$scope.displayScenarioID) {
            result = 'edit-general-userapp-row-appID-no-scenario';
        }
        return result;
    };

    $scope.getTableClass = function () {
        let result = 'edit-gen-usr-app-table-container';
        if (!$scope.displayScenarioID) {
            result = 'edit-gen-usr-app-table-container-no-scenario';
        }
        return result;
    };

    //Table header is fixed position. Should have diff class when sidebar toggle and not toggle
    $scope.getTableHeaderClass = function () {
        let result;
        if ($scope.displayScenarioID) {
            if (SidebarService.sidebar.checked) {
                result = TH_CLASS_SCENARIO_SIDEBAR;
            }
            else {
                result = TH_CLASS_SCENARIO_NO_SIDEBAR;
            }
        }
        else {
            if (SidebarService.sidebar.checked) {
                result = TH_CLASS_NO_SCENARIO_SIDEBAR;
            }
            else {
                result = TH_CLASS_NO_SCENARIO_NO_SIDEBAR;
            }
        }
        return result;
    };

    $scope.getEditBleApplicationFormClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "dashboard-edit-page-edit-app-form-mobile well row";
        }
        else {
            return "dashboard-edit-page-edit-app-form well row";
        }
    };

    $scope.getCollapseClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "input-group gen-usr-app-collapse-mobile";
        }
        else {
            return "input-group gen-usr-app-collapse";
        }
    };

    // Change lora application collapse sign
    $scope.changeLoraAppCollapse = function () {
        $scope.loraAppCollapse = !$scope.loraAppCollapse;
    };

    // Change ble application collapse sign for each ble application
    $scope.changeBleAppCollapse = function (index) {
        $scope.bleApps[index].collapse = !$scope.bleApps[index].collapse;
    };

    ///////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////

    //Init scenarioIDs array 
    function initScenIDsMap() {
        let scenarios = AccountService.userInfo.settings.Scenarios;
        for (let i in scenarios) {
            let key = scenarios[i].scenarioName;
            let value = scenarios[i].scenarioID;
            $scope.scenarioIDsMap[key] = value;
        }
    }

    //Init device table by default application id
    function initEditData() {
        GeneralUserAppSharedService.getGeneralUsrAppsForExistDeviceV2([$scope.generalUsrAppID]).then(function (response) {
            if (response.status === "success" && response.content.length !== 0) {
                let generalUserApplication = response.content[0];
                $scope.generalUserApplicationName = EditGeneralUserAppService.getGeneralUsrAppName(generalUserApplication.generalUserApplicationName);
                $scope.scenarioID = EditGeneralUserAppService.getGeneralUsrAppScenarioID($scope.scenarioIDsMap, generalUserApplication.scenarioID);
                $scope.displayScenarioID = (!$scope.scenarioID || $scope.scenarioID === EMPTY_SCENARIO_ID) ? false : true;
                $scope.createdTime  = DashboardTableSharedService.transSingleISOTimeToLocaleTime(generalUserApplication.createdTime);
                $scope.modifiedTime = DashboardTableSharedService.transSingleISOTimeToLocaleTime(generalUserApplication.modifiedTime);
                $scope.createdBy = AccountService.userInfo.userName;
                $scope.creatorAccessRole = AccountService.userInfo.currentUserType === "ACCOUNT.ADMIN" ? "admin" : "general";

                $scope.lora = EditGeneralUserAppService.getGeneralUsrAppLoraContentForExistDeviceV2WebApi(generalUserApplication.networks);
                $scope.loraApplicationID = $scope.lora.loraApplicationID;
                $scope.loraDevEUIs = $scope.lora.devEUIs;
                $scope.ble = EditGeneralUserAppService.getGeneralUsrAppBleContentForExistDeviceV2WebApi(generalUserApplication.networks);

                loadDeviceTable($scope.loraApplicationID, $scope.loraDevEUIs);
                loadBleNodesTable($scope.ble);
            }
            else if (response.status === "success" && response.content.length === 0) {
                let errorMessage = "Cannot find this application in the system";
                $window.alert("Error occurred due to: " + errorMessage);
                $scope.initializing = false;
            }
            else {
                let errorMessage = EditGeneralUserAppService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + errorMessage);
                $scope.initializing = false;
            }
        });
    }

    //Load device table content according to application id
    function loadDeviceTable(loraApplicationID, devEUIs) {
        //initializing parameters
        let appIDRange = [];
        //If loraApplicationID is not "--", we query the lora device information
        if (loraApplicationID !== "" && loraApplicationID !== EMPTY_LORA_APP_ID) {
            appIDRange.push(loraApplicationID);
            loraDeviceService.getLoraDevicesInfo(appIDRange).then(function (resp) {
                $scope.initializing = true;
                if (resp.status === "success") {
                    //Clean the devFromGwApp every time
                    devFromGwApp = [];
                    let nodeSessions = resp.content.nodeSessions;
                    //Get all the nodesessions info and concat them into a single object array
                    nodeSessions.forEach(function (nodeSession) {
                        devFromGwApp = devFromGwApp.concat(nodeSession.data);
                    });
                    let existNodeSessions = EditGeneralUserAppService.findExistNodeSessions(devFromGwApp, devEUIs);

                    //Get table header
                    let tableHeader     = DashboardTableSharedService.getTableHeaderFromConst(DEVICE_ATTRIBUTES);
                    displayTableHeader  = tableHeader.displayTableHeader;
                    completeTableHeader = DashboardTableSharedService.getCompleteTableHeaderFromObj(existNodeSessions);

                    //Get tableBody from node sessions
                    let tableBody       = DashboardTableSharedService.getTableBody(displayTableHeader, existNodeSessions);
                    displayTableBody    = tableBody.tableBodyArray;
                    completeTableBody   = tableBody.popupBodyArray;

                    $scope.tableHeader  = displayTableHeader;
                    $scope.tableBody    = displayTableBody;              

                    $scope.noDataHint   = false;
                    $scope.initializing = false;
                }
                else {
                    let errorMessage = EditGeneralUserAppService.parseErrorMessage(resp.errors);
                    $window.alert("Error occurred due to: " + errorMessage);
                    $scope.tableHeader = [];
                    $scope.tableBody = [];
                    $scope.noDataHint = true;
                    $scope.initializing = false;
                }
            });
        }
        else {
            $scope.tableHeader = [];
            $scope.tableBody = [];
            $scope.noDataHint = true;
            $scope.initializing = false;
        }
    }

    function loadBleNodesTable(ble) {
        if (Array.isArray(ble) && ble.length !== 0) {
            //1. Get bleAppIDs array, and find which ble application exist in the system, which ble
            //   application not exist in the system
            let bleAppIDs = EditGeneralUserAppService.getBleAppIDsArray(ble);
            BLEApplicationSharedService.getBleApplications(bleAppIDs).then(function (response) {
                if (response.status === "success") {
                    let existBleApplications = response.content;
                    let findResult = EditGeneralUserAppService.findExistAndNotExistBleApplications(bleAppIDs, existBleApplications);
                    $scope.data.existBleApplicationsArray = findResult.existBleApplicationsArray;
                    $scope.data.notExistBleApplicationsArray = findResult.notExistBleApplicationsArray;
                    ble = EditGeneralUserAppService.removeNotExistBleApplications(ble, findResult.notExistBleApplicationsArray);
                    //2. For exist ble application, get each exist ble node information of it
                    ble.forEach((bleApplication, index) => {
                        let bleAppObj = Object.assign({}, defaultBleApp);
                        bleAppObj.id = index + 1;
                        bleAppObj.bleAppID = parseInt(bleApplication.bleAppID);
                        if (Array.isArray(bleApplication.devices) && bleApplication.devices.length === 0) {
                            bleAppObj.bleNodesAllSign = false;
                            $scope.bleApps.push(bleAppObj);
                            NewGeneralUserAppService.sortBleAppsByID($scope.bleApps);
                        }
                        else if (Array.isArray(bleApplication.devices) && bleApplication.devices.length !== 0) {
                            bleAppObj.bleNodesAllSign = false;
                            BLENodeSharedService.getBleNodes(bleAppObj.bleAppID).then(function (response) {
                                if (response.status === "success") {
                                    bleAppObj.bleNodes = response.content;
                                    bleAppObj.existBleNodeSessions = EditGeneralUserAppService.findExistBleNodeSessions(bleAppObj.bleNodes, bleApplication.devices);
                                    //Get completeTableHeader from config
                                    let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES);
                                    bleAppObj.displayTableHeader  = tableHeader.displayTableHeader;
                                    bleAppObj.completeTableHeader = DashboardTableSharedService.getCompleteTableHeaderFromObj(bleAppObj.existBleNodeSessions);

                                    //Get completeTableBody from applications 
                                    let tableBody = DashboardTableSharedService.getTableBody(bleAppObj.displayTableHeader, bleAppObj.existBleNodeSessions);
                                    bleAppObj.displayTableBody = tableBody.tableBodyArray;
                                    bleAppObj.completeTableBody = tableBody.popupBodyArray;

                                    bleAppObj.tableHeader  = bleAppObj.displayTableHeader;
                                    bleAppObj.tableBody    = bleAppObj.displayTableBody; 

                                    bleAppObj.initializing = false;
                                    $scope.bleApps.push(bleAppObj);
                                    NewGeneralUserAppService.sortBleAppsByID($scope.bleApps);
                                }
                                else {
                                    let errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                                    $window.alert("Error occurred due to: " + errorMessage);
                                    bleAppObj.tableHeader = [];
                                    bleAppObj.tableBody = [];
                                    bleAppObj.initializing = false;
                                    $scope.bleApps.push(bleAppObj);
                                    NewGeneralUserAppService.sortBleAppsByID($scope.bleApps);
                                }
                            });
                        }
                        else {
                            $scope.bleApps.push(bleAppObj);
                            NewGeneralUserAppService.sortBleAppsByID($scope.bleApps);
                        }
                    });
                }
                else {
                    let errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + errorMessage);
                }
            });
        }
    }
};