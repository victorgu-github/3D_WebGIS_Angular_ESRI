'use strict';

module.exports = function ($scope, $rootScope, $timeout, $window, $location, 3D_WebGIS_Angular_ESRI, dashboardConstant, dashTableConfig, 
  AccountService, SidebarService, CollectionUtils, dashboardSharedService, DashboardTableSharedService, loraDeviceService, 
  loraGatewayService) {

  let loraGatewayNodeSessions;
  //Display table header and table body used to display table content
  //Complete table header and table body used to store relevant information for subsequent presentation, editing and deleting
  let displayTableHeader  = [];
  let displayTableBody    = [];
  let completeTableHeader = [];
  let completeTableBody   = [];

  $scope.initializing  = true;
  $scope.searchVal;
  $scope.sortMap       = DashboardTableSharedService.initSortMap(dashTableConfig.Devices.LoraDevice.devTableHeader);    //Initialize the sort table, set sort status to null for each col
  $scope.sortAscMap    = DashboardTableSharedService.initSortMap(dashTableConfig.Devices.LoraDevice.devTableHeader);    //Initialize the ascending sort table, set sort status to null for each col
  $scope.overviewPageUrl = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
  $scope.containerClass   = AccountService.userInfo.isCellPhone ? "dashboard-shared-table-container-mobile container" : "dashboard-shared-table-container container";

  /////////////////////////////////////////////////////
  //
  // Initialization function
  //
  /////////////////////////////////////////////////////

  initLoraGateways();

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

  //Show device according to gatewayID
  $scope.showDeviceInfo = function (row) {
    let gatewayMac      = DashboardTableSharedService.findKeyIndexVal(displayTableHeader, dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY, row);
    let rowInfo         = DashboardTableSharedService.findRowInfo(loraGatewayNodeSessions, dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY, gatewayMac);
    $scope.popupRowInfo = DashboardTableSharedService.getPopupRowInfo(rowInfo);

    let bandIDElement   = $scope.popupRowInfo.find((element) => { return element.header === dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.BAND_ID.KEY; });
    bandIDElement.body  = dashboardSharedService.getMapValue(bandIDElement.body, $scope.bandIDs);
    dashboardSharedService.transISODateToLocaleDateForPopup($scope.popupRowInfo, dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.UPDATED_AT.KEY);
    dashboardSharedService.transISODateToLocaleDateForPopup($scope.popupRowInfo, dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.CREATED_AT.KEY);
    dashboardSharedService.transISODateToLocaleDateForPopup($scope.popupRowInfo, dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.INSTALLATION_DATE.KEY);
    angular.element('#generalInfoModal').modal();
  };

  //Relocate to edit lora gateway page
  $scope.editDevice = function (row) {
    let url;
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY]);
    if (result.status === "success") {
      let gatewayMAC = result[dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY];
      url = "/dashboard/loraGateway/edit/" + gatewayMAC;
    }
    $location.url(url);
  };

  $scope.deleteDevice = function (row) {
    //find the gatewayID
    let result = dashboardSharedService.findElement($scope.tableHeader, row, [dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY]);
    if (result.status === "success") {
      let gatewayMAC = result[dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY];
      //confirm the delete alert, and then delete the loraDeivce
      let confirmResult = window.confirm("Are you sure to remove this device?");
      if (confirmResult === true) {
        loraGatewayService.deleteLoraGateway(gatewayMAC).then(function (response) {
          if (response.status === 'success') {
            location.reload();
          }
          else {
            $window.alert("Error occurred due to: " + dashboardSharedService.parseErrorMessage(response.errors));
          }
        });
      }
    }
    else {
      $window.alert("Cannot delete this gateway, please make sure GatewayMAC exist for this gateway!");
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
    dashboardSharedService.sortTable(position, input, $scope.sortMap, $scope.sortAscMap, $scope.tableBody, displayTableBody, 
      dashTableConfig.CommonSortAttr.sortAttribute.ASC_SORT, dashTableConfig.CommonSortAttr.sortAttribute.DSC_SORT);
  };

  //Show edit and delete button according to currentUserType and createdBy
  //1.If currentUserType is admin user, always display edit and delete button, no matter lora gateway is created
  //  by current user or not
  //2.If currentUserType is general user, only display edit and delete button for lora gateway created by them selves
  $scope.displayEditAndDelBtnByUserType = function (row) {
    let result = false;
    let displayTableHeaderGatewayMacPosition  = completeTableHeader.findIndex((header) => { return header === dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY; });
    let gatewayMac = row[displayTableHeaderGatewayMacPosition];

    let completeTableHeaderGatewayMacPosition = completeTableHeader.findIndex((header) => { return header === dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY; });
    let completeTableHeaderCreatedByPosition  = completeTableHeader.findIndex((header) => { return header === dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.CREATED_BY.KEY; });
    let completeTableBodyRowIndex             = completeTableBody.findIndex((row) => { return row[completeTableHeaderGatewayMacPosition] === gatewayMac; });
    let user = completeTableBody[completeTableBodyRowIndex][completeTableHeaderCreatedByPosition];
    if (AccountService.userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.ADMIN_USER) {
      result = true;
    }
    else if (AccountService.userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER && 
             AccountService.userInfo.userName === user) {
      result = true;
    }
    return result;
  };

  //////////////////////////////////////////////////////
  //
  // Initialize Function
  //
  //////////////////////////////////////////////////////

  function initLoraGateways() {
    if (dashboardSharedService.candidateValues) {
      $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
      initLoraGatewayTable();
    }
    else {
      loraDeviceService.getDefaultCandidateValues().then(function (response) {
        if (response.status === "success") {
          dashboardSharedService.candidateValues = response.content.candidateValues;
          $scope.bandIDs = dashboardSharedService.parseDefaultBandIDs(dashboardSharedService.candidateValues.BandID);
          initLoraGatewayTable();
        }
        else {
          $scope.initializing = false;
          $window.alert("Error occurred due to: " + response.errors[0].message);
        }
      });
    }
  }

  function initLoraGatewayTable() {
    let tableHeader     = DashboardTableSharedService.getTableHeaderFromConst(dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES);
    displayTableHeader  = tableHeader.displayTableHeader;
    completeTableHeader = tableHeader.completeTableHeader;
    let defaultSortIndex;
    loraGatewayService.getLoraGatewaysInfo().then(function (response) {
      $scope.initializing = true;
      if (response.status === "success") {
        loraGatewayNodeSessions = response.content.result;
        //Get tableBody from node sessions array resp 
        let displayTableBodyResult  = DashboardTableSharedService.getTableBody(displayTableHeader, loraGatewayNodeSessions);
        displayTableBody  = displayTableBodyResult.tableBodyArray;
        let completeTableBodyResult = DashboardTableSharedService.getTableBody(completeTableHeader, loraGatewayNodeSessions);
        completeTableBody = completeTableBodyResult.tableBodyArray;
        //Implement default sort for lora gateway table, right now, only support default sort according to applicationID and devEUI
        defaultSortIndex = DashboardTableSharedService.getDefaultSortIndex(displayTableHeader, dashboardConstant.LORA_GATEWAY.OVERVIEW_TABLE_ATTRIBUTES.GATEWAY_MAC.KEY);
        displayTableBody = DashboardTableSharedService.defaultSortTableBody(displayTableBody, defaultSortIndex, dashTableConfig.CommonSortAttr.sortAttribute.ASC_NUM);
        completeTableBody  = DashboardTableSharedService.defaultSortTableBody(completeTableBody, defaultSortIndex, dashTableConfig.CommonSortAttr.sortAttribute.ASC_NUM);

        $scope.tableHeader = displayTableHeader;
        $scope.tableBody   = displayTableBody;

        $scope.initializing = false;
      }
      else {
        $scope.initializing = false;
        $window.alert("Error occurred due to: " + dashboardSharedService.parseErrorMessage(response.errors));
        $scope.tableHeader = [];
        $scope.tableBody = [];
      }
    });
  }
};