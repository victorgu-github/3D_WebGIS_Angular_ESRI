'use strict';

module.exports = function ($http, appConfig, dashTableConfig, CollectionUtils, PieChart, MultiAxisForMonitor, HistoryChart,
    HttpResponseHandler, Gauge, fakeDataForMonitorSummary) {
    let self = this;
    const TIMEOUT = 30000;
    const DEVICE_TYPE = "Device Type";
    const DEVICE_ATTRIBUTE = "Device Attribute";

    let nodeServer = appConfig.nodeServer;
    let summaryInfoBaseUrl = dashTableConfig.MonitorAttributes.summaryInfoUrlForDatastream.baseUrl.urlPrefix;
    let historyInfoBaseUrl = dashTableConfig.MonitorAttributes.historyInfoUrlForDatastream.baseUrl.urlPrefix;
    let summaryInfoByAppIDData = fakeDataForMonitorSummary.summaryInfoByAppID.data;
    let unitForStandByTime = fakeDataForMonitorSummary.summaryInfoByAppID.unit.unitForStandByTime;
    let ceillightSectionInfo = fakeDataForMonitorSummary.ceillightSectionInfo;
    let sections = ceillightSectionInfo.sections;
    let ceillightGeneralInfoData = fakeDataForMonitorSummary.ceillightGeneralInfo.data;
    let unitForCeillightPowerUsage = fakeDataForMonitorSummary.ceillightGeneralInfo.unit.unitForCeillightPowerUsage;
    let unitForCeillightGrossPower = fakeDataForMonitorSummary.ceillightSectionInfo.unit.unitForCeillightGrossPower;
    let updateDeviceTypesAndAttributes = dashTableConfig.MonitorAttributes.updateDeviceTypesAndAttributes;
    let monitorDeviceTypes = getInitDeviceTypes(updateDeviceTypesAndAttributes);
    let monitorDeviceAttributes = [];
    let historyData = fakeDataForMonitorSummary.historyData;
    let summaryInfoDataStreamStartTime;
    let summaryInfoDataStreamEndTime;

    //init summary info page, calculate the page responsive height
    self.calcMonitorHeight = function () {
        let monitorHeight = window.innerHeight;
        let monitorInnerHeight;
        //In 100% height, Fixed header height is 400, 50 left for the padding-bottom
        monitorInnerHeight = (monitorHeight - 200);
        return monitorInnerHeight;
    };

    //update the number of devices according to applicationID and deviceType
    self.updateNumOfDevices = function (applicationID, deviceType, devFromGwApp) {
        let updateDevArray = [];
        if (applicationID === "Application ID" && deviceType === DEVICE_TYPE) {
            return devFromGwApp.length;
        } else if (applicationID === "Application ID" && deviceType !== DEVICE_TYPE) {
            for (let i = 0; i < devFromGwApp.length; i++) {
                if (devFromGwApp[i].DevType === deviceType) {
                    updateDevArray.push(devFromGwApp[i]);
                }
            }
            return updateDevArray.length;
        } else if (applicationID !== "Application ID" && deviceType === DEVICE_TYPE) {
            for (let i = 0; i < devFromGwApp.length; i++) {
                if (devFromGwApp[i].ApplicationID === applicationID) {
                    updateDevArray.push(devFromGwApp[i]);
                }
            }
            return updateDevArray.length;
        } else {
            for (let i = 0; i < devFromGwApp.length; i++) {
                if (devFromGwApp[i].ApplicationID === applicationID && devFromGwApp[i].DevType === deviceType) {
                    updateDevArray.push(devFromGwApp[i]);
                }
            }
            return updateDevArray.length;
        }
    };

    /////////////////////////////////////////////////////////////////////////
    // 
    //  Draw summary info graph
    //
    /////////////////////////////////////////////////////////////////////////
    //get the summary info data for lora devices
    //leave a interface for future implement
    self.getnumberOfDevByDevTypeArray = function (devFromGwApp, applicationID) {
        let numberOfDevByDevTypeArray = [];
        if (applicationID === "Application ID") {
            numberOfDevByDevTypeArray = devFromGwApp;
        } else {
            for (let i = 0; i < devFromGwApp.length; i++) {
                if (devFromGwApp[i].ApplicationID === applicationID) {
                    numberOfDevByDevTypeArray.push(devFromGwApp[i]);
                }
            }
        }
        return numberOfDevByDevTypeArray;
    };

    self.parsenumberOfDevByDevTypeArray = function (numberOfDevByDevTypeArray) {
        let nodesDivideByDevType = CollectionUtils.groupBy(numberOfDevByDevTypeArray, 'DevType');
        return nodesDivideByDevType;
    };
    
    //draw the pie chart for number of device, separated by devicetype
    self.drawNumOfDevPieChart = function (containerIds, numberOfDevByDevTypeArray) {
        let option = {};
        option.title = "Number of Devices by Device Type";
        option.series = {
            name: 'Number of Devices by Device Type',
            colorByPoint: true,
            data: []
        };

        for (let deviceType in numberOfDevByDevTypeArray) {
            if (numberOfDevByDevTypeArray.hasOwnProperty(deviceType)) {
                option.series.data.push({
                    name: deviceType,
                    y: numberOfDevByDevTypeArray[deviceType].length
                });
            }
        }

        let pieChart = new PieChart(containerIds, option.title, [option.series]);
        pieChart.draw();
    };

    //draw the multiAxis chart for data stream, separated by deviceType, xAxis
    self.getDataStreamData = function () {
        let baseUrl = nodeServer + summaryInfoBaseUrl;
        let url;
        summaryInfoDataStreamEndTime = getIntegerHour(new Date());
        summaryInfoDataStreamStartTime = getSummaryInfoDatastreamStartTime(summaryInfoDataStreamEndTime);
        summaryInfoDataStreamEndTime = summaryInfoDataStreamEndTime.toString();
        summaryInfoDataStreamStartTime = summaryInfoDataStreamStartTime.toString();
        url = baseUrl + "start/" + summaryInfoDataStreamStartTime + "/end/" + summaryInfoDataStreamEndTime;
        let promise = $http.get(url, { timeout: TIMEOUT });
        promise = promise.then(function (response) {
            return HttpResponseHandler.handleResponse(response.data);
        }).catch(function (error) {
            return HttpResponseHandler.handleError(error, url, TIMEOUT);
        });
        return promise;
    };

    self.getStandardDataStreamData = function (deviceTypes, response) {
        let dataStreamData = [];
        //loop from i = 1, because i = 0 is "Device Type"
        for (let i = 1; i < deviceTypes.length; i++) {
            let dataStreamDataObject = {};
            let dataStreamDataDevEUIs = [];
            dataStreamDataObject.devType = deviceTypes[i];
            dataStreamDataObject.numOfDevice = 0;
            dataStreamDataObject.dataStream = 0;
            for (let j = 0; j < response.result.length; j++) {
                dataStreamDataObject.dataStream += getDataStreamDataForEachDay(dataStreamDataObject, response.result[j].aggregationByDevType);
                dataStreamDataDevEUIs = dataStreamDataDevEUIs.concat(getDevEUIsForEachDay(dataStreamDataObject, response.result[j].aggregationByDevType));
            }
            dataStreamDataDevEUIs = getUniqueDataStreamDataDevEUIs(dataStreamDataDevEUIs);
            dataStreamDataObject.numOfDevice = dataStreamDataDevEUIs.length;
            dataStreamData.push(dataStreamDataObject);
        }
        return dataStreamData;
    };

    self.parseDataStreamData = function (dataStreamData) {
        dataStreamData = CollectionUtils.groupBy(dataStreamData, 'devType');
        return dataStreamData;
    };

    self.drawDataStreamChart = function (containerIds, deviceTypes, dataStreamData) {
        let nodesDivideByDevType = dataStreamData;
        let nodesSumDatastream;
        let nodesAvgDatastream;
        let startTime = summaryInfoDataStreamStartTime.substring(0, 16);
        let endTime = summaryInfoDataStreamEndTime.substring(0, 16);
        let option = {};
        option.type = "xy";
        option.title = "Number of Data Stream";
        option.subtitle = "From " + startTime + " to " + endTime +"";
        option.xAxis = deviceTypes.slice(1, deviceTypes.length);
        option.yAxis = [{ // Primary yAxis
            labels: {
                format: '{value}',
            },
            title: {
                text: '',
            },
        }, { // Secondary yAxis
            labels: {
                format: '{value}',
            },
            title: {
                text: '',
            },
        }];
        option.legend = {
            x: 0,
            y: 60
        };

        nodesSumDatastream = calNodesSumDatastream(option.xAxis, nodesDivideByDevType);
        nodesAvgDatastream = calNodesAvgDatastream(option.xAxis, nodesDivideByDevType);

        option.series = [{
            name: 'Sum Data Stream',
            type: 'column',
            yAxis: 0,
            data: [],
            tooltip: {
                valueSuffix: ' '
            }

        }, {
            name: 'Unit Data Stream',
            type: 'column',
            yAxis: 1,
            data: [],
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: ' '
            }

        }];

        putNodesSumDatastream(nodesSumDatastream, option.series[0]);
        putNodesAvgDatastream(nodesAvgDatastream, option.series[1]);

        let multiAxisForMonitor = new MultiAxisForMonitor(containerIds, option.type, option.title, option.subtitle, option.xAxis,
            option.yAxis, option.legend, option.series);
        multiAxisForMonitor.draw();
    };

    self.getStandByTimeData = function (applicationID) {
        let standByTimeData = [];
        if (applicationID === "Application ID") {
            for (let i = 0; i < summaryInfoByAppIDData.length; i++) {
                standByTimeData.push(summaryInfoByAppIDData[i]);
            }
        } else {
            for (let i = 0; i < summaryInfoByAppIDData.length; i++) {
                if (summaryInfoByAppIDData[i].ApplicationID === applicationID) {
                    standByTimeData.push(summaryInfoByAppIDData[i]);
                }
            }
        }
        return standByTimeData;
    };

    self.parseStandByTimeData = function (standByTimeData) {
        standByTimeData = CollectionUtils.groupBy(standByTimeData, 'DevType');
        return standByTimeData;
    };

    //draw the multiAxis chart for stand by time, separated by deviceType, xAxis
    self.drawStandByTimeChart = function (containerIds, deviceTypes, standByTimeData) {
        let nodesDivideByDevType = standByTimeData;
        let nodesSumStandByTime;
        let nodesAvgStandByTime;
        let StandByTimeData = {};
        StandByTimeData.type = "bar";
        StandByTimeData.title = "Device Standby Time";
        StandByTimeData.subtitle = "";
        StandByTimeData.xAxis = deviceTypes.slice(1, deviceTypes.length);
        StandByTimeData.yAxis = [{ // Primary yAxis
            labels: {
                format: '{value} ' + unitForStandByTime,
            },
            title: {
                text: '',
            },
        }, { // Secondary yAxis
            labels: {
                format: '{value} ' + unitForStandByTime,
            },
            title: {
                text: '',
            },
        }];
        StandByTimeData.legend = {
            x: 0,
            y: 100
        };

        nodesSumStandByTime = calNodesSumStandByTime(StandByTimeData.xAxis, nodesDivideByDevType);
        nodesAvgStandByTime = calNodesAvgStandByTime(StandByTimeData.xAxis, nodesDivideByDevType);

        StandByTimeData.series = [{
            name: 'Sum Standby Time',
            type: 'column',
            yAxis: 0,
            data: [],
            tooltip: {
                valueSuffix: ' ' + unitForStandByTime
            }

        }, {
            name: 'Unit Standby Time',
            type: 'column',
            yAxis: 1,
            data: [],
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: ' ' + unitForStandByTime
            }

        }];

        putNodesSumStandByTime(nodesSumStandByTime, StandByTimeData.series[0]);
        putNodesAvgStandByTime(nodesAvgStandByTime, StandByTimeData.series[1]);
        
        let multiAxisForMonitor = new MultiAxisForMonitor(containerIds, StandByTimeData.type, StandByTimeData.title, StandByTimeData.subtitle, StandByTimeData.xAxis,
            StandByTimeData.yAxis, StandByTimeData.legend, StandByTimeData.series);
        multiAxisForMonitor.draw();
    };

    /////////////////////////////////////////////////////////////////////////
    // 
    //  Draw ceiling light graph
    //
    /////////////////////////////////////////////////////////////////////////
    self.getceillightSecData = function () {
        let ceillightSecData = {};
        for (let i = 0; i < sections.length; i++) {
            let sectionName = sections[i].secName;
            ceillightSecData[sectionName] = ceillightSectionInfo[sectionName];
        }
        return ceillightSecData;
    };

    self.parseCeillightPowForLatest3Days = function (ceillightSecData, applicationID) {
        let ceillightPowForLatest3Days = {
            Day1: [],
            Day2: [],
            Day3: []
        };
        //use changeTimestampToDate to change "2017-10-06T21:11:00.000Z" to "Mon Nov 06 2017 00:00:00 GMT-0700 (MST)"
        //to decide the 1 2 3 day date before, we need "Mon Nov 06 2017 00:00:00 GMT-0700 (MST)"
        let currentTimeStamp = new Date("2017-10-06T21:11:00.000Z");
        let currentDate = CollectionUtils.changeTimestampToDate(currentTimeStamp);
        for (let section in ceillightSecData) {
            let Day1Data = parseLatest3DaysData(ceillightSecData[section], currentDate, 1, applicationID);
            let Day2Data = parseLatest3DaysData(ceillightSecData[section], currentDate, 2, applicationID);
            let Day3Data = parseLatest3DaysData(ceillightSecData[section], currentDate, 3, applicationID);
            ceillightPowForLatest3Days.Day1.push(Day1Data);
            ceillightPowForLatest3Days.Day2.push(Day2Data);
            ceillightPowForLatest3Days.Day3.push(Day3Data);
        }
        return ceillightPowForLatest3Days;
    };

    self.drawCeillightPowForLatest3DaysChart = function (containerIds, ceillightPowForLatest3Days) {
        let option = {};
        option.type = "xy";
        option.title = "Latest 3 Days Power Usage";
        option.subtitle = "";
        option.xAxis = ['Day1', 'Day2', 'Day3'];
        option.yAxis = [
            { // Primary yAxis
                labels: {
                    format: '{value} ' + unitForCeillightPowerUsage,
                },
                title: {
                    text: 'Latest 3 Days Power Usage',
                },
            },
            {
                labels: {
                    format: '',
                },
                title: {
                    text: '',
                },
            },
        ],
        option.legend = {
            x: -200,
            y: 20
        };
        option.series = [];

        initOptionSeries(sections, option.series);
        putPowerUsageByDate(ceillightPowForLatest3Days, option.series, sections);
        
        let multiAxisForMonitor = new MultiAxisForMonitor(containerIds, option.type, option.title, option.subtitle, option.xAxis,
            option.yAxis, option.legend, option.series);
        multiAxisForMonitor.draw();
    };

    self.getCeillightGrossPower = function () {
        return ceillightGeneralInfoData;
    };

    self.parseCeillightGrossPower = function (ceillightGrossPower, applicationID) {
        let grossPower = 0;
        if (applicationID === "Application ID") {
            for (let i = 0; i < ceillightGrossPower.length; i++) {
                grossPower += ceillightGrossPower[i].grossPower;
            }
        } else {
            for (let i = 0; i < ceillightGrossPower.length; i++) {
                if (ceillightGrossPower[i].ApplicationID === applicationID) {
                    grossPower += ceillightGrossPower[i].grossPower;
                }
            }
        }
        return grossPower;
    };

    self.drawCeillightGrossPowerChart = function (containerIds, ceillightGrossPower) {
        let option = {};
        option.title = "Ceiling Light Gross Power";
        option.startAngle = -90;
        option.endAngle = 90;
        option.minValue = 2000;
        option.maxValue = 26000;
        option.unit = unitForCeillightGrossPower;
        option.plotBands = [{
            from: 2000,
            to: 6000,
            color: '#000080'  // deep blue
        }, {
            from: 6000,
            to: 10000,
            color: '#0000ff' // blue
        }, {
            from: 10000,
            to: 14000,
            color: '#00ffff' // light blue
        }, {
            from: 14000,
            to: 18000,
            color: '#00ff00' //green
        }, {
            from: 18000,
            to: 22000,
            color: '#ffa500' // orange
        }, {
            from: 22000,
            to: 26000,
            color: '#ff0000' // red
        }];
        option.hintName = "Battery Level";
        option.value = ceillightGrossPower;

        let gauge = new Gauge(containerIds, option.title, option.startAngle, option.endAngle, option.minValue, option.maxValue,
            option.unit, option.plotBands, option.hintName, [option.value]);

        gauge.draw();
    };

    self.getCeillightOnOffNumber = function () {
        return ceillightGeneralInfoData;
    };

    self.parseCeillightOnOffNumber = function (ceillightOnOffNumber, applicationID) {
        let onOffNumber = {
            on: 0,
            off: 0
        };
        if (applicationID === "Application ID") {
            for (let i = 0; i < ceillightOnOffNumber.length; i++) {
                onOffNumber.on += ceillightOnOffNumber[i].ceilinglightOn;
                onOffNumber.off += ceillightOnOffNumber[i].ceilinglightOff;
            }
        } else {
            for (let i = 0; i < ceillightOnOffNumber.length; i++) {
                if (ceillightOnOffNumber[i].ApplicationID === applicationID) {
                    onOffNumber.on += ceillightOnOffNumber[i].ceilinglightOn;
                    onOffNumber.off += ceillightOnOffNumber[i].ceilinglightOff;
                }
            }
        }
        return onOffNumber;
    };

    self.drawCeillightOnOffChart = function (containerIds, ceillightOnOffNumber) {
        let option = {};
        option.title = "Ceiling Light On and Off Number";
        option.series = [{
            name: 'On and Off Number',
            colorByPoint: true,
            data: [{
                name: 'On',
                y: ceillightOnOffNumber.on
            }, {
                name: 'Off',
                y: ceillightOnOffNumber.off,
            }]
        }];

        let pieChart = new PieChart(containerIds, option.title, [option.series[0]]);
        pieChart.draw();
    };

    /////////////////////////////////////////////////////////////////////////
    // 
    //  Draw history chart
    //
    /////////////////////////////////////////////////////////////////////////
    self.drawEmptyHistoryChart = function (containerIds) {
        let option = {};
        option.title = "Device History Chart";
        option.subtitle = "No Data";
        option.yAxis = "History Data";
        option.series = [{
            type: 'area',
            name: '',
            data: []
        }];

        let historyChart = new HistoryChart(containerIds, option.title, option.subtitle, option.yAxis, option.series);
        historyChart.draw();
    };

    self.setDefaultHistoryEndTime = function (historyInfoEndDateByDefault) {
        let endTime = new Date(historyInfoEndDateByDefault.getFullYear(), historyInfoEndDateByDefault.getMonth(),
            historyInfoEndDateByDefault.getDate(), historyInfoEndDateByDefault.getHours());
        return endTime;
    };

    self.setDefaultHistoryStartTime = function (historyInfoStartDateByDefault) {
        let startTime = new Date(historyInfoStartDateByDefault.getFullYear(), historyInfoStartDateByDefault.getMonth(),
            historyInfoStartDateByDefault.getDate(), historyInfoStartDateByDefault.getHours());
        return startTime;
    };

    self.initHistoryDeviceTypes = function () {
        let deviceTypes = [];
        deviceTypes.push(DEVICE_TYPE);
        deviceTypes = deviceTypes.concat(monitorDeviceTypes);
        return deviceTypes;
    };

    self.initHistoryDataDeviceAttributes = function () {
        let attributes = [];
        attributes.push(DEVICE_ATTRIBUTE);
        attributes = attributes.concat(monitorDeviceAttributes);
        return attributes;
    };

    self.validateFormAttribute = function (deviceType, attribute, historyStartTime, historyEndTime) {
        let validationResult = {
            status: "",
            errorMessage: ""
        };
        if (deviceType !== DEVICE_TYPE) {
            if (attribute !== DEVICE_ATTRIBUTE) {
                if (!isEmptyStartTimeEndTime(historyStartTime, historyEndTime)) {
                    if (!durationOverLimit(historyStartTime, historyEndTime)) {
                        if (!endTimeLateThanCurrentTime(historyEndTime)) {
                            if (endTimeBehindStartTime(historyStartTime, historyEndTime)) {
                                validationResult.status = "success";
                                validationResult.errorMessage = "";
                            } else {
                                validationResult.status = "error";
                                validationResult.errorMessage = "End time should behind start time!";
                            }
                        } else {
                            validationResult.status = "error";
                            validationResult.errorMessage = "End time should not late than current time!";
                        }
                    } else {
                        validationResult.status = "error";
                        validationResult.errorMessage = "Duration between start time and end time over limitation, 1000 hours!";
                    }
                } else {
                    validationResult.status = "error";
                    validationResult.errorMessage = "Start time and end time should be a valid value!";
                }
            } else {
                validationResult.status = "error";
                validationResult.errorMessage = "Please select the valid device attribute!";
            }
        } else {
            validationResult.status = "error";
            validationResult.errorMessage = "Please select the valid device type!";
        }
        return validationResult;
    };

    //right now, we generate fake data by template, but later on we will calling the web api and get the date
    //let historyInfoData = dataFactory.filterHistoryInfoData(startTime, endTime);
    self.generateFakeRandomData = function () {
        let historyInfoData = historyData.result;
        let historyInfoDataTemplate = historyInfoData[0];
        historyInfoData = generateRandomHistoryInfoData(historyInfoDataTemplate, 1000);
        return historyInfoData;
    };

    self.getDataStreamHistoryData = function (startTime, endTime) {
        let baseUrl = nodeServer + historyInfoBaseUrl;
        let url;
        endTime = endTime.toISOString();
        startTime = startTime.toISOString();
        url = baseUrl + "start/" + startTime + "/end/" + endTime;
        let promise = $http.get(url, { timeout: TIMEOUT });
        promise = promise.then(function (response) {
            return HttpResponseHandler.handleResponse(response.data);
        }).catch(function (error) {
            return HttpResponseHandler.handleError(error, url, TIMEOUT);
        });
        return promise;
    };

    self.filterHistoryInfoData = function (historyInfoData, deviceType, attribute) {
        let historyData = [];
        for (let i = 0; i < historyInfoData.length; i++){
            let historyDataObject = {};
            historyDataObject.aggStartTime = historyInfoData[i].aggStartTime;
            historyDataObject.data = filterHistoryDataByDeviceAttribute(historyInfoData[i], attribute);
            historyDataObject.data = filterHistoryDataByDeviceType(historyDataObject.data, deviceType);
            historyData.push(historyDataObject);
        }
        return historyData;
    };

    //get the series data for highchart
    self.parseHistoryInfoData = function (historyInfoData, attribute) {
        let seriesData = [];
        for (let i = 0; i < historyInfoData.length; i++) {
            let singleSeriesData = [];
            let date = new Date(historyInfoData[i].aggStartTime);
            let utcDate = generateTemplateTimeForHistoryChart(date);
            if (attribute === "dataStream") {
                singleSeriesData.push(utcDate);
                singleSeriesData.push(historyInfoData[i].data.numRssiEntries);
            }
            seriesData.unshift(singleSeriesData); //unshift always insert data at the beginning of the array, push insert the end
        }
        return seriesData;
    };

    self.drawHistoryInfoChart = function (containerIds, historyInfoData, deviceType, attribute, optionTitle, optionSubtitle, optionyAxis, 
        chartBackgroundColor, titleColor, xAxisColor, xAxisLabelsColor, yAxisColor, yAxisLabelsColor) {
        let option = {};
        option.title = optionTitle;
        option.subtitle = optionSubtitle;
        option.yAxis = optionyAxis;
        option.series = [{
            type: 'area',
            name: attribute,
            data: historyInfoData
        }];

        let historyChart = new HistoryChart(containerIds, option.title, option.subtitle, option.yAxis, option.series, chartBackgroundColor, 
            titleColor, xAxisColor, xAxisLabelsColor, yAxisColor, yAxisLabelsColor);
        historyChart.draw();
    };

    self.updateAttributesAccordingHistoryDeivceType = function (deviceType) {
        let attributesArray = [];
        attributesArray.push(DEVICE_ATTRIBUTE);
        for (let key in updateDeviceTypesAndAttributes) {
            if (key === deviceType) {
                attributesArray = attributesArray.concat(updateDeviceTypesAndAttributes[key]);
            }
        }
        return attributesArray;
    };

    /////////////////////////////////////////////////////////////////////////
    // 
    //  Private function in monitorSummary.service
    //
    /////////////////////////////////////////////////////////////////////////

    //summary info - data stream
    function getIntegerHour(date) {
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    function getSummaryInfoDatastreamStartTime(endTime) {
        let duration = dashTableConfig.MonitorAttributes.summaryInfoDurationForDatastream.days;
        let newDate = new Date(endTime - duration * 24 * 3600000);
        return newDate;
    }

    function getDataStreamDataForEachDay(dataStreamDataObject, aggregationByDevTypePerDay) {
        let deviceType = dataStreamDataObject.devType;
        let dataStreamData = 0;
        for (let i = 0; i < aggregationByDevTypePerDay.length; i++) {
            if (aggregationByDevTypePerDay[i].devType === deviceType) {
                dataStreamData += aggregationByDevTypePerDay[i].numRssiEntries;
            }
        }
        return dataStreamData;
    }

    function getDevEUIsForEachDay(dataStreamDataObject, aggregationByDevTypePerDay) {
        let deviceType = dataStreamDataObject.devType;
        let devEUIs = [];
        for (let i = 0; i < aggregationByDevTypePerDay.length; i++) {
            if (aggregationByDevTypePerDay[i].devType === deviceType) {
                devEUIs = aggregationByDevTypePerDay[i].devEUIs;
            }
        }
        return devEUIs;
    }

    function getUniqueDataStreamDataDevEUIs(dataStreamDataDevEUIs) {
        let devEUIs = [];
        for (let i = 0; i < dataStreamDataDevEUIs.length; i++) {
            if (!devEUIs.includes(dataStreamDataDevEUIs[i])) {
                devEUIs.push(dataStreamDataDevEUIs[i]);
            }
        }
        return devEUIs;
    }

    function calNodesSumDatastream(deviceTypes, nodesDivideByDevType) {
        let nodesSumDatastream = {};
        for (let i = 0; i < deviceTypes.length; i++) {
            let key = deviceTypes[i];
            let nodes = nodesDivideByDevType[key];
            let nodeSumDatastream = 0;
            for (let i = 0; i < nodes.length; i++) {
                nodeSumDatastream += nodes[i].dataStream;
            }
            nodesSumDatastream[key] = parseFloat(nodeSumDatastream.toFixed(2));
        }
        return nodesSumDatastream;
    }

    function calNodesAvgDatastream(deviceTypes, nodesDivideByDevType) {
        let nodesAvgDatastream = {};
        for (let i = 0; i < deviceTypes.length; i++) {
            let key = deviceTypes[i];
            let nodes = nodesDivideByDevType[key];
            let nodeAvgDatastream = 0;
            let numOfDevice = 0;
            for (let i = 0; i < nodes.length; i++) {
                nodeAvgDatastream += nodes[i].dataStream;
                numOfDevice += nodes[i].numOfDevice;
            }
            nodeAvgDatastream /= numOfDevice;
            nodesAvgDatastream[key] = parseFloat(nodeAvgDatastream.toFixed(2));
        }
        return nodesAvgDatastream;
    }

    function putNodesSumDatastream(nodesSumDatastream, series0) {
        for (let key in nodesSumDatastream) {
            series0.data.push(nodesSumDatastream[key]);
        }
    }

    function putNodesAvgDatastream(nodesAvgDatastream, series1) {
        for (let key in nodesAvgDatastream) {
            series1.data.push(nodesAvgDatastream[key]);
        }
    }

    function calNodesSumStandByTime(deviceTypes, nodesDivideByDevType) {
        let nodesSumStandByTime = {};
        for (let i = 0; i < deviceTypes.length; i++) {
            let key = deviceTypes[i];
            let nodes = nodesDivideByDevType[key] ? nodesDivideByDevType[key] : [];
            let nodeSumStandByTime = 0;
            for (let i = 0; i < nodes.length; i++) {
                nodeSumStandByTime += nodes[i].StandByTime;
            }
            nodesSumStandByTime[key] = parseFloat(nodeSumStandByTime.toFixed(2));
        }
        return nodesSumStandByTime;
    }

    function calNodesAvgStandByTime(deviceTypes, nodesDivideByDevType) {
        let nodesAvgStandByTime = {};
        for (let i = 0; i < deviceTypes.length; i++) {
            let key = deviceTypes[i];
            let nodes = nodesDivideByDevType[key] ? nodesDivideByDevType[key] : [];
            let nodeAvgStandByTime = 0;
            for (let i = 0; i < nodes.length; i++) {
                nodeAvgStandByTime += nodes[i].StandByTime;
            }
            nodeAvgStandByTime /= nodes.length;
            nodesAvgStandByTime[key] = parseFloat(nodeAvgStandByTime.toFixed(2));
        }
        return nodesAvgStandByTime;
    }

    function putNodesSumStandByTime(nodesSumStandByTime, series0) {
        for (let key in nodesSumStandByTime) {
            series0.data.push(nodesSumStandByTime[key]);
        }
    }

    function putNodesAvgStandByTime(nodesAvgStandByTime, series1) {
        for (let key in nodesAvgStandByTime) {
            series1.data.push(nodesAvgStandByTime[key]);
        }
    }

    function parseLatest3DaysData(sectionData, currentDate, day, applicationID) {
        let powerData = 0;
        if (applicationID === "Application ID") {
            for (let i = 0; i < sectionData.length; i++) {
                let timestamp = new Date(sectionData[i].timestamp);
                let timestampDate = CollectionUtils.changeTimestampToDate(timestamp);
                let dateDiff = (currentDate - timestampDate) / 86400000;
                if (dateDiff === day) {
                    powerData += sectionData[i].power;
                }
            }
        } else {
            for (let i = 0; i < sectionData.length; i++) {
                let timestamp = new Date(sectionData[i].timestamp);
                let timestampDate = CollectionUtils.changeTimestampToDate(timestamp);
                let dateDiff = (currentDate - timestampDate) / 86400000;
                if (dateDiff === day && sectionData[i].ApplicationID === applicationID) {
                    powerData += sectionData[i].power;
                }
            }
        }
        return powerData;
    }

    function initOptionSeries(section, series) {
        for (let i = 0; i < sections.length; i++) {
            let template = {
                name: '',
                type: 'column',
                yAxis: 0,
                data: [],
                tooltip: {
                    valueSuffix: ' MW'
                },
            };
            template.name = sections[i].secName;
            series.push(template);
        }
    }

    function putPowerUsageByDate(ceillightPowForLatest3Days, series, sections) {
        for (let i = 0; i < sections.length; i++) {
            for (let key in ceillightPowForLatest3Days) {
                series[i].data.push(ceillightPowForLatest3Days[key][i]);
            }
        }
    }

    function isEmptyStartTimeEndTime(historyStartTime, historyEndTime) {
        //if historyStartTime, historyEndTime is undefined or null or false will return true, otherwise will return false
        //but historyStartTime and historyEndTime will never be false, here only check undefined and null situation
        if (!historyStartTime || !historyEndTime) {
            return true;
        } else {
            return false;
        }
    }

    function durationOverLimit(historyStartTime, historyEndTime) {
        let limit = dashTableConfig.MonitorAttributes.historyInfoLimitationForDatastream.numOfRecord;
        let limitTime = limit * 3600000;
        let duration = historyEndTime - historyStartTime;
        if (duration > limitTime) {
            return true;
        }
        return false;
    }

    function endTimeLateThanCurrentTime(historyEndTime) {
        let currentTime = new Date();
        if (historyEndTime.getTime() > currentTime.getTime()) {
            return true;
        }
        return false;
    }

    function endTimeBehindStartTime(historyStartTime, historyEndTime) {
        if (historyStartTime.getTime() >= historyEndTime.getTime()) {
            return false;
        } else {
            return true;
        }
    }

    function generateRandomHistoryInfoData(historyInfoDataTemplate, numOfRandomData) {
        let randomHistoryInfoData = [];
        for (let i = 0; i < numOfRandomData; i++) {
            let template = {};
            template.aggStartTime = generateTemplateTime(i + 1);
            template.aggregationByDevType = generateTemplateRssiData(historyInfoDataTemplate.aggregationByDevType, 3000);
            template.aggregationOnOffByDevType = generateTemplateOnOffData(historyInfoDataTemplate.aggregationOnOffByDevType, 3000);
            randomHistoryInfoData.push(template);
        }
        return randomHistoryInfoData;
    }

    function generateTemplateTime(numberOfHour) {
        let Time = new Date();
        let newTime = new Date(Time.getTime() - numberOfHour * 3600000);
        let year = newTime.getUTCFullYear();
        let month = newTime.getUTCMonth();
        let date = newTime.getUTCDate();
        let hour = newTime.getUTCHours();
        newTime = Date.UTC(year, month, date, hour).toString();
        return newTime;
    }

    function generateTemplateTimeForHistoryChart(date) {
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth();
        let utcDate = date.getUTCDate();
        let hour = date.getUTCHours();
      return Date.UTC(year, month, utcDate, hour);
    }

    function generateTemplateRssiData(aggregationByDevType, rangeOfValue) {
        let templateRssiData = [];
        for (let i = 0; i < aggregationByDevType.length; i++) {
            let singleTemplateRssiData = {};
            let randomData = parseInt(Math.random() * rangeOfValue);
            singleTemplateRssiData.devType = aggregationByDevType[i].devType;
            singleTemplateRssiData.numRssiEntries = randomData;
            templateRssiData.push(singleTemplateRssiData);
        }
        return templateRssiData;
    }

    function generateTemplateOnOffData(aggregationOnOffByDevType, rangeOfValue) {
        let templateOnOffData = [];
        for (let i = 0; i < aggregationOnOffByDevType.length; i++) {
            let singleTemplateOnOffData = {};
            let randomData = parseInt(Math.random() * rangeOfValue);
            singleTemplateOnOffData.devType = aggregationOnOffByDevType[i].devType;
            singleTemplateOnOffData.on = randomData;
            templateOnOffData.push(singleTemplateOnOffData);
        }
        return templateOnOffData;
    }

    function filterHistoryDataByDeviceAttribute(historyDataObject, attribute) {
        if (attribute === "dataStream") {
            return historyDataObject.aggregationByDevType;
        }
        return [];
    }

    //grep all the data stream from device type in dropdown list, the device type not include
    //in dropdown list will not be calculated
    function filterHistoryDataByDeviceType(historyData, deviceType) {
        if (deviceType === "all") {
          return getAggregateHistoryData(historyData);
        } else {
            for (let i = 0; i < historyData.length; i++) {
                if (historyData[i].devType === deviceType) {
                    return historyData[i];
                }
            }
            return {};
        }
    }

    function getAggregateHistoryData(historyData) {
        let aggregateHistoryData = {};
        aggregateHistoryData.devEUIs = [];
        aggregateHistoryData.devType = [];
        aggregateHistoryData.numRssiEntries = 0;
        for (let i = 0; i < historyData.length; i++) {
            aggregateHistoryData.devEUIs = aggregateHistoryData.devEUIs.concat(historyData[i].devEUIs);
            aggregateHistoryData.devType.push(historyData[i].devType);
            aggregateHistoryData.numRssiEntries += historyData[i].numRssiEntries;
        }
        return aggregateHistoryData;
    }

    function getInitDeviceTypes(updateDeviceTypesAndAttributes) {
        let monitorDeviceTypes = [];
        for (let key in updateDeviceTypesAndAttributes) {
            if (updateDeviceTypesAndAttributes.hasOwnProperty(key)) {
                monitorDeviceTypes.push(key);
            }
        }
        return monitorDeviceTypes;
    }

};
