'use strict';

module.exports = function ($scope, $window, $location, dashTableConfig, dashboardConstant, AccountService, SidebarService,
  DashboardTableSharedService, dashboardSharedService, GeneralUserAppSharedService) {

  const TH_WITH_SIDEBAR    = "dashboard-shared-table-header-with-sidebar";
  const TH_WITHOUT_SIDEBAR = "dashboard-shared-table-header-without-sidebar";

  //Variable coming from dashTableConfig file 
  let sortAttribute = dashTableConfig.CommonSortAttr.sortAttribute;
  let ascSort       = sortAttribute.ASC_SORT;                                                          //"ascending";
  let dscSort       = sortAttribute.DSC_SORT;                                                          //"descending";
  let dscNum        = sortAttribute.DSC_NUM;                                                           //1;

  let GENERAL_USER_APP_EDIT_URL = dashTableConfig.GeneralUser.GenearlUserEditCommonUrl;

  let userInfo   = AccountService.userInfo;
  let appIDRange = userInfo.appIDs;
  let username   = userInfo.username ? userInfo.username : userInfo.userName;
  let accessRole = userInfo.currentUserType === "ACCOUNT.ADMIN" ? "admin" : "general";

  let applications;
  let completeTableHeader;
  let completeTableBody;

  $scope.initializing = true;
  $scope.filterVal;
  $scope.searchVal;
  $scope.sortMap;
  $scope.sortAscMap;

  /////////////////////////////////////////////////////
  //
  // Main function
  //
  /////////////////////////////////////////////////////

  initFilter();
  initGeneralUserAppTable();

  /////////////////////////////////////////////////////
  //
  // Widget function
  //
  /////////////////////////////////////////////////////

  //Table header is fixed position. Should have diff class when sidebar toggle and not toggle
  $scope.getTableHeaderClass = function () {
    let result;
    if (SidebarService.sidebar.checked) {
      result = TH_WITH_SIDEBAR;
    }
    else {
      result = TH_WITHOUT_SIDEBAR;
    }
    return result;
  };

  //Filter and Search Function
  $scope.searchDevice = function () {
    let filterVal = $scope.filterVal ? $scope.filterVal : "";
    let filterValForBleApp = $scope.filterValForBleApp ? $scope.filterValForBleApp : "";
    let searchVal = $scope.searchVal ? $scope.searchVal : "";
    let trs = [];
    // Updatecase and lowercase insensitive
    filterVal = filterVal.toUpperCase();
    filterValForBleApp = filterValForBleApp.toUpperCase();
    searchVal = searchVal.toUpperCase();
    // Step 1, remove all the element inside tablebody, and assign table body content
    $scope.tableBody = [];
    trs = completeTableBody;
    // Step 2, traverse the complete copy, find the eligible row
    for (let index in trs) {
      let tr = trs[index];
      let bleAppIDIndex = completeTableHeader.indexOf(dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APPLICATION_ID.DISPLAY_NAME);
      let bleAppIDs = tr[bleAppIDIndex].split(",");
      if (dashboardSharedService.rowIncludeElem(tr, filterVal) && dashboardSharedService.arrayIncludeFilterString(bleAppIDs, filterValForBleApp) && dashboardSharedService.rowIncludeElem(tr, searchVal)) {
        $scope.tableBody.push(tr);
      }
    }
  };

  //Sort function
  $scope.sortTable = function (input) {
    let header = $scope.tableHeader;
    //Find sort col's index
    let position = DashboardTableSharedService.findIndex(header, input);
    //Step 1: if we didn't sort before, we do the ascending sort for the first time
    if (!$scope.sortMap[input]) {
      $scope.sortMap[input] = true;
      $scope.sortAscMap[input] = true;
      DashboardTableSharedService.clearSortMap($scope.sortMap, input);
      DashboardTableSharedService.clearSortMap($scope.sortAscMap, input);
      DashboardTableSharedService.sortTable(position, $scope.tableBody, ascSort);
      DashboardTableSharedService.sortTable(position, completeTableBody, ascSort);
    }
    else {
      //Step 2: if we have already sort, we do the sorting according the current sorting status
      if (!$scope.sortAscMap[input]) {
        $scope.sortMap[input] = true;
        $scope.sortAscMap[input] = true;
        DashboardTableSharedService.clearSortMap($scope.sortMap, input);
        DashboardTableSharedService.clearSortMap($scope.sortAscMap, input);
        DashboardTableSharedService.sortTable(position, $scope.tableBody, ascSort);
        DashboardTableSharedService.sortTable(position, completeTableBody, ascSort);
      }
      else {
        $scope.sortMap[input] = true;
        $scope.sortAscMap[input] = false;
        DashboardTableSharedService.clearSortMap($scope.sortMap, input);
        DashboardTableSharedService.clearSortMap($scope.sortAscMap, input);
        DashboardTableSharedService.sortTable(position, $scope.tableBody, dscSort);
        DashboardTableSharedService.sortTable(position, completeTableBody, dscSort);
      }
    }
  };

  //Relocate to update device page
  $scope.editDevice = function (row) {
    let generalUserApplicationID;
    let url;
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.KEY]);
    if (result.status === "success") {
      generalUserApplicationID = result.generalUserApplicationID;
      url = GENERAL_USER_APP_EDIT_URL + generalUserApplicationID;
      $location.url(url);
    }
    else {
      $window.alert("Cannot edit this record, please make sure the key index exist in the row");
    }
  };

  $scope.deleteDevice = function (row) {
    let generalUserApplicationID;

    let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.KEY]);
    if (result.status === "success") {
      generalUserApplicationID = result.generalUserApplicationID;
      let confirmResult = window.confirm("Are you sure to remove this application?");
      if (confirmResult === true) {
        GeneralUserAppSharedService.deleteGeneralUsrApp(generalUserApplicationID).then(function (response) {
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
    else {
      $window.alert("Cannot delete this application, please make sure generalApplicationID exist for this application!");
    }
  };

  //////////////////////////////////////////////////////
  //
  // Initialize Function
  //
  //////////////////////////////////////////////////////

  //Init Lora Application IDs Filter
  function initFilter() {
    let applicationIDs = [""];
    applicationIDs = applicationIDs.concat(appIDRange);
    $scope.filterVal = applicationIDs[0];
    $scope.applicationIDs = applicationIDs;
  }

  //Init Ble Application IDs Filter
  function initBleApplicationsFilter(tableHeader, tableBody, bleAppID) {
    let bleApplications = [""];
    let bleAppIDIndex = tableHeader.findIndex((element) => { return element === bleAppID; });
    for (let index in tableBody) {
      let row = tableBody[index];
      let bleAppIDsArray = row[bleAppIDIndex].split(",");
      for (let i in bleAppIDsArray) {
        let id = bleAppIDsArray[i];
        if (!bleApplications.includes(id)) {
          bleApplications.push(id);
        }
      }
    }
    bleApplications = bleApplications.sort(function(a, b){
      return parseInt(a) - parseInt(b);
    });
    return bleApplications;
  }

  function initGeneralUserAppTable() {
    //initializing parameters
    let defaultSortIndex;
    GeneralUserAppSharedService.getGeneralUsrAppsCreatedByV2(username, accessRole).then(function (response) {
      $scope.initializing = true;
      if (response.status === "success") {
        applications = response.content;

        //Get completeTableHeader from config
        let tableHeader     = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES);
        completeTableHeader = tableHeader.displayTableHeader;

        //Get completeTableBody from applications 
        //Ble App Info for general user application is very special, we need special function to extract the data (object within an array)
        //"ble": [
        //  {
        //    "devices": [
        //        "AAAABBBBCCCC",
        //        "111122223333"
        //    ],
        //    "bleAppID": "6"
        //  }
        //],
        completeTableBody  = DashboardTableSharedService.getTableBodyWithBleApp(completeTableHeader, applications, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APPLICATION_ID.KEY);

        $scope.tableHeader = completeTableHeader;
        $scope.tableBody   = completeTableBody;
        $scope.bleApplications = initBleApplicationsFilter(completeTableHeader, completeTableBody, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APPLICATION_ID.KEY);
        $scope.filterValForBleApp = $scope.bleApplications[0];
        //Implement default sort for lora device table, right now, only support default sort according to applicationID and devEUI
        defaultSortIndex  = DashboardTableSharedService.getDefaultSortIndex($scope.tableHeader, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.KEY);
        $scope.tableBody  = DashboardTableSharedService.defaultSortTableBody($scope.tableBody, defaultSortIndex, dscNum);
        //Initialize the sort table, set sort status to null for each col
        $scope.sortMap    = DashboardTableSharedService.initSortMap($scope.tableHeader);
        //Initialize the ascending sort table, set sort status to null for each col    
        $scope.sortAscMap = DashboardTableSharedService.initSortMap($scope.tableHeader);

        //Transfer the $scope.tableHeader and $scope.tableBody for new application
        //1. devEUIs -> devEUIsNum; 
        //2. ISO createdTime to locale createdTime
        //3. ISO modifiedTime to locale modifiedTime
        DashboardTableSharedService.transDevicesToDeviceNums($scope.tableHeader, $scope.tableBody, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.DEV_EUIS.KEY, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.DEV_EUIS.TRANS_OBJECT.KEY);
        DashboardTableSharedService.transTableISOTimeToLocaleTime($scope.tableHeader, $scope.tableBody, [dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.CREATED_TIME.KEY, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.MODIFIED_TIME.KEY]);
        DashboardTableSharedService.transTableHeaderName($scope.tableHeader, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APPLICATION_ID.KEY, dashboardConstant.GENERAL_USER_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APPLICATION_ID.DISPLAY_NAME);
        $scope.initializing = false;
      }
      else {
        $scope.initializing = false;
        let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + errMsg);
        $scope.tableHeader = [];
        $scope.tableBody = [];
      }
    });
  }
};