'use strict';

module.exports = function (dashTableConfig) {
    let self = this;
    let dynamicDataAttributes = dashTableConfig.MonitorAttributes.dataTable.dynamicDataAttributes;

    const STATUS = dynamicDataAttributes.checkStatusAttr;
    const TIME_STAMP = dynamicDataAttributes.checkTimestampAttr;
    const APPLICATION_ID = dynamicDataAttributes.checkAppIDAttr;
    const DEV_EUI = dynamicDataAttributes.checkDeviceEUIAttr;
    const RELAY_NUM = dynamicDataAttributes.checkRelayNumAttr;
    const ASC_SORT = "ascending";
    const INVALID_DATE = "Invalid Date";

    ////////////////////////////////////////////////////////
    //
    // Init the applicationID Array and device type array
    //
    ////////////////////////////////////////////////////////

    //Get default dynamic data device type fron dashTable config file
    self.getDefaultDevType = function (devTypeArr, dynamicDataAttributes) {
        let defaultDevType;
        for (let index in devTypeArr) {
            let deviceType = devTypeArr[index];
            if (dynamicDataAttributes.hasOwnProperty(deviceType) && dynamicDataAttributes[deviceType].default) {
                defaultDevType = deviceType;
                break;
            }
        }
        return defaultDevType === undefined ? devTypeArr[0] : defaultDevType;
    };

    //Change the subDeviceTypes to the format we want
    //For example, subDeviceTypes = {parentDeviceType: "smartswitch", subDeviceTypes: ["ceilinglight"]}
    //we just want subSevTypeMap = {smartswitch: ["ceiliniglight"]}
    self.getSubDevTypeMap = function (devTypeArr, subDeviceTypes) {
        let subDevTypeMap = {};
        for (let i in devTypeArr) {
            let deviceType = devTypeArr[i];
            if (Array.isArray(subDeviceTypes) && subDeviceTypes.length !== 0) {
                for (let j in subDeviceTypes) {
                    let subDeviceType = subDeviceTypes[j];
                    if (subDeviceType.parentDeviceType === deviceType) {
                        subDevTypeMap[deviceType] = subDeviceType.subDeviceTypes;
                    } else {
                        subDevTypeMap[deviceType] = [];
                    }
                }
            }
            else {
                subDevTypeMap[deviceType] = [];
            }
        }
        return subDevTypeMap;
    };

    //Remove the device type exist in system but doesn't exist in config file
    self.removeNoConfigDevType = function (devTypeArr, dynamicDataAttributes) {
        for (let index in devTypeArr) {
            if (!dynamicDataAttributes.hasOwnProperty(devTypeArr[index])) {
                devTypeArr.splice(index, 1);
            }
        }
    };

    ////////////////////////////////////////////////////////
    //
    // Get datatable header and body
    //
    ////////////////////////////////////////////////////////

    //Get table header according to default device type and dashTable config file
    self.getDataTableHeader = function (deviceType, dynamicDataAttributes, subTypeMap) {
        let subTypes = subTypeMap[deviceType];
        let devTypeConfigInfo = dynamicDataAttributes[deviceType];
        let dataTableHeader = [];
        //Get common attributes for every kind of device type
        dataTableHeader = dataTableHeader.concat(dynamicDataAttributes.commonAttr);
        //If device type has sub type, we need search its sub type's table header in config file
        //If device type doesn't have sub type, we directly search its table header in config file
        //Note: currently, we assume the device sub type have the same header set in the config file
        //      so we only need to get the first one
        if (subTypes.length !== 0) {
            let subTypeHeader = getSubTypeHeader(subTypes, devTypeConfigInfo);
            dataTableHeader = dataTableHeader.concat(subTypeHeader);
            //SubType is a specific header. It does not belong to either common attribute nor dynamic attribute 
            //(eg. current status attribute and latest usage attribute), so we need to add it separately
            dataTableHeader.push("subType");
        } else {
            if (devTypeConfigInfo && devTypeConfigInfo.hasOwnProperty("currentStatusAttr")) {
                dataTableHeader = dataTableHeader.concat(devTypeConfigInfo.currentStatusAttr);
            }
            if (devTypeConfigInfo && devTypeConfigInfo.hasOwnProperty("latestUsageAttr")) {
                dataTableHeader = dataTableHeader.concat(devTypeConfigInfo.latestUsageAttr);
            }
        }
        return dataTableHeader;
    };

    //Chage table header order according to dashTableConfig datatable header order
    self.changeHeaderOrder = function (tableHeader, headerOrder) {
        let headers = [];
        //Iterate headerOrder array, if header in headerOrder also exist in tableHeader then push it into headers array
        for (let index in headerOrder) {
            let header = headerOrder[index];
            if (tableHeader.includes(header)) {
                headers.push(header);
            }
        }

        //Iterate tableHeader array, if headers doesn't have the rest header in tableHeader, push it into headers array
        for (let index in tableHeader) {
            let header = tableHeader[index];
            if (!headers.includes(header)) {
                headers.push(header);
            }
        }

        return headers;
    };

    //Get table body according to table header and responses
    self.getDataTableBody = function (tableHeader, responses) {
        let body = [];
        let mergeResult = mergeCurrStatAndLatestUsage(responses);
        let mergeResultArray = changeMapToArray(mergeResult);
        for (let i in mergeResultArray) {
            let row = [];
            let deviceInfo = mergeResultArray[i];
            for (let index in tableHeader) {
                let attribute = tableHeader[index];
                if (attribute === TIME_STAMP) {
                    row.push(transTimeAttribute(deviceInfo[attribute]));
                } else {
                    row.push(deviceInfo[attribute]);
                }
            }
            body.push(row);
        }
        return body;
    };

    ////////////////////////////////////////////////////////
    //
    // Get defaultSortIndex and sort table body
    //
    ////////////////////////////////////////////////////////

    //Get defaultSortIndex from table header
    self.getDefaultSortIndex = function (tableHeader) {
        let defaultSortIndex = {};
        tableHeader.forEach(function (header, index) {
            if (header === APPLICATION_ID) {
                defaultSortIndex.applicationID = index;
            } else if (header === DEV_EUI) {
                defaultSortIndex.devEUI = index;
            } else if (header === RELAY_NUM) {
                defaultSortIndex.relayNum = index;
            }
        });
        //Deal with invalid situation: defaultSortIndex.applicationID doesn't exist 
        //or defaultSortIndex.devEUI doesn't exist
        if (!defaultSortIndex.applicationID && !defaultSortIndex.devEUI) {
            defaultSortIndex.applicationID = 0;
            defaultSortIndex.devEUI = 0;
        } else if (!defaultSortIndex.applicationID) {
            defaultSortIndex.applicationID = defaultSortIndex.devEUI;
        } else if (!defaultSortIndex.devEUI) {
            defaultSortIndex.devEUI = defaultSortIndex.applicationID;
        }
        return defaultSortIndex;
    };

    //Use defaultSortIndex to sort the table body
    self.defaultSortTableBody = function (tableBody, defaultSortIndex) {
        let appIDIndex = defaultSortIndex.applicationID;
        let devEUIIndex = defaultSortIndex.devEUI;
        let relayNum = defaultSortIndex.relayNum;
        tableBody.sort(function (row1, row2) {
            //Common situation
            let row1AppID = row1[appIDIndex].toLowerCase();
            let row2AppID = row2[appIDIndex].toLowerCase();
            let row1DevEUI = row1[devEUIIndex].toLowerCase();
            let row2DevEUI = row2[devEUIIndex].toLowerCase();
            if (row1AppID < row2AppID) return -1;
            if (row1AppID > row2AppID) return 1;
            if (row1DevEUI < row2DevEUI) return -1;
            if (row1DevEUI > row2DevEUI) return 1;
            if (defaultSortIndex.relayNum) {
                let row1RelayNum = row1[relayNum];
                let row2RelayNum = row2[relayNum];
                if (row1RelayNum < row2RelayNum) return -1;
                if (row1RelayNum > row2RelayNum) return 1;
            }
            return 0;
        });

        return tableBody;
    };

    //Init sorting status map and ascending sort status map
    self.initSortMap = function (header) {
        let sortMap = {};
        for (let key in header) {
            let value = header[key];
            sortMap[value] = null;
        }
        return sortMap;
    };

    //Find the col for sorting, notice the first col is for edit and delete
    self.findIndex = function (header, input) {
        let position = header.findIndex(function (element) {
            return element === input;
        });
        return position;
    };

    //Clear sort map according to input, if key not equals to input, set key value to null
    self.clearSortMap = function (sortMap, input) {
        for (let key in sortMap) {
            if (key && key !== input) {
                sortMap[key] = null;
            }
        }
    };

    //Sort Table
    self.sortTable = function (index, tableBody, operation) {
        tableBody.sort(function (row1, row2) {
            let A = row1[index];
            let B = row2[index];
            //Step1, sort with A or B is undefined/null situation. We need special method under this situation
            if (A === undefined || A === null || A === INVALID_DATE) {
                return 1;
            }
            else if (B === undefined || B === null || B === INVALID_DATE) {
                return -1;
            }
            //Step2, sort with A and B is datetime type situation. We need change the string to date type and then sort
            else if (isDate(A) && isDate(B)) {
                A = Date.parse(A);
                B = Date.parse(B);
                return (operation === ASC_SORT) ? ascSort(A, B) : dscSort(A, B);
            }
            //Step3, if A and B are not undefined/null/date, we need consider it is string or not string
            //If A and B are string, we need convert it to lower case and make it case insensitive
            else {
                A = (typeof row1[index] === "string") ? row1[index].toLowerCase() : row1[index];
                B = (typeof row2[index] === "string") ? row2[index].toLowerCase() : row2[index];
                return (operation === ASC_SORT) ? ascSort(A, B) : dscSort(A, B);
            }
        });
        return tableBody;
    };

    ////////////////////////////////////////////////////////
    //
    // Validate the row element, when change the row status
    //
    ////////////////////////////////////////////////////////

    self.getCurrStatRowsValArray = function (checkboxes) {
        let rowsVal = [];
        $(checkboxes).each(function (index, checkbox) {
            let rowVal = [];
            $(checkbox).closest("td").siblings("td").each(function (index, td) {
                let string = $(td).text().replace(/(\r\n|\n|\r|\s\s)/gm, "");
                rowVal.push(string);
            });
            rowsVal.push(rowVal);
        });
        return rowsVal;
    };

    //Change the row from an array to an object
    self.getRowsObjArray = function (tableHeader, rowsValArray) {
        let header = tableHeader.slice(1, tableHeader.length);
        let rowsValObjArray = [];
        for (let i in rowsValArray) {
            let rowVal = rowsValArray[i].slice(1, rowsValArray[i].length);
            let rowValObj = {};
            for (let j in header) {
                let key = header[j];
                rowValObj[key] = rowVal[j];
            }
            rowsValObjArray.push(rowValObj);
        }
        return rowsValObjArray;
    };

    self.getRowObjArray = function (tableHeader, row) {
        let header = tableHeader.slice(1, tableHeader.length);
        row = row.slice(1, row.length);
        let rowsValObjArray = [];
        let rowValObj = {};
        for (let i in header) {
            let key = header[i];
            rowValObj[key] = row[i];
        }
        rowsValObjArray.push(rowValObj);
        return rowsValObjArray;
    };

    self.validateRows = function (rowsValObjArray) {
        let validationResult = {};
        if (rowsValObjArray.length === 0) {
            validationResult.status = "error";
            validationResult.errorMessage = "You haven't select a device yet";
            return validationResult;
        } else {
            let rowObject = rowsValObjArray[0];
            if (!rowObject.hasOwnProperty(STATUS)) {
                validationResult.status = "error";
                validationResult.errorMessage = "Device type is incorrect, we only support change status for smartswitch, plugbase and streetlight";
                return validationResult;
            } else {
                if (!validateStatus(rowsValObjArray)) {
                    validationResult.status = "error";
                    validationResult.errorMessage = "All devices must have the same and valid status (eg. 'On' and 'Off')";
                    return validationResult;
                } else {
                    validationResult.status = "success";
                    validationResult.errorMessage = "";
                    return validationResult;
                }
            }
        }
    };

    ///////////////////////////////////////////////////
    //
    // Check Box Function
    //
    ///////////////////////////////////////////////////

    //Set default check-all box status to table header
    self.addThChkStatus = function (tableHeader) {
        tableHeader.unshift(false);
        return tableHeader;
    };

    //Set default check box status to table body
    self.addTBChkStatus = function (tableBody) {
        for (let index in tableBody) {
            let row = tableBody[index];
            row.unshift(false);
        }
        return tableBody;
    };

    //tableHeader[0] always exist, it is added in the initialization process
    //after refresh, recover the check box status in table header
    self.setTheaderChkBoxStatus = function (checkedHeader, tableHeader) {
        tableHeader[0] = checkedHeader;
    };

    //tableBody[position][0] always exist, it is added in the initialization process
    //after refresh, recover the check box status in table body
    self.setTbodyChkBoxStatus = function (checkedRows, tableHeader, tableBody) {
        let devEUIIndex = tableHeader.indexOf(DEV_EUI);
        let relayNumIndex = tableHeader.indexOf(RELAY_NUM);
        for (let index in checkedRows) {
            let checkedRow = checkedRows[index];
            let position = tableBody.findIndex(function (element) {
                //If the device type is smartswitch, we need use devEUIIndex and relayNumIndex to determine the 
                //device position in table body
                if (relayNumIndex && relayNumIndex !== -1) {
                    return element[devEUIIndex] === checkedRow[devEUIIndex] && element[relayNumIndex] === checkedRow[relayNumIndex];
                }
                else {
                    return element[devEUIIndex] === checkedRow[devEUIIndex];
                }
            });
            //Here we use undefined, because position could be 0
            if (position !== undefined && position !== -1) {
                //If we find the checkedRows element in tableBody, we need set the first col of tableBody row to true, checked check box
                //If we find the checkedRows element in tableBody, we also need sync the checkedRows element with table body row
                tableBody[position][0] = true;
                checkedRows[index] = tableBody[position];
            }
        }
    };

    //Clear check box status after filtering and searching
    self.clearChkStatus = function (tableBody) {
        let tb = tableBody;
        for (let index in tb) {
            let row = tb[index];
            if (row && row.length !== 0) {
                row[0] = false;
            }
        }
        return tb;
    };

    ///////////////////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////////////////

    //Check if the row object status is valid
    function validateStatus(rowsValObjArray) {
        let status = [];
        for (let index in rowsValObjArray) {
            let rowValObject = rowsValObjArray[index];
            if (rowValObject.status === "On" || rowValObject.status === "Off") {
                if (!status.includes(rowValObject.status)) {
                    status.push(rowValObject.status);
                }
            } else {
                return false;
            }
        }
        return status.length === 1;
    }

    //Here, we receive the UTC timestamp from server, we need to change it to locale timestamp and display it
    function transTimeAttribute(attribute) {
        let date = new Date(attribute);
        let dateString = date.toString().slice(0, 24);
        return dateString;
    }

    //Merge the current status and latest usage responses, for example:
    //Device: "12345678"
    //Current Status Response: {"devEUI": "12345", "status": "off"}
    //Latest Usage Response: {"power": 1, "current": 2, "voltage": 3}
    //We want to merget them as:  {"devEUI": "12345", "status": "off", "power": 1, "current": 2, "voltage": 3} and use it
    function mergeCurrStatAndLatestUsage(responses) {
        let mergeResult = {};
        let deviceMap = {};
        let devType;
        let applicationID;
        let subType;
        let deviceInfos;
        for (let key in responses) {
            let response = responses[key];
            let commonAttrBody = key.split("_");
            devType = commonAttrBody[1];
            applicationID = commonAttrBody[2];
            subType = commonAttrBody[3] ? commonAttrBody[3] : null;
            deviceInfos = response.data.hasOwnProperty('deviceInfos') ? response.data.deviceInfos :
                response.data.deviceStatuses;
            for (let index in deviceInfos) {
                let deviceInfo = deviceInfos[index];
                let deviceDevEUI = deviceInfo.devEUI;
                if (!deviceMap.hasOwnProperty(deviceDevEUI)) {
                    deviceMap[deviceDevEUI] = deviceInfo;
                } else {
                    deviceMap[deviceDevEUI] = Object.assign(deviceMap[deviceDevEUI], deviceInfo);
                }
                deviceMap[deviceDevEUI].devType = devType;
                deviceMap[deviceDevEUI].applicationID = applicationID;
                if (subType !== null) {
                    deviceMap[deviceDevEUI].subType = subType;
                }
            }
        }
        mergeResult.deviceType = devType;
        mergeResult.data = deviceMap;
        return mergeResult;
    }

    //Here we need change map to array, because smartswitch's sub type ceilinglight has 3 relay statuses,
    //but they belong to the same devEUI. Same devEUI with 3 different relay statuses, that is the reason 
    //why we need use array to store the data
    function changeMapToArray(mergeResult) {
        let deviceArray = [];
        let deviceMap = mergeResult.data;
        if (mergeResult.deviceType !== "smartswitch") {
            for (let key in deviceMap) {
                let element = deviceMap[key];
                deviceArray.push(element);
            }
        } else {
            for (let key in deviceMap) {
                let element = deviceMap[key];
                if (!element.hasOwnProperty("relayStatuses")) {
                    deviceArray.push(element);
                } else {
                    let relayStatuses = element.relayStatuses;
                    delete element.relayStatuses;
                    for (let index in relayStatuses) {
                        let baseObject = {};
                        let relayStatus = relayStatuses[index];
                        baseObject = Object.assign(baseObject, element);
                        baseObject = Object.assign(baseObject, relayStatus);
                        deviceArray.push(baseObject);
                    }
                }
            }
        }
        return deviceArray;
    }

    //Compare device subTypes array and devTypeConfigInfo, get the table header for device sub type
    //Currently, all the sub type have the same header config, we only need to find one
    function getSubTypeHeader(subTypes, devTypeConfigInfo) {
        let header = [];
        for (let index in subTypes) {
            let subType = subTypes[index];
            if (devTypeConfigInfo.hasOwnProperty("subTypes") && devTypeConfigInfo["subTypes"].hasOwnProperty(subType)) {
                let subTypeConfigInfo = devTypeConfigInfo["subTypes"][subType];
                if (subTypeConfigInfo.hasOwnProperty("currentStatusAttr") && subTypeConfigInfo.currentStatusAttr.length !== 0) {
                    header = header.concat(subTypeConfigInfo.currentStatusAttr);
                }
                if (subTypeConfigInfo.hasOwnProperty("latestUsageAttr") && subTypeConfigInfo.latestUsageAttr.length !== 0) {
                    header = header.concat(subTypeConfigInfo.latestUsageAttr);
                }
            }
            //If we have found the header for the first sub type in the config file, we stop the loop and return the header
            if (header.length !== 0) {
                break;
            }
        }
        return header;
    }

    //Determine a string is a valid date string
    //1.Date.parse(string) is not NaN
    //2.Date.parse(string).toString() is a length 13 string
    function isDate(string) {
        let result = true;
        if (Number.isNaN(Date.parse(string)) || Date.parse(string).toString().length !== 13) {
            result = false;
        }
        return result;
    }

    //Ascending sort
    function ascSort(A, B) {
        let result;
        if (A > B) {
            result = 1;
        }
        else if (A < B) {
            result = -1;
        }
        else {
            result = 0;
        }
        return result;
    }

    //Dscending sort
    function dscSort(A, B) {
        let result;
        if (A > B) {
            result = -1;
        }
        else if (A < B) {
            result = 1;
        }
        else {
            result = 0;
        }
        return result;
    }
};
