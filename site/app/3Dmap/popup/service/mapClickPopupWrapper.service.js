'use strict';

module.exports = function () {

  let MapClickPopupWrapper = function (view, currentScenarioConfig, evt, controller,
                                       graphic, layerId, layer, popupTemplate) {
    this.view = view;
    this.currentScenarioConfig = currentScenarioConfig;
    this.evt = evt;
    this.controller = controller;
    this.graphic = graphic;
    this.data = graphic.attributes;
    this.layerId = layerId;
    this.layer = layer;
    this.popupTemplate = popupTemplate;
  };


  return MapClickPopupWrapper;

};
