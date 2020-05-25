'use strict';

module.exports = function ($translate, dataFactory, CollectionUtils) {
  this.popupForDataTable = function (popupWrapper) {
    let {data, layerId,view, popup, popupTemplate} = popupWrapper;
    let layer = view.map.layers.items.find(item => item.id === layerId);
    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
    popup.title = CollectionUtils.parse(title, data);
    popup.content = CollectionUtils.parse(content, data);
    view.popup = popup;
  
    view.whenLayerView(layer).then(function (lyrView) {
      // esriLoader.require(["esri/tasks/support/Query"], function (Query) {
      // let query = new Query();
      let query = layer.createQuery();
      query.where = "deviceeui='" + data.deviceeui + "'and relay_number='" + data.relay_number + "'";
      // the query should return all attributes
      query.outFields = ["*"];
      // perform the query
      layer.queryFeatures(query).then(function (result) {
        let actions = view.popup.actions.filter(function (action) {
          return action.id === "zoom-to";
        });
        dataFactory.getLORAdeviceStatus("ceilinglight", data.deviceeui).then(function (response) {
          let status;
          //get status based on relay num
          if (response.status === "success" && response.content.deviceStatuses[0]) {
            for (let i = 0; i < response.content.deviceStatuses[0].relayStatuses.length; i++) {
              if (response.content.deviceStatuses[0].relayStatuses[i].relayNum.toString() === data.relay_number) {
                status = response.content.deviceStatuses[0].relayStatuses[i].status;
                break;
              }
            }
          }
          let action = {};
          //add group control button if more one feature
          if (result.features.length > 1) {
            if (status === "On") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_OFF_GROUP"),
                id: "contorlCeilingLightGroup",
                className: "esri-icon-support",
                features: result.features,
                lyrView: lyrView,
                devEUI: data.deviceeui
              };
            } else if (status === "Off") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_ON_GROUP"),
                id: "contorlCeilingLightGroup",
                className: "esri-icon-support",
                features: result.features,
                lyrView: lyrView,
                devEUI: data.deviceeui
              };
            } else {
              action = {
                title: $translate.instant("DEVICE_CONTROL.UNKNOWN"),
                id: "",
                className: "esri-icon-support"
              };
            }
            actions.push(action);
          } else if (result.features.length > 0) {
            if (status === "On") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_OFF"),
                id: "contorlCeilingLight",
                className: "esri-icon-support",
                features: result.features,
                devEUI: data.deviceeui
              };
            } else if (status === "Off") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_ON"),
                id: "contorlCeilingLight",
                className: "esri-icon-support",
                features: result.features,
                devEUI: data.deviceeui
              };
            } else {
              action = {
                title: $translate.instant("DEVICE_CONTROL.UNKNOWN"),
                id: "",
                className: "esri-icon-support"
              };
            }
            actions.push(action);
          }
        });
        view.popup.visible = true;
        view.popup.actions = actions;
      }, function (error) {
        console.log(error);
      });
    });

  };

  this.popupForClick = function (popupWrapper) {
    let {view, layer, data} = popupWrapper;

    view.whenLayerView(layer).then(function (lyrView) {
      // esriLoader.require(["esri/tasks/support/Query"], function (Query) {
      // let query = new Query();
      let query = layer.createQuery();
      query.where = "deviceeui='" + data.deviceeui + "'and relay_number='" + data.relay_number + "'";
      // the query should return all attributes
      query.outFields = ["*"];
      // perform the query
      layer.queryFeatures(query).then(function (result) {
        let actions = view.popup.actions.filter(function (action) {
          return action.id === "zoom-to";
        });
        dataFactory.getLORAdeviceStatus("ceilinglight", data.deviceeui).then(function (response) {
          let status;
          //get status based on relay num
          if (response.status === "success" && response.content.deviceStatuses[0]) {
            for (let i = 0; i < response.content.deviceStatuses[0].relayStatuses.length; i++) {
              if (response.content.deviceStatuses[0].relayStatuses[i].relayNum.toString() === data.relay_number) {
                status = response.content.deviceStatuses[0].relayStatuses[i].status;
                break;
              }
            }
          }
          let action = {};
          //add group control button if more one feature
          if (result.features.length > 1) {
            if (status === "On") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_OFF_GROUP"),
                id: "contorlCeilingLightGroup",
                className: "esri-icon-support",
                features: result.features,
                lyrView: lyrView,
                devEUI: data.deviceeui
              };
            } else if (status === "Off") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_ON_GROUP"),
                id: "contorlCeilingLightGroup",
                className: "esri-icon-support",
                features: result.features,
                lyrView: lyrView,
                devEUI: data.deviceeui
              };
            } else {
              action = {
                title: $translate.instant("DEVICE_CONTROL.UNKNOWN"),
                id: "",
                className: "esri-icon-support"
              };
            }
            actions.push(action);
          } else if (result.features.length > 0) {
            if (status === "On") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_OFF"),
                id: "contorlCeilingLight",
                className: "esri-icon-support",
                features: result.features,
                devEUI: data.deviceeui
              };
            } else if (status === "Off") {
              action = {
                title: $translate.instant("DEVICE_CONTROL.TURN_ON"),
                id: "contorlCeilingLight",
                className: "esri-icon-support",
                features: result.features,
                devEUI: data.deviceeui
              };
            } else {
              action = {
                title: $translate.instant("DEVICE_CONTROL.UNKNOWN"),
                id: "",
                className: "esri-icon-support"
              };
            }
            actions.push(action);
          }
        });
        view.popup.visible = true;
        view.popup.actions = actions;
      }, function (error) {
        console.log(error);
      });
    });
  };

};
