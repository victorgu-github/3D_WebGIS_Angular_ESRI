'use strict';

module.exports = function ($scope, $window, $location, dashboardConstant, dashTableConfig, CollectionUtils, AccountService, SidebarService,
  DashboardTableSharedService, dashboardSharedService, MengyangSharedService, EditMengyangService) {

  const TH_WITH_SIDEBAR    = "dashboard-shared-table-header-with-sidebar";
  const TH_WITHOUT_SIDEBAR = "dashboard-shared-table-header-without-sidebar";
  const EDIT_PAGE_URL      = "/dashboard/mengyang/edit/";

  //Variable coming from dashTableConfig file                                                        //"descending";
  let sheeps              = [];
  let displayTableHeader  = [];
  let displayTableBody    = [];
  let completeTableHeader = [];
  let completeTableBody   = [];
  let completeTableBodyAfterSearch = [];

  $scope.data = {
    overviewPageUrl: CollectionUtils.getMengyangOverviewPageUrl(AccountService.userInfo),
    initializing   : true,
    pastureIDs     : dashTableConfig.Mengyang.pastureIDs.slice(),
    filterVal      : dashTableConfig.Mengyang.pastureIDs[0],
    searchVal      : "",
    sortMap        : [],
    sortAscMap     : [],
    tableHeader    : [],
    tableBody      : [],
    popupRowInfoWithoutPic: [],
    popupRowInfoWithPic   : []
  };

  $scope.containerClass = AccountService.userInfo.isCellPhone ? "dashboard-shared-table-container-mobile container" : "dashboard-shared-table-container container";

  /////////////////////////////////////////////////////
  //
  // Main function
  //
  /////////////////////////////////////////////////////

  initMengyangTable();

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

  //Filter sheeps, each time we reload sheeps info according to pastureID, that means filtering
  $scope.filterSheeps = function () {
    initMengyangTable();
  };

  //Search by text at the same time
  $scope.searchSheeps = function () {
    let searchVal = $scope.data.searchVal ? $scope.data.searchVal.toUpperCase() : "";
    let displayTableRows = displayTableBody;
    $scope.data.tableBody = [];
    completeTableBodyAfterSearch = [];

    // 1. traverse the complete copy, find the eligible row
    for (let index in displayTableRows) {
      let displayTableRow = displayTableRows[index];
      let completeTableRow = completeTableBody[index];
      if (dashboardSharedService.rowIncludeElem(displayTableRow, searchVal)) {
        $scope.data.tableBody.push(displayTableRow);
        completeTableBodyAfterSearch.push(completeTableRow);
      }
    }
  };

  //Display sheep general information
  $scope.showSheepInfo = function (row) {
    let mengyangID   = DashboardTableSharedService.findKeyIndexVal(displayTableHeader, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID.DISPLAY_NAME, row);
    let mengyangID2  = DashboardTableSharedService.findKeyIndexVal(displayTableHeader, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID2.DISPLAY_NAME, row);
    let rowInfo;
    if (mengyangID) {
      rowInfo = DashboardTableSharedService.findRowInfo(sheeps, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID.KEY, mengyangID);
    }
    else if (!mengyangID && mengyangID2) {
      rowInfo = DashboardTableSharedService.findRowInfo(sheeps, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID2.KEY, mengyangID2);
    }
    let popupRowInfo = DashboardTableSharedService.getPopupRowInfoByConst(rowInfo, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES);
    $scope.data.popupRowInfoWithoutPic = popupRowInfo.popupRowInfoWithoutPic;
    $scope.data.popupRowInfoWithPic    = popupRowInfo.popupRowInfoWithPic;
    angular.element('#generalInfoModal').modal();
  };

  //Relocate to update sheep page
  $scope.editSheep = function (index) {
    let url;
    let result = dashboardSharedService.findSheepElement(completeTableHeader, completeTableBodyAfterSearch[index], 
      [dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.PASTURE_ID.KEY, 
       dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID.KEY,
       dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID2.KEY]);
    if (result.status === "success") {
      EditMengyangService.sheepInfo = result;
      url = EDIT_PAGE_URL;
      $location.url(url);
    }
    else {
      $window.alert("不能编辑该羊只信息，请确认蒙羊耳标1数据正确");
    }
  };

  //Delete sheep
  $scope.deleteSheep = function (index) {
    let result = dashboardSharedService.findSheepElement(completeTableHeader, completeTableBodyAfterSearch[index], 
      [dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.PASTURE_ID.KEY, 
       dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID.KEY,
       dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES.MENGYANG_ID2.KEY]);
    if (result.status === "success") {
      let confirmResult = window.confirm("请确认你想删除该羊只信息");
      if (confirmResult === true) {
        MengyangSharedService.delSheep(result).then(function (response) {
          if (response.status === 'success') {
            location.reload();
          }
          else {
            let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
            $window.alert("错误原因: " + errMsg);
          }
        });
      }
    }
    else {
      $window.alert("不能删除该羊只信息，请确认蒙羊耳标1正确");
    }
  };

  //////////////////////////////////////////////////////
  //
  // Initialize Function
  //
  //////////////////////////////////////////////////////

  function initMengyangTable() {
    MengyangSharedService.getSheeps([$scope.data.filterVal]).then(function (response) {
      $scope.data.initializing = true;
      if (response.status === "success") {
        sheeps = response.content;

        //Get display table header and complete table header from constant config file
        let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES);
        displayTableHeader  = tableHeader.displayTableHeader;
        completeTableHeader = tableHeader.completeTableHeader;

        //Get display table body and complete table body from display table header and complete table header
        let tableBody       = DashboardTableSharedService.getTableBody(completeTableHeader, sheeps);
        completeTableBody   = tableBody.tableBodyArray;
        completeTableBodyAfterSearch = completeTableBody.slice();
        displayTableBody    = DashboardTableSharedService.getDisplayTableBody(displayTableHeader, completeTableHeader, completeTableBody);

        $scope.data.tableHeader = displayTableHeader;
        $scope.data.tableBody   = displayTableBody;

        //Change table headers' name
        $scope.data.tableHeader = DashboardTableSharedService.transTableHeaderNames($scope.data.tableHeader, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES);
        //Change table body dateOfBirth to local time
        DashboardTableSharedService.transTableISOTimeToLocaleTimeByConfig($scope.data.tableHeader, $scope.data.tableBody, dashboardConstant.MENG_YANG.OVERVIEW_TABLE_ATTRIBUTES); 

        //After initializing and filtering, need to activate searching function, especially after filtering function 
        $scope.searchSheeps();

        $scope.data.initializing = false;
      }
      else {
        $scope.data.initializing = false;
        let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("Error occurred due to: " + errMsg);
        $scope.data.tableHeader = [];
        $scope.data.tableBody = [];
      }
    });
  }
};