'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let PercentageArea = function (_container, _title, _series, _timestamps, _unit, _min, _max) {
    this.container = _container;
    this.title = _title;
    this.series = _series;
    this.timestamps = _timestamps;
    this.unit = _unit || '%';
    this.min = _min || 0;
    this.max = _max || 100;
  };

  PercentageArea.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      Highcharts.chart(this.container, {
        chart: {
          type: 'areaspline'
        },
        title: {
          text: this.title
        },
        xAxis: {
          categories: this.timestamps,
          plotBands: [{
            from: this.timestamps[0],
            to: this.timestamps[this.timestamps - 1]
          }]
        },
        yAxis: {
          title: {
            text: this.title
          },
          max: this.max,
          min: this.min
        },
        tooltip: {
          shared: true,
          valueSuffix: ' ' + this.unit
        },
        exporting: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            fillColor: 'rgba(172, 255, 0, .2)'
          }
        },
        series: this.series
      });
    }
  };

  return PercentageArea;

};
