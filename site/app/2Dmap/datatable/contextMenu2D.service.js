'use strict';

module.exports = function ($translate, DataTable2DService) {
  const ADD_NEW_TAB = "DATATABLE.CONTROL.ADD_NEW_TAB";
  const CLOSE_VIEW = "DATATABLE.CONTROL.CLOSE_VIEW";

  this.generateMenuOptions = function () {
    let availableLayers = DataTable2DService.data.dataTableLayers;

    let services = [];
    for (let i in availableLayers) {
      let layer = availableLayers[i];
      services.push([layer.displayName, function () {
        let removeIndex;
        for (let j = 0; j < DataTable2DService.data.dataTableLayers.length; j++) {
          let layerInTable = DataTable2DService.data.dataTableLayers[j];
          if (layerInTable.id === layer.id) {
            DataTable2DService.switchTab(layer.id);
            return;
          }
        }

        for (let k = 0; k < DataTable2DService.data.hiddenLayers.length; k++) {
          let hiddenLayer = DataTable2DService.data.hiddenLayers[k];
          if (hiddenLayer.id === layer.id) {
            removeIndex = k;
            DataTable2DService.data.dataTableLayers.push(hiddenLayer);
            hiddenLayer.initializing = true;
            DataTable2DService.data.noTabSelected = false;
            DataTable2DService.switchTab(layer.id);
            break;
          }
        }

        if (removeIndex) {
          DataTable2DService.data.hiddenLayers.splice(removeIndex, 1);
        }

      }]);
    }

    return [
      [$translate.instant(ADD_NEW_TAB), function () {
        // When clicking add new tab
      }, services],
      null, // Divider
      [$translate.instant(CLOSE_VIEW), function () {
        DataTable2DService.closeView();
      }]
    ];
  };

};
