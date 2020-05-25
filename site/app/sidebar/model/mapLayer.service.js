/* eslint-disable no-unused-vars */
'use strict';

module.exports = function () {
  let MapLayer = function (_mapLayer, _id, _title, _items, _layers, _opacity,
                           _resizeSymbol, _changeHistoryPoints, _isOpen, _collapsed) {
    this.mapLayer = _mapLayer;
    this.id = _id;
    this.title = _title;
    this.items = _items || [];
    this.layers = _layers || [];
    this.opacity = _opacity || 100;
    this.isOpen = _isOpen || false;
    this.collapsed = _collapsed || true;
    this.resizeSymbol = _resizeSymbol || false;
    this.changeHistoryPoints = _changeHistoryPoints || false;
    this.sizeFactor = 1;
    // When mapLayer has existing sizeFactor
    if (_mapLayer && _mapLayer.sizeFactor) {
      this.sizeFactor = _mapLayer.sizeFactor;
    }
    this.historySize = this.mapLayer.historyPointNum;
    this.slideOptions = {
      floor: 0,
      ceil: 100,
      onStart: function (id, newValue, highValue, pointerType) {
        this.opacity = newValue;
        this.mapLayer.opacity = newValue / 100;
      }.bind(this),
      onChange: function (id, newValue, highValue, pointerType) {
        this.opacity = newValue;
        this.mapLayer.opacity = newValue / 100;
      }.bind(this),
      onEnd: function (id, newValue, highValue, pointerType) {
        this.changeLayerOpacity(newValue);
      }.bind(this)
    };
    this.symbolSizeSlideOptions = {
      floor: 1,
      ceil: 10,
      onStart: function (id, newValue, highValue, pointerType) {

      }.bind(this),
      onChange: function (id, newValue, highValue, pointerType) {

      }.bind(this),
      onEnd: function (id, newValue, highValue, pointerType) {
        enlarge(this.mapLayer, newValue);
      }.bind(this)
    };
    this.historySizeSlideOptions = {
      floor: 1,
      ceil: 10,
      onStart: function (id, newValue, highValue, pointerType) {

      }.bind(this),
      onChange: function (id, newValue, highValue, pointerType) {

      }.bind(this),
      onEnd: function (id, newValue, highValue, pointerType) {
        this.mapLayer.historyPointNum = newValue;
      }.bind(this)
    };
  };

  MapLayer.prototype = {
    toggleLayerVisibility: function (visibility) {
      if (visibility !== undefined) {
        this.mapLayer.visible = visibility;
      } else {
        this.mapLayer.visible = !this.mapLayer.visible;
      }

      for (let i = 0; i < this.layers.length; i++) {
        this.layers[i].toggleLayerVisibility(this.mapLayer.visible);
      }
    },

    changeLayerOpacity: function (opacity) {
      this.opacity = opacity;
      this.mapLayer.opacity = opacity / 100;

      for (let i = 0; i < this.layers.length; i++) {
        this.layers[i].changeLayerOpacity(this.opacity);
      }
    },

    toggleItems: function () {
      this.isOpen = !this.isOpen;
    },

    toggleCollapse: function () {
      this.collapsed = !this.collapsed;
    },

    isVisible: function () {
      return this.mapLayer.visible;
    }

  };

  function enlarge(layer, factor) {
    //backup symbol
    if (!layer.originalSymbol) {
        layer.originalSymbol = layer.renderer.symbol.clone();
    }
    if (layer && layer.originalSymbol.type==="web-style-symbol") {
      layer.originalSymbol.fetchSymbol().then(function (pointSymbol3D) {
        // clone the retrieved symbol, as properties on it are immutable
        let newSymbol = pointSymbol3D.clone();
        // the first symbolLayer contains the properties that can be modified
        let symbolLayer = newSymbol.symbolLayers.getItemAt(0);
        // change for example the height of the object
        if (symbolLayer.width) {
          symbolLayer.height *= factor;
          symbolLayer.width *= factor;
          symbolLayer.depth *= factor;

        }
        // do something with newSymbol, like setting it on a layer renderer
        let newRenderer = layer.renderer.clone();
        newRenderer.symbol = newSymbol;
        layer.sizeFactor = factor;
        layer.renderer = newRenderer;
      });
    }
    else if (layer &&  layer.originalSymbol.type==="point-symbol-3d")
    {
      let newRenderer = layer.renderer.clone();
      newRenderer.symbol.symbolLayers.items[0].width = layer.originalSymbol.symbolLayers.items[0].width*factor;
      newRenderer.symbol.symbolLayers.items[0].height = layer.originalSymbol.symbolLayers.items[0].height*factor;
      newRenderer.symbol.symbolLayers.items[0].depth = layer.originalSymbol.symbolLayers.items[0].depth*factor;
      layer.sizeFactor = factor;
      layer.renderer = newRenderer;
    }
  }

  return MapLayer;

};
