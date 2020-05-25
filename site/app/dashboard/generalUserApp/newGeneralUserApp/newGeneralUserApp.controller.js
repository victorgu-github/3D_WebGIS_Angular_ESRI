'use strict';

module.exports = function ($scope, $window, 3D_WebGIS_Angular_ESRI, dashTableConfig, dashboardConstant, AccountService, loraDeviceService,
    dashboardSharedService, DashboardTableSharedService, GeneralUserAppSharedService, BLEApplicationSharedService,
    BLENodeSharedService, NewGeneralUserAppService, EditGeneralUserAppService) {

    ///////////////////////////////////////
    //
    // Variable 
    //
    ///////////////////////////////////////
    const ADMIN_USER = 3D_WebGIS_Angular_ESRI.ACCOUNT.ADMIN_USER;

    let editGenUsrAppConst = dashTableConfig.GeneralUserApplication.editGenUsrAppConst;
    let EMPTY_SCENARIO_ID = editGenUsrAppConst.EMPTY_SCENARIO_ID;
    let EMPTY_LORA_APP_ID = editGenUsrAppConst.EMPTY_LORA_APP_ID;
    let DEVICE_NOT_EXIST_MSG = editGenUsrAppConst.DEVICE_NOT_EXIST_MSG;
    let LoraDevice = dashTableConfig.Devices.LoraDevice;
    let DevEUI = LoraDevice.sortHeader.DEVEUI;
    let devFromGwApp;
    let completeTableHeader;
    let completeTableBody;

    $scope.generalUsrAppName;
    $scope.scenarioID;
    $scope.scenarioIDsMap = {};
    $scope.scenarioIDsArr = [];
    $scope.applicationID;
    $scope.applicationIDs = [];
    $scope.devices = [];
    $scope.checkedRows = [];
    $scope.initializing = true;
    $scope.displayTitleForAdminUsr = AccountService.userInfo.currentUserType === ADMIN_USER ? true : false;

    $scope.loraAppCollapse = true;
    $scope.bleAppIDs = [];
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
        devices: []
    };
    $scope.bleApps = [Object.assign({}, defaultBleApp)];

    ///////////////////////////////////////
    //
    // Main Function
    //
    ///////////////////////////////////////

    //Init scenarioIDs and applicationIDs array
    initScenIDs(AccountService);
    initAppIDs(AccountService);
    initBleAppIDs();

    ///////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////

    //Selcet different lora application id and load data for that lora application
    $scope.selectAppID = function () {
        //Clean the $scope.tableHeader and $scope.tableBody when reload data
        $scope.tableHeader = [];
        $scope.tableBody = [];
        $scope.devices = [];
        loadDeviceTable();
    };

    //Select different ble application id for different ble application, and load data for that ble application
    $scope.selectBleAppID = function (index) {
        //Clean ble application tableHeader and tableBody before reload data
        $scope.bleApps[index].tableHeader = [];
        $scope.bleApps[index].tableBody = [];
        $scope.bleApps[index].devices = [];
        loadBleNodesTable(index);
    };

    //Select all the checked box
    $scope.selectAll = function () {
        $scope.checkedRows = DashboardTableSharedService.selectAllSharedFunction($scope.tableHeader, $scope.tableBody);
    };

    //Select all the check box for ble application
    $scope.selectAllForBleApp = function (index) {
        $scope.bleApps[index].checkedRows = DashboardTableSharedService.selectAllSharedFunction($scope.bleApps[index].tableHeader, $scope.bleApps[index].tableBody);
    };

    //Add and remove checked rows from checkedRows array
    $scope.adAndRmChkRow = function (row) {
        DashboardTableSharedService.adAndRmChkRowSharedFunction($scope.checkedRows, row);
    };

    $scope.adAndRmChkRowForBleApp = function (index, row) {
        DashboardTableSharedService.adAndRmChkRowSharedFunction($scope.bleApps[index].checkedRows, row);
    };

    // Change lora application collapse sign
    $scope.changeLoraAppCollapse = function () {
        $scope.loraAppCollapse = !$scope.loraAppCollapse;
    };

    // Change ble application collapse sign for each ble application
    $scope.changeBleAppCollapse = function (index) {
        $scope.bleApps[index].collapse = !$scope.bleApps[index].collapse;
    };

    // Add a default ble application into bleApps
    $scope.addABleApp = function () {
        $scope.bleApps.push(Object.assign({}, defaultBleApp));
        NewGeneralUserAppService.updateBleAppsID($scope.bleApps);
    };

    // Remove a ble application from bleApps
    $scope.removeBleApp = function (index) {
        $scope.bleApps.splice(index, 1);
    };

    //Submit the for and register the user application
    $scope.submit = function () {
        let registerBody = {};
        registerBody.generalUserApplicationName = $scope.generalUserApplicationName;
        //If $scope.scenarioID is "--", which means $scope.scenarioIDsMap[$scope.scenarioID] doesn't exist
        //Then we don't include registerBody.scenarioID in the request body
        if ($scope.scenarioIDsMap[$scope.scenarioID]) {
            registerBody.scenarioID = parseInt($scope.scenarioIDsMap[$scope.scenarioID]);
        }
        //If $scope.applicationID is "--", which means we don't select a valid lora application id
        //If $scope.checkedRows.length is 0, which means we don't select any device
        //These two condition means we cannot provide complete information for lora field of request body
        if ($scope.applicationID !== EMPTY_LORA_APP_ID && $scope.checkedRows.length !== 0) {
            registerBody.lora = {};
            registerBody.lora.loraApplicationID = $scope.applicationID;
            registerBody.lora.devEUIs = NewGeneralUserAppService.getDevEUIs($scope.tableHeader, $scope.checkedRows, DevEUI);
        }
        //Incomplete condition 1: no lora.devEUIs
        else if ($scope.applicationID !== EMPTY_LORA_APP_ID && $scope.checkedRows.length === 0) {
            registerBody.lora = {};
            registerBody.lora.loraApplicationID = $scope.applicationID;
        }
        else if ($scope.loraApplicationID === EMPTY_LORA_APP_ID) {
            registerBody.lora = null;
        }
        registerBody.ble = NewGeneralUserAppService.getBleApps($scope.bleApps, dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES.MAC_ADDRESS.KEY);
        let summaryInfo = NewGeneralUserAppService.getSubmitSummaryInfo(registerBody);
        let confirmResult = window.confirm(summaryInfo);
        if (confirmResult === true) {
            let validationResult = validRegisterBody(registerBody);
            if (validationResult.status === "success") {
                //Register the new general user application
                GeneralUserAppSharedService.registerGeneralUsrAppByV2(registerBody).then(function (response) {
                    if (response.status === "success") {
                        $window.alert("Register user application successful");
                        $window.location.href = '/#/dashboard/overview';
                    }
                    else {
                        $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                        $window.alert("Error occurred due to: " + $scope.errorMessage);
                    }
                });
            }
            else {
                $scope.errorMessage = validationResult.errorMessage;
                $window.alert("Error occurred due to: " + $scope.errorMessage);
            }
        }
    };

    ///////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////

    //Init scenarioIDs array 
    function initScenIDs(AccountService) {
        let scenarios = AccountService.userInfo.settings.Scenarios;
        for (let i in scenarios) {
            let key = scenarios[i].scenarioName;
            let value = scenarios[i].scenarioID;
            $scope.scenarioIDsMap[key] = value;
            $scope.scenarioIDsArr.push(key);
        }
        //Add "--" as the first element of scenario id array
        $scope.scenarioIDsArr.unshift(EMPTY_SCENARIO_ID);
        $scope.scenarioID = $scope.scenarioIDsArr.length !== 0 ? $scope.scenarioIDsArr[0] : "";
    }

    //Init AppIDs array
    function initAppIDs(AccountService) {
        let appIDs = AccountService.userInfo.appIDs;
        for (let i in appIDs) {
            let appID = appIDs[i];
            $scope.applicationIDs.push(appID);
        }
        $scope.applicationIDs.sort();
        $scope.applicationIDs.unshift(EMPTY_LORA_APP_ID);
        $scope.applicationID = $scope.applicationIDs.length !== 0 ? $scope.applicationIDs[0] : "";
    }

    //Init Ble AppIDs array
    function initBleAppIDs() {
        BLEApplicationSharedService.getBleApplicationsByCurrentUser().then(function (response) {
            if (response.status === "success") {
                let bleApplications = response.content;
                bleApplications.forEach((bleApplication) => {
                    $scope.bleAppIDs.push(bleApplication.bleAppID);
                });
                $scope.bleAppIDs.unshift("--");
            }
            else {
                $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + $scope.errorMessage);
            }
        });
    }

    //Load device table content according to application id
    function loadDeviceTable() {
        //initializing parameters
        let devTableHeader = dashTableConfig.GeneralUserApplication.devTableHeader;
        let addTBChkStatusResult;
        let defaultSortIndex;
        let appIDRange = [];
        //If $scope.applicationID is not "--", we query the lora device information
        if ($scope.applicationID !== EMPTY_SCENARIO_ID) {
            appIDRange.push($scope.applicationID);
            loraDeviceService.getLoraDevicesInfo(appIDRange).then(function (response) {
                $scope.initializing = true;
                if (response.status === "success") {
                    //Clean the devFromGwApp every time
                    devFromGwApp = [];
                    let nodeSessions = response.content.nodeSessions;
                    //Get all the nodesessions info and concat them into a single object array
                    nodeSessions.forEach(function (nodeSession) {
                        devFromGwApp = devFromGwApp.concat(nodeSession.data);
                    });

                    //Get completeTableHeader from devTableHeader in dashboard config file
                    completeTableHeader = NewGeneralUserAppService.getTableHeader(devTableHeader);

                    //Get completeTableBody from  Get completeTableBody and devFromGwApp 
                    completeTableBody = NewGeneralUserAppService.getTableBody(completeTableHeader, devFromGwApp);

                    //Add the default check box status as the first col to table header and table body;
                    addTBChkStatusResult = EditGeneralUserAppService.addTBChkStatus(completeTableHeader, completeTableBody, $scope.checkedRows, 
                        $scope.devices, dashboardConstant.GENERAL_USER_APPLICATION_FOR_GEN_USR.DEVICE_ATTRIBUTES.DEV_EUI.KEY, 
                        dashboardConstant.GENERAL_USER_APPLICATION_FOR_GEN_USR.DEVICE_ATTRIBUTES.NAME.KEY, DEVICE_NOT_EXIST_MSG);
                    $scope.tableBody = addTBChkStatusResult.tableBody;
                    $scope.checkedRows = addTBChkStatusResult.checkedRows;
                    $scope.tableHeader = EditGeneralUserAppService.addThChkStatus(completeTableHeader, $scope.tableBody);

                    //Implement default sort for lora device table, right now, only support default sort according to devEUI
                    defaultSortIndex = NewGeneralUserAppService.getDefaultSortIndex(completeTableHeader, DevEUI);
                    $scope.tableBody = NewGeneralUserAppService.defaultSortTableBody(completeTableBody, defaultSortIndex);
                    $scope.noDataHint = true;
                    $scope.initializing = false;
                }
                else {
                    $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + $scope.errorMessage);
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

    function validRegisterBody(registerBody) {
        let validationResult = {
            status: "success",
            errorMessage: ""
        };
        if (registerBody.lora !== undefined && registerBody.lora.loraApplicationID !== undefined && registerBody.lora.devEUIs === undefined) {
            validationResult.status = "false";
            validationResult.errorMessage = "If you select Lora Application ID, you must also select devEUIs";
        }
        else if (registerBody.lora !== undefined && registerBody.lora.loraApplicationID === undefined && registerBody.lora.devEUIs !== undefined) {
            validationResult.status = "false";
            validationResult.errorMessage = "If you select devEUIs, you must also select Lora Application ID";
        }
        return validationResult;
    }

    function loadBleNodesTable(index) {
        let addTBChkStatusResult;
        $scope.bleApps[index].initializing = true;
        if ($scope.bleApps[index].bleAppID !== "--") {
            BLENodeSharedService.getBleNodes($scope.bleApps[index].bleAppID).then(function (response) {
                if (response.status === "success") {
                    let bleNodes = response.content;
                    //Get completeTableHeader from config
                    let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES);
                    completeTableHeader = tableHeader.displayTableHeader;

                    //Get completeTableBody from applications 
                    let tableBody = DashboardTableSharedService.getTableBody(completeTableHeader, bleNodes);
                    completeTableBody = tableBody.tableBodyArray;

                    //Add the default check box status as the first col to table header and table body;
                    addTBChkStatusResult = EditGeneralUserAppService.addTBChkStatus(completeTableHeader, completeTableBody, $scope.bleApps[index].checkedRows,
                        $scope.bleApps[index].devices, dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES.MAC_ADDRESS.KEY,
                        dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES.NAME.KEY, DEVICE_NOT_EXIST_MSG);
                    $scope.bleApps[index].tableBody = addTBChkStatusResult.tableBody;
                    $scope.bleApps[index].checkedRows = addTBChkStatusResult.checkedRows;
                    $scope.bleApps[index].tableHeader = EditGeneralUserAppService.addThChkStatus(completeTableHeader, $scope.bleApps[index].tableBody);

                    $scope.bleApps[index].initializing = false;
                }
                else {
                    $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + $scope.errorMessage);
                    $scope.bleApps[index].tableHeader = [];
                    $scope.bleApps[index].tableBody = [];
                    $scope.bleApps[index].initializing = false;
                }
            });
        }
        else {
            $scope.bleApps[index].tableHeader = [];
            $scope.bleApps[index].tableBody = [];
            $scope.bleApps[index].initializing = false;
        }
    }
};