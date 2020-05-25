'use strict';

module.exports = function ($scope, $window, $location, dashTableConfig, dashboardConstant, AccountService, SidebarService,
  DashboardTableSharedService, dashboardSharedService, CompanySharedService, GeneralUserSharedService) {

  const TH_WITH_SIDEBAR    = "dashboard-shared-table-header-with-sidebar";
  const TH_WITHOUT_SIDEBAR = "dashboard-shared-table-header-without-sidebar";

  //Variable coming from dashTableConfig file
  let GeneralUser       = dashTableConfig.GeneralUser;
  let GENERAL_USER_NAME = GeneralUser.sortHeader.GENERAL_USER_NAME;
  let sortAttribute     = dashTableConfig.CommonSortAttr.sortAttribute;
  let ascNum            = sortAttribute.ASC_NUM;                                                //1;
  let users;
  let completeTableHeader;
  let completeTableBody;
  let appIDRange        = AccountService.userInfo.appIDs;

  $scope.initializing = true;
  $scope.searchVal;

  /////////////////////////////////////////////////////
  //
  // Main function
  //
  /////////////////////////////////////////////////////

  initGeneralUserTable();

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

  //Relocate to update device page
  $scope.editDevice = function (row) {
    let userName;
    let url;
    //Find the key index of the row record
    //1.For general user: "userName"
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [GENERAL_USER_NAME]);
    if (result.status === "success") {
      userName = result.userName;
      url = "/dashboard/generalUser/edit/" + userName;
      $location.url(url);
    }
    else {
      $window.alert("Cannot edit this record, please make sure the userName exist in the row");
    }
  };

  //Search Function
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

  //////////////////////////////////////////////////////
  //
  // Initialize Function
  //
  //////////////////////////////////////////////////////

  function initGeneralUserTable() {
    //initializing parameters
    let defaultSortIndex;

    CompanySharedService.getCompanys().then(function (response) {
      if (response.status === "success") {
        let loraApplicationIDs = appIDRange ? appIDRange : [];
        let companys    = response.content.filter((company) => { return loraApplicationIDs.includes(company.loraApplicationID); });
        let companysArr = [];
        let companysMap = {};
        //Generate array of companys' id: [1, 2, 3]
        //Generate map of companys' id and name: {"1": "3D_WebGIS_Angular_ESRI Canada"}
        companys.forEach((company) => {
          companysArr.push(company[dashboardConstant.GENERAL_USER.OVERVIEW_TABLE_ATTRIBUTES.COMPANY_ID.KEY]);
          companysMap[company[dashboardConstant.GENERAL_USER.OVERVIEW_TABLE_ATTRIBUTES.COMPANY_ID.KEY]] = company[dashboardConstant.GENERAL_USER.OVERVIEW_TABLE_ATTRIBUTES.COMPANY_ID.TRANS_OBJECT.KEY];
        });
        if (companysArr.length !== 0) {
          GeneralUserSharedService.getGeneralUsersByCompanyID(companysArr).then(function (resp) {
            if (resp.status === "success") {
              users = resp.content;

              //Get completeTableHeader from config
              let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.GENERAL_USER.OVERVIEW_TABLE_ATTRIBUTES);
              completeTableHeader = tableHeader.displayTableHeader;

              //Get tableBody from users array 
              let tableBody       = DashboardTableSharedService.getTableBody(completeTableHeader, users);
              completeTableBody   = tableBody.tableBodyArray;

              $scope.tableHeader  = completeTableHeader;
              $scope.tableBody    = completeTableBody;
              //Trans company id to company name in both table header and table body
              dashboardSharedService.transTableContent($scope.tableHeader, $scope.tableBody, dashboardConstant.GENERAL_USER.OVERVIEW_TABLE_ATTRIBUTES.COMPANY_ID.KEY, dashboardConstant.GENERAL_USER.OVERVIEW_TABLE_ATTRIBUTES.COMPANY_ID.TRANS_OBJECT.KEY, companysMap);
              //Implement default sort for lora device table, right now, only support default sort according to applicationID and devEUI
              defaultSortIndex    = DashboardTableSharedService.getDefaultSortIndex($scope.tableHeader, GENERAL_USER_NAME);
              $scope.tableBody    = DashboardTableSharedService.defaultSortTableBody($scope.tableBody, defaultSortIndex, ascNum);
              $scope.initializing = false;
            }
            else {
              $scope.initializing = false;
              $window.alert("Error occurred due to: " + resp.errors[0].message);
              $scope.tableHeader  = [];
              $scope.tableBody    = [];
            }
          });
        }
        else {
          $scope.initializing = false;
          $scope.tableHeader  = [];
          $scope.tableBody    = [];
        }
      }
      else {
        $scope.initializing = false;
        $window.alert("Error occurred due to: " + response.errors[0].message);
        $scope.tableHeader  = [];
        $scope.tableBody    = [];
      }
    });
  }
};