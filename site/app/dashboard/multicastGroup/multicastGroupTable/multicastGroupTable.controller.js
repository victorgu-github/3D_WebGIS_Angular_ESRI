'use strict';

module.exports = function ($scope, $window, $location, dashTableConfig, dashboardConstant, AccountService, SidebarService, loraDeviceService, 
  DashboardTableSharedService, dashboardSharedService, MulticastGroupSharedService, MulticastGroupTableService) {

  const TH_WITH_SIDEBAR    = "dashboard-shared-table-header-with-sidebar";
  const TH_WITHOUT_SIDEBAR = "dashboard-shared-table-header-without-sidebar";

  //Variable coming from dashTableConfig file
  let MulticastGroup = dashTableConfig.MulticastGroup;
  let APPLICATION_ID = MulticastGroup.sortHeader.APPLICATION_ID;                                         //"ApplicationID";
  let MULTICAST_ADDR = MulticastGroup.sortHeader.MULTICAST_ADDR;                                         //"MulticastAddr"
  let sortAttribute  = dashTableConfig.CommonSortAttr.sortAttribute;
  let ascSort        = sortAttribute.ASC_SORT;                                                           //"ascending";
  let dscSort        = sortAttribute.DSC_SORT;                                                           //"descending";
  let ascNum         = sortAttribute.ASC_NUM;                                                            //1;

  let userInfo   = AccountService.userInfo;
  let appIDRange = userInfo.appIDs;

  let groups;
  let completeTableHeader;
  let completeTableBody;

  $scope.initializing = true;
  $scope.filterVal;
  $scope.searchVal;
  $scope.sortMap;
  $scope.sortAscMap;

  /////////////////////////////////////////////////////
  //
  // Init function
  //
  /////////////////////////////////////////////////////

  initFilter();
  initMulticastGroup();

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

  //Edit multicast groups
  $scope.editMulticastGroup = function (row) {
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [APPLICATION_ID, MULTICAST_ADDR]);
    if (result.status === "success") {
      let applicationID = result.ApplicationID;
      let multicastAddr = result.MulticastAddr;
      let url = dashTableConfig.MulticastGroup.MulticastGroupEditPageCommonUrl + applicationID + "/" + multicastAddr;
      $location.url(url);
    }
    else {
      $window.alert("Cannot edit this record, please make sure the ApplicationID and MulticastAddr exist in the row");
    }
  };

  //Delete multicast groups
  $scope.deleteMulticastGroup = function (row) {
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [APPLICATION_ID, MULTICAST_ADDR]);
    if (result.status === "success") {
      let applicationID = result.ApplicationID;
      let multicastAddr = result.MulticastAddr;
      let confirmResult = window.confirm("Are you sure to remove this multicast group?");
      if (confirmResult === true) {
        MulticastGroupSharedService.deleteMulticastGroup(applicationID, multicastAddr).then(function (response) {
          if (response.status === "success") {
            location.reload();
          }
        }).catch(function (error) {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + error.message);
        });
      }
    }
    else {
      $window.alert("Cannot delete this multicast group, please make sure ApplicationID and MulticastAddr exist for this Device!");
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
    trs = completeTableBody;
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

  //1.DevEUI here is the keywords attribute in node session: "DevEUI"
  //2.devEUI is the actual value of each line element: "AAAAAAAAAAAAAAAB"
  //3.With these two value we can find the exact node session from node sessions collection
  $scope.showDeviceInfo = function (row) {
    let MulticastAddr = DashboardTableSharedService.findKeyIndexVal(completeTableHeader, MULTICAST_ADDR, row);
    let rowInfo = DashboardTableSharedService.findRowInfo(groups, MULTICAST_ADDR, MulticastAddr);
    $scope.popupRowInfo = DashboardTableSharedService.getPopupRowInfoWithDefinedAttributes(rowInfo, dashTableConfig.MulticastGroup.popUpAttributes);
    $scope.popupRowInfoBandID = $scope.popupRowInfo.find((element) => { return element.header === "BandID"; });
    $scope.popupRowInfoBandID.body = dashboardSharedService.getMapValue($scope.popupRowInfoBandID.body, $scope.bandIDs);
    $scope.popupRowInfoClass = $scope.popupRowInfo.find((element) => { return element.header === "Class"; });
    $scope.popupRowInfoClass.body = dashboardSharedService.getMapValue($scope.popupRowInfoClass.body, $scope.classes);
    angular.element('#myModal').modal();
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

  function initMulticastGroup() {
    if (dashboardSharedService.candidateValues) {
      $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
      $scope.classes = dashboardSharedService.parseDefaultClasses();
      initMulticastGroupTable();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
          $scope.classes = dashboardSharedService.parseDefaultClasses();
          initMulticastGroupTable();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initMulticastGroupTable() {
    //initializing parameters
    let defaultSortIndex;

    MulticastGroupSharedService.getMulticastGroups(appIDRange).then(function (response) {
      $scope.initializing = true;
      if (response.status === "success") {

        groups = MulticastGroupTableService.getMulticastGroupsArray(response.content.multicastSessions);

        //Get completeTableHeader from config
        let tableHeader = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.MULTICAST_GROUP.OVERVIEW_TABLE_ATTRIBUTES);
        completeTableHeader = tableHeader.displayTableHeader;

        //Get completeTableBody from groups 
        let tableBody = DashboardTableSharedService.getTableBody(completeTableHeader, groups);
        completeTableBody = tableBody.tableBodyArray;
        $scope.tableHeader = completeTableHeader;
        $scope.tableBody = completeTableBody;

        //Implement default sort for lora device table, right now, only support default sort according to applicationID and devEUI
        defaultSortIndex = DashboardTableSharedService.getDefaultSortIndex($scope.tableHeader, APPLICATION_ID);
        $scope.tableBody = DashboardTableSharedService.defaultSortTableBody($scope.tableBody, defaultSortIndex, ascNum);
        //Initialize the sort table, set sort status to null for each col
        $scope.sortMap = DashboardTableSharedService.initSortMap($scope.tableHeader);
        //Initialize the ascending sort table, set sort status to null for each col    
        $scope.sortAscMap = DashboardTableSharedService.initSortMap($scope.tableHeader);
        DashboardTableSharedService.transTableHeaderName($scope.tableHeader, dashboardConstant.MULTICAST_GROUP.OVERVIEW_TABLE_ATTRIBUTES.VALID_GATEWAY_ARRAY_NUM.KEY, dashboardConstant.MULTICAST_GROUP.OVERVIEW_TABLE_ATTRIBUTES.VALID_GATEWAY_ARRAY_NUM.DISPLAY_NAME);

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
};