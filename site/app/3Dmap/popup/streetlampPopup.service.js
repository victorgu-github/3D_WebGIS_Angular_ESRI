'use strict';

module.exports = function ($translate, CollectionUtils) {
  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, popupTemplate, currentScenarioConfig} = popupWrapper;

    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);

    let lampId = data.objectid;
    let status = data.dynStatus;
    let devEUI = data.deviceeui;
    let action = {};
    if (status === "On") {
      action = {
        title: $translate.instant("DEVICE_CONTROL.TURN_OFF"),
        id: "contorlLamp",
        className: "esri-icon-support",
        objectID: lampId,
        devEUI: devEUI
      };
    } else if (status === "Off") {
      action = {
        title: $translate.instant("DEVICE_CONTROL.TURN_ON"),
        id: "contorlLamp",
        className: "esri-icon-support",
        objectID: lampId,
        devEUI: devEUI
      };
    }
    else {
      action = {
        title: $translate.instant("DEVICE_CONTROL.UNKNOWN"),
        id: "contorlLamp",
        className: "esri-icon-support",
        objectID: lampId,
        devEUI: devEUI
      };
    }
    popup.actions.push(action);
    view.popup = popup;
    view.popup.visible = true;
    //set street map layer ref in view
    if (!view.streetLampLayer) {
      for (let i = 0; i < view.map.allLayers.items.length; i++) {
        if (currentScenarioConfig.actionLayers.LoraLampOnOff.indexOf(view.map.allLayers.items[i].id) > -1) {
          view.streetLampLayer = view.map.allLayers.items[i];
          break;
        }
      }
    }
  };

  this.popupForClick = function (popupWrapper) {
    let {view, evt, data, layer, currentScenarioConfig} = popupWrapper;
    let lampId = data.objectid;
    let devEUI = data.deviceeui;
    let status;
    let dynData = layer.dynData;
    for (let i = 0; i < dynData.length; i++) {
      if (data.objectid === dynData[i].attributes.objectid) {
        status = dynData[i].attributes.dynStatus;
        break;
      }
    }

    if (evt) {
      view.popup.location = evt.mapPoint;
    }
    let action = {};
    if (status === "On") {
      action = {
        title: $translate.instant("DEVICE_CONTROL.TURN_OFF"),
        id: "contorlLamp",
        className: "esri-icon-support",
        objectID: lampId,
        devEUI: devEUI
      };
    } else if (status === "Off") {
      action = {
        title: $translate.instant("DEVICE_CONTROL.TURN_ON"),
        id: "contorlLamp",
        className: "esri-icon-support",
        objectID: lampId,
        devEUI: devEUI
      };
    }
    else {
      action = {
        title: $translate.instant("DEVICE_CONTROL.UNKNOWN"),
        id: "contorlLamp",
        className: "esri-icon-support",
        objectID: lampId,
        devEUI: devEUI
      };
    }
    let actions = view.popup.actions.filter(function (action) {
      return action.id === "zoom-to";
    });
    actions.push(action);
    view.popup.actions = actions;
    view.popup.visible = true;
    //set street map layer ref in view
    if (!view.streetLampLayer) {
      for (let i = 0; i < view.map.allLayers.items.length; i++) {
        if (currentScenarioConfig.actionLayers.LoraLampOnOff.indexOf(view.map.allLayers.items[i].id) > -1) {
          view.streetLampLayer = view.map.allLayers.items[i];
          break;
        }
      }
    }
  };
};
