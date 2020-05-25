'use strict';

const Highcharts = window.Highcharts;

module.exports = function ($q, $scope, $window, $translate, dataFactory, AccountService, LabelLine, MultiAxis,
                           SmokeDetectorLayer, PlugBaseLayer, 3D_WebGIS_Angular_ESRI) {
  let self = this;

  // register controller to listen for initializeChart event
  $scope.$on("initializeChart", function (event, arg) {
    if (arg.chartId === "SmokeDetectorHistory") {
      SmokeDetectorLayer.buildHistoryChart('chartContainer', arg.chartTitle, arg.devEUI);
    } else if (arg.chartId === "DetectorHistory") {
      buildDetectorHistoryChart('chartContainer', arg.chartTitle, arg.devEUI);
    } else if (arg.chartId === "EnergyUsageHistory") {
      PlugBaseLayer.buildHistoryChart('chartContainer', arg.title, arg.devEUI, arg.deviceType);
    } else if (arg.chartId === "WaterSensorHistory") {
      buildWaterSensorHistoryChart('chartContainer', arg.chartTitle);
    } else if (arg.chartId === "WaterTankHistory") {
      buildWaterTankHistoryChart('chartContainer', arg.chartTitle);
    } else {
      buildGatewayHistoryChart(self, 'chartContainer', arg.chartTitle);
      if (arg.seriesData) {
        for (let i = 0; i < arg.seriesData.length; i++) {
          self.Chart.series[i].setData(arg.seriesData[i]);
        }
      }
    }
  });

  function buildGatewayHistoryChart(self, containerId, chartTitle) {
    self.xAxisData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    self.yAxisLabels = [
      {title: $translate.instant("DYNAMIC_ATTR.GATEWAY.TEMPERATURE"), format: "{value}°C"},
      {title: $translate.instant("DYNAMIC_ATTR.GATEWAY.AIR_QUALITY"), format: "{value}mg/m^3"},
      {title: $translate.instant("DYNAMIC_ATTR.GATEWAY.HUMIDITY"), format: "{value}%"}];

    self.yAxisData = [
      [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
      [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
      [34, 45, 45, 66, 34, 67, 54, 44, 58, 57, 47, 54.4]
    ];

    self.Chart = Highcharts.chart(containerId, {
      chart: {
        zoomType: 'xy'
      },xAxis: [{
        //  categories: self.xAxisData,
        reversed: true,
        title: {
          enabled: true,
          text: $translate.instant('Date')
        },
        labels: {
          enabled: false
        },
        crosshair: true
      }],
      yAxis: [{ // Primary yAxis
        labels: {
          format: self.yAxisLabels[0].format,
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        title: {
          text: self.yAxisLabels[0].title,
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        opposite: true

      }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: self.yAxisLabels[1].title,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        labels: {
          format: self.yAxisLabels[1].format,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }

      }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
          text: self.yAxisLabels[2].title,
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        labels: {
          format: self.yAxisLabels[2].format,
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: true
      }],
      tooltip: {
        shared: true
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
      },
      series: [{
        name: $translate.instant('DYNAMIC_ATTR.GATEWAY.TEMPERATURE'),
        type: 'spline',
        yAxis: 0,
        data: self.yAxisData[0],
        tooltip: {
          valueSuffix: ' °C'
        }

      }, {
        name: $translate.instant('DYNAMIC_ATTR.GATEWAY.AIR_QUALITY'),
        type: 'spline',
        yAxis: 1,
        data: self.yAxisData[1],
        marker: {
          enabled: false
        },
        dashStyle: 'shortdot',
        tooltip: {
          valueSuffix: ' mg/m^3'
        }

      }, {
        name: $translate.instant('DYNAMIC_ATTR.GATEWAY.HUMIDITY'),
        type: 'spline',
        yAxis: 2,
        data: self.yAxisData[2],
        tooltip: {
          valueSuffix: ' %'
        }
      }]
    });

    self.Chart.title.update({text: chartTitle});
  }

  function buildDetectorHistoryChart(container, title, devEUI) {
    let yAxis = [{
      title: $translate.instant("DYNAMIC_ATTR.DETECTOR.TEMPERATURE"),
      suffix: " °C",
      format: "{value}°C",
      isOpposite: true,
      data: []
    }, {
      title: $translate.instant("DYNAMIC_ATTR.DETECTOR.HUMIDITY"),
      suffix: " %",
      format: "{value}%",
      gridLineWidth: 0,
      isOpposite: true,
      data: []
    }];
    let timestamps = [];
    let legend = {
      x: 0,
      y: 20
    };

    // TODO: Generate dummy data for demo, remove after final release.
    if (AccountService.isLoRaDemo()) {
      let temperatureData = [];
      let humidityData = [];
      let now = new Date();
      for (let i = 0; i < 60; i++) {
        temperatureData.push(Math.random() * 10 + 15);
        humidityData.push(Math.random() * 30 + 15);
        let date = new Date(now.getTime() - 60 * 1000 * i);
        let hour = ("0" + date.getHours()).slice(-2);
        let minute = ("0" + date.getMinutes()).slice(-2);
        timestamps.push(hour + ":" + minute);
      }

      yAxis[0].data = temperatureData;
      yAxis[1].data = humidityData;

      let chart = new MultiAxis(container, title, yAxis, timestamps, legend);

      chart.draw();

    } else {
      const duration = 60 * 6; // last 6 hours data
      dataFactory.getLoRaDeviceRecentUsage('bodysensor', devEUI, duration, 3D_WebGIS_Angular_ESRI.SCATTER_MODE).then(function (response) {

        if (response.status === "success") {
          let temperatureData = [];
          let humidityData = [];

          buildData(response.content.deviceInfos, temperatureData, humidityData, timestamps);

          yAxis[0].data = temperatureData;
          yAxis[1].data = humidityData;

        } else {
          $window.alert("An error occurred when loading data, try close and reopen chart.");
        }
      }).then(function () {
        let chart = new MultiAxis(container, title, yAxis, timestamps, legend);

        chart.draw();
      });
    }

  }

  function buildWaterSensorHistoryChart(container, title) {
    let yAxis = [{
      title: "酸碱度",
      suffix: " pH",
      format: "{value}",
      isOpposite: true,
      data: []
    }, {
      title: "溶解氧",
      suffix: " mg/L",
      format: "{value}mg/L",
      gridLineWidth: 0,
      isOpposite: true,
      data: []
    }, {
      title: "浊度",
      suffix: " FTU",
      format: "{value}FTU",
      gridLineWidth: 0,
      isOpposite: false,
      data: []
    }];

    let legend = {
      x: -10,
      y: 40
    };

    let timestamps = [];
    let ph = [];
    let dissolvedOxygen = [];
    let ftu = [];
    let now = +new Date();
    // 10080000 is the time gap between each data point, period is latest one week.
    for (let i = 0; i < 60; i++) {
      let date = new Date(now - 10080000 * i);
      let day = ("0" + date.getDate()).slice(-2);
      let hour = ("0" + date.getHours()).slice(-2);
      let minute = ("0" + date.getMinutes()).slice(-2);
      timestamps.push(day + " - " + hour + ":" + minute);
      ph.push(Math.random() * (14 - 1) + 1);
      dissolvedOxygen.push(Math.random() * (2.5 - 1) + 1);
      ftu.push(Math.random() * 8);
    }

    yAxis[0].data = ph;
    yAxis[1].data = dissolvedOxygen;
    yAxis[2].data = ftu;

    let chart = new MultiAxis(container, title, yAxis, timestamps, legend);

    chart.draw();
  }

  function buildWaterTankHistoryChart(container, title) {
    let yAxis = [{
      title: "pH值",
      suffix: " pH",
      format: "{value}",
      isOpposite: true,
      data: []
    }, {
      title: "氨氮",
      suffix: " mg/L",
      format: "{value}mg/L",
      gridLineWidth: 0,
      isOpposite: true,
      data: []
    }, {
      title: "浊度",
      suffix: " FTU",
      format: "{value}FTU",
      gridLineWidth: 0,
      isOpposite: false,
      data: []
    }];

    let legend = {
      x: -10,
      y: 40
    };

    let timestamps = [];
    let ph = [];
    let dissolvedOxygen = [];
    let ftu = [];
    let now = +new Date();
    // 10080000 is the time gap between each data point, period is latest one week.
    for (let i = 0; i < 60; i++) {
      let date = new Date(now - 10080000 * i);
      let day = ("0" + date.getDate()).slice(-2);
      let hour = ("0" + date.getHours()).slice(-2);
      let minute = ("0" + date.getMinutes()).slice(-2);
      timestamps.push(day + " - " + hour + ":" + minute);
      ph.push(i % 14);
      dissolvedOxygen.push(Math.random() * (2.5 - 1) + 1);
      ftu.push(Math.random() * 8);
    }

    yAxis[0].data = ph;
    yAxis[1].data = dissolvedOxygen;
    yAxis[2].data = ftu;

    let chart = new MultiAxis(container, title, yAxis, timestamps, legend);

    chart.draw();
  }

  function buildData(deviceInfos, temperatureData, humidityData, timestamps) {

    let now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    const threeHours = 3 * 60 * 60 * 1000;
    const threeHourAgo = new Date(now - threeHours).getTime();

    // From Oldest to latest
    deviceInfos.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let startPoint = {
      "timestamp": null,
      "humidity": null,
      "temperature": null
    };
    let i = 0;
    while (deviceInfos[i] && new Date(deviceInfos[i].timestamp).getTime() <= threeHourAgo) {
      startPoint = deviceInfos[i];
      i++;
    }
    startPoint.timestamp = new Date(threeHourAgo).toISOString();

    let startTime = new Date(startPoint.timestamp).getTime();

    let history = [];
    let prevRecord = startPoint;

    const oneMinute = 1000 * 60;
    for (let time = startTime; time <= now ; time += oneMinute) {

      let key = new Date(time).toISOString();

      let found = deviceInfos.find(e => e.timestamp === key);

      if (found) {
        history.push(found);
        prevRecord = found;
      } else {
        history.push({
          "humidity": prevRecord.humidity,
          "temperature": prevRecord.temperature,
          "timestamp": new Date(time).toISOString()
        });
      }
    }

    history.reverse().forEach(point => {
      temperatureData.push(point.temperature);
      humidityData.push(point.humidity);
      buildTimeStamp(point.timestamp, timestamps);
    });
  }

  let buildTimeStamp = function (timestamp, array) {
    let date = new Date(timestamp);
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    array.push(hour + ":" + minute);
  };

};
