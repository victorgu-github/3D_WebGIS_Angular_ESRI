'use strict';

module.exports = function ($scope, $window, $location, dashboardConstant, dashTableConfig, CollectionUtils, AccountService, SidebarService,
  DashboardTableSharedService, dashboardSharedService, BLEApplicationSharedService, BLENodeSharedService) {

  const TH_WITH_SIDEBAR    = "dashboard-shared-table-header-with-sidebar";
  const TH_WITHOUT_SIDEBAR = "dashboard-shared-table-header-without-sidebar";

  //Variable coming from dashTableConfig file
  let ascSort = dashTableConfig.CommonSortAttr.sortAttribute.ASC_SORT;                                                          //"ascending";
  let dscSort = dashTableConfig.CommonSortAttr.sortAttribute.DSC_SORT;                                                          //"descending";
  let applications        = [];
  let completeTableHeader = [];
  let completeTableBody   = [];
  let bleAppEditPageUrl   = "/dashboard/ble/bleApplication/edit/";

  $scope.initializing = true;
  $scope.searchVal;
  $scope.sortMap;
  $scope.sortAscMap;
  $scope.overviewPageUrl  = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
  $scope.containerClass   = AccountService.userInfo.isCellPhone ? "dashboard-shared-table-container-mobile container" : "dashboard-shared-table-container container";

  /////////////////////////////////////////////////////
  //
  // Main function
  //
  /////////////////////////////////////////////////////

  initBleAppTable();

  /////////////////////////////////////////////////////
  //
  // Widget function
  //
  /////////////////////////////////////////////////////

  $scope.getDashboardSharedTableContainerClass = function () {
    if (AccountService.userInfo.isCellPhone) {
      return "dashboard-shared-table-container-mobile container";
    }
    else {
      return "dashboard-shared-table-container container";
    }
  };

  $scope.getDashboardSharedTableClass = function () {
    if (AccountService.userInfo.isCellPhone) {
      return "dashboard-shared-table-details-mobile col-sm-12 col-md-12 col-lg-12";
    }
    else {
      return "dashboard-shared-table-details col-sm-12 col-md-12 col-lg-12";
    }
  };
  
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
    let searchVal = $scope.searchVal ? $scope.searchVal : "";
    let trs = [];
    // Updatecase and lowercase insensitive
    searchVal = searchVal.toUpperCase();
    // Step 1, remove all the element inside tablebody, and assign table body content
    $scope.tableBody = [];
    trs = completeTableBody;
    // Step 2, traverse the complete copy, find the eligible row
    for (let index in trs) {
      let tr = trs[index];
      if (dashboardSharedService.rowIncludeElem(tr, searchVal)) {
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

  //Relocate to update ble application page
  $scope.editDevice = function (row) {
    let bleAppID;
    let url;

    let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.BLE_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APP_ID.KEY]);
    if (result.status === "success") {
      bleAppID = result.bleAppID;
      url = bleAppEditPageUrl + bleAppID;
      $location.url(url);
    }
    else {
      $window.alert("Cannot edit this record, please make sure the key index exist in the row");
    }
  };

  //Delete ble application
  $scope.deleteDevice = function (row) {
    let bleAppID;

    let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.BLE_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES.BLE_APP_ID.KEY]);
    if (result.status === "success") {
      bleAppID = result.bleAppID;
      let confirmResult = window.confirm("Are you sure to remove this application? Please notice if you remove this ble application, all the ble nodes under this ble application will be removed at the same time");
      if (confirmResult === true) {
        BLEApplicationSharedService.delBleApplication(bleAppID).then(function (response) {
          if (response.status === 'success') {
            BLENodeSharedService.delAllBleNodes(bleAppID).then(function (response) {
              if (response.status === 'success') {
                location.reload();
              }
              else {
                let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + errMsg);
              }
            });
          }
          else {
            let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
            $window.alert("Error occurred due to: " + errMsg);
          }
        });
      }
    }
    else {
      $window.alert("Cannot delete this application, please make sure bleAppID exist for this application!");
    }
  };

  //////////////////////////////////////////////////////
  //
  // Initialize Function
  //
  //////////////////////////////////////////////////////

  function initBleAppTable() {
    BLEApplicationSharedService.getBleApplicationsByCurrentUser().then(function (response) {
      $scope.initializing = true;
      if (response.status === "success") {
        applications = response.content;

        //Get completeTableHeader from config
        let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.BLE_APPLICATION.OVERVIEW_TABLE_ATTRIBUTES);
        completeTableHeader = tableHeader.displayTableHeader;

        //Get completeTableBody from applications 
        let tableBody      = DashboardTableSharedService.getTableBody(completeTableHeader, applications);
        completeTableBody  = tableBody.tableBodyArray;
        $scope.tableHeader = completeTableHeader;
        $scope.tableBody   = completeTableBody;
        //Initialize the sort table, set sort status to null for each col
        $scope.sortMap     = DashboardTableSharedService.initSortMap($scope.tableHeader);
        //Initialize the ascending sort table, set sort status to null for each col    
        $scope.sortAscMap  = DashboardTableSharedService.initSortMap($scope.tableHeader);

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