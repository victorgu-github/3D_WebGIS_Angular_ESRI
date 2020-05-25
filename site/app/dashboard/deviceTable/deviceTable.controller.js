'use strict';

module.exports = function ($scope, $window, $location, $routeParams, appConfig, dashTableConfig, dataFactory, CollectionUtils, 
  AccountService, SidebarService, loraDeviceService, loraDevEditValidateService, dashboardSharedService, DashboardTableSharedService) {
  
  const DEVICE_TABLE_DETAILS = "dashboard-shared-table-details device-table-details";
  const DEVICE_TABLE_DETAILS_FILTER_SEARCH_HIDE = "dashboard-shared-table-details device-table-details-filter-hide";
  let loraDevice = dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;                                        //"loraDevices";
  let bleGateway = dashTableConfig.Devices.Gateway.BLE_GATEWAY_ID;                                            //"gateways";
  const correctRouteParamsArray = [loraDevice, bleGateway];
  
  //Variable coming from dashTableConfig file
  let loraDeviceTableUrl = dashTableConfig.Devices.DevTableCommonUrl + dashTableConfig.Devices.LoraDevice.LORA_DEVICE_ID;
  let CommonSortAttr     = dashTableConfig.CommonSortAttr;
  let sortAttribute      = CommonSortAttr.sortAttribute;
  let appID  = dashTableConfig.Devices.LoraDevice.sortHeader.APPID;                                           //"ApplicationID";
  let DevEUI = dashTableConfig.Devices.LoraDevice.sortHeader.DEVEUI;                                         //"DevEUI";
  let maintanence = dashTableConfig.Devices.LoraDevice.sortHeader.MAINTANENCE;                               //"InMaintenance";

  let ascSort = sortAttribute.ASC_SORT;                                              //"ascending";
  let dscSort = sortAttribute.DSC_SORT;                                              //"descending";
  let ascNum  = sortAttribute.ASC_NUM;                                                //1;

  let loraDeviceTableHighBottom = dashTableConfig.Devices.LoraDevice.cssStyles.DEVICE_TABLE_HIGH_BOTTOM;                         //"62px";
  let loraDeviceTableLowBottom = dashTableConfig.Devices.LoraDevice.cssStyles.DEVICE_TABLE_LOW_BOTTOM;                           //"10px";

  let userInfo = AccountService.userInfo;
  let appIDRange = userInfo.appIDs;

  let loraDeviceNodeSessions;
  let loraDevCompleteTableHeader;
  let loraDevCompleteTableBody;

  let channelHistoryDataEndTimeByDefault   = new Date();
  let channelHistoryDataStartTimeByDefault = new Date(channelHistoryDataEndTimeByDefault - dashTableConfig.Devices.LoraDevice.channelHistory.timeDuration * 3600000);
  
  $scope.deviceName = $routeParams.name;
  $scope.initializing = true;
  $scope.rowsToBeDeleted = {};
  $scope.filterByAppID;
  $scope.filterVal;
  $scope.searchVal;
  $scope.sortMap = DashboardTableSharedService.initSortMap(dashTableConfig.Devices.LoraDevice.devTableHeader);       //Initialize the sort table, set sort status to null for each col
  $scope.sortAscMap = DashboardTableSharedService.initSortMap(dashTableConfig.Devices.LoraDevice.devTableHeader);    //Initialize the ascending sort table, set sort status to null for each col
  $scope.checkedRows = [];
  $scope.batchMtEntry = {};
  $scope.hideFilter;
  $scope.hideSearch;
  $scope.deviceTableDetails;
  // Decide whether to show the check box
  $scope.showCheckBox = $scope.deviceName === loraDevice;
  $scope.deviceMap = {};
  $scope.batchCHEntry = {};
  
  /////////////////////////////////////////////////////
  //
  // Main function
  //
  /////////////////////////////////////////////////////

  checkUrlAndInitPage();

  /////////////////////////////////////////////////////
  //
  // Widget function
  //
  /////////////////////////////////////////////////////

  //Table header is fixed position. Should have diff class when sidebar toggle and not toggle
  $scope.getTableHeaderClass = function () {
    let result;
    if ($scope.hideFilter && $scope.hideSearch) {
      if (SidebarService.sidebar.checked) {
        result = "dashboard-shared-table-header-filter-hide-with-sidebar";
      }
      else {
        result = "dashboard-shared-table-header-filter-hide-without-sidebar";
      }
    }
    else {
      if (SidebarService.sidebar.checked) {
        result = "dashboard-shared-table-header-with-sidebar";
      }
      else {
        result = "dashboard-shared-table-header-without-sidebar";
      }
    }
    return result;
  };

  //1.DevEUI here is the keywords attribute in node session: "DevEUI"
  //2.devEUI is the actual value of each line element: "AAAAAAAAAAAAAAAB"
  //3.With these two value we can find the exact node session from node sessions collection
  $scope.showDeviceInfo = function (row) {
    if ($scope.deviceName === loraDevice) {
      let devEUI = DashboardTableSharedService.findKeyIndexVal(loraDevCompleteTableHeader, DevEUI, row);
      let rowInfo = DashboardTableSharedService.findRowInfo(loraDeviceNodeSessions, DevEUI, devEUI);

      $scope.popupRowInfo = DashboardTableSharedService.getPopupRowInfo(rowInfo);
      //Display bandID string instead bandID number: 0 => "US 902-928MHz"
      //Display class string instead class number: 0 => "A"
      $scope.popupRowInfoBandID = $scope.popupRowInfo.find((element) => { return element.header === "BandID"; });
      $scope.popupRowInfoBandID.body = dashboardSharedService.getMapValue($scope.popupRowInfoBandID.body, $scope.bandIDs);
      $scope.popupRowInfoClass = $scope.popupRowInfo.find((element) => { return element.header === "Class"; });
      $scope.popupRowInfoClass.body = dashboardSharedService.getMapValue($scope.popupRowInfoClass.body, $scope.classes);
      angular.element('#generalInfoModal').modal();
    }
  };

  //Relocate to update device page
  $scope.editDevice = function (row) {
    let url;

    //according to different device, forward to different edit page
    if ($scope.deviceName === loraDevice) {
      let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashTableConfig.Devices.LoraDevice.sortHeader.DEVEUI, 
        dashTableConfig.Devices.LoraDevice.sortHeader.APPID]);
      if (result.status === "success") {
        if ($scope.deviceName === loraDevice) {
          url = "/dashboard/loraDevice/edit/" + result.ApplicationID + "/" + result.DevEUI;
        }
        $location.url(url);
      }
      else {
        $window.alert("Cannot edit this record, please make sure the key index exist in the row");
      }
    }
  };

  $scope.deleteDevice = function (row) {
    let devEUI;
    let applicationID;

    if ($scope.deviceName === loraDevice) {
      //find the device devEUI and applicationID
      let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashTableConfig.Devices.LoraDevice.sortHeader.DEVEUI, 
        dashTableConfig.Devices.LoraDevice.sortHeader.APPID]);
      if (result.status === "success") {
        devEUI = result.DevEUI;
        applicationID = result.ApplicationID;
      }
      else {
        $window.alert("Cannot delete this device, please make sure DevEUI and ApplicationID exist for this Device!");
      }

      //confirm the delete alert, and then delete the loraDeivce
      let confirmResult = window.confirm("Are you sure to remove this device?");
      if (confirmResult === true) {
        loraDeviceService.deleteLoraDevice(devEUI, applicationID).then(function (response) {
          if (response.status === 'success') {
            location.reload();
          }
          else {
            let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
            $window.alert("Error occurred due to: " + errMsg);
          }
        });
      }
    }
  };

  //Combine search function, support filter by applicationID and search by text at the same time
  $scope.searchDevice = function () {
    let filterVal = $scope.filterVal ? $scope.filterVal : "";
    let searchVal = $scope.searchVal ? $scope.searchVal : "";
    let trs = [];
    // Updatecase and lowercase insensitive
    filterVal = filterVal.toUpperCase();
    searchVal = searchVal.toUpperCase();
    // Step 1, remove all the element inside tablebody, and assign table body content according
    // to deviceName
    if ($scope.deviceName === loraDevice) {
      $scope.tableBody = [];
      trs = loraDevCompleteTableBody;
    }

    // Step 2, traverse the complete copy, find the eligible row
    for (let index in trs) {
      let tr = trs[index];
      if (dashboardSharedService.rowIncludeElem(tr, filterVal) && dashboardSharedService.rowIncludeElem(tr, searchVal)) {
        $scope.tableBody.push(tr);
      }
    }
    // Step 3, after each filtering and searching, clear the status of check box status
    // clear tableHeader first col, tableBody first col, checkedRows array
    $scope.tableHeader[0] = false;
    $scope.tablBody = DashboardTableSharedService.clearChkStatus($scope.tableBody);
    $scope.checkedRows = [];
  };

  //Sort function
  $scope.sortTable = function (input) {
    let header = $scope.tableHeader;
    //Find sort col's index
    let position = DashboardTableSharedService.findIndex(header, input);
    //Right now, we only support sort for lora device and lora gateway
    if ($scope.deviceName === loraDevice) {
      dashboardSharedService.sortTable(position, input, $scope.sortMap, $scope.sortAscMap, $scope.tableBody, loraDevCompleteTableBody, ascSort, dscSort);
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
      //Add not include element into checkedRows array
      $scope.checkedRows = [];
    }

    //If $scope.checkedRows have rows inside it, show the change maintanence status button
    showMtBtn();
  };

  //Add and remove checked rows from checkedRows array
  $scope.adAndRmChkRow = function (row) {
    //When click the check box, add or remove an element in checked rows
    if (row[0]) {
      $scope.checkedRows.push(row);
    }
    else {
      let position = $scope.checkedRows.indexOf(row);
      $scope.checkedRows.splice(position, 1);
    }

    showMtBtn();
  };

  //Only ApplicationID and InMaintenance status is valid, then popup the batch maintanence edit page
  //1.ApplicationID and InMaintenance of checked rows are the same:
  //  a.Popup the batch maintenence edit page. The check box in the batch maintenance edit page represent the devices' current status
  //2.ApplicationID of the checked rows are the same, but Inmaintenance of checked rows are not the same:
  //  a.Popup an alert, let the user know the current Inmaintenance of checked rows are not the same
  //  b.Popup the batch maintenence edit page. The check box in the batch maintenance edit page represent the devices' status will change to
  //3.ApplicationID of the checked rows are not the same:
  //  a.Popup an alert, let the user know ApplicationID of checked are not the same
  //  b.Don't popup the maintenance edit page
  $scope.changeMtStatus = function () {
    let appIDArray    = DashboardTableSharedService.getCheckedRowsVal($scope.tableHeader, appID, $scope.checkedRows);
    let mtStatusArray = DashboardTableSharedService.getCheckedRowsVal($scope.tableHeader, maintanence, $scope.checkedRows);
    if (!DashboardTableSharedService.hasDiffVal(appIDArray) && !DashboardTableSharedService.hasDiffVal(mtStatusArray)) {
      initBatchMtObject(appIDArray[0], mtStatusArray[0]);
      angular.element('#changeMtModal').modal();
    }
    else if (!DashboardTableSharedService.hasDiffVal(appIDArray) && DashboardTableSharedService.hasDiffVal(mtStatusArray)){
      window.alert("The selected deivces have different InMaintenance status. The check box in edit page only indicates the maintenance status will changed to");
      initBatchMtObject(appIDArray[0], null);
      angular.element('#changeMtModal').modal();
    }
    else {
      window.alert("The selected devices have different ApplicationID, ApplicationID should be the same for bulk status change");
    }
  };

  //Prepare batchChannelHistoryData object, get appID and devEUIArray, used to get csv file
  $scope.downloadCHData = function () {
    let appIDArray    = DashboardTableSharedService.getCheckedRowsVal($scope.tableHeader, appID, $scope.checkedRows);
    let devEUIArray   = DashboardTableSharedService.getCheckedRowsVal($scope.tableHeader, DevEUI, $scope.checkedRows);
    if (!DashboardTableSharedService.hasDiffVal(appIDArray)) {
      initBatchCHObject(appIDArray[0], devEUIArray);
      angular.element('#channelHistoryDataModal').modal();
    }
    else {
      window.alert("The selected devices have different ApplicationID, ApplicationID should be the same for bulk downloading channel historical data");
    }
  };

  $scope.batchChangeMtStatus = function () {
    let mtEditEntry = {
      applicationID: $scope.batchMtEntry.batchMtAppID,
      devEUI:        $scope.batchMtEntry.batchMtDevEUI,
      maintCommand:  $scope.batchMtEntry.batchMtStatus ? "enable" : "disable",
      comments:      $scope.batchMtEntry.batchMtComments
    };
    let validationResult = loraDevEditValidateService.validateMtAttr(mtEditEntry);
    if (validationResult.status === "success") {
      loraDeviceService.updateMtStatus(mtEditEntry).then(function (response) {
        if (response.status === "success") {
          let successMessage = "Lora device successfully update";
          $window.alert(successMessage);
          $window.location.href = loraDeviceTableUrl;
        }
        else {
          $scope.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
          $window.alert("Error occurred due to: \n" + $scope.errorMessage);
        }
      });
    }
    else {
      $scope.errorMessage = validationResult.message;
      $window.alert(validationResult.message);
    }
  };

  //Show lora device zmq payload and channel history data
  //1.Right now, only lora device support zmq payload will show zmq payload data
  $scope.showZmqPayloadAndChannelHistoryData = function (row) {
    let url;

    //according to different device, forward to different edit page
    if ($scope.deviceName === loraDevice) {
      //Find the key index of the row record
      //1.ApplicationID;
      //2.DevEUI;
      //3.DevType;
      let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashTableConfig.Devices.LoraDevice.devTableHeader.DevEUI,
        dashTableConfig.Devices.LoraDevice.devTableHeader.ApplicationID, dashTableConfig.Devices.LoraDevice.devTableHeader.DevType]);
      if (result.status === "success") {
        url = "/dashboard/loraDevice/zmqPayloadAndChannelHistoryData/" + result.ApplicationID + "/" + result.DevEUI + "/" + result.DevType;
        $location.url(url);
      }
      else {
        $window.alert("Cannot edit this record, please make sure the key index exist in the row");
      }
    }
  };

  //Get channel history data
  $scope.getChannelHistoryData = function () {
    let applicationID = $scope.batchCHEntry.batchCHAppID;
    let devEUIs       = $scope.batchCHEntry.batchCHDevEUIs;
    let startTime     = $scope.batchCHEntry.channelHistoryDataStartTime.toISOString();
    let endTime       = $scope.batchCHEntry.channelHistoryDataEndTime.toISOString();
    loraDeviceService.getChannelHistoryData(applicationID, devEUIs, startTime, endTime).then(function (response) {
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:attachment/csv,' + encodeURI(response.data);
      hiddenElement.target = '_blank';
      hiddenElement.download = dashTableConfig.Devices.LoraDevice.channelHistory.fileName;
      hiddenElement.click();
      angular.element('#channelHistoryDataModal').modal('toggle');
    }).catch(function (error) {
      window.alert(error.data.error.errors[0].message);
    });
  };

  //////////////////////////////////////////////////////
  //
  // Initialize Function
  //
  //////////////////////////////////////////////////////

  function checkUrlAndInitPage() {
    let panelName = $routeParams.name;
    let isCorrectRouteParams = CollectionUtils.isCorrectRouteParams(panelName, correctRouteParamsArray);
    if (!isCorrectRouteParams) {
      $scope.displayPageNotFoundTemplate = true;
    }
    else {
      $scope.displayPageNotFoundTemplate = false;
      initFilter();
      hideFilterAndSearch();
      initTable();
    }
  }

  //Here we use jQuery instead of angularjs. After lots of test, find that angularjs $scope.oFilterVal and $scope.oFilterArr cannot 
  //be synchronized to HTML immediately after assigning the value, and we use jquery to implement an immediate synchronization
  function initFilter() {
    //Right now, the filter is only serve for loraDevice
    //However, search bar serve for all of the devices
    //Later on, we can customize different widget for different device
    if ($scope.deviceName === loraDevice) {
      let applicationIDs = [];
      applicationIDs.push("");
      applicationIDs = applicationIDs.concat(appIDRange);
      $scope.filterVal = applicationIDs[0] ? applicationIDs[0] : "";
      $scope.applicationIDs = applicationIDs;
    }
  }

  //Right now, only lora device and lora gateway device table support filter and search
  //We disable the filter and search function for other device table
  function hideFilterAndSearch() {
    switch ($scope.deviceName) {
      case loraDevice:
        $scope.hideFilter = false;
        $scope.hideSearch = false;
        $scope.deviceTableDetails = ($scope.hideFilter && $scope.hideSearch) ? DEVICE_TABLE_DETAILS_FILTER_SEARCH_HIDE : DEVICE_TABLE_DETAILS;
        break;
      default:
        $scope.hideFilter = true;
        $scope.hideSearch = true;
        $scope.deviceTableDetails = ($scope.hideFilter && $scope.hideSearch) ? DEVICE_TABLE_DETAILS_FILTER_SEARCH_HIDE : DEVICE_TABLE_DETAILS;
    }
  }

  function initTable() {
    if ($scope.deviceName === loraDevice) {
      initLoraDevices();
    }
    else if ($scope.deviceName === bleGateway) {
      initGateways();
    }
  }

  //Init lora device table
  function initLoraDevices() {
    if (dashboardSharedService.candidateValues) {
      $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
      $scope.classes = dashboardSharedService.parseDefaultClasses();
      initLoraDevicesTable();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
          $scope.classes = dashboardSharedService.parseDefaultClasses();
          initLoraDevicesTable();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initLoraDevicesTable() {
    loraDeviceService.getLoraDevicesInfo(appIDRange).then(function (response) {
      //initializing parameters
      let devTableHeader = dashTableConfig.Devices.LoraDevice.devTableHeader;
      let defaultSortIndex;
      loraDeviceNodeSessions = [];

      $scope.initializing = true;
      if (response.status === "success") {
        let nodeSessions = response.content.nodeSessions;
        //Get all the nodesessions info and concat them into a single object array
        nodeSessions.forEach(function (nodeSession) {
          loraDeviceNodeSessions = loraDeviceNodeSessions.concat(nodeSession.data);
        });

        //Get loraDevCompleteTableHeader from devTableHeader in dashboard config file
        loraDevCompleteTableHeader = DashboardTableSharedService.getTableHeader(devTableHeader);

        let tableBody = DashboardTableSharedService.getTableBody(loraDevCompleteTableHeader, loraDeviceNodeSessions);
        loraDevCompleteTableBody = tableBody.tableBodyArray;

        //when initialized the lora device cards, and deviceTable.controller.js use these two values
        $scope.tableHeader = loraDevCompleteTableHeader;
        $scope.tableBody = loraDevCompleteTableBody;
        //Add the default check box status as the first col to table header and table body;
        $scope.tableHeader = DashboardTableSharedService.addThChkStatus($scope.tableHeader);
        $scope.tableBody = DashboardTableSharedService.addTBChkStatus($scope.tableBody);
        //Implement default sort for lora device table, right now, only support default sort according to applicationID and devEUI
        defaultSortIndex = DashboardTableSharedService.getDefaultSortIndex(loraDevCompleteTableHeader, appID, DevEUI);
        $scope.tableBody = DashboardTableSharedService.defaultSortTableBody(loraDevCompleteTableBody, defaultSortIndex, ascNum);

        $scope.initializing = false;
      }
      else {
        $scope.initializing = false;
        $window.alert("Error occurred due to: " + response.errors[0].message);
        $scope.tableHeader = [];
        $scope.tableBody = [];
      }
    });
  }

  function initGateways() {
    // Fetch BLE Gateway data from web api
    dataFactory.getAllGWSensorValues().then(function (responses) {
      $scope.initializing = true;
      let records = [];
      responses.forEach(function (response) {
        if (response.status === "success") {
          let gwSensorRecs = response.content.gw_sensor_recs;
          records = records.concat(gwSensorRecs);
        }
        else {
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });

      // Initiate device table, device table header and device table body
      let header = ['Gateway Mac', 'Name', 'Temperature', 'Humidity', 'Air Quality'];
      let body = [];
      for (let index in records) {
        let record = records[index];
        let row = [];
        row.push(record["gw_mac"]);
        row.push(record["name"]);
        for (let i in record["resv_sensors"]) {
          let sensorRecord = record["resv_sensors"][i];
          row.push(sensorRecord.value + '' + sensorRecord.unit);
        }
        body.push(row);
      }
      $scope.tableHeader  = header;
      $scope.tableBody    = body;
      $scope.initializing = false;
    });
  }

  /////////////////////////////////////////////////////
  //
  // Private function
  //
  /////////////////////////////////////////////////////

  angular.element(document).ready(function () {
    let isFirefox = typeof InstallTrigger !== 'undefined';
    if (isFirefox) {
      angular.element(".device-table-details table").css('height', '0');
    }
  });

  //Determinie whether show the maintain status change button or not
  function showMtBtn() {
    //When click the check box, determine if the change maintanence button will appear or not
    //Then change the table style, leave space for change maintanence button
    if ($scope.checkedRows.length !== 0) {
      angular.element(".device-table-details").css("bottom", loraDeviceTableHighBottom);
    }
    else {
      angular.element(".device-table-details").css("bottom", loraDeviceTableLowBottom);
    }
  }

  //Init batch maintenance object value for change maintenance status
  function initBatchMtObject(appIDVal, mtStatusVal) {
    $scope.batchMtEntry.batchMtAppID  = appIDVal;
    $scope.batchMtEntry.batchMtStatus = mtStatusVal;
    $scope.batchMtEntry.batchMtDevEUI = DashboardTableSharedService.getCheckedRowsVal($scope.tableHeader, DevEUI, $scope.checkedRows);
    $scope.batchMtEntry.batchMtDevEUI = $scope.batchMtEntry.batchMtDevEUI.join();
  }

  //Init batch channel history data object value for get channel history data csv
  function initBatchCHObject(appIDVal, devEUIArray){
    $scope.batchCHEntry.batchCHAppID = appIDVal;
    $scope.batchCHEntry.batchCHDevEUIs = devEUIArray.join();
    $scope.batchCHEntry.channelHistoryDataStartTime = dashboardSharedService.setDefaultStartTime(channelHistoryDataStartTimeByDefault);
    $scope.batchCHEntry.channelHistoryDataEndTime   = dashboardSharedService.setDefaultEndTime(channelHistoryDataEndTimeByDefault);
  }
};