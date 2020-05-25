'use strict';

module.exports = function ($scope, 3D_WebGIS_Angular_ESRI, monitor2DMapConfig, CollectionUtils, ContextMenu2DService, Popup2DService,
  Monitor2DMapDatatableService) {
  
  $scope.data = Monitor2DMapDatatableService.data;
  $scope.menuOptions = ContextMenu2DService.generateMenuOptions();

  ///////////////////////////////////////////////////////
  //
  // Initialization Function
  //
  ///////////////////////////////////////////////////////

  Monitor2DMapDatatableService.closeView();

  ///////////////////////////////////////////////////////
  //
  // Widget Function
  //
  ///////////////////////////////////////////////////////

  $scope.slide = function () {
    Monitor2DMapDatatableService.slide();
    if ($scope.data.isOpen) {
      Monitor2DMapDatatableService.updateLayers();
      $scope.menuOptions = ContextMenu2DService.generateMenuOptions();
      Monitor2DMapDatatableService.initializeDataTable();
    }
  };

  $scope.closeView = function() {
    Monitor2DMapDatatableService.closeView();
  };

  $scope.switchTab = function (id) {
    Monitor2DMapDatatableService.switchTab(id);
  };

  $scope.closeTab = function (id) {
    Monitor2DMapDatatableService.closeTab(id);
  };

  $scope.onLeftClick = function (index) {
    let leafletMap = $scope.data.leafletMap;
    let layerID    = Monitor2DMapDatatableService.data.currentTab;
    let zoomLevel  = 27;
    let popupTemplate = monitor2DMapConfig.loraGateway.popupTemplate;
    let popupContent;
    //Parse row data, get the necessary data for zoom to and popup
    let currentLayer = [];
    for (let key in $scope.data.dataTableLayers) {
      let layer = $scope.data.dataTableLayers[key];
      if (layer.id === $scope.data.currentTab) {
        currentLayer = layer;
        break;
      }
    }
    let rowData = Monitor2DMapDatatableService.parseRowData(layerID, currentLayer.body[index]);
    //Get latitude and longitude from rowData
    let {lat, lng} = Monitor2DMapDatatableService.getLatLng(layerID, rowData);

    //Zoom to feature, use leafletMap.setView zoom to device
    leafletMap.setView([lat, lng], zoomLevel);

    let popup = L.popup({className: "loraGateway-click-popup"});

    //Parse popup content according to popupTemplate and rowData
    popupContent = generatePopup(popupTemplate, rowData);

    //Popup
    popup.setLatLng([lat, lng]).setContent(popupContent).openOn(leafletMap);
  };

  //////////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////////

  function generatePopup(popupTemplate, properties) {
    //Parse the popupTemplate, get the popup title and popup content
    let popup   = "";
    let popupObject = {};
    let title   = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
    popupObject.title = CollectionUtils.parse(title, properties);
    popupObject.content = CollectionUtils.parse(content, properties);

    //Assemble the popup into a string so that it can be displayed under the 2D map
    popup += popupObject.title + "</br>" + popupObject.content;
    return popup;
}
};
