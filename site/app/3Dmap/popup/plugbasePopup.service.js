'use strict';

module.exports = function ($translate, sceneViewDataService, dataFactory, PlugBaseLayer, CollectionUtils, AccountService) {
  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, layerId, popupTemplate} = popupWrapper;
    let devEUI = data.deviceeui;
    let deviceType = PlugBaseLayer.getDeviceType(layerId);

    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);

    //query plugbase status and add button based on its status
    if (devEUI) {
      dataFactory.getLORAdeviceStatus(deviceType, devEUI).then(function (response) {
        let status;
        if (response.status === "success" && response.content.deviceStatuses[0]) {
          status = response.content.deviceStatuses[0].status;
        }
        let action = {};
        if (status === "On") {
          action = {
            title: $translate.instant("DEVICE_CONTROL.TURN_OFF"),
            id: "contorlPlugbase",
            className: "esri-icon-support",
            deviceType: deviceType
          };
        } else if (status === "Off") {
          action = {
            title: $translate.instant("DEVICE_CONTROL.TURN_ON"),
            id: "contorlPlugbase",
            className: "esri-icon-support",
            deviceType: deviceType
          };
        }
        else {
          action = {
            title: $translate.instant("DEVICE_CONTROL.WAITING"),
            id: "contorlPlugbase",
            className: "esri-icon-loading-indicator"
          };
        }
        popup.actions.push(action);
        //add Energy Usage button
        let energyAction = {
          title: $translate.instant("HISTORY_CHART_TITLE.ENERGY_USAGE"),
          id: "EnergyUsageHistory",
          className: "esri-icon-line-chart",
          devEUI: devEUI,
          deviceType: deviceType
        };
        popup.actions.push(energyAction);
        view.popup = popup;
        view.popup.visible = true;
      });
    }
    else {
      view.popup = popup;
      view.popup.visible = true;
    }

  };

  this.popupForClick = function (popupWrapper) {
    let {view, evt, data, layerId} = popupWrapper;
    let devEUI = data.deviceeui;
    let deviceType = PlugBaseLayer.getDeviceType(layerId);

    if (evt) {
      view.popup.location = evt.mapPoint;
    }

    //query plugbase status and add button based on its status
    if (devEUI) {
      dataFactory.getLORAdeviceStatus(deviceType, devEUI).then(function (response) {
        let status;
        if (response.status === "success" && response.content.deviceStatuses[0]) {
          status = response.content.deviceStatuses[0].status;
        }
        let action = {};
        if (status === "On") {
          action = {
            title: $translate.instant("DEVICE_CONTROL.TURN_OFF"),
            id: "contorlPlugbase",
            className: "esri-icon-support",
            deviceType: deviceType
          };
        } else if (status === "Off") {
          action = {
            title: $translate.instant("DEVICE_CONTROL.TURN_ON"),
            id: "contorlPlugbase",
            className: "esri-icon-support",
            deviceType: deviceType
          };
        } else {
          action = {
            title: $translate.instant("DEVICE_CONTROL.WAITING"),
            id: "contorlPlugbase",
            className: "esri-icon-loading-indicator"
          };
        }
        //add Energy Usage button
        let energyAction = {
          title: $translate.instant("HISTORY_CHART_TITLE.ENERGY_USAGE"),
          id: "EnergyUsageHistory",
          className: "esri-icon-line-chart",
          devEUI: devEUI,
          deviceType: deviceType
        };
        let actions = view.popup.actions.filter(function (action) {
          return action.id === "zoom-to";
        });
        actions.addMany([action, energyAction]);
        view.popup.actions = actions;
        view.popup.visible = true;
      });
    } else {
      // TODO: Generate dummy data for demo, remove after final release.
      if (AccountService.isLoRaDemo()) {
        let status = {
          title: $translate.instant("DEVICE_CONTROL.WAITING"),
          id: "contorlPlugbase",
          className: "esri-icon-loading-indicator",
          deviceType: deviceType
        };
        let history = {
          title: $translate.instant("HISTORY_CHART_TITLE.ENERGY_USAGE"),
          id: "EnergyUsageHistory",
          className: "esri-icon-line-chart",
          devEUI: devEUI,
          deviceType: deviceType
        };
        let actions = view.popup.actions.filter(function (action) {
          return action.id === "zoom-to";
        });
        actions.addMany([status, history]);
        view.popup.actions = actions;
      }

      view.popup.visible = true;
    }

  };
};
