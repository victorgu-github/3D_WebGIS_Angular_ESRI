'use strict';

module.exports = function ($scope, $window, $routeParams, dashTableConfig, dashboardConstant, AccountService, loraDeviceService, 
    dashboardSharedService, DashboardTableSharedService, GeneralUserAppSharedService, BLEApplicationSharedService, BLENodeSharedService, 
    EditGeneralUserAppService, NewGeneralUserAppService) {

    ///////////////////////////////////////
    //
    // Variable 
    //
    ///////////////////////////////////////
    
    let editGenUsrAppConst =   dashTableConfig.GeneralUserApplication.editGenUsrAppConst;
    let EXIST_ROW_CLASS =      editGenUsrAppConst.EXIST_ROW_CLASS;
    let NOT_EXIST_ROW_CLASS =  editGenUsrAppConst.NOT_EXIST_ROW_CLASS;
    let DEVICE_NOT_EXIST_MSG = editGenUsrAppConst.DEVICE_NOT_EXIST_MSG;
    let EMPTY_SCENARIO_ID =    editGenUsrAppConst.EMPTY_SCENARIO_ID;
    let EMPTY_LORA_APP_ID =    editGenUsrAppConst.EMPTY_LORA_APP_ID;

    let devTableHeader = dashTableConfig.GeneralUserApplication.devTableHeader;
    let NAME           = devTableHeader.key1;
    let DEVEUI         = devTableHeader.key3;
    let DESCRIPTION    = devTableHeader.key2;
    let ascNum = dashTableConfig.CommonSortAttr.sortAttribute.ASC_NUM;       
    
    let devFromGwApp;
    let completeTableHeader;
    let completeTableBody;

    $scope.generalUserAppTableUrl = dashTableConfig.GeneralUserApplication.GernalUserAppTableCommonUrl;
    $scope.generalUsrAppID = parseInt($routeParams.generalUserApplicationID);
    $scope.generalUsrAppName;
    $scope.scenarioID;
    $scope.scenarioIDsMap = {};
    $scope.scenarioIDsArr = [];
    $scope.lora;
    $scope.loraApplicationID;
    $scope.loraApplicationIDs = [];
    $scope.loraDevEUIs;
    $scope.checkedRows = [];
    $scope.initializing = true;

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
        devices: []
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

    //Init scenarioIDs and applicationIDs array
    initScenIDs(AccountService);
    initAppIDs(AccountService);
    initBleAppIDs();
    initEditData();

    ///////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////

    //Selcet different application id and load data from that application server
    $scope.selectAppID = function (oldLoraAppID) {
        //Clean the $scope.tableHeader and $scope.tableBody when reload data
        $scope.tableBody = [];
        let confirmResult = window.confirm("A general user application only has devices under one lora application." +
            " Switching the lora application will clear the devices selected for current lora application." +
            " Do you still want to change lora application?");
        if (confirmResult === true) {
            $scope.loraDevEUIs = [];
            loadDeviceTable($scope.loraApplicationID, $scope.loraDevEUIs);
        }
        else {
            $scope.loraApplicationID = oldLoraAppID;
            $scope.loraDevEUIs = EditGeneralUserAppService.getLoraCheckedRowsContent($scope.checkedRows, $scope.tableHeader);
            loadDeviceTable($scope.loraApplicationID, $scope.loraDevEUIs);
        }
    };

    //Select different ble application id for different ble application, and load data for that ble application
    $scope.selectBleAppID = function (index, oldBleAppID) {
        oldBleAppID = oldBleAppID === "--" ? oldBleAppID : parseInt(oldBleAppID);
        //Clean ble application tableHeader and tableBody before reload data
        $scope.bleApps[index].tableBody = [];
        let confirmResult = window.confirm("Switching the ble application will clear the devices selected for current ble application." +
        " Do you still want to change ble application?");
        if (confirmResult === true) {
            $scope.bleApps[index].devices = [];
            updateBleAppIDAndLoadBleNodesTable(index);
        }
        else {
            $scope.bleApps[index].bleAppID = oldBleAppID;
            $scope.bleApps[index].devices = EditGeneralUserAppService.getBleCheckedRowsContent($scope.bleApps[index].checkedRows, $scope.bleApps[index].tableHeader);
            updateBleAppIDAndLoadBleNodesTable(index);
        }
    };

    $scope.changeAllSign = function (index) {
        //Clean ble application tableHeader and tableBody before reload data
        $scope.bleApps[index].tableHeader = [];
        $scope.bleApps[index].tableBody = [];
        $scope.bleApps[index].devices = [];
        updateBleAppIDAndLoadBleNodesTable(index);
    };

    // Change lora application collapse sign
    $scope.changeLoraAppCollapse = function () {
        $scope.loraAppCollapse = !$scope.loraAppCollapse;
    };

    // Change ble application collapse sign for each ble application
    $scope.changeBleAppCollapse = function (index) {
        $scope.bleApps[index].collapse = !$scope.bleApps[index].collapse;
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

    // Add a default ble application into bleApps
    $scope.addABleApp = function () {
        $scope.bleApps.push(Object.assign({}, defaultBleApp));
        NewGeneralUserAppService.updateBleAppsID($scope.bleApps);
    };

    // Remove a ble application from bleApps
    $scope.removeBleApp = function (index) {
        $scope.bleApps.splice(index, 1);
    };

    //Check and assign different style for exist device and not exsit device
    $scope.checkTableRowClass = function (row) {
        let result = EXIST_ROW_CLASS;
        let position = $scope.tableHeader.findIndex((element) => { return element === DESCRIPTION; });
        result = (row[position] && row[position].includes(DEVICE_NOT_EXIST_MSG)) ? NOT_EXIST_ROW_CLASS : EXIST_ROW_CLASS;
        return result;
    };

    //Display checked box only for exist lora device
    $scope.showCheckBox = function (row) {
        let result = true;
        for (let index in row) {
            let element = row[index];
            if (typeof element === "string" && element.includes(DEVICE_NOT_EXIST_MSG)) {
                result = false;
                break;
            }
        }
        return result;
    };

    //Submit the for and register the user application
    $scope.submit = function () {
        let updateBody = {};
        updateBody.generalUserApplicationID = $scope.generalUsrAppID;
        updateBody.generalUserApplicationName = $scope.generalUserApplicationName;
        //If $scope.scenarioID is "--", which means $scope.scenarioIDsMap[$scope.scenarioID] doesn't exist
        //Then we send null for $scope.scenarioID
        if ($scope.scenarioIDsMap[$scope.scenarioID]) {
            updateBody.scenarioID = parseInt($scope.scenarioIDsMap[$scope.scenarioID]);
        }
        else {
            updateBody.scenarioID = null;
        }
        //1.Complete situation: $scope.loraApplicationID is not '--' and $scope.checkedRows is not empty array
        //                      send the lora.loraApplicationID and lora.devEUIs to backend
        //2.Incomplete situation 1: $scope.loraApplicationID is not '--' and $scope.checkedRows is empty array
        //                      send only the lora.loraApplicationID to backend, will receive error message
        //3.Incomplete situation 2: $scope.loraApplicationID is '--'
        //                      send null for lora to backend, will receive the error message
        if ($scope.loraApplicationID !== EMPTY_LORA_APP_ID && $scope.checkedRows.length !== 0) {
            updateBody.lora = {};
            updateBody.lora.loraApplicationID = $scope.loraApplicationID;
            updateBody.lora.devEUIs = EditGeneralUserAppService.getDevEUIs($scope.tableHeader, $scope.checkedRows, DEVEUI);
        }
        else if ($scope.loraApplicationID !== EMPTY_LORA_APP_ID && $scope.checkedRows.length === 0) {
            updateBody.lora = {};
            updateBody.lora.loraApplicationID = $scope.loraApplicationID;
        }
        else if ($scope.loraApplicationID === EMPTY_LORA_APP_ID) {
            updateBody.lora = null;
        }
        updateBody.ble = EditGeneralUserAppService.getBleApps($scope.bleApps, dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES.MAC_ADDRESS.KEY);
        //Register the new general user application
        let summaryInfo = NewGeneralUserAppService.getSubmitSummaryInfo(updateBody);
        let confirmResult = window.confirm(summaryInfo);
        if (confirmResult === true) {
            GeneralUserAppSharedService.updateGeneralUsrAppByV2(updateBody).then(function (response) {
                if (response.status === "success") {
                    $window.alert("General User Application Update Success");
                    let url = $scope.generalUserAppTableUrl;
                    $window.location.href = url;
                }
                else {
                    let errorMessage = EditGeneralUserAppService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + errorMessage);
                }
            });
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
        $scope.scenarioID = $scope.scenarioIDsArr[0];
    }

    //Init AppIDs array
    function initAppIDs(AccountService) {
        let appIDs = AccountService.userInfo.appIDs;
        for (let i in appIDs) {
            let appID = appIDs[i];
            $scope.loraApplicationIDs.push(appID);
        }
        $scope.loraApplicationIDs.sort();
        $scope.loraApplicationIDs.unshift(EMPTY_LORA_APP_ID);
        $scope.loraApplicationID = $scope.loraApplicationIDs[0];
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

    //Init device table by default application id
    function initEditData() {
        GeneralUserAppSharedService.getGeneralUsrAppsForExistDeviceV2([$scope.generalUsrAppID]).then(function (response) {
            if (response.status === "success" && response.content.length !== 0) {
                let generalUserApplication = response.content[0];
                $scope.generalUserApplicationName = EditGeneralUserAppService.getGeneralUsrAppName(generalUserApplication.generalUserApplicationName);
                $scope.scenarioID = EditGeneralUserAppService.getGeneralUsrAppScenarioID($scope.scenarioIDsMap, generalUserApplication.scenarioID);
                $scope.createdTime  = DashboardTableSharedService.transSingleISOTimeToLocaleTime(generalUserApplication.createdTime);
                $scope.modifiedTime = DashboardTableSharedService.transSingleISOTimeToLocaleTime(generalUserApplication.modifiedTime);
                $scope.createdBy = AccountService.userInfo.username;
                $scope.creatorAccessRole = AccountService.userInfo.currentUserType === "ACCOUNT.ADMIN" ? "admin" : "general";

                GeneralUserAppSharedService.getGeneralUsrAppByV2($scope.generalUsrAppID).then(function (response) {
                    if (response.status === "success") {
                        $scope.lora = EditGeneralUserAppService.getGeneralUsrAppLora(response.content[0].lora);
                    }
                    else {
                        $scope.lora = EditGeneralUserAppService.getGeneralUsrAppLoraContentForExistDeviceV2WebApi(generalUserApplication.networks);
                    }
                    $scope.loraApplicationID = $scope.lora.loraApplicationID;
                    $scope.loraDevEUIs = $scope.lora.devEUIs;
                    if ($scope.loraApplicationIDs.includes($scope.loraApplicationID)) {
                        loadDeviceTable($scope.loraApplicationID, $scope.loraDevEUIs);
                    }

                    $scope.ble = EditGeneralUserAppService.getGeneralUsrAppBleContentForExistDeviceV2WebApi(generalUserApplication.networks);
                    loadBleNodesTable($scope.ble);
                });
            }
            else if (response.status === "success" && response.content.length === 0) {
                let errorMessage = "Cannot find this general user application in the system";
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
        let devTableHeader = dashTableConfig.GeneralUserApplication.devTableHeader;
        let defaultSortIndex;
        let appIDRange = [];
        let addTBChkStatusResult;
        //If $scope.loraApplicationID is not "--", we query the lora device information
        if (loraApplicationID !== "" && loraApplicationID !== EMPTY_SCENARIO_ID) {
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

                    //Get completeTableHeader from devTableHeader in dashboard config file
                    completeTableHeader = EditGeneralUserAppService.getTableHeader(devTableHeader);

                    //Get completeTableBody from  Get completeTableBody and devFromGwApp 
                    completeTableBody = EditGeneralUserAppService.getTableBody(completeTableHeader, devFromGwApp);

                    //Add the default check box status as the first col to table header and table body;
                    addTBChkStatusResult = EditGeneralUserAppService.addTBChkStatus(completeTableHeader, completeTableBody, $scope.checkedRows, devEUIs, DEVEUI, DESCRIPTION, DEVICE_NOT_EXIST_MSG);
                    $scope.tableBody = addTBChkStatusResult.tableBody;
                    $scope.checkedRows = addTBChkStatusResult.checkedRows;
                    $scope.tableHeader = EditGeneralUserAppService.addThChkStatus(completeTableHeader, $scope.tableBody);

                    //Implement default sort for lora device table, right now, only support default sort according to devEUI
                    defaultSortIndex = DashboardTableSharedService.getDefaultSortIndex($scope.tableHeader, NAME, DEVEUI);
                    $scope.tableBody = DashboardTableSharedService.defaultSortTableBody($scope.tableBody, defaultSortIndex, ascNum);
                    $scope.noDataHint = true;
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
        let addTBChkStatusResult;
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
                    let bleAppIDsArray = ble.map((element) => { return element.bleAppID; });
                    BLENodeSharedService.getBleNodesForBleApps(bleAppIDsArray).then(function (responses) {
                        //Need do the for loop for ble, otherwise we cannot separate the condition:
                        //a. ble.devices = "all"
                        //b. ble.devices = []
                        //Both of these two condition will ble nodes response []
                        ble.forEach((bleApplication, index) => {
                            let bleAppObj = Object.assign({}, defaultBleApp);
                            bleAppObj.id = index + 1;
                            bleAppObj.bleAppID = parseInt(bleApplication.bleAppID);
                            if (Array.isArray(bleApplication.devices)) {
                                bleAppObj.bleNodesAllSign = false;
                                let bleNodes = responses.content[index].data;
                                //Get completeTableHeader from config
                                let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES);
                                completeTableHeader = tableHeader.displayTableHeader;

                                //Get completeTableBody from applications 
                                let tableBody = DashboardTableSharedService.getTableBody(completeTableHeader, bleNodes);
                                completeTableBody = tableBody.tableBodyArray;

                                //Add the default check box status as the first col to table header and table body;
                                addTBChkStatusResult = EditGeneralUserAppService.addTBChkStatus(completeTableHeader, completeTableBody, bleAppObj.checkedRows,
                                    bleApplication.devices, dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES.MAC_ADDRESS.KEY,
                                    dashboardConstant.GENERAL_USER_APPLICATION.BLE_NODES_TABLE_ATTRIBUTES.NAME.KEY, DEVICE_NOT_EXIST_MSG);
                                bleAppObj.tableBody = addTBChkStatusResult.tableBody;
                                bleAppObj.checkedRows = addTBChkStatusResult.checkedRows;
                                bleAppObj.tableHeader = EditGeneralUserAppService.addThChkStatus(completeTableHeader, bleAppObj.tableBody);

                                bleAppObj.devices = bleApplication.devices;

                                bleAppObj.initializing = false;
                            }
                            $scope.bleApps.push(bleAppObj);
                            NewGeneralUserAppService.sortBleAppsByID($scope.bleApps);
                            $scope.enabledNewBleAppButton = (index === ble.length - 1) ? true : false;
                        });
                    }).catch(function (error) {
                        let errorMessage = dashboardSharedService.parseErrorMessage(error);
                        $window.alert("Error occurred due to: " + errorMessage);
                        let bleAppObj = Object.assign({}, defaultBleApp);
                        bleAppObj.tableHeader = [];
                        bleAppObj.tableBody = [];
                        bleAppObj.initializing = false;
                        $scope.bleApps.push(bleAppObj);
                        NewGeneralUserAppService.sortBleAppsByID($scope.bleApps);
                        $scope.enabledNewBleAppButton = true;
                    });
                }
                else {
                    let errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + errorMessage);
                }
            });
        }
        else {
            $scope.enabledNewBleAppButton = true;
        }
    }

    function updateBleAppIDAndLoadBleNodesTable(index) {
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