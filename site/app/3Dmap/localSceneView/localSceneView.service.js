'use strict';

module.exports = function (MapLayer3D, PipelineLayer, LayerActionItem, LayerListService, 3D_WebGIS_Angular_ESRI) {
  let self = this;

  self.data = {
    layers: [], // raw layers
    animationLayers: [], // dynamic layers
    mapLayers: [], // mapLayer3D, used for Layer List
    timerServices: {}
  };

  this.resetLocalScene = function () {
    self.data.layers.length = 0;
    self.data.animationLayers.length = 0;
    self.data.mapLayers.length = 0;
    self.clearBackgroundService();
  };

  this.updateLayerList = function (mapLayers, mapView) {
    // Clear layers
    self.data.mapLayers.length = 0;

    let layerList = _buildLayerList(mapLayers, mapView);

    Array.prototype.push.apply(self.data.mapLayers, layerList.reverse());

    // Sync layers into layerList
    LayerListService.data.layers.length = 0;
    Array.prototype.push.apply(LayerListService.data.layers, self.data.mapLayers);

    self.clearBackgroundService();

    launchBackgroundService();
  };

  function _buildLayerList(mapLayers, mapView) {
    let layerList = [];

    mapLayers.items.forEach(mapLayer => {
      if (mapLayer.listMode !== "hide") {
        let layer = _buildMapLayer(mapLayer, mapView);
        layerList.push(layer);
      }
    });

    return layerList;
  }

  function _buildMapLayer(layer, mapView) {
    let action = new LayerActionItem("Go to Full Extent", "arrows-alt", layer, mapView);
    let id = layer.id;
    let title = layer.title;
    let opacity = layer.opacity * 100;

    if (id === 3D_WebGIS_Angular_ESRI.WATER_PIPES) {
      let animationLayer = self.data.animationLayers.find(layer => layer.matchFeatureLayer === id);
      animationLayer.allGraphics =[];
      return new PipelineLayer(layer, animationLayer, mapView, id, title, [action], [], opacity);
    } else {
      return new MapLayer3D(layer, null, id, title, [action], [], opacity);
    }
  }

  this.clearBackgroundService = function () {
    for (let serviceId in self.data.timerServices) {
      if (self.data.timerServices.hasOwnProperty(serviceId)) {
        window.clearInterval(self.data.timerServices[serviceId]);
        delete self.data.timerServices[serviceId];
      }
    }
  };

  function launchBackgroundService() {
    self.data.mapLayers.filter(layer => layer.animationLayer !== null)
      .forEach(layer => {
        self.data.timerServices[layer.id] = window.setInterval(function () {
          if (layer.isVisible()) {
            layer.update();
          }
        }, layer.refreshTime);
      });
  }

};
