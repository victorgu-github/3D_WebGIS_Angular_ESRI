'use strict';

module.exports = function ($scope, $window, $route, $location, $routeParams, dashTableConfig, dashboardConstant, 
    AccountService, loraDeviceService, DashboardTableSharedService, dashboardSharedService, GeneralUserAppSharedService, 
    EditGeneralUserAppForGenUsrService, SidebarService) {

    const TH_CLASS_SCENARIO_SIDEBAR       = "edit-gen-usr-app-table-header-scenario-sidebar";
    const TH_CLASS_SCENARIO_NO_SIDEBAR    = "edit-gen-usr-app-table-header-scenario-no-sidebar";
    const TH_CLASS_NO_SCENARIO_SIDEBAR    = "edit-gen-usr-app-table-header-no-scenario-sidebar";
    const TH_CLASS_NO_SCENARIO_NO_SIDEBAR = "edit-gen-usr-app-table-header-no-scenario-no-sidebar";
    const DEVICE_ATTRIBUTES = dashboardConstant.GENERAL_USER_APPLICATION_FOR_GEN_USR.DEVICE_ATTRIBUTES;

    let editGenUsrAppConst   = dashTableConfig.GeneralUserApplication.editGenUsrAppConst;
    let EXIST_ROW_CLASS      = editGenUsrAppConst.EXIST_ROW_CLASS;
    let NOT_EXIST_ROW_CLASS  = editGenUsrAppConst.NOT_EXIST_ROW_CLASS;
    let DEVICE_NOT_EXIST_MSG = editGenUsrAppConst.DEVICE_NOT_EXIST_MSG;

    let DEV_EUI      = DEVICE_ATTRIBUTES.DEV_EUI.KEY;
    let DESCRIPTION = DEVICE_ATTRIBUTES.DESCRIPTION.KEY;  
    
    let devFromGwApp        = [];
    let displayTableHeader  = [];
    let displayTableBody    = [];
    let completeTableHeader = [];
    let completeTableBody   = [];

    $scope.generalUsrAppTableUrl    = dashTableConfig.GeneralUserApplicationForGenUsr.generalUsrAppTableUrl;
    $scope.generalUserApplicationID = parseInt($routeParams.generalUserApplicationID);
    $scope.generalUserApplicationName;
    $scope.generalUserApplicationNameOrigin;
    $scope.createdTime;
    $scope.modifiedTime;
    $scope.scenarioID;
    $scope.scenarioIDsMap        = {};
    $scope.displayScenarioID;
    $scope.lora;
    $scope.loraApplicationID;
    $scope.loraDevEUIs;
    $scope.checkedRows           = [];
    $scope.initializing          = true;
    $scope.showSubmitBtn         = false;

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

    $scope.getEditGeneralUserAppFormClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "dashboard-edit-page-edit-app-form-mobile well";
        }
        else {
            return "dashboard-edit-page-edit-app-form well";
        }
    };

    $scope.getGeneralUserAppTableClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "dashboard-edit-page-edit-app-table-row-mobile row well";
        }
        else {
            return "dashboard-edit-page-edit-app-table-row row well";
        }
    };

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
        let devEUI  = DashboardTableSharedService.findKeyIndexVal(completeTableHeader, DEV_EUI, completeTableBody[index]);
        let rowInfo = DashboardTableSharedService.findRowInfo(devFromGwApp, DEV_EUI, devEUI);
        $scope.popupRowInfo = DashboardTableSharedService.getPopupRowInfo(rowInfo);
        angular.element('#generalInfoModal').modal();
    };

    //Relocate to edit device page for general user
    $scope.editDevice = function (index) {
        //Find the key index "DevEUI", "ApplicationID"
        //1. Find "DevEUI"
        //2. Find rowInfo according to "DevEUI"
        //3. Find "Application"
        let result = dashboardSharedService.findElement(completeTableHeader, completeTableBody[index], [DEV_EUI]);
        if (result.status === "success") {
            let devEUI            = result.DevEUI;
            let nodeSession       = dashboardSharedService.findNodeSession(devFromGwApp, DEV_EUI, devEUI);
            let applicationID     = nodeSession.ApplicationID;
            $location.url("/dashboard/loraDeviceForGenUsrApp/edit/" + applicationID + "/" + devEUI + "/" + $scope.generalUserApplicationID); 
        }
        else {
            $window.alert("Cannot edit this record, please make sure the key index exist in the row");
        }
    };

    //Delete lora device for general user application
    $scope.deleteDevice = function (index) {
        let devEUI, nodeSession, applicationID;
        //Find the key index "DevEUI", "ApplicationID"
        //1. Find "DevEUI"
        //2. Find rowInfo according to "DevEUI"
        //3. Find "Application"
        let result = dashboardSharedService.findElement(completeTableHeader, completeTableBody[index], [DEV_EUI]);
        if (result.status === "success") {
            devEUI        = result.DevEUI;
            nodeSession   = dashboardSharedService.findNodeSession(devFromGwApp, DEV_EUI, devEUI);
            applicationID = nodeSession.ApplicationID;
        }
        else {
            $window.alert("Cannot delete this device, please make sure DevEUI exist for this Device!");
        }

        //1.Confirm the delete alert, and then delete the loraDeivce
        let confirmResult = window.confirm("Are you sure to remove this device?");
        if (confirmResult === true) {
            //2.Delete the lora device in the system
            loraDeviceService.deleteLoraDevice(devEUI, applicationID).then(function (response) {
                if (response.status === 'success') {
                    //Here we can only use getGeneralUsrAppsCreatedBy, getGeneralUsrAppsByGenUsrAppID will only return 
                    //exist devices info in the generalApp.lora.devices, and we cannot use it to update general user application
                    GeneralUserAppSharedService.getGeneralUsrApp($scope.generalUserApplicationID).then(function (app_resp) {
                        if (app_resp.status === "success") {
                            let generalApp  = app_resp.content[0];
                            let updateEntry = {
                                generalUserApplicationID: $scope.generalUserApplicationID
                            };
                            //Generate the updateEntry according to general user application lora exist or not
                            if (generalApp.lora) {
                                updateEntry.lora = {};
                                updateEntry.lora.loraApplicationID = applicationID;
                                updateEntry.lora.devEUIs = generalApp.lora.devEUIs.filter((element) => { return element !== devEUI; });
                            }
                            //If updateEntry.lora.devEUIs is empty array [], we can send null value to backend and remove lora field
                            if (updateEntry.lora.devEUIs.length === 0) {
                                updateEntry.lora = null;
                            }
                            //3.Update general user application lora content
                            GeneralUserAppSharedService.updateGeneralUsrApp(updateEntry).then(function (updateApp_resp) {
                                if (updateApp_resp.status === "success") {
                                    $window.alert("Device has been successfully deleted!");
                                    $route.reload();
                                }
                                else {
                                    $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(updateApp_resp.errors);
                                    $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
                                }
                            });
                        }
                        else {
                            $scope.ABPErrorMessage = dashboardSharedService.parseErrorMessage(app_resp.errors);
                            $window.alert("Error occurred due to: \n" + $scope.ABPErrorMessage);
                        }
                    });
                }
                else {
                    let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + errMsg);
                }
            });
        }
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

    //If user change genearl user application name, display submit button
    $scope.displaySubmit = function () {
        if ($scope.generalUserApplicationName !== $scope.generalUserApplicationNameOrigin) {
            $scope.showSubmitBtn = true;
        }
        else {
            $scope.showSubmitBtn = false;
        }
    };

    //Submit and change the general user application name
    $scope.submit = function () {
        let updateEntry = {
            generalUserApplicationID:   $scope.generalUserApplicationID,
            generalUserApplicationName: $scope.generalUserApplicationName
        };
        GeneralUserAppSharedService.updateGeneralUsrApp(updateEntry).then(function (response) {
            if (response.status === "success") {
                $window.alert("General User Application Update Success");
                location.reload();
            }
            else {
                let errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + errorMessage);
            }
        });
    };

    //Forward to new lora device page, create new lora device for general user application
    $scope.createDev = function () {
        $location.url(dashTableConfig.GeneralUserApplicationForGenUsr.NEW_LORA_DEV_URL + "/" + $scope.generalUserApplicationID);
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
        let generalUserApplicationIDs = [$scope.generalUserApplicationID];
        GeneralUserAppSharedService.getGeneralUsrAppsByGenUsrAppID(generalUserApplicationIDs).then(function (response) {
            if (response.status === "success" && response.content.length !== 0) {
                let generalUserApplication = response.content[0];
                $scope.generalUserApplicationName = EditGeneralUserAppForGenUsrService.getGeneralUsrAppName(generalUserApplication.generalUserApplicationName);
                $scope.generalUserApplicationNameOrigin = $scope.generalUserApplicationName.slice();
                $scope.createdTime  = DashboardTableSharedService.transSingleISOTimeToLocaleTime(generalUserApplication.createdTime);
                $scope.modifiedTime = DashboardTableSharedService.transSingleISOTimeToLocaleTime(generalUserApplication.modifiedTime);
                $scope.scenarioID = EditGeneralUserAppForGenUsrService.getGeneralUsrAppScenarioID($scope.scenarioIDsMap, generalUserApplication.scenarioID);
                $scope.displayScenarioID = (!$scope.scenarioID) ? false : true;
                $scope.lora = EditGeneralUserAppForGenUsrService.getGeneralUsrAppLora(generalUserApplication.lora);
                $scope.loraApplicationID = $scope.lora.loraApplicationID;
                $scope.loraDevEUIs = generalUserApplication.lora !== null ? $scope.lora.devices : $scope.lora.devEUIs;
                loadDeviceTable($scope.loraApplicationID, $scope.loraDevEUIs);
            }
            else if (response.status === "success" && response.content.length === 0) {
                let errorMessage = "Cannot find this application in the system";
                $window.alert("Error occurred due to: " + errorMessage);
                $scope.initializing = false;
            }
            else {
                let errorMessage = EditGeneralUserAppForGenUsrService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + errorMessage);
                $scope.initializing = false;
            }
        });
    }

    //Load device table content according to application id
    function loadDeviceTable(loraApplicationID, devEUIs) {
        //initializing parameters
        let appIDRange = [];
        //If $scope.loraApplicationID is not "--", we query the lora device information
        if ($scope.loraDevEUIs.length !== 0) {
            appIDRange.push($scope.loraApplicationID);
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
                    let existNodeSessions = EditGeneralUserAppForGenUsrService.findExistNodeSessions(devFromGwApp, devEUIs);

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
                    let errorMessage = EditGeneralUserAppForGenUsrService.parseErrorMessage(resp.errors);
                    $window.alert("Error occurred due to: " + errorMessage);
                    $scope.tableHeader  = [];
                    $scope.tableBody    = [];
                    $scope.noDataHint   = true;
                    $scope.initializing = false;
                }
            });
        }
        else {
            $scope.tableHeader  = [];
            $scope.tableBody    = [];
            $scope.noDataHint   = true;
            $scope.initializing = false;
        }
    }
};