'use strict';

module.exports = function () {

  let LayerActionItem = function (_title, _icon, _layer, _view) {
    this.title = _title;
    this.icon = _icon;
    this.layer = _layer;
    this.view = _view;
  };

  function gotoFullExtent(view, layer) {
    if (view && layer) {
      view.goTo(layer.fullExtent);
    }
  }

  LayerActionItem.prototype = {
    doAction: function () {
      gotoFullExtent(this.view, this.layer);

    }
  };

  return LayerActionItem;
};
