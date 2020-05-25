'use strict';

module.exports = function () {
    let self = this;

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
    self.getDevEUIs = function (tableHeader, checkedRows, DevEUI) {
        let devEUIs = [];
        let devEUIIndex = tableHeader.findIndex((element) => {
            return element === DevEUI;
        });
        for (let i in checkedRows) {
            devEUIs.push(checkedRows[i][devEUIIndex]);
        }
        return devEUIs;
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
        return result.length === 0 ? undefined : result;
    };

    self.updateBleAppsID = function (bleApps) {
        bleApps.forEach((bleApp, index) => {
            bleApp.id = index + 1;
        });
    };

    self.sortBleAppsByID = function(bleApps){
        bleApps.sort(compareByID);
    };

    self.getSubmitSummaryInfo = function (registerBody) {
        let summaryInfo = "Do you want to register this general user application: \r\n";
        summaryInfo += "general user application name: " + (registerBody.generalUserApplicationName ? registerBody.generalUserApplicationName : "") + "\r\n";
        let count = 0;
        if (registerBody.lora) {
            count++;
            summaryInfo += count + ". lora application: " + registerBody.lora.loraApplicationID + "\r\n";
            summaryInfo += !registerBody.lora.devEUIs ? [] : registerBody.lora.devEUIs + "\r\n";
        }
        if (registerBody.ble) {
            if (Array.isArray(registerBody.ble) && registerBody.ble.length !== 0) {
                registerBody.ble.forEach((bleApplication) => {
                    count++;
                    summaryInfo += count + ". ble application: " + bleApplication.bleAppID + "\r\n";
                    summaryInfo += bleApplication.devices + "\r\n";
                });
            }
        }
        return summaryInfo;
    };

    function compareByID(a, b) {
        if (a.id < b.id) {
            return -1;
        }

        if (a.id > b.id) {
            return 1;
        }

        return 0;
    }
};