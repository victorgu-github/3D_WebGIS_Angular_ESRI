/* eslint-disable no-unused-vars */
'use strict';

module.exports = function ($q, $scope, $rootScope, appConfig, dataTableService, contextMenuService) {
  let scenario;

  $scope.rootScope = $rootScope;
  $scope.currentPageData = dataTableService.currentPageData;
  $scope.dataTableService = dataTableService;
  $scope.menuOptions = contextMenuService.generateMenuOptions();

  $scope.$watch('dataTableService.currentTab', function () {
    let currentTab = dataTableService.findCurrentTab();
    if (currentTab) {
      dataTableService.pageCount = currentTab.body.length;
      dataTableService.serviceData = currentTab.body;
      dataTableService.setCurrentPageData(currentTab.body);
      $scope.currentPageData = dataTableService.currentPageData;

    }
  });

  $scope.$watch('dataTableService.pageNumber', function () {
    dataTableService.setCurrentPageData(dataTableService.serviceData);
    $scope.currentPageData = dataTableService.currentPageData;
  });

  //When initialized the map or change scenario, pass the scenario information to datatable
  $scope.$on('MapLayersInitialized', function (event, args) {
    $scope.controller = args.controller;
    scenario = $scope.controller.scenario;
  });

  $scope.onRightClick = function (row) {
    //TODO Add right click handler
    alert("right click: " + row);
  };

  $scope.onLeftClick = function (row, index) {
    let id = dataTableService.currentTab;
    let dataMap = {};
    //Left click the datatable and get the row data
    for (let i = 0; i < dataTableService.services.length; i++) {
      if (dataTableService.services[i].id === id) {
        dataMap = dataTableService.arrayToMap(dataTableService.services[i].header, row);
        break;
      }
    }

    //Select the necessary data defined in dataTableConfig, store in data and use for popup
    let data = dataTableService.parseRowData(id, dataMap, scenario);

    this.rootScope.$broadcast('zoomToFeature', {
      pageSize: dataTableService.pageSize,
      layerId: id,
      data: data,
      rowIndex: index
    });
  }.bind($scope);

  $scope.$on("syncLayerListDataTable", function (event, arg) {
    dataTableService.updateTabServices(arg.dataTableLayers);
    $scope.menuOptions = contextMenuService.generateMenuOptions();
    // always close data table when event happened
    dataTableService.closeView();
  });

};
