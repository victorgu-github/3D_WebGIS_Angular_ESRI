'use strict';

module.exports = function (CollectionUtils) {

  this.popupForClick = function (popupWrapper) {
    let {view, evt, layer, graphic, data} = popupWrapper;

    // Handle for animation click
    if (!layer.popupTemplate) {
      setPopupTitleContent(view, layer.matchFeatureLayer, data);
    }

    view.whenLayerView(graphic.layer).then(function(lyrView){

      lyrView.highlight(graphic);
    });

    //view.popup.location = [evt.mapPoint.longitude, evt.mapPoint.latitude,evt.mapPoint.z];
    if (evt) {
      view.popup.location = evt.mapPoint;
    }
    view.popup.visible = true;
  };

  function setPopupTitleContent(view, matchFeatureLayer, data) {
    let matched = view.map.layers.items.find(item => item.id === matchFeatureLayer);
    if (matched) {
      let title = matched.popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
      let content = matched.popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
      view.popup.title = CollectionUtils.parse(title, data);
      view.popup.content = CollectionUtils.parse(content, data);
    }
  }

};
