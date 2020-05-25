'use strict';

module.exports = function (dashTableConfig, formValidator) {
  let self = this;

  let sortAttribute = dashTableConfig.CommonSortAttr.sortAttribute;
  let ascSortParam  = sortAttribute.ASC_SORT;

  //////////////////////////////////////////////////////
  //
  // Get Table Header and Table Body
  //
  //////////////////////////////////////////////////////

  //Get popup table header from node sessions array nodeSessions
  //If nodeSessions exist and is not an empty array, get the popup table header from it first element
  self.getPopupTableHeader = function (nodeSessions) {
    let popupTableHeader = [];
    if (nodeSessions && nodeSessions.length !== 0) {
      let sample = nodeSessions[0];
      iterateObjKey(sample, popupTableHeader);
    }
    return popupTableHeader;
  };

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
    let tableBodyObj = {};
    tableBodyObj.popupBodyArray = [];
    tableBodyObj.tableBodyArray = [];
    for (let index in resp) {
      let nodeSession = resp[index];
      let popupBody = [];
      let tableBody = [];
      //Get table body row for popup table body
      iterateObjVal(nodeSession, popupBody);

      //Get table body row for table body
      iterateObjValByHeader(nodeSession, tableHeader, tableBody);

      tableBodyObj.popupBodyArray.push(popupBody);
      tableBodyObj.tableBodyArray.push(tableBody);
    }
    return tableBodyObj;
  };

  //Get table header from constant defined in dashboardConstant file
  self.getTableHeaderFromConst = function (tableHeaderConst) {
    let result = {
      displayTableHeader: [],
      completeTableHeader: []
    };
    //Get displayTableHeader
    for (let key in tableHeaderConst) {
      let attribute = tableHeaderConst[key];
      if (attribute.IS_DISPLAY) {
        result.displayTableHeader.push(attribute.KEY);
      }
      result.completeTableHeader.push(attribute.KEY);
    }
    return result;
  };

  //Get display table body according to display table header, complete table header, complete table body
  self.getDisplayTableBody = function (displayTableHeader, completeTableHeader, completeTableBody) {
    let displayTableBody = [];
    let indexes = [];
    //Find index array according to display table header and complete table header
    //For example: displayTableHeader - [1, 3, 5], completeTableHeader - [1, 2, 3, 4, 5], indexes is [0, 2, 4]
    for (let index in displayTableHeader) {
      let header = displayTableHeader[index];
      let position = completeTableHeader.indexOf(header);
      indexes.push(position);
    }
    //Iterate completeTableBody, use indexes to get displayTableBody
    for (let index in completeTableBody) {
      let row = completeTableBody[index];
      let tr = [];
      for (let i in indexes) {
        let position = indexes[i];
        tr.push(row[position]);
      }
      displayTableBody.push(tr);
    }
    return displayTableBody;
  };

  //Get table body from general user application with ble application info
  self.getTableBodyWithBleApp = function (tableHeader, applications, bleAppID) {
    let tableBody = [];
    for (let index in applications) {
      let application = applications[index];
      let tableRow = [];

      //Get table body row for table body
      iterateObjValByHeader(application, tableHeader, tableRow);

      getBleAppInfo(application, tableHeader, tableRow, bleAppID);

      tableBody.push(tableRow);
    }
    return tableBody;
  };

  //Get ble application number and insert it to table row
  //1. If general user application has ble field, get the number of ble application
  //2. If general user application not has ble field, set number of ble application to 0
  function getBleAppInfo(application, tableHeader, tableRow, bleAppID) {
    let bleAppIDIndex = tableHeader.findIndex((element) => { return element === bleAppID; });
    if (application.ble) {
      let bleAppIDArray = [];
      for (let index in application.ble) {
        let bleApplication = application.ble[index];
        bleAppIDArray.push(bleApplication.bleAppID);
      }
      tableRow[bleAppIDIndex] = bleAppIDArray.join();
    }
    else {
      tableRow[bleAppIDIndex] = "";
    }
  }

  //Get complete table header from objects array
  //[Notice: it is based on objects provide all the keys, otherwise, it may miss some keys. But it is impossible to iterate all the 
  //         elements and get the complete keys]
  //[Notice: it works for lora device objects: 1. because lora device objects return all the keys for each of them
  //                                                2. at least, lora device objects include the key field "DevEUI", it can be use as the index 
  //                                                   to find the "devEUI" in complete table body]
  self.getCompleteTableHeaderFromObj = function (objects) {
    let completeTableHeader = [];
    if (Array.isArray(objects) && objects.length !== 0) {
      let tempObj = objects[0];
      completeTableHeader = Object.keys(tempObj);
    }
    return completeTableHeader;
  };

  //1.Transfer the devEUIs to devEUIs number
  self.transDevicesToDeviceNums = function (tableHeader, tableBody, devices, devEUIsNum) {
    let devEUIsIdx = tableHeader.findIndex(function (element) {
      return element === devices;
    });
    tableHeader[devEUIsIdx] = devEUIsNum;
    for (let index in tableBody) {
      let row = tableBody[index];
      if (Array.isArray(row[devEUIsIdx])) {
        row[devEUIsIdx] = row[devEUIsIdx].length;
      }
      else {
        row[devEUIsIdx] = 0;
      }
    }
  };

  //Transfer table body ISO time to locale time
  self.transTableISOTimeToLocaleTime = function (tableHeader, tableBody, timeFieldsArray) {
    timeFieldsArray.forEach((field) => {
      let index = tableHeader.findIndex((header) => { return header === field; });
      for (let i in tableBody) {
        let row = tableBody[i];
        //Here we use Date.prototype.toString instead of Date.prototype.toLocaleString(), because Date.prototype.toLocaleString()
        //cannot be parsed back to a type date, and cannot be used to sort
        row[index] = new Date(row[index]);
        row[index] = row[index].toString().slice(0, 24);
      }
    });
  };

  //Transfer table body ISO time to locale time according to config 
  self.transTableISOTimeToLocaleTimeByConfig = function (tableHeader, tableBody, configAttrs) {
    for (let key in configAttrs) {
      let attr = configAttrs[key];
      if (attr.IS_DATE && attr.DISPLAY_NAME) {
        self.transTableISOTimeToLocaleTime(tableHeader, tableBody, [attr.DISPLAY_NAME]);
      }
      else if (attr.IS_DATE && !attr.DISPLAY_NAME) {
        self.transTableISOTimeToLocaleTime(tableHeader, tableBody, [attr.KEY]);
      }
    }
  };

  //Transfer single ISO time to Locale time
  self.transSingleISOTimeToLocaleTime = function (ISOTime) {
    let date = new Date(ISOTime);
    return date.toString().slice(0, 24);
  };

  //Transfer the origin name to target name in table header
  self.transTableHeaderName = function (tableHeader, originName, targetName) {
    let position = tableHeader.indexOf(originName);
    tableHeader[position] = targetName;
  };

  //Transfer the origin names to target names in table header
  self.transTableHeaderNames = function (tableHeader, attributes) {
    for (let key in attributes) {
      let attr = attributes[key];
      let originName = attr.KEY;
      let targetName = attr.DISPLAY_NAME;
      let position = tableHeader.indexOf(originName);
      tableHeader[position] = targetName;
    }
    return tableHeader;
  };

  //Replace the old attribute name with new attribute name in table header
  self.transTableHeadName = function (tableHeader, oldAttributeName, newAttributeName) {
    let position = tableHeader.findIndex((header) => { return header === oldAttributeName; });
    tableHeader[position] = newAttributeName;
  };

  //////////////////////////////////////////////////////
  //
  // Get Device Info for Popup
  //
  //////////////////////////////////////////////////////

  //Find key index value, for example, devEUI is the key index of lora device
  //We need find the devEUI value in the row and return it
  self.findKeyIndexVal = function (tableHeader, keywords, row) {
    let keyIndexVal;
    for (let index in tableHeader) {
      if (tableHeader[index] === keywords && row[index]) {
        keyIndexVal = row[index];
        break;
      }
    }
    return keyIndexVal;
  };

  //Find the row include the keyIndexVal, and return the row info
  self.findRowInfo = function (nodeSessions, keyword, keyIndexVal) {
    let rowInfo = {};
    for (let index in nodeSessions) {
      let nodeSession = nodeSessions[index];
      if (nodeSession.hasOwnProperty(keyword) && nodeSession[keyword] === keyIndexVal) {
        rowInfo = nodeSession;
      }
    }
    return rowInfo;
  };

  //Get popup row information, attributes is coming from data itself
  self.getPopupRowInfo = function (rowInfo) {
    let popupRowInfo = [];
    for (let key in rowInfo) {
      let rowObject = {};
      rowObject.header = key;
      rowObject.body = rowInfo[key];
      popupRowInfo.push(rowObject);
    }
    return popupRowInfo;
  };

  //Get popup row information according to constant file
  self.getPopupRowInfoByConst = function (rowInfo, constant) {
    let result = {
      popupRowInfoWithoutPic: [],
      popupRowInfoWithPic: []
    };
    for (let key in constant) {
      let attr = constant[key];
      if (attr.IS_PICTURE) {
        let obj = {};
        obj.header = attr.DISPLAY_NAME;
        if (rowInfo[attr.KEY]) {
          obj.body = "http://" + rowInfo[attr.KEY];
          obj.width = "300px";
          obj.height = "150px";
        }
        else {
          obj.body = "";
          obj.width = "0px";
          obj.height = "0px";
        }
        result.popupRowInfoWithPic.push(obj);
      }
      else if (!attr.IS_PICTURE && attr.IS_DATE) {
        let obj = {};
        obj.header = attr.DISPLAY_NAME;
        obj.body = rowInfo[attr.KEY].toLocaleString();
        result.popupRowInfoWithoutPic.push(obj);
      }
      else if (!attr.IS_PICTURE && !attr.IS_DATE) {
        let obj = {};
        obj.header = attr.DISPLAY_NAME;
        obj.body = rowInfo[attr.KEY];
        result.popupRowInfoWithoutPic.push(obj);
      }
    }
    return result;
  };

  //Get popup row information, attributes is defined in the config file
  self.getPopupRowInfoWithDefinedAttributes = function (rowInfo, attributes) {
    let popupRowInfo = [];
    for (let index in attributes) {
      let attribute = attributes[index];
      let obj = {};
      obj.header = attribute;
      obj.body = rowInfo[attribute];
      popupRowInfo.push(obj);
    }
    return popupRowInfo;
  };

  //////////////////////////////////////////////////////
  //
  // Sort Table with Specific Attribute
  //
  //////////////////////////////////////////////////////

  //Init sorting status map and ascending sort status map
  self.initSortMap = function (header) {
    let sortMap = {};
    for (let key in header) {
      let value = header[key];
      sortMap[value] = null;
    }
    return sortMap;
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
      if (A === undefined || A === null) {
        return 1;
      }
      else if (B === undefined || B === null) {
        return -1;
      }
      //Step2, sort with A and B is datetime type situation. We need change the string to date type and then sort
      else if (isDate(A) && isDate(B)) {
        A = Date.parse(A);
        B = Date.parse(B);
        return (operation === ascSortParam) ? ascSort(A, B) : dscSort(A, B);
      }
      //Step3, sort with A and B is string, deal with empty string and make string comparison case insensitive
      else if (typeof A === "string" && typeof B === "string") {
        if (A === "") {
          return 1;
        }
        else if (B === "") {
          return -1;
        }
        else {
          A = A.toLowerCase();
          B = B.toLowerCase();
          return (operation === ascSortParam) ? ascSort(A, B) : dscSort(A, B);
        }
      }
      //Step4, compare A and B as other type
      else {
        return (operation === ascSortParam) ? ascSort(A, B) : dscSort(A, B);
      }
    });
    return tableBody;
  };

  //Find the col for sorting, notice the first col is for edit and delete
  self.findIndex = function (header, input) {
    let position = header.findIndex(function (element) {
      return element === input;
    });
    return position;
  };

  //Get the default sort attribute's index in table header
  self.getDefaultSortIndex = function (headers, defaultSortAttr1, defaultSortAttr2) {
    let defaultSortIndex = {};
    for (let index in headers) {
      let header = headers[index];
      if (header && header === defaultSortAttr1) {
        defaultSortIndex.index1 = index;
      }
      else if (header && header === defaultSortAttr2) {
        defaultSortIndex.index2 = index;
      }
    }
    //Deal with invalid situation: defaultSortIndex.index1 doesn't exist 
    //or defaultSortIndex.index2 doesn't exist
    if (!defaultSortIndex.index1 && !defaultSortIndex.index2) {
      defaultSortIndex.index1 = 0;
      defaultSortIndex.index2 = 0;
    }
    else if (!defaultSortIndex.index1) {
      defaultSortIndex.index1 = defaultSortIndex.index2;
    }
    else if (!defaultSortIndex.index2) {
      defaultSortIndex.index2 = defaultSortIndex.index1;
    }
    return defaultSortIndex;
  };

  self.defaultSortTableBody = function (tablebody, defaultSortIndex, SORT_NUM) {
    let TableBody = tablebody;
    let index1 = defaultSortIndex.index1;
    let index2 = defaultSortIndex.index2;
    TableBody.sort(function (row1, row2) {
      //Get row 1 and 2 value for two attribute
      let row1ForAttr1Val = (typeof row1[index1] === 'string') ? row1[index1].toLowerCase() : row1[index1];
      let row2ForAttr1Val = (typeof row2[index1] === 'string') ? row2[index1].toLowerCase() : row2[index1];
      let row1ForAttr2Val = (typeof row1[index2] === 'string') ? row1[index2].toLowerCase() : row1[index2];
      let row2ForAttr2Val = (typeof row2[index2] === 'string') ? row2[index2].toLowerCase() : row2[index2];

      //Correlation comparison
      //Correlation comparison method need write inside the sort function, cannot extract outside
      //I.   Sorting rule:  1.If row value is undefined or null, put it at the bottom
      //                    2.If row value is not undefined or null, use javascript default comparison rule to sort in ascending or descending order
      //                      a.String:  sort in alphabet order, not case sensitive
      //                      b.Number:  sort in value
      //                      c.Boolean: true's value > false's value, simialr as true(2) > false(1)
      //                      d.Array:   sort by the element type inside the array
      //II.  Comparison function: If compareFunction(a, b) is greater than 0(such as:  1), sort b to an index lower than a, b comes first, [b, a].
      //                          If compareFunction(a, b) is less than    0(such as: -1), sort a to an index lower than b, a comes first, [a, b].
      //                          If compareFunction(a, b) returns 0, leave a and b unchanged
      //III. Sort Params SORT_NUM:
      //                      a. SORT_NUM = ascNum = 1, ascending sort, "small value --> big value", such as [1,2,3,4,5,6,7]
      //                      b. SORT_NUM = dscNum = -1,dscending sort, "big value --> small value", such as [7,6,5,4,3,2,1]
      //                      c. No matter what hind of sort, undefined and null will always be at bottom [1,2,3,4, undefined] [4,3,2,1, undefined]
      //1.Comparison for first attribute, the undefined and null value will put at the bottom
      if (row1ForAttr1Val === undefined || row1ForAttr1Val === null) return 1;
      if (row2ForAttr1Val === undefined || row2ForAttr1Val === null) return -1;
      if (row1ForAttr1Val < row2ForAttr1Val) return -1 * SORT_NUM;
      if (row1ForAttr1Val > row2ForAttr1Val) return 1 * SORT_NUM;
      //2.Comparison for second attribute, the undefined and null value will put at the bottom
      if (row1ForAttr2Val === undefined || row1ForAttr2Val === null) return 1;
      if (row2ForAttr2Val === undefined || row2ForAttr2Val === null) return -1;
      if (row1ForAttr2Val < row2ForAttr2Val) return -1 * SORT_NUM;
      if (row1ForAttr2Val > row2ForAttr2Val) return 1 * SORT_NUM;
      return 0;
    });

    return TableBody;
  };

  /////////////////////////////////////////////////////////
  //
  // Check Box Method
  //
  /////////////////////////////////////////////////////////

  //Add default select all check box status as the first col to table header
  self.addThChkStatus = function (tableHeader) {
    tableHeader.unshift(false);
    return tableHeader;
  };

  //Add default check box array as the first col to table body
  self.addTBChkStatus = function (tableBody) {
    for (let index in tableBody) {
      let row = tableBody[index];
      row.unshift(false);
    }
    return tableBody;
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

  //Select all the check box
  self.selectAllSharedFunction = function (tableHeader, tableBody) {
    let checkedRows = [];
    if (tableHeader[0]) {
      //Set every check box elem to checked
      for (let index in tableBody) {
        let row = tableBody[index];
        row[0] = true;
      }
      for (let index in tableBody) {
        let row = tableBody[index];
        if (!checkedRows.includes(row)) {
          checkedRows.push(row);
        }
      }
    }
    else {
      //Set every check box elem to unchecked
      for (let index in tableBody) {
        let row = tableBody[index];
        row[0] = false;
      }
    }
    return checkedRows;
  };

  //Add and remove row from checkedRows
  self.adAndRmChkRowSharedFunction = function (checkedRows, row) {
    //When click the check box, add or remove an element in checked rows
    if (row[0]) {
      checkedRows.push(row);
    }
    else {
      let position = checkedRows.indexOf(row);
      checkedRows.splice(position, 1);
    }
  };

  /////////////////////////////////////////////////////////
  //
  // Batch Change Maintenance Status
  //
  /////////////////////////////////////////////////////////

  //Give a attribute, find all the element value of this attribute in checked rows
  self.getCheckedRowsVal = function (header, attribute, checkedRows) {
    let array = [];
    let position = header.indexOf(attribute);
    if (position && position !== -1) {
      for (let index in checkedRows) {
        let row = checkedRows[index];
        let value = row[position];
        array.push(value);
      }
    }
    return array;
  };

  //Find if the array has different value inside it
  self.hasDiffVal = function (array) {
    let result = false;
    //Cannot use array[0] ? array[0] : null condition
    //Because InMaintenance is boolean value
    let initVal = (array[0] !== undefined && array[0] !== null) ? array[0] : null;
    for (let index in array) {
      let value = array[index];
      if (value !== initVal) {
        result = true;
        break;
      }
    }
    return result;
  };

  /////////////////////////////////////////////////////////
  //
  // Private Function
  //
  /////////////////////////////////////////////////////////

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

  //Iterate object and get all the properties in the object
  //Not only for the first layer property, but also second layer property and so on
  function iterateObjKey(obj, array) {
    for (let property in obj) {
      if (formValidator.getObjectType(obj[property]) === "object") {
        iterateObjKey(obj[property], array);
      }
      else {
        array.push(property);
      }
    }
  }

  //Iterate object and get all the values in the object
  //Not only for the first layer value, but also second layer value and so on
  function iterateObjVal(obj, array) {
    for (let property in obj) {
      if (formValidator.getObjectType(obj[property]) === "object") {
        iterateObjVal(obj[property], array);
      }
      else {
        array.push(obj[property]);
      }
    }
  }

  //Iterate and get all the obj value according to given headers
  function iterateObjValByHeader(obj, headers, array) {
    let object = {};
    object = flattenObj(obj);
    for (let index in headers) {
      let header = headers[index];
      array.push(object[header]);
    }
    return array;
  }

  function flattenObj(obj) {
    let object = {};
    for (let property in obj) {
      if (formValidator.getObjectType(obj[property]) === "object") {
        object = Object.assign(object, flattenObj(obj[property]));
      }
      else {
        object[property] = obj[property];
      }
    }
    return object;
  }
};
