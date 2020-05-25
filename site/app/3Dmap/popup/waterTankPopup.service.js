'use strict';

module.exports = function ($translate, CollectionUtils) {

  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, popupTemplate} = popupWrapper;
    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");

    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);

    popup.actions.push(buildHistoryAction());
    view.popup = popup;
    view.popup.visible = true;
  };

  this.popupForClick = function (popupWrapper) {
    let {view} = popupWrapper;
    let actions = view.popup.actions.filter(function (action) {
      return action.id === "zoom-to";
    });
    actions.push(buildHistoryAction());
    view.popup.actions = actions;
    view.popup.visible = true;
  };

  function buildHistoryAction() {
    return {
      title: $translate.instant("HISTORY_CHART_TITLE.WATER_TANK"),
      id: "WaterTankHistory",
      className: "esri-icon-line-chart"
    };
  }

};
