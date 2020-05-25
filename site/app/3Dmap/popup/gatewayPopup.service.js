'use strict';

module.exports = function ($translate, dataFactory, CollectionUtils) {
  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup, controller, popupTemplate} = popupWrapper;
    let mac = data.mac_address;
    let title = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
    let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");

    popup.title = CollectionUtils.parse(title, data);

    dataFactory.getGWsensorValues(mac).then(function (response) {
      if (response.status === "success" && response.content.latest_gw_sensor_recs[0]) {
        let latestGwSensorRec = response.content.latest_gw_sensor_recs[0];
        let resvSensors = latestGwSensorRec.resv_sensors;
        data.temperature = `${resvSensors[0].value} ${resvSensors[0].unit}`;
        data.humidity = `${resvSensors[1].value} ${resvSensors[1].unit}`;
        data.airquality = `${resvSensors[2].value} ${resvSensors[2].unit}`;
      } else {
        data.temperature = "-";
        data.humidity = "-";
        data.airquality = "-";
      }

      popup.content = CollectionUtils.parse(content, data);
      let action = {
        title: $translate.instant("HISTORY_CHART_TITLE.GATEWAY"),
        id: "GatewayHistory",
        className: "esri-icon-line-chart"
      };
      popup.actions.push(action);
      view.popup = popup;
      view.popup.visible = true;
  
    });
    // get history sensor data

    dataFactory.getGWsensorHistoryData(mac).then(function (response) {
      //Temperature, air quality, humidity
      let temp = [];
      let air = [];
      let humidity = [];

      if (response.status === "success") {
        let latestGwSensorRec = response.content.latest_gw_sensor_recs;
        for (let i = 0; i < latestGwSensorRec.length; i++) {
          //Here we need to check if the latestGwSensorRec[i] is a valid element, then we can get the property
          if (latestGwSensorRec[i]) {
            temp.push([latestGwSensorRec[i].date, latestGwSensorRec[i].resv_sensors[0].value]);
            air.push([latestGwSensorRec[i].date, latestGwSensorRec[i].resv_sensors[2].value]);
            humidity.push([latestGwSensorRec[i].date, latestGwSensorRec[i].resv_sensors[1].value]);
          }
        }
      }

      controller.histiryGWsensorData = [
        temp, air, humidity
      ];
    });

  };

  this.popupForClick = function (popupWrapper) {
    let {view, data, controller, popupTemplate} = popupWrapper;
    let mac = data.mac_address.replace(/-/g, ":");

    // get latest sensor data
    dataFactory.getGWsensorValues(mac).then(function (response) {
      data.temperature = "-";
      data.humidity = "-";
      data.airquality = "-";
      if (response.status === "success" && response.content.latest_gw_sensor_recs[0]) {
        let latestGwSensorRec = response.content.latest_gw_sensor_recs[0];
        let resvSensors = latestGwSensorRec.resv_sensors;
        data.temperature = `${resvSensors[0].value} ${resvSensors[0].unit}`;
        data.humidity = `${resvSensors[1].value} ${resvSensors[1].unit}`;
        data.airquality = `${resvSensors[2].value} ${resvSensors[2].unit}`;
      }

      let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
      view.popup.content = CollectionUtils.parse(content, data);

      let actions = view.popup.actions.filter(function(action) {
        return action.id === "zoom-to";
      });
      let action = {
        title: $translate.instant("HISTORY_CHART_TITLE.GATEWAY"),
        id: "GatewayHistory",
        className: "esri-icon-line-chart"
      };
      actions.push(action);
      view.popup.actions = actions;
      view.popup.visible = true;
    });
    // get history sensor data

    dataFactory.getGWsensorHistoryData(mac).then(function (response) {
      //Temperature, air quality, humidity
      let temp = [];
      let air = [];
      let humidity = [];

      if (response.status === "success") {
        let latestGwSensorRec = response.content.latest_gw_sensor_recs;
        for (let i = 0; i < latestGwSensorRec.length; i++) {
          if (latestGwSensorRec[i]) {
            temp.push([latestGwSensorRec[i].date, latestGwSensorRec[i].resv_sensors[0].value]);
            air.push([latestGwSensorRec[i].date, latestGwSensorRec[i].resv_sensors[2].value]);
            humidity.push([latestGwSensorRec[i].date, latestGwSensorRec[i].resv_sensors[1].value]);
          }
        }
      }

      controller.histiryGWsensorData = [
        temp, air, humidity
      ];
    });

  };
};
