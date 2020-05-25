'use strict';

module.exports = function (CollectionUtils) {
  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, popupTemplate} = popupWrapper;
    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);

    view.popup = popup;
    view.popup.visible = true;
  };

  this.popupForClick = function (view, evt) {
    //view.popup.location = [evt.mapPoint.longitude, evt.mapPoint.latitude,evt.mapPoint.z];
    if (evt) {
      view.popup.location = evt.mapPoint;
    }
    view.popup.visible = true;
  };

};
