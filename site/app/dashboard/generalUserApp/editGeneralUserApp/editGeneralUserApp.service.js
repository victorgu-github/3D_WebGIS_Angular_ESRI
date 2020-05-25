'use strict';

module.exports = function (CollectionUtils) {
    let self = this;

    ////////////////////////////////////////////////////////
    //
    // Init Edit Page Func
    //
    ////////////////////////////////////////////////////////

    //Get General User Application Name
    self.getGeneralUsrAppName = function (generalUserApplicationName) {
        return (generalUserApplicationName !== undefined && generalUserApplicationName !== null) ? generalUserApplicationName : "";
    };

    //Get General User Application Scenario
    self.getGeneralUsrAppScenarioID = function (scenarioIDsMap, scenarioID) {
        let result = "--";
        for (let key in scenarioIDsMap) {
            if (scenarioIDsMap[key] === scenarioID) {
                result = key;
                break;
            }
        }
        return result;
    };

    //Get General User Application Lora Info
    self.getGeneralUsrAppLora = function (lora) {
        let result = {
            loraApplicationID: "--",
            devEUIs: []
        };
        if (lora !== undefined && lora !== null) {
            result = lora;
        }
        return result;
    };

    //Get lora content from general user application exist device v2 web api
    self.getGeneralUsrAppLoraContentForExistDeviceV2WebApi = function (networks) {
        let result = {
            loraApplicationID: "--",
            devEUIs: []
        };
        let lora = networks.find((element) => { return element.type === "lora"; });
        if (lora !== undefined && lora !== null) {
            result.loraApplicationID = lora.applicationID;
            lora.devices.forEach((device) => {
                result.devEUIs.push(device.devEUI);
            });
        }
        return result;
    };

    //Get ble content from general user application exist device v2 web api
    self.getGeneralUsrAppBleContentForExistDeviceV2WebApi = function (networks) {
        let result = [];
        let ble = networks.find((element) => { return element.type === "ble"; });
        if (ble !== undefined && ble !== null) {
            result = ble.bleApps;
        }
        return result;
    };

    //get ble application id array
    self.getBleAppIDsArray = function (bleApps) {
        let result = [];
        if (Array.isArray(bleApps) && bleApps.length !== 0) {
            bleApps.forEach((bleApplication) => {
                result.push(bleApplication.bleAppID);
            });
        }
        return result;
    };

    self.getBleApps = function (bleApps, macAddress) {
        let result = [];
        bleApps.forEach((bleApp) => {
            if (bleApp.bleAppID !== "--") {
                let bleAppObj = {};
                bleAppObj.bleAppID = bleApp.bleAppID.toString();
                if (bleApp.bleNodesAllSign) {
                    bleAppObj.devices = "all";
                }
                else {
                    bleAppObj.devices = [];
                    let position = bleApp.tableHeader.indexOf(macAddress);
                    bleApp.checkedRows.forEach((row) => {
                        bleAppObj.devices.push(row[position]);
                    });
                }
                result.push(bleAppObj);
            }
        });
        return result.length === 0 ? null : result;
    };

    //Separate the exist ble applications and not exist ble applications
    self.findExistAndNotExistBleApplications = function (bleAppIDs, existBleApplications) {
        let result = {
            existBleApplicationsArray: [],
            notExistBleApplicationsArray: []
        };
        if (Array.isArray(existBleApplications) && existBleApplications.length !== 0) {
            let bleAppIDsArray = [];
            existBleApplications.forEach((bleApplication) => { bleAppIDsArray.push(bleApplication.bleAppID.toString()); });
            bleAppIDs.forEach((bleAppID) => {
                if (bleAppIDsArray.includes(bleAppID)) {
                    result.existBleApplicationsArray.push(bleAppID);
                }
                else {
                    result.notExistBleApplicationsArray.push(bleAppID);
                }
            });
        }
        else if (Array.isArray(existBleApplications) && existBleApplications.length === 0) {
            result.notExistBleApplicationsArray = bleAppIDs;
        }
        return result;
    };

    //Remove not exist ble application from bleApps
    self.removeNotExistBleApplications = function (bleApps, notExistBleApplicationsArray) {
        let result = [];
        bleApps.forEach((bleApplication) => {
            if (!notExistBleApplicationsArray.includes(bleApplication.bleAppID)) {
                result.push(bleApplication);
            }
        });
        return result;
    };

    self.getLoraCheckedRowsContent = function (checkedRows, tableHeader) {
        let result = [];
        let index = tableHeader.indexOf("DevEUI");
        checkedRows.forEach((element) => {
            result.push(element[index]);
        });
        return result;
    };

    self.getBleCheckedRowsContent = function (checkedRows, tableHeader) {
        let result = [];
        let index = tableHeader.indexOf("macAddress");
        checkedRows.forEach((element) => {
            result.push(element[index]);
        });
        return result;
    };

    ////////////////////////////////////////////////////////
    //
    // General User Application Device Table Func
    //
    ////////////////////////////////////////////////////////

    //In the device table, we don't need to display all the information for the node sessions
    //We only need to display the special fields, which is defined in the dashboard config file
    self.getTableHeader = function (devTableHeader) {
        let devTableHeaderArray = [];
        for (let key in devTableHeader) {
            devTableHeaderArray.push(devTableHeader[key]);
        }
        return devTableHeaderArray;
    };

    //Get popup table body and table body from node sessions array resp
    self.getTableBody = function (tableHeader, resp) {
        let tableBodyArray = [];
        for (let i in resp) {
            let nodeSession = resp[i];
            let tableBody = [];
            //Get table body row for table body
            for (let j in tableHeader) {
                let tableHeaderKey = tableHeader[j];
                tableBody.push(nodeSession[tableHeaderKey]);
            }
            tableBodyArray.push(tableBody);
        }
        return tableBodyArray;
    };

    //Add default select all check box status as the first col to table header
    self.addThChkStatus = function (tableHeader, tableBody) {
        let countOfCheckedRows = tableBody.filter(function (row) {
            return row[0] === true;
        });
        if (countOfCheckedRows.length === tableBody.length) {
            tableHeader.unshift(true);
        }
        else {
            tableHeader.unshift(false);
        }
        return tableHeader;
    };

    //1.Add checkbox and set checkbox status for table body
    //2.Record checked rows
    //3.Sort out existing lora device and not existing lora device
    //4.Add not existing at the end of table body
    self.addTBChkStatus = function (tableHeader, tableBody, checkedRows, devEUIs, DEVEUI, DESCRIPTION, DEVICE_NOT_EXIST_MSG) {
        let result = {};
        let devEUIPosition = tableHeader.findIndex((element) => { return element === DEVEUI; });
        let namePosition = tableHeader.findIndex((element) => { return element === DESCRIPTION; });
        let column = CollectionUtils.getCol(tableBody, devEUIPosition);
        tableBody = initCheckedStatusForTableBody(tableBody);
        checkedRows = [];
        for (let index in devEUIs) {
            let devEUI = devEUIs[index];
            if (column.includes(devEUI)) {
                let i = column.findIndex((element) => { return element === devEUI; });
                tableBody[i][0] = true;
                checkedRows.unshift(tableBody[i]);
            }
            else {
                let notExistDevEUI = constructNotExsitDevEUI(tableHeader, devEUI, devEUIPosition, namePosition, DEVICE_NOT_EXIST_MSG);
                tableBody.push(notExistDevEUI);
            }
        }
        result.tableBody = tableBody;
        result.checkedRows = checkedRows;
        return result;
    };

    //Find exist lora node sessions
    self.findExistNodeSessions = function (nodeSessions, devEUIs) {
        let existNodeSessions = [];
        for (let index in devEUIs) {
            let devEUI = devEUIs[index];
            let nodeSession = nodeSessions.find((element) => { return element.DevEUI === devEUI; });
            existNodeSessions.push(nodeSession);
        }
        return existNodeSessions;
    };

    //Find exist ble node sessions
    self.findExistBleNodeSessions = function (bleNodes, macAddresses) {
        let existBleNodeSessions = [];
        for (let index in macAddresses) {
            let macAddress = macAddresses[index];
            let bleNodeSession = bleNodes.find((element) => { return element.macAddress === macAddress; });
            existBleNodeSessions.push(bleNodeSession);
        }
        return existBleNodeSessions;
    };

    //Get the default sort attribute's index in table header
    self.getDefaultSortIndex = function (headers, defaultSortAttr) {
        let defaultSortIndex = headers.findIndex((element) => {
            return element === defaultSortAttr;
        });
        return defaultSortIndex ? defaultSortIndex : 0;
    };

    //Sort table body according to default sort index
    self.defaultSortTableBody = function (tablebody, defaultSortIndex) {
        let TableBody = tablebody;
        TableBody.sort(function (row1, row2) {
            //Get row 1 and 2 value for two attribute
            let row1ForAttr1Val = row1[defaultSortIndex].toLowerCase();
            let row2ForAttr1Val = row2[defaultSortIndex].toLowerCase();

            //Comparefunction
            if (row1ForAttr1Val < row2ForAttr1Val) return -1;
            if (row1ForAttr1Val > row2ForAttr1Val) return 1;

            return 0;
        });
        return TableBody;
    };

    //Get devEUIs array from checkedRows
    self.getDevEUIs = function (tableHeader, checkedRows, DEVEUI) {       
        let devEUIs = [];
        let devEUIIndex = tableHeader.findIndex((element) => {
            return element === DEVEUI;
        });
        checkedRows = checkedRows.filter(function(row){
            return row[0] === true;
        });
        for (let i in checkedRows) {
            devEUIs.push(checkedRows[i][devEUIIndex]);
        }
        return devEUIs;
    };

    /////////////////////////////////////////////////////////////
    //
    // Shared Func
    //
    /////////////////////////////////////////////////////////////

    self.parseErrorMessage = function (responseErrorMessage) {
        let finalErrorMessage = "";
        for (let i = 0; i < responseErrorMessage.length; i++) {
            if (responseErrorMessage[i].message && responseErrorMessage[i].message !== null) {
                let errorMessageJSON = JSON.parse(responseErrorMessage[i].message);
                if (errorMessageJSON.error.hasOwnProperty("errors")) {
                    for (let j = 0; j < errorMessageJSON.error.errors.length; j++) {
                        finalErrorMessage += j + 1 + ". " + errorMessageJSON.error.errors[j].message + ";\n";
                    }
                } else {
                    finalErrorMessage += errorMessageJSON.error.message + ";\n";
                }
            }
        }
        return finalErrorMessage;
    };

    //////////////////////////////////////////////////////////////
    //
    // Private Func
    //
    //////////////////////////////////////////////////////////////

    //Init check box status table body, set all checkbox status to false
    function initCheckedStatusForTableBody(tableBody) {
        let result = [];
        for (let index in tableBody) {
            let row = tableBody[index];
            row.unshift(false);
            result.push(row);
        }
        return result;
    }

    //Construct not exist lora device row info
    function constructNotExsitDevEUI(tableHeader, devEUI, devEUIPosition, namePosition, DEVICE_NOT_EXIST_MSG) {
        let result = [];
        for (let index in tableHeader) {
            if (parseInt(index) === devEUIPosition) {
                result.push(devEUI);
            }
            else if (parseInt(index) === namePosition) {
                result.push(DEVICE_NOT_EXIST_MSG);
            }
            else {
                result.push(null);
            }
        }
        result.unshift(false);
        return result;
    }
};