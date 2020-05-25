'use strict';

module.exports = function () {

  let DataTablePopupWrapper = function (data, popup, view, controller, currentScenarioConfig, layerId, popupTemplate) {
    this.data = data;
    this.popup = popup;
    this.view = view;
    this.controller = controller;
    this.currentScenarioConfig = currentScenarioConfig;
    this.layerId = layerId;
    this.popupTemplate = popupTemplate;
  };


  return DataTablePopupWrapper;

};
