'use strict';
module.exports = function ($scope, $window, $location, $routeParams, dashTableConfig, loraDeviceService, dashboardSharedService, 
    DashboardTableSharedService) {
    //Zmq payload data field need to transfer, from ISO Date Format to Local Date Format
    const ZMQ_PAYLOAD_TRANS_FIELD = "timestamp";

    let zmqPayloadTableHeader = [];
    let zmqPayloadTableBody   = [];
    // Channel history data start time and end time
    let channelHistoryDataEndTimeByDefault = new Date();
    let channelHistoryDataStartTimeByDefault = new Date(channelHistoryDataEndTimeByDefault - 
        dashTableConfig.Devices.LoraDevice.channelHistory.timeDuration * 3600000);
    let ascSort = dashTableConfig.CommonSortAttr.sortAttribute.ASC_SORT;
    let dscSort = dashTableConfig.CommonSortAttr.sortAttribute.DSC_SORT;

    $scope.loraDeviceTableUrl = dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;
    $scope.datetime = {};
    $scope.datetime.channelHistoryDataEndTime   = dashboardSharedService.setDefaultEndTime(channelHistoryDataEndTimeByDefault);
    $scope.datetime.channelHistoryDataStartTime = dashboardSharedService.setDefaultStartTime(channelHistoryDataStartTimeByDefault);

    $scope.zmqPayloadAppID;
    $scope.zmqPayloadDevEUI;
    $scope.zmqPayloadDevType;
    $scope.zmqPayloadTimeInterval = {};
    $scope.zmqPayloadTimeIntervals;
    $scope.zmqPayloadSortMap;
    $scope.zmqPayloadSortAscMap;
    $scope.zmqPayloadInitializing = true;

    ////////////////////////////////////////////////////////////////////////
    //
    // Init Function
    //
    ////////////////////////////////////////////////////////////////////////

    initZmqPayloadAndChannelHistoryData();

    ////////////////////////////////////////////////////////////////////////
    //
    // Widget Function
    //
    ////////////////////////////////////////////////////////////////////////

    //Clean variable when close modal
    $scope.clearZmqPayloadData = function () {
        $scope.zmqPayloadInitializing = true;
        $scope.zmqPayloadTableHeader.length = [];
        $scope.zmqPayloadTableBody.length = [];
        zmqPayloadTableHeader.length = [];
        zmqPayloadTableBody.length = [];
    };

    //Change zmq payload data time interval, reload data
    $scope.changeTimeInterval = function () {
        $scope.zmqPayloadInitializing = true;
        loadZmqPayloadData();
    };

    //Sort function
    $scope.sortZmqPayloadTable = function (input) {
        let header = $scope.zmqPayloadTableHeader;
        //Find sort col's index
        let position = DashboardTableSharedService.findIndex(header, input);
        dashboardSharedService.sortTable(position, input, $scope.zmqPayloadSortMap, $scope.zmqPayloadSortAscMap, $scope.zmqPayloadTableBody, zmqPayloadTableBody, ascSort, dscSort);
    };

    //Get channel history data
    $scope.getChannelHistoryData = function () {
        let applicationID = $scope.zmqPayloadAppID;
        let devEUI = $scope.zmqPayloadDevEUI;
        let startTime = $scope.datetime.channelHistoryDataStartTime.toISOString();
        let endTime = $scope.datetime.channelHistoryDataEndTime.toISOString();
        loraDeviceService.getChannelHistoryData(applicationID, devEUI, startTime, endTime).then(function (response) {
            let hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:attachment/csv,' + encodeURI(response.data);
            hiddenElement.target = '_blank';
            hiddenElement.download = dashTableConfig.Devices.LoraDevice.channelHistory.fileName;
            hiddenElement.click();
        }).catch(function (error) {
            window.alert(error.data.error.errors[0].message);
        });
    };

    ////////////////////////////////////////////////////////////////////////
    //
    // Private Function
    //
    ////////////////////////////////////////////////////////////////////////

    //Init Zmq Payload Data Fields
    function initZmqPayloadAndChannelHistoryData() {
        //lora device type is not passed by url, we need use try ... catch ... to catch device type undefined error
        //If user provide a error url
        try {
            //1.Init ApplicationID Field
            $scope.zmqPayloadAppID = $routeParams.applicationID;
            //2.Init DevEUI Field
            $scope.zmqPayloadDevEUI = $routeParams.devEUI;
            //3.Init DevType Field
            $scope.zmqPayloadDevType = $routeParams.devType;
            //4.Init Time Interval Filter
            $scope.zmqPayloadTimeIntervals = [];
            for (let i = dashTableConfig.Devices.LoraDevice.zmqPayload.zmqPayloadTimeIntervalRange[0];
                i <= dashTableConfig.Devices.LoraDevice.zmqPayload.zmqPayloadTimeIntervalRange[1];
                i++) {
                $scope.zmqPayloadTimeIntervals.push(i);
            }
            $scope.zmqPayloadTimeInterval.val = dashTableConfig.Devices.LoraDevice.zmqPayload.zmqPayloadTimeIntervalDefaultVal;
            //5.Init Payload Data Table
            loadZmqPayloadData();
        }
        catch (error) {
            $scope.zmqPayloadInitializing = false;
            $scope.zmqPayloadTableHeader  = [];
            $scope.zmqPayloadTableBody    = [];
            window.alert(error);
        }
    }

    //Init Zmq Payload Data Table
    function loadZmqPayloadData() {

        zmqPayloadTableHeader = [];
        zmqPayloadTableBody   = [];

        loraDeviceService.getZmqPayloadData($scope.zmqPayloadAppID, $scope.zmqPayloadDevEUI, $scope.zmqPayloadTimeInterval.val)
            .then(function (response) {
                if (response.status === "success") {
                    let payloads = response.content.payload;
                    if (payloads.length !== 0) {
                        //Get zmqPayloadTableHeader from payloads
                        zmqPayloadTableHeader = DashboardTableSharedService.getPopupTableHeader(payloads);

                        //Get zmqPayloadTableBody payloads
                        zmqPayloadTableBody = getZmqPayloadTableBody(zmqPayloadTableHeader, payloads, ZMQ_PAYLOAD_TRANS_FIELD);

                        $scope.zmqPayloadTableHeader = zmqPayloadTableHeader;
                        $scope.zmqPayloadTableBody   = zmqPayloadTableBody;

                        $scope.zmqPayloadSortMap      = DashboardTableSharedService.initSortMap($scope.zmqPayloadTableHeader);
                        $scope.zmqPayloadSortAscMap   = DashboardTableSharedService.initSortMap($scope.zmqPayloadTableHeader);
                        $scope.zmqPayloadInitializing = false;
                    }
                    else {
                        $scope.zmqPayloadInitializing = false;
                        $scope.zmqPayloadTableHeader  = [];
                        $scope.zmqPayloadTableBody    = [];
                    }
                }
                else {
                    let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
                    $window.alert("Error occurred due to: " + errMsg);
                    $scope.zmqPayloadInitializing = false;
                    $scope.zmqPayloadTableHeader  = [];
                    $scope.zmqPayloadTableBody    = [];
                    $location.url("dashboard/device/loraDevices");
                }
            });
    }

    //Get the table body for zmq payload data
    function getZmqPayloadTableBody(tableHeader, payloads, timestamp) {
        let tableBody = [];
        for (let index in payloads) {
            let payload = payloads[index];
            let row = [];
            for (let key in payload) {
                if (key === timestamp) {
                    let timestampData = new Date(payload[key]);
                    timestampData = timestampData.toString().slice(0, 24);
                    row.push(timestampData);
                }
                else {
                    row.push(payload[key]);
                }
            }
            tableBody.push(row);
        }
        return tableBody;
    }
};