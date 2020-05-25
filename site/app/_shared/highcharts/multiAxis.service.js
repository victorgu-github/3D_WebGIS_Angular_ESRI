'use strict';

const Highcharts = window.Highcharts;

module.exports = function ($translate) {
  let MultiAxis = function (_container, _title, _yAxis, _timestamps, _legend) {
    this.container = _container;
    this.title = _title;
    this.yAxis = _yAxis;
    this.timestamps = _timestamps;
    this.legend = _legend;
  };

  function buildChartData(yAxis, yAxisData, series) {
    for (let i = 0; i < yAxis.length; i++) {
      let colorIndex = i % Highcharts.getOptions().colors.length;
      yAxisData.push({
        gridLineWidth: yAxis[i].gridLineWidth || 1,
        labels: {
          format: yAxis[i].format,
          style: {
            color: Highcharts.getOptions().colors[colorIndex]
          }
        },
        title: {
          text: yAxis[i].title,
          style: {
            color: Highcharts.getOptions().colors[colorIndex]
          }
        },
        opposite: yAxis[i].isOpposite || false
      });
      series.push({
        name: yAxis[i].title,
        type: 'spline',
        yAxis: i,
        data: yAxis[i].data,
        marker: {
          enabled: false
        },
        dashStyle: yAxis[i].dashStyle || 'Solid',
        tooltip: {
          valueSuffix: yAxis[i].suffix
        }
      });
    }
  }

  MultiAxis.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      let yAxisData = [];
      let series = [];

      buildChartData(this.yAxis, yAxisData, series);

      let options = {
        chart: {
          zoomType: 'xy'
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
        xAxis: [{
          reversed: true,
          title: {
            enabled: true,
            text: $translate.instant('Time Duration')
          },
          crosshair: true,
          categories: this.timestamps
        }],
        yAxis: yAxisData,
        legend: {
          layout: 'horizontal',
          align: 'center',
          x: this.legend.x || 0,
          verticalAlign: 'top',
          y: this.legend.y || 0,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        tooltip: {
          shared: true
        },
        series: series
      };

      Highcharts.chart(this.container, options);

    }
  };

  return MultiAxis;

};
