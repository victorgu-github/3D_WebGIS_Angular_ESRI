'use strict';

module.exports = function ($scope, $routeParams, $window, dashTableConfig, AccountService, dashboardSharedService, GeneralUserAppSharedService, 
    GeneralUserSharedService, DashboardTableSharedService, EditGeneralUserService) {

    const EXIST_ROW_CLASS =     "data-table-row-exit";
    const NOT_EXIST_ROW_CLASS = "data-table-row-not-exist";
    const ERROR_MESSAGE =       "General Application Has Been Deleted";

    let GENERAL_USER_APP_ID   = dashTableConfig.GeneralUser.generalUserAppHeader.key1;
    let GENERAL_USER_APP_NAME = dashTableConfig.GeneralUser.generalUserAppHeader.key2;
    let generalUserAppHeader  =  dashTableConfig.GeneralUser.generalUserAppHeader;
    let userInfo   = AccountService.userInfo;
    let appIDRange = userInfo.appIDs;
    let username   = userInfo.username ? userInfo.username : userInfo.userName;
    let accessRole = userInfo.currentUserType === "ACCOUNT.ADMIN" ? "admin" : "general";
    let completeTableHeader;
    let completeTableBody;
    let totalAppsResult;
    let assignAppResult;

    $scope.generalUserTableUrl = dashTableConfig.GeneralUser.GeneralUserTableCommonUrl;
    //This is a walk around at this time, because we allow userName stored in the database as empty string ""
    //When the userName is empty string, $routeParams.userName will be undefined here
    $scope.userName = $routeParams.userName !== undefined ? $routeParams.userName : "";
    $scope.editEntry = {};
    $scope.tableHeader;
    $scope.tableBody;
    $scope.initializing = true;
    $scope.models = {
        selected: null,
        lists: { "unassignApps": [], "assignApps": [] }
    };

    ////////////////////////////////////////////////////////
    //
    // Initialization Process
    //
    ////////////////////////////////////////////////////////

    initGeneralUserEditPage();

    ////////////////////////////////////////////////////////
    //
    // Widget Function
    //
    ////////////////////////////////////////////////////////

    $scope.checkTableRowClass = function (row) {
        let result = EXIST_ROW_CLASS;
        let position = $scope.tableHeader.findIndex(function (element) {
            return element === GENERAL_USER_APP_NAME;
        });
        result = (row[position] === ERROR_MESSAGE) ? NOT_EXIST_ROW_CLASS : EXIST_ROW_CLASS;
        return result;
    };

    //Enter into the edit general user applications modal page
    $scope.editGeneralUserApplication = function () {
        initModalGeneralAppArray();
        angular.element('#generalUsrAppModal').modal();
    };

    //Filter general user applications by lora application id
    $scope.filterByAppID = function () {
        //Copy total general user applications array
        let totalAppsResultBak = totalAppsResult.slice();
        let currentAassignApps = $scope.models.lists.assignApps;
        let currentUnassignApps = EditGeneralUserService.findCurrUnassignApps(totalAppsResultBak, currentAassignApps);
        if ($scope.filterVal === "" && $scope.filterValForBleApp === "") {
            $scope.models.lists.unassignApps = currentUnassignApps;
        }
        else if ($scope.filterVal !== "" && $scope.filterValForBleApp === "") {
            $scope.models.lists.unassignApps = filterUnassignAppsByLoraAppID(currentUnassignApps, $scope.filterVal);
        }
        else if ($scope.filterVal === "" && $scope.filterValForBleApp !== "") {
            $scope.models.lists.unassignApps = filterUnassignAppsByBleID(currentUnassignApps, $scope.filterValForBleApp);
        }
        else {
            $scope.models.lists.unassignApps = filterUnassignAppsByLoraAppIDAndBleAppID(currentUnassignApps, $scope.filterByAppID, $scope.filterValForBleApp);
        }
    };

    //Update general user applications
    $scope.updateGeneralUsrApp = function () {
        let updateRequestBody = {};
        updateRequestBody.userName = $scope.userName;
        updateRequestBody.generalAppIDs = EditGeneralUserService.extractGeneralAppIDs($scope.models.lists.assignApps);
        GeneralUserSharedService.updateGeneralUsers(updateRequestBody).then(function (response) {
            if (response.status === "success") {
                $window.alert("General User Application Update Success");
                let url = "/dashboard/generalUser/edit/" + $scope.userName;
                $window.location.href = url;
            }
            else {
                let errorMessage = response.errors[0].message;
                $window.alert("Error occurred due to: " + errorMessage);
            }
        });
    };

    ////////////////////////////////////////////////////////
    //
    // Private Function
    //
    ////////////////////////////////////////////////////////

    function initGeneralUserEditPage() {
        GeneralUserSharedService.getGeneralUsers().then(function (response) {
            if (response.status === "success") {
                let generalUsers = response.content;
                let generalUser = generalUsers.find(function (element) {
                    return element.userName === $scope.userName;
                });
                if (generalUser) {
                    $scope.editEntry = generalUser;
                    GeneralUserAppSharedService.getGeneralUsrAppsCreatedByV2(username, accessRole).then(function (response) {
                        if (response.status === "success") {
                            //Store a complete copy of all the general applications info
                            totalAppsResult = EditGeneralUserService.sortGeneralApplications(response.content.slice());
                            let generalAppIDs = $scope.editEntry.generalAppIDs;
                            let applications = totalAppsResult.slice();
                            EditGeneralUserService.applications = EditGeneralUserService.findExistNotExistApplications(generalAppIDs, applications, generalUserAppHeader, GENERAL_USER_APP_ID, GENERAL_USER_APP_NAME, ERROR_MESSAGE);

                            //Get EditGeneralUserService.popupHeader from applications array
                            completeTableHeader = DashboardTableSharedService.getTableHeader(generalUserAppHeader);

                            //Get EditGeneralUserService.popupBody and tableBody from applications array 
                            let tableBody = DashboardTableSharedService.getTableBody(completeTableHeader, EditGeneralUserService.applications);
                            completeTableBody = tableBody.tableBodyArray;

                            $scope.tableHeader = completeTableHeader;
                            $scope.tableBody = completeTableBody;
                            $scope.initializing = false;
                        }
                        else {
                            let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
                            $window.alert("Error occurred due to: " + errMsg);
                            $scope.tableHeader = [];
                            $scope.tableBody = [];
                            $scope.initializing = false;
                        }
                    });
                }
                //The user pass from general table may not sync with database, if another administrator delete the user
                //We may not find the user in the system, and need to give some error message to customer
                else {
                    let errMsg = "Cannot find this user in the system";
                    $window.alert("Error occurred due to: " + errMsg);
                    $scope.tableHeader = [];
                    $scope.tableBody = [];
                    $scope.initializing = false;
                }
            }
            else {
                let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + errMsg);
                $scope.tableHeader = [];
                $scope.tableBody = [];
                $scope.initializing = false;
            }
        });
    }

    //Init application ids filter
    function initApplicationFilter() {
        let applicationIDs = [""];
        applicationIDs = applicationIDs.concat(appIDRange);
        $scope.filterVal = applicationIDs[0] ? applicationIDs[0] : "";
        $scope.applicationIDs = applicationIDs;
    }

    function initBleApplicationFilter(applications) {
        let bleApplicationIDs = [""];
        for (let index in applications) {
            let application = applications[index];
            if (application.ble) {
                for (let i in application.ble) {
                    let bleApplication = application.ble[i];
                    if (bleApplication.bleAppID && !bleApplicationIDs.includes(bleApplication.bleAppID)) {
                        bleApplicationIDs.push(bleApplication.bleAppID);
                    }
                }
            }
        }
        $scope.filterValForBleApp = bleApplicationIDs[0];
        $scope.bleApplicationIDs = bleApplicationIDs.sort(function (a, b) {
            return parseInt(a) - parseInt(b);
        });
    }

    //Init unassigned general application array
    function initModalGeneralAppArray() {
        let generalAppIDs = $scope.editEntry.generalAppIDs;
        let applications = totalAppsResult.slice();
        assignAppResult = EditGeneralUserService.findAssignNotAssignApplications(generalAppIDs, applications);

        $scope.models.lists.unassignApps = assignAppResult.unassignedApps;
        $scope.models.lists.assignApps = assignAppResult.assignedApps;
        initApplicationFilter();
        initBleApplicationFilter($scope.models.lists.unassignApps);
    }

    function filterUnassignAppsByLoraAppID(unassignApps, loraAppID) {
        let result = [];
        for (let index in unassignApps) {
            let unassignApp = unassignApps[index];
            if (unassignApp.lora && unassignApp.lora.loraApplicationID === loraAppID) {
                result.push(unassignApp);
            }
        }
        return result;
    }

    function filterUnassignAppsByBleID(unassignApps, bleAppID) {
        let result = [];
        for (let index in unassignApps) {
            let unassignApp = unassignApps[index];
            if (unassignApp.ble) {
                for (let i in unassignApp.ble) {
                    if (unassignApp.ble[i].bleAppID === bleAppID) {
                        result.push(unassignApp);
                        break;
                    }
                }
            }
        }
        return result;
    }

    function filterUnassignAppsByLoraAppIDAndBleAppID(unassignApps, loraAppID, bleAppID) {
        let result = [];
        for (let index in unassignApps) {
            let unassignApp = unassignApps[index];
            if (unassignApp.lora && unassignApp.ble) {
                for (let i in unassignApp.ble) {
                    if (unassignApp.ble[i].bleAppID === bleAppID && unassignApp.lora.loraApplicationID === loraAppID) {
                        result.push(unassignApp);
                        break;
                    }
                }
            }
        }
        return result;
    }
};