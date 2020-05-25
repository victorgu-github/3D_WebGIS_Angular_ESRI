'use strict';

module.exports = function ($scope, $window, $location, 3D_WebGIS_Angular_ESRI, dashTableConfig, dashboardConstant, AccountService, 
  CollectionUtils, loraDeviceService, DashboardTableSharedService, dashboardSharedService, GeneralUserSharedService, 
  GeneralUserAppSharedService, SidebarService) {

  const GEN_USER_APP_TABLE_ATTRIBUTES = dashboardConstant.GENERAL_USER_APPLICATION_FOR_GEN_USR.GEN_USER_APP_TABLE_ATTRIBUTES;

  //Variable coming from dashTableConfig file
  let GeneralUserApplicationForGenUsr = dashTableConfig.GeneralUserApplicationForGenUsr;
  //Complete tableHeader and tableBody, recording the complete table header and table body data
  let applications;
  let displayTableHeader  = [];
  let displayTableBody    = [];
  let completeTableHeader = [];
  let completeTableBody   = [];
  //Common sort attributes
  let CommonSortAttr = dashTableConfig.CommonSortAttr;
  let sortAttribute  = CommonSortAttr.sortAttribute;
  let ascSort = sortAttribute.ASC_SORT;                                                                   //"ascending";
  let dscSort = sortAttribute.DSC_SORT;                                                                   //"descending";
  let dscNum  = sortAttribute.DSC_NUM;                                                                    //1;

  let userInfo = AccountService.userInfo;
  let username = userInfo.username ? userInfo.username : userInfo.userName;

  let SHOW_GENERAL_USER_APP_URL = GeneralUserApplicationForGenUsr.SHOW_GENERAL_USER_APP_URL;
  let EDIT_GENERAL_USER_APP_URL = GeneralUserApplicationForGenUsr.EDIT_GENERAL_USER_APP_URL;

  $scope.initializing = true;
  $scope.searchVal;
  $scope.sortMap;
  $scope.sortAscMap;
  $scope.overviewPageUrl = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
  $scope.containerClass   = AccountService.userInfo.isCellPhone ? "dashboard-shared-table-container-mobile container" : "dashboard-shared-table-container container";


  /////////////////////////////////////////////////////
  //
  // Main function
  //
  /////////////////////////////////////////////////////

  initGenUsrAppTable();

  /////////////////////////////////////////////////////
  //
  // Widget function
  //
  /////////////////////////////////////////////////////

  //Table header is fixed position. Should have diff class when sidebar toggle and not toggle
  $scope.getTableHeaderClass = function () {
    if (SidebarService.sidebar.checked) {
      return "dashboard-shared-table-header-with-sidebar";
    }
    else {
      return "dashboard-shared-table-header-without-sidebar";
    }
  };

  //Filter and Search Function
  $scope.searchDevice = function () {
    let filterVal = $scope.filterVal ? $scope.filterVal : "";
    let searchVal = $scope.searchVal ? $scope.searchVal : "";
    let trs = [];
    // Updatecase and lowercase insensitive
    filterVal = filterVal.toUpperCase();
    searchVal = searchVal.toUpperCase();
    // Step 1, remove all the element inside tablebody, and assign table body content
    $scope.tableBody = [];
    trs = displayTableBody;
    // Step 2, traverse the complete copy, find the eligible row
    for (let index in trs) {
      let tr = trs[index];
      if (dashboardSharedService.rowIncludeElem(tr, filterVal) && dashboardSharedService.rowIncludeElem(tr, searchVal)) {
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
      DashboardTableSharedService.sortTable(position, displayTableBody, ascSort);
    }
    else {
      //Step 2: if we have already sort, we do the sorting according the current sorting status
      if (!$scope.sortAscMap[input]) {
        $scope.sortMap[input] = true;
        $scope.sortAscMap[input] = true;
        DashboardTableSharedService.clearSortMap($scope.sortMap, input);
        DashboardTableSharedService.clearSortMap($scope.sortAscMap, input);
        DashboardTableSharedService.sortTable(position, $scope.tableBody, ascSort);
        DashboardTableSharedService.sortTable(position, displayTableBody, ascSort);
      }
      else {
        $scope.sortMap[input] = true;
        $scope.sortAscMap[input] = false;
        DashboardTableSharedService.clearSortMap($scope.sortMap, input);
        DashboardTableSharedService.clearSortMap($scope.sortAscMap, input);
        DashboardTableSharedService.sortTable(position, $scope.tableBody, dscSort);
        DashboardTableSharedService.sortTable(position, displayTableBody, dscSort);
      }
    }
  };

  //Relocate to update device page
  $scope.showApplicationsInfo = function (row) {
    let generalUserApplicationID;
    let url;

    let result = dashboardSharedService.findElement($scope.tableHeader, row, [GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.TRANS_OBJECT.SHORT_TITLE]);
    if (result.status) {
      generalUserApplicationID = result.ID;
      url = SHOW_GENERAL_USER_APP_URL + generalUserApplicationID;
      $location.url(url);
    }
    else {
      $window.alert("Cannot show this record, please make sure the key index exist in the row");
    }
  };

  //If application createdBy current user, allow edit and delete. Otherwise, disable edit and delete function
  $scope.showEditAndDel = function (row) {
    let result = false;
    let displayTableHeaderIDPosition = displayTableHeader.findIndex((header) => { return header === "ID"; });
    let id = row[displayTableHeaderIDPosition];

    let completeTableHeaderIDPosition        = completeTableHeader.findIndex((header) => { return header === "generalUserApplicationID"; });
    let completeTableHeaderCreatedByPosition = completeTableHeader.findIndex((header) => { return header === "createdBy"; });
    let completeTableBodyRowIndex    = completeTableBody.findIndex((row) => { return row[completeTableHeaderIDPosition] === id; });
    let user = completeTableBody[completeTableBodyRowIndex][completeTableHeaderCreatedByPosition];

    if (user && username && user === username) {
      result = true;
    }
    return result;
  };

  //Relocate to update device page
  $scope.editApp = function (row) {
    let generalUserApplicationID;
    let url;
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.TRANS_OBJECT.SHORT_TITLE]);
    if (result.status === "success") {
      generalUserApplicationID = result.ID;
      url = EDIT_GENERAL_USER_APP_URL + generalUserApplicationID;
      $location.url(url);
    }
    else {
      $window.alert("Cannot edit this record, please make sure the key index exist in the row");
    }
  };

  $scope.deleteApp = function (row) {
    let generalUserApplicationID;
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.TRANS_OBJECT.SHORT_TITLE]);
    if (result.status === "success") {
      generalUserApplicationID = result[GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.TRANS_OBJECT.SHORT_TITLE];
      let confirmResult = window.confirm("When you remove this application, we will also remove all the devices under it. "
        + "Are you still want to remove this application?");
      if (confirmResult === true) {
        //1.Get general user application info
        GeneralUserAppSharedService.getGeneralUsrAppsByGenUsrAppID([generalUserApplicationID]).then(function (response) {
          if (response.status === "success") {
            let generalUserApp = response.content[0];
            //2. If general user application has lora content, also need to delete lora devices under it
            if (generalUserApp.lora && Object.keys(generalUserApp.lora).length !== 0) {
              let devEUIs = dashboardSharedService.getDevEUIsFromGenUsrApp(generalUserApp.lora);
              let loraApplicationID = generalUserApp.lora.loraApplicationID;
              GeneralUserAppSharedService.deleteGeneralUsrApp(generalUserApplicationID).then(function (del_app_resp) {
                if (del_app_resp.status === 'success') {
                  GeneralUserSharedService.updateAppForGenUsr(username, generalUserApplicationID).then(function (up_app_resp) {
                    if (up_app_resp.status === "success") {
                      //1.Update userInfo.generalAppIDs in cookies
                      userInfo.generalAppIDs = userInfo.generalAppIDs.filter((generalAppID) => { return generalAppID !== generalUserApplicationID; });
                      AccountService.updateCookie(userInfo);
                      loraDeviceService.deleteLoraDevices(devEUIs, loraApplicationID).then(function (del_devs_resp) {
                        if (del_devs_resp.status === "success") {
                          location.reload();
                        }
                        else {
                          let errMsg = dashboardSharedService.parseErrorMessage(del_app_resp.errors);
                          $window.alert("Error occurred due to: " + errMsg);
                        }
                      });
                    }
                    else {
                      let errMsg = dashboardSharedService.parseErrorMessage(del_app_resp.errors);
                      $window.alert("Error occurred due to: " + errMsg);
                    }
                  });
                }
                else {
                  let errMsg = dashboardSharedService.parseErrorMessage(del_app_resp.errors);
                  $window.alert("Error occurred due to: " + errMsg);
                }
              });
            }
            //3. If general user application doesn't have lora content, only need to delete general user application itself
            else {
              GeneralUserAppSharedService.deleteGeneralUsrApp(generalUserApplicationID).then(function (del_app_resp) {
                if (del_app_resp.status === 'success') {
                  GeneralUserSharedService.updateAppForGenUsr(username, generalUserApplicationID).then(function (up_app_resp) {
                    if (up_app_resp.status === "success") {
                      //1.Update userInfo.generalAppIDs in cookies
                      userInfo.generalAppIDs = userInfo.generalAppIDs.filter((generalAppID) => { return generalAppID !== generalUserApplicationID; });
                      AccountService.updateCookie(userInfo);
                      location.reload();
                    }
                    else {
                      let errMsg = dashboardSharedService.parseErrorMessage(del_app_resp.errors);
                      $window.alert("Error occurred due to: " + errMsg);
                    }
                  });
                }
                else {
                  let errMsg = dashboardSharedService.parseErrorMessage(del_app_resp.errors);
                  $window.alert("Error occurred due to: " + errMsg);
                }
              });
            }
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

  function initGenUsrAppTable() {
    //initializing parameters
    let defaultSortIndex;
    let generalAppIDs = userInfo.generalAppIDs ? userInfo.generalAppIDs : [];
    if (generalAppIDs.length !== 0) {
      GeneralUserAppSharedService.getGeneralUsrAppsByGenUsrAppID(generalAppIDs).then(function (response) {
        if (response.status === "success") {
          applications = response.content;

          //Get displayTableHeader
          let tableHeader     = DashboardTableSharedService.getTableHeaderFromConst(GEN_USER_APP_TABLE_ATTRIBUTES);
          displayTableHeader  = tableHeader.displayTableHeader;
          completeTableHeader = tableHeader.completeTableHeader;

          $scope.tableHeader = displayTableHeader;
          //Get displayTableBody from applications 
          let displayTableBodyResult  = DashboardTableSharedService.getTableBody(displayTableHeader, applications);
          displayTableBody            = displayTableBodyResult.tableBodyArray;
          let completeTableBodyResult = DashboardTableSharedService.getTableBody(completeTableHeader, applications);
          completeTableBody           = completeTableBodyResult.tableBodyArray;
          $scope.tableBody            = displayTableBody;
          //Implement default sort for lora device table, right now, only support default sort according to applicationID and devEUI
          defaultSortIndex  = DashboardTableSharedService.getDefaultSortIndex($scope.tableHeader, GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.KEY);
          $scope.tableBody  = DashboardTableSharedService.defaultSortTableBody($scope.tableBody, defaultSortIndex, dscNum);
          //Initialize the sort table, set sort status to null for each col
          $scope.sortMap    = DashboardTableSharedService.initSortMap($scope.tableHeader);
          //Initialize the ascending sort table, set sort status to null for each col    
          $scope.sortAscMap = DashboardTableSharedService.initSortMap($scope.tableHeader);

          //Transfer the $scope.tableHeader and $scope.tableBody for new application
          //1. devices -> devEUIsNum; 
          //2. ISO createdTime to locale createdTime
          //3. ISO modifiedTime to locale modifiedTime
          DashboardTableSharedService.transDevicesToDeviceNums($scope.tableHeader, $scope.tableBody, GEN_USER_APP_TABLE_ATTRIBUTES.DEVICES.KEY, 
            GEN_USER_APP_TABLE_ATTRIBUTES.DEVICES.TRANS_OBJECT.SHORT_TITLE);
          DashboardTableSharedService.transTableHeadName($scope.tableHeader, GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.KEY, 
            GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_ID.TRANS_OBJECT.SHORT_TITLE);
          DashboardTableSharedService.transTableHeadName($scope.tableHeader, GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_NAME.KEY, 
            GEN_USER_APP_TABLE_ATTRIBUTES.GENERAL_USER_APPLICATION_NAME.TRANS_OBJECT.SHORT_TITLE);
          $scope.initializing = false;
        }
        else {
          $scope.initializing = false;
          $scope.tableHeader = [];
          $scope.tableBody = [];
        }
      });
    } else {
      $scope.initializing = false;
      $scope.tableHeader = [];
      $scope.tableBody = [];
    }
  }
};