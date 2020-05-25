'use strict';

module.exports = function (PlugBaseLayer) {

  this.createLayer = function(layer, animationLayer, mapView, id, title, action, opacity) {
    let deviceType = PlugBaseLayer.getDeviceType(id);

    return new PlugBaseLayer(layer, animationLayer, mapView, id, title, deviceType, [action], [], opacity);
  };
};
