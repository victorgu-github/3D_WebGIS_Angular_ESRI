'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let MultiAxisForMonitor = function (_container, _type, _title, _subtitle, _xAxis, _yAxis, _legend, _series) {
    this.container = _container;
    this.type = _type;
    this.title = _title;
    this.subtitle = _subtitle;
    this.xAxis = _xAxis;
    this.yAxis = _yAxis;
    this.legend = _legend;
    this.series = _series;
  };

  MultiAxisForMonitor.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      let options = {
        chart: {
          type: this.type
        },
        title: {
          text: this.title
        },
        subtitle: {
          text: this.subtitle
        },
        exporting: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        xAxis: [{
          crosshair: true,
          categories: this.xAxis,
        }],
        yAxis: [{ // Primary yAxis
          labels: {
            format: this.yAxis[0].labels.format,
            style: {
              color: Highcharts.getOptions().colors[0],
              fontSize:'10px'
            }
          },
          title: {
            text: this.yAxis[0].title.text,
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
        }, { // Secondary yAxis
          labels: {
            format: this.yAxis[1].labels.format,
            style: {
              color: Highcharts.getOptions().colors[1],
              fontSize:'10px'
            }
          },
          title: {
            text: this.yAxis[1].title.text,
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
        }],
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: this.legend.x || 0,
          y: this.legend.y || 0,
          borderWidth: 1,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
        },
        tooltip: {
          shared: true
        },
        series: this.series
      };

      Highcharts.chart(this.container, options);

    }
  };

  return MultiAxisForMonitor;

};
