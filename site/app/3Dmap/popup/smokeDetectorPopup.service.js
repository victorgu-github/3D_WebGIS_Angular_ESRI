'use strict';

module.exports = function ($translate, CollectionUtils) {

  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, popupTemplate} = popupWrapper;
    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");

    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);

    popup.actions.push(buildHistoryAction(data.deviceeui));
    view.popup = popup;
    view.popup.visible = true;
  };

  this.popupForClick = function (popupWrapper) {
    let {view, data} = popupWrapper;

    let actions = view.popup.actions.filter(function (action) {
      return action.id === "zoom-to";
    });
    actions.push(buildHistoryAction(data.deviceeui));
    view.popup.actions = actions;
    view.popup.visible = true;
  };

  function buildHistoryAction(deviceeui) {
    return {
      title: $translate.instant("HISTORY_CHART_TITLE.SMOKE_DETECTOR"),
      id: "SmokeDetectorHistory",
      className: "esri-icon-line-chart",
      devEUI: deviceeui
    };
  }

};
