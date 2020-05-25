'use strict';

module.exports = function ($translate, CollectionUtils) {
  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, popupTemplate} = popupWrapper;
    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);

    view.popup = popup;
    view.popup.visible = true;
  };

  this.popupForClick = function (popupWrapper) {
    let {view, data, layer} = popupWrapper;

    // Handle for animation click
    if (!layer.popupTemplate) {
      setPopupTitleContent(view, layer.matchFeatureLayer, data);
    }

    let actions = view.popup.actions.filter(function(action) {
      return action.id === "zoom-to";
    });

    view.popup.actions = actions;
    //view.popup.location = [popupWrapper.graphic.geometry.longitude, popupWrapper.graphic.geometry.latitude]; //fix randomly zoom when click on animation
    //for fixing pop up not shown issue when go inside
    view.popup.dockEnabled = true;
    view.popup.dockOptions= {
      // Disables the dock button from the popup
      buttonEnabled: false,
      // Ignore the default sizes that trigger responsive docking
      breakpoint: false,
      position:"top-center"
    };
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