'use strict';

module.exports = function ($scope, $window, $routeParams, $location, dashboardConstant, dashTableConfig, AccountService, 
    dashboardSharedService, DashboardTableSharedService, BLEApplicationSharedService, BLENodeSharedService) {

    ///////////////////////////////////////
    //
    // Variable 
    //
    ///////////////////////////////////////    

    const FORM_STATUS = {
        SUBMITTED: "submitted",
        EDITING: "editing",
        INVALID: "invalid"
    };
    let bleNodeEditPageUrl = "/dashboard/ble/bleNode/edit/";

    let completeTableHeader;
    let completeTableBody;

    $scope.formStatus     = FORM_STATUS.EDITING;
    $scope.bleAppTableUrl = dashboardConstant.BLE_APPLICATION.OVERVIEW_TABLE_URL;
    $scope.initializing   = true;
    $scope.showSubmitBtn  = false;
    $scope.numOfBleNodes  = 0;

    ///////////////////////////////////////
    //
    // Main Function
    //
    ///////////////////////////////////////

    initEditData();

    ///////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////

    //Close Alert
    $scope.closeAlert = function () {
        $scope.formStatus = FORM_STATUS.EDITING;
    };

    $scope.getEditBleApplicationFormClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "dashboard-edit-page-edit-app-form-mobile well";
        }
        else {
            return "dashboard-edit-page-edit-app-form well";
        }
    };

    $scope.getBleApplicationTableClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "dashboard-edit-page-edit-app-table-row-mobile row well";
        }
        else {
            return "dashboard-edit-page-edit-app-table-row row well";
        }
    };

    $scope.getDashboardEditPageSubmitBtnClass = function () {
        if (AccountService.userInfo.isCellPhone) {
            return "dashboard-edit-page-edit-app-submit-btn-mobile row";
        }
        else {
            return "dashboard-edit-page-edit-app-submit-btn row";
        }
    }; 

    //Relocate to register ble node page
    $scope.createDev = function () {
        let url = "/dashboard/ble/bleNode/new?bleAppID=" + $routeParams.bleAppID;
        $location.url(url);
    };

    //Relocate to update ble node page
    $scope.editDevice = function (row) {
        let macAddress;
        let url;

        let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.BLE_NODES.OVERVIEW_TABLE_ATTRIBUTES.MAC_ADDRESS.KEY]);
        if (result.status === "success") {
            macAddress = result.macAddress;
            url = bleNodeEditPageUrl + $routeParams.bleAppID + "/" + macAddress;
            $location.url(url);
        }
        else {
            $window.alert("Cannot edit this record, please make sure the key index exist in the row");
        }
    };

    //Delete ble node
    $scope.deleteDevice = function (row) {
        let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.BLE_NODES.OVERVIEW_TABLE_ATTRIBUTES.MAC_ADDRESS.KEY]);
        if (result.status === "success") {
            let confirmResult = window.confirm("Are you sure to remove this node?");
            if (confirmResult === true) {
                BLENodeSharedService.delBleNodes($routeParams.bleAppID, [result.macAddress]).then(function (response) {
                    if (response.status === 'success') {
                        location.reload();
                    }
                    else {
                        $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                        $window.alert("Error occurred due to: " + $scope.errorMessage);
                    }
                });
            }
        }
        else {
            $window.alert("Cannot delete this node, please make sure macAddress exist for this node!");
        }
    };

    //If user change genearl user application name, display submit button
    $scope.displaySubmit = function () {
        if ($scope.editEntryOrigin) {
            for (let key in $scope.editEntryOrigin) {
                if ($scope.editEntry[key] !== $scope.editEntryOrigin[key]) {
                    $scope.showSubmitBtn = true;
                    break;
                }
                else {
                    $scope.showSubmitBtn = false;
                }
            }
        }
    };

    //Submit the for and register the ble application
    $scope.submit = function (isValid) {
        $scope.closeAlert();
        if (isValid || isValid === undefined) {
            //Register the new ble application
            BLEApplicationSharedService.updateBleApplication($scope.editEntry).then(function (response) {
                if (response.status === "success") {
                    $window.alert("Ble Application Update Success");
                    let url = $scope.bleAppTableUrl;
                    $window.location.href = url;
                }
                else {
                    $scope.formStatus   = FORM_STATUS.INVALID;
                    $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + $scope.errorMessage);
                }
            });
        }
        else {
            $scope.formStatus   = FORM_STATUS.INVALID;
            $scope.errorMessage = "you have entered invalid fields, notice that the number fields cannot filled in with text";
            $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        }
    };

    ///////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////

    //Init device table by default application id
    function initEditData() {
        BLEApplicationSharedService.getBleApplication($routeParams.bleAppID).then(function (response) {
            if (response.status === "success" && response.content.length !== 0) {
                $scope.editEntry = response.content[0];
                $scope.editEntry.createdAt = DashboardTableSharedService.transSingleISOTimeToLocaleTime($scope.editEntry.createdAt);
                $scope.editEntryOrigin = Object.assign({}, $scope.editEntry);
                loadBleNodeTable($routeParams.bleAppID);
                $scope.initializing = false;
            }
            else if (response.status === "success" && response.content.length === 0) {
                $scope.formStatus   = FORM_STATUS.INVALID;
                $scope.errorMessage = "Cannot find this ble application in the system";
                $window.alert("Error occurred due to: " + $scope.errorMessage);
                $scope.initializing = false;
            }
            else {
                $scope.formStatus   = FORM_STATUS.INVALID;
                $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + $scope.errorMessage);
                $scope.initializing = false;
            }
        });
    }

    //Load device table content according to application id
    function loadBleNodeTable(bleAppID) {
        BLENodeSharedService.getBleNodes(bleAppID).then(function (resp) {
            $scope.initializing = true;
            if (resp.status === "success") {
                let bleNodes = resp.content;
                let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.BLE_NODES.OVERVIEW_TABLE_ATTRIBUTES);
                completeTableHeader = tableHeader.completeTableHeader;
                //Get tableBody from node sessions
                let tableBody = DashboardTableSharedService.getTableBody(completeTableHeader, bleNodes);
                completeTableBody    = tableBody.tableBodyArray;
                $scope.tableHeader   = completeTableHeader;
                $scope.tableBody     = completeTableBody;
                $scope.numOfBleNodes = $scope.tableBody.length;
                $scope.initializing  = false;
            }
            else {
                $scope.formStatus   = FORM_STATUS.INVALID;
                $scope.errorMessage = dashboardSharedService.parseErrorMessage(resp.errors);
                $window.alert("Error occurred due to: " + $scope.errorMessage);
                $scope.tableHeader  = [];
                $scope.tableBody    = [];
                $scope.initializing = false;
            }
        });
    }
};