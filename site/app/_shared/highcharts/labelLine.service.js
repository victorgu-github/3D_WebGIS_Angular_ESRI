'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let LabelLine = function (_container, _title, _seriesName, _timestamps, _data) {
    this.container = _container;
    this.title = _title;
    this.seriesName = _seriesName;
    this.timestamps = _timestamps;
    this.data = _data;
  };

  LabelLine.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      Highcharts.chart(this.container, {
        chart: {
          type: 'line'
        },
        title: {
          text: this.title
        },
        exporting: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: this.timestamps
        },
        yAxis: {
          title: {
            text: 'kWh'
          }
        },
        plotOptions: {
          line: {
            dataLabels: {
              enabled: true
            },
            enableMouseTracking: false
          }
        },
        series: [{
          name: this.seriesName,
          data: this.data
        }]
      });
    }
  };

  return LabelLine;

};
