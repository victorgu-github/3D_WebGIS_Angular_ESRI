'use strict';

module.exports = function ($scope, $timeout, $window, $log, $routeParams, monitorLoraDeviceSummaryService, dashTableConfig,
    loraDeviceService, AccountService) {
    const DEVICE_TYPE = "Device Type";

    let userInfo = AccountService.userInfo;
    let appIDRange = userInfo.appIDs;
    //Note: appID is a newly added field, there may be old data in the database without this field, 
    //      we do not show summary page for these abnormal data
    //1.Condition 1: if appIDRange is undefined and null in user account info, hide summary page
    //2.Condition 2: if appIDRange is not an array, appIDRange is invalid, hide summary page
    //3.Condition 3: if appIDRange is an empty array, appIDRange is invalide, hide summary page
    if (appIDRange === undefined || appIDRange === null || !Array.isArray(appIDRange) || appIDRange.length === 0) {
        $scope.hideSummaryPage = true;
    } else {
        $scope.hideSummaryPage = false;
        //Get the applicationIDs for applicationID dropdown list
        //Only appIDRange is valid, then we can initialize the applicationIDs drop-down list
        //Otherwise, we will receive console error, cannot assign $scope.applicationIDs[0] to $scope.applicationID
        $scope.applicationIDs = [];
        $scope.applicationIDs = $scope.applicationIDs.concat(appIDRange);
        $scope.applicationIDs.unshift("Application ID");
        $scope.applicationID = $scope.applicationIDs[0];
    }

    //compare devFromGwTrans and devFromApp, find the unique device exist in both gateway server and appliation server
    //store them in the array devFromGwApp
    let devFromGwApp = [];
    //use an array to store the number of device, separated by device type
    let numberOfDevByDevTypeArray;
    let dataStreamData;
    let standByTimeData;
    let ceillightSecData = {};
    let ceillightPowForLatest3Days = {};
    let ceillightGrossPower;
    let ceillightOnOffNumber;
    let historyInfoEndDateByDefault = new Date();
    let historyInfoStartDateByDefault = new Date(historyInfoEndDateByDefault - 24 * 3600000);

    $scope.deviceTypes = [];
    $scope.deviceType;
    $scope.historyDeviceTypes = [];
    $scope.historyDeviceType;
    $scope.attributes = [];
    $scope.attribute;
    $scope.numOfDevices;
    $scope.historyEndTime = monitorLoraDeviceSummaryService.setDefaultHistoryEndTime(historyInfoEndDateByDefault);
    $scope.historyStartTime = monitorLoraDeviceSummaryService.setDefaultHistoryStartTime(historyInfoStartDateByDefault);
    $scope.highChartShow = true;
    $scope.isLoading = true;
    $scope.isLoaded = false;

    //////////////////////////////////////////////////////////////
    //
    // Init monitor datatable
    //
    //////////////////////////////////////////////////////////////

    initCeilinglightSectionData();

    //init the device candidate value, get device types array
    loraDeviceService.getDefaultCandidateValues().then(function (response) {
        //init the device type for summary info
        let devTypeResp = response.content.candidateValues.DevType;
        $scope.deviceTypes.push(DEVICE_TYPE);
        $scope.deviceTypes = $scope.deviceTypes.concat(devTypeResp);
        $scope.deviceType = $scope.deviceTypes[0];
        //init the device type and attributes for history info
        $scope.historyDeviceTypes = monitorLoraDeviceSummaryService.initHistoryDeviceTypes();
        $scope.historyDeviceType = $scope.historyDeviceTypes[0];
        $scope.attributes = monitorLoraDeviceSummaryService.initHistoryDataDeviceAttributes();
        $scope.attribute = $scope.attributes[0];
    });

    //call web api get the lora device infomation according to application id, store the data locally
    loraDeviceService.getLoraDevicesInfo(appIDRange).then(function (response) {
        if (response.status === "success") {
            let nodeSessions = response.content.nodeSessions;
            nodeSessions.forEach(function (nodeSession) {
                devFromGwApp = devFromGwApp.concat(nodeSession.data);
            });
            $scope.numOfDevices = devFromGwApp.length;
            $scope.isLoading = false;
            $scope.isLoaded = true;
            try {
                initHighChart();
                initHistoryHighChart();
            } catch (err) {
                console.log(err);
            }
        } else {
            $window.alert("Error occurred due to: " + response.errors[0].message);
            $scope.hideSummaryPage = true;
        }
    });

    //////////////////////////////////////////////////////////////
    //
    // Widget function
    //
    //////////////////////////////////////////////////////////////

    //update the number of device according to applicationID and deviceType
    $scope.updateByAppID = function () {
        let applicationID = $scope.applicationID;
        let deviceType = $scope.deviceType;
        $scope.numOfDevices = monitorLoraDeviceSummaryService.updateNumOfDevices(applicationID, deviceType, devFromGwApp);

        if ($scope.deviceType !== DEVICE_TYPE && $scope.deviceType !== "ceilinglight") {
            $scope.highChartShow = false;
        } else {
            if ($scope.deviceType === DEVICE_TYPE) {
                $scope.highChartShow = true;
                initHighChart();
            } else if ($scope.deviceType === "ceilinglight") {
                $scope.highChartShow = true;
                drawCeillightHighChart();
            }
        }
    };

    $scope.updateByDevType = function () {
        let applicationID = $scope.applicationID;
        let deviceType = $scope.deviceType;
        $scope.numOfDevices = monitorLoraDeviceSummaryService.updateNumOfDevices(applicationID, deviceType, devFromGwApp);

        if ($scope.deviceType !== DEVICE_TYPE && $scope.deviceType !== "ceilinglight") {
            $scope.highChartShow = false;
        } else {
            if ($scope.deviceType === DEVICE_TYPE) {
                $scope.highChartShow = true;
                initHighChart();
            } else if ($scope.deviceType === "ceilinglight") {
                $scope.highChartShow = true;
                drawCeillightHighChart();
            }
        }
    };

    $scope.updateAttribute = function () {
        $scope.attributes = monitorLoraDeviceSummaryService.updateAttributesAccordingHistoryDeivceType($scope.historyDeviceType);
        if (!$scope.attributes.includes($scope.attribute)) {
            $scope.attribute = $scope.attributes[0];
        }
    };

    //update the history chart according to historyApplicationID and historyDeviceType and attributes
    $scope.drawHistoryHighChart = function () {
        drawHistoryHighChart($scope.historyDeviceType, $scope.attribute, $scope.historyStartTime, $scope.historyEndTime);
    };

    //////////////////////////////////////////////////////////////
    //
    // Private function
    //
    //////////////////////////////////////////////////////////////

    //init ceilinglight information by section, store them in different array, later on use it render the graph(id = 1)
    function initCeilinglightSectionData() {
        ceillightSecData = monitorLoraDeviceSummaryService.getceillightSecData();
        ceillightPowForLatest3Days = monitorLoraDeviceSummaryService.parseCeillightPowForLatest3Days(ceillightSecData, $scope.applicationID);
    }

    //init history info hightchart
    function initHistoryHighChart() {
        try {
            drawHistoryHighChart("all", "dataStream", $scope.historyStartTime, $scope.historyEndTime);
        } catch (err) {
            console.log(err);
        }

    }

    //init summary info highchart
    function initHighChart() {
        let containerIds = ['loraDevice-monitor-summary-graph1', 'loraDevice-monitor-summary-graph2', 'loraDevice-monitor-summary-graph3'];
        //draw different highChart
        numberOfDevByDevTypeArray = monitorLoraDeviceSummaryService.getnumberOfDevByDevTypeArray(devFromGwApp, $scope.applicationID);
        numberOfDevByDevTypeArray = monitorLoraDeviceSummaryService.parsenumberOfDevByDevTypeArray(numberOfDevByDevTypeArray);
        try {
            monitorLoraDeviceSummaryService.drawNumOfDevPieChart(containerIds[0], numberOfDevByDevTypeArray);
        } catch (err) {
            console.log(err);
        }


        standByTimeData = monitorLoraDeviceSummaryService.getStandByTimeData($scope.applicationID);
        standByTimeData = monitorLoraDeviceSummaryService.parseStandByTimeData(standByTimeData);
        try {
            monitorLoraDeviceSummaryService.drawStandByTimeChart(containerIds[2], $scope.deviceTypes, standByTimeData);
        } catch (err) {
            console.log(err);
        }

        monitorLoraDeviceSummaryService.getDataStreamData().then(function (response) {
            dataStreamData = monitorLoraDeviceSummaryService.getStandardDataStreamData($scope.deviceTypes, response.content);
            dataStreamData = monitorLoraDeviceSummaryService.parseDataStreamData(dataStreamData);
            try {
                monitorLoraDeviceSummaryService.drawDataStreamChart(containerIds[1], $scope.deviceTypes, dataStreamData);
            } catch (err) {
                console.log(err);
            }
        });
    }

    //draw ceillightHighChart
    function drawCeillightHighChart() {
        let containerIds = ['loraDevice-monitor-summary-graph1', 'loraDevice-monitor-summary-graph2', 'loraDevice-monitor-summary-graph3'];
        //get data, parse data, and then draw the charts
        ceillightSecData = monitorLoraDeviceSummaryService.getceillightSecData();
        ceillightPowForLatest3Days = monitorLoraDeviceSummaryService.parseCeillightPowForLatest3Days(ceillightSecData, $scope.applicationID);
        monitorLoraDeviceSummaryService.drawCeillightPowForLatest3DaysChart(containerIds[0], ceillightPowForLatest3Days);

        ceillightGrossPower = monitorLoraDeviceSummaryService.getCeillightGrossPower();
        ceillightGrossPower = monitorLoraDeviceSummaryService.parseCeillightGrossPower(ceillightGrossPower, $scope.applicationID);
        monitorLoraDeviceSummaryService.drawCeillightGrossPowerChart(containerIds[1], ceillightGrossPower);

        ceillightOnOffNumber = monitorLoraDeviceSummaryService.getCeillightOnOffNumber();
        ceillightOnOffNumber = monitorLoraDeviceSummaryService.parseCeillightOnOffNumber(ceillightOnOffNumber, $scope.applicationID);
        monitorLoraDeviceSummaryService.drawCeillightOnOffChart(containerIds[2], ceillightOnOffNumber);
    }

    function drawHistoryHighChart(historyDeviceType, attribute, historyStartTime, historyEndTime) {
        let containerIds = ['loraDevice-monitor-history-graph'];
        let validationResult = monitorLoraDeviceSummaryService.validateFormAttribute(historyDeviceType, attribute, historyStartTime, historyEndTime);
        if (validationResult.status === "success") {
            monitorLoraDeviceSummaryService.getDataStreamHistoryData(historyStartTime, historyEndTime)
                .then(function (response) {
                    let historyInfoData = response.content.result;
                    historyInfoData = monitorLoraDeviceSummaryService.filterHistoryInfoData(historyInfoData, historyDeviceType, attribute);
                    historyInfoData = monitorLoraDeviceSummaryService.parseHistoryInfoData(historyInfoData, attribute);
                    try {
                        let subtitle = (attribute === "dataStream") ? historyDeviceType + " data stream" : historyDeviceType + attribute;
                        monitorLoraDeviceSummaryService.drawHistoryInfoChart(containerIds[0], historyInfoData, historyDeviceType, attribute, 
                            "Device History Chart", subtitle, "History Data");
                    } catch (err) {
                        console.log(err);
                    }

                });
        } else {
            window.alert(validationResult.errorMessage);
        }
    }
};
