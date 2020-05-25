'use strict';

module.exports = function ($scope, $timeout, $window, $log, $routeParams, dashTableConfig, monitorLoraDeviceDatatableService,
    AccountService, loraDeviceService, dashboardSharedService) {
        
    ///////////////////////////////////////////////////
    //
    // Related variable and $scope variable
    //
    //////////////////////////////////////////////////
    let dynamicDataAttributes = dashTableConfig.MonitorAttributes.dataTable.dynamicDataAttributes;
    const DEV_EUI = dynamicDataAttributes.checkDeviceEUIAttr;
    const STATUS = dynamicDataAttributes.checkStatusAttr;
    const ASC_SORT = "ascending";
    const DSC_SORT = "descending";
    const INIT = "init";
    const UPDATE = "update";
    const REFRESH = "refresh";
    let userInfo = AccountService.userInfo;
    let appIDRange = userInfo.appIDs;
    let datatableHeaderOrder = dynamicDataAttributes.headerOrder;
    let refreshTime = dynamicDataAttributes.REFRESH_TIME;
    let tableHeader = [];
    let tableBody = [];
    $scope.initializing = true;
    $scope.applicationIDArr;
    $scope.applicationID;
    $scope.refreshTime;
    $scope.candidateVal;
    $scope.devTypeArr;
    $scope.subTypeMap;
    $scope.deviceType;
    $scope.intervalID;
    $scope.searchContent;
    $scope.checkedHeader;
    $scope.checkedRows = [];
    $scope.sortMap;
    $scope.sortAscMap;
    $scope.sortItem;
    $scope.showChgStatBtn;

    //////////////////////////////////////////////////
    //
    // Initialize table and refresh the data
    //
    //////////////////////////////////////////////////

    //Init to load the dynamic data
    initDataTable();

    //////////////////////////////////////////////////
    //
    // Widget Function 
    //
    //////////////////////////////////////////////////

    //Reload data when change the device type
    $scope.updateByDevType = function () {
        //First, close the previous refresh data function
        closeInterval($scope.intervalID);
        //Second, reload the data
        loadData();
        //Third, apply the refresh dynamic data function
        $scope.intervalID = setInterval(function () {
            refreshData();
        }, refreshTime);
    };

    //Change the lora devices status
    $scope.changeStatus = function () {
        let rowsValObjArray = monitorLoraDeviceDatatableService.getRowsObjArray($scope.tableHeader, $scope.checkedRows);
        //Validate if the rows are valid to change status
        //Invalid situation:
        //1. No device is slected
        //2. Device doesn't has attribute "status"
        //3. Devices status are not the same, for example, a device status is "On", b device status is "Off"
        //4. Devices status are the same but not valid, for example, "Waiting", "Unknown"
        let validationResult = monitorLoraDeviceDatatableService.validateRows(rowsValObjArray);
        changeLoraDeviceStatus(validationResult, rowsValObjArray);
    };

    //Change a single object current status by toggle button
    //Only when the row status === 'On' or 'Off', we allow to click toggle button and change status
    //Notice: for invalid status, we don't allow to click toggle button, but we allow to use checkbox
    //        when user change device status by check box, we will show error message for invalid status
    $scope.changeStatusByToggle = function (row) {
        let position = $scope.tableHeader.findIndex(function (element) { return element === STATUS; });
        if (position && position !== -1) {
            let status = row[position];
            if (status && (status === 'On' || status === 'Off')) {
                let rowsValObjArray = monitorLoraDeviceDatatableService.getRowObjArray($scope.tableHeader, row);
                let validationResult = monitorLoraDeviceDatatableService.validateRows(rowsValObjArray);
                changeLoraDeviceStatus(validationResult, rowsValObjArray);
            }
        }
    };

    //Search table content according to user input in search bar
    $scope.searchTable = function (operationType) {
        // Updatecase and lowercase insensitive
        // Step 1, hide all the table row
        // Step 2, find the specific tables row and display them
        $scope.tableBody = [];
        // For the first time init table body, the search content is undefined. 
        // So we need to check the search content value and then use it.
        let input = $scope.searchContent ? $scope.searchContent.toUpperCase() : "";
        let trs = tableBody;
        for (let i in trs) {
            let tr = trs[i];
            if (dashboardSharedService.rowIncludeElem(tr, input)) {
                $scope.tableBody.push(tr);
            }
        }
        // Step 3, after each filtering and searching, clear the status of check box status
        // clear tableHeader first col, tableBody first col, checkedRows array
        // if this operation is due to refresh operation, we mustn't clear check box status
        if (operationType !== REFRESH) {
            $scope.tableHeader[0] = false;
            $scope.tablBody = monitorLoraDeviceDatatableService.clearChkStatus($scope.tableBody);
            $scope.checkedHeader = false;
            $scope.checkedRows = [];
        }
    };

    //Select all the checked box
    $scope.selectAll = function () {
        if ($scope.tableHeader[0]) {
            //Set every check box elem to checked
            for (let index in $scope.tableBody) {
                let row = $scope.tableBody[index];
                row[0] = true;
            }
            //Record the table header check box situation, we need use it when refresh
            $scope.checkedHeader = true;
            //Clear checkedRows and then add all rows into checkedRows array
            $scope.checkedRows = [];
            for (let index in $scope.tableBody) {
                let row = $scope.tableBody[index];
                if (!$scope.checkedRows.includes(row)) {
                    $scope.checkedRows.push(row);
                }
            }
        }
        else {
            //Set every check box elem to unchecked
            for (let index in $scope.tableBody) {
                let row = $scope.tableBody[index];
                row[0] = false;
            }
            //Clear the table header check box situation, we need use it when refresh
            $scope.checkedHeader = false;
            //Add not include element into checkedRows array
            $scope.checkedRows = [];
        }
    };

    //Add and remove checked rows from checkedRows array
    $scope.addAndRemoveCheckedRow = function (row) {
        //When click the check box, add or remove an element in checked rows
        if (row[0]) {
            $scope.checkedRows.push(row);
        }
        else {
            let devEUIIndex = $scope.tableHeader.indexOf(DEV_EUI);
            let position = $scope.checkedRows.findIndex(function (element) {
                return element[devEUIIndex] === row[devEUIIndex];
            });
            $scope.checkedRows.splice(position, 1);
        }
    };

    //Sort function
    $scope.sortTableByClick = function (input) {
        $scope.sortItem = input ? input : $scope.sortItem;
        let header = $scope.tableHeader;
        //Find sort col's index
        let position = monitorLoraDeviceDatatableService.findIndex(header, $scope.sortItem);
        //Step 1: if we didn't sort before, we do the ascending sort for the first time
        if (!$scope.sortMap[$scope.sortItem]) {
            firstSort(position);
        }
        else {
            //Step 2: if we have already sort, we do the sorting according the current sorting status
            if (!$scope.sortAscMap[$scope.sortItem]) {
                ascendingSort(position);
            } else {
                descendingSort(position);
            }
        }
    };

    $scope.sortTableByRefresh = function () {
        let header = $scope.tableHeader;
        //Find sort col's index
        let position = monitorLoraDeviceDatatableService.findIndex(header, $scope.sortItem);
        //sortTableByRefresh is differnet from sortTableByClick
        //1. If $scope.sortMap[$scope.sortItem] is undefined, unnecessary to sort table
        //2. If $scope.sortAscMap[$scope.sortItem] is true, keep the previous sorting status
        //   However, in sortTableByClick $scope.sortAscMap[$scope.sortItem] is true will result
        //   in a status converting
        if ($scope.sortMap[$scope.sortItem]) {
            if ($scope.sortAscMap[$scope.sortItem]) {
                ascendingSort(position);
            } else {
                descendingSort(position);
            }
        }
    };

    //When leave the page, close the refresh function
    $scope.$on('$destroy', function () {
        if ($scope.intervalID) {
            closeInterval($scope.intervalID);
        }
    });

    ////////////////////////////////////////////////
    //
    // Private Function for CurrentStatus Controller
    //
    ////////////////////////////////////////////////

    //Init datatable main function
    function initDataTable() {
        tableHeader = [];
        tableBody = [];
        $scope.applicationIDArr = appIDRange;
        loadData(INIT);
        //For the first time, after init table header and table body, need init
        //$scope.sortMap and $scope.sortAscMap
        //But refresh and change device type operation shouldn't init sortMap and sortAscMap
        $scope.sortMap = monitorLoraDeviceDatatableService.initSortMap($scope.tableHeader);
        $scope.sortAscMap = monitorLoraDeviceDatatableService.initSortMap($scope.tableHeader);
        //Apply the refresh dynamic data function
        $scope.intervalID = setInterval(function () {
            refreshData();
        }, refreshTime);
    }

    //load data main function, has initializing process
    function loadData(operationType) {
        loraDeviceService.getDefaultCandidateValues().then(function (response) {
            if (response.status === "success") {
                $scope.initializing = true;
                $scope.candidateVal = response.content.candidateValues;
                $scope.devTypeArr = $scope.candidateVal.DevType;
                //Have the intersection of dashboard config file and candidate value, only display the device
                //exist in the system database and config file
                monitorLoraDeviceDatatableService.removeNoConfigDevType($scope.devTypeArr, dynamicDataAttributes);
                if ($scope.devTypeArr && $scope.devTypeArr.length !== 0) {
                    //We need to get the default value of device type during the initialization process. On the other hand,
                    //we only take the $scope.deviceType and use it directly
                    if (operationType === INIT) {
                        $scope.deviceType = monitorLoraDeviceDatatableService.getDefaultDevType($scope.devTypeArr, dynamicDataAttributes);
                    }

                    //Get device type and sub device type map, will use it to get current status and latest usage. And implement
                    //The device change status
                    $scope.subTypeMap = monitorLoraDeviceDatatableService.getSubDevTypeMap($scope.devTypeArr, $scope.candidateVal.subDeviceTypes);

                    //Get lora device current status and latest usage according to applicationID and devType
                    loraDeviceService.getCurrentStatusAndLatestUsage($scope.applicationIDArr, $scope.deviceType, dynamicDataAttributes, $scope.subTypeMap)
                        .then(function (responses) {
                            initializeDatatable(responses);
                            //After initialization and change device type, need to do three things:
                            //1. search table
                            //2. sort table
                            //3. determine if we need to show the change status button
                            $scope.searchTable(UPDATE);
                            $scope.sortTableByRefresh();
                            $scope.showChgStatBtn = $scope.tableHeader.includes(STATUS);
                            $scope.initializing = false;
                        }).catch(function (error) {
                            $scope.initializing = false;
                            $scope.tableBody = [];
                            $window.alert(JSON.parse(JSON.stringify(error)));
                        });
                } else {
                    $scope.initializing = false;
                    $scope.tableBody = [];
                    $window.alert("There is no intersection between system candidate value and dashboard config file");
                }
            }
        }).catch(function (error) {
            $scope.initializing = false;
            $scope.tableBody = [];
            $window.alert(JSON.parse(JSON.stringify(error)));
        });
    }

    //Refresh data main function, doesn't have initializing process
    function refreshData() {
        //Get lora device current status and latest usage according to applicationID and devType
        loraDeviceService.getCurrentStatusAndLatestUsage($scope.applicationIDArr, $scope.deviceType, dynamicDataAttributes, $scope.subTypeMap)
            .then(function (responses) {
                initializeDatatable(responses);
                //If operation type is "refresh", we need to set the check box status according to the previous status
                monitorLoraDeviceDatatableService.setTheaderChkBoxStatus($scope.checkedHeader, $scope.tableHeader);
                monitorLoraDeviceDatatableService.setTbodyChkBoxStatus($scope.checkedRows, $scope.tableHeader, $scope.tableBody);
                //Each time, after refresh data, we need to re-search the table
                //Because refresh operation will change the content in table body
                $scope.searchTable(REFRESH);
                $scope.sortTableByRefresh();
                $scope.showChgStatBtn = $scope.tableHeader.includes(STATUS);
            }).catch(function (error) {
                $scope.initializing = false;
                $scope.tableBody = [];
                $window.alert(JSON.parse(JSON.stringify(error)));
            });
    }

    //Use the data to initialize datatable header and body
    function initializeDatatable(data) {
        tableHeader = monitorLoraDeviceDatatableService
            .getDataTableHeader($scope.deviceType, dynamicDataAttributes, $scope.subTypeMap);
        //Change tableHeader order, set "status" as the first column
        //currently, ["device type", "application id", "devEUI", "status"]
        //later on, ["status", "application id", "device type", "devEUI"]
        tableHeader = monitorLoraDeviceDatatableService
            .changeHeaderOrder(tableHeader, datatableHeaderOrder);

        tableBody = monitorLoraDeviceDatatableService
            .getDataTableBody(tableHeader, data);

        //Get applicationID and devEUI default sort index from tableHeader
        //for example, ["status", "application id", "device type", "deviceEUI"]
        //should return defaultSortIndex = {applicationID: 1, devEUI: 3}
        let defaultSortIndex = monitorLoraDeviceDatatableService
            .getDefaultSortIndex(tableHeader);

        //Use defaultSortIndex to excute default sort for table body
        //For example, applicationID = 1, first sort col 1 of table body 
        //             devEUI = 3, then sort col3 of table body
        tableBody = monitorLoraDeviceDatatableService
            .defaultSortTableBody(tableBody, defaultSortIndex);

        $scope.tableHeader = tableHeader;
        $scope.tableBody = tableBody;
        
        //No mater which operation type, we need to add check box col for table header and body during initializing process
        monitorLoraDeviceDatatableService.addThChkStatus($scope.tableHeader);
        monitorLoraDeviceDatatableService.addTBChkStatus($scope.tableBody);
    }

    function closeInterval(id) {
        clearInterval(id);
    }

    function firstSort(position) {
        $scope.sortMap[$scope.sortItem] = true;
        $scope.sortAscMap[$scope.sortItem] = true;
        monitorLoraDeviceDatatableService.clearSortMap($scope.sortMap, $scope.sortItem);
        monitorLoraDeviceDatatableService.clearSortMap($scope.sortAscMap, $scope.sortItem);
        monitorLoraDeviceDatatableService.sortTable(position, $scope.tableBody, ASC_SORT);
        monitorLoraDeviceDatatableService.sortTable(position, tableBody, ASC_SORT);
    }

    function ascendingSort(position) {
        $scope.sortMap[$scope.sortItem] = true;
        $scope.sortAscMap[$scope.sortItem] = true;
        monitorLoraDeviceDatatableService.clearSortMap($scope.sortMap, $scope.sortItem);
        monitorLoraDeviceDatatableService.clearSortMap($scope.sortAscMap, $scope.sortItem);
        monitorLoraDeviceDatatableService.sortTable(position, $scope.tableBody, ASC_SORT);
        monitorLoraDeviceDatatableService.sortTable(position, tableBody, ASC_SORT);
    }

    function descendingSort(position) {
        $scope.sortMap[$scope.sortItem] = true;
        $scope.sortAscMap[$scope.sortItem] = false;
        monitorLoraDeviceDatatableService.clearSortMap($scope.sortMap, $scope.sortItem);
        monitorLoraDeviceDatatableService.clearSortMap($scope.sortAscMap, $scope.sortItem);
        monitorLoraDeviceDatatableService.sortTable(position, $scope.tableBody, DSC_SORT);
        monitorLoraDeviceDatatableService.sortTable(position, tableBody, DSC_SORT);
    }

    //Change lora device status after validation
    function changeLoraDeviceStatus(validationResult, rowsValObjArray) {
        if (validationResult.status === "success") {
            loraDeviceService.changeLoraDevStatus(rowsValObjArray, dynamicDataAttributes).then(function () {
                refreshData();
            }).catch(function (error) {
                $window.alert(JSON.parse(JSON.stringify(error)));
            });
        } else {
            $window.alert(validationResult.errorMessage);
        }
    }
};
