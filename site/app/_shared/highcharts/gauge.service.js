'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let Gauge = function (_container, _title, _startAngle, _endAngle, _min, _max,
                        _unit, _plotBands, _hintName, _value) {
    this.container = _container;
    this.title = _title;
    this.startAngle = _startAngle;
    this.endAngle = _endAngle;
    this.min = _min;
    this.max = _max;
    this.unit = _unit;
    this.plotBands = _plotBands;
    this.hintName = _hintName;
    this.value = _value;
  };

  Gauge.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      Highcharts.chart(this.container, {
        chart: {
          type: 'gauge',
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
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
        pane: {
          startAngle: this.startAngle,
          endAngle: this.endAngle,
          background: [{
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#FFF'],
                [1, '#333']
              ]
            },
            borderWidth: 0,
            outerRadius: '109%'
          }, {
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#333'],
                [1, '#FFF']
              ]
            },
            borderWidth: 1,
            outerRadius: '107%'
          }, {
            // default background
          }, {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
          }]
        },
        // the value axis
        yAxis: {
          min: this.min,
          max: this.max,

          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickColor: '#666',

          tickPixelInterval: 30,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
            step: 2,
            rotation: 'auto'
          },
          title: {
            text: this.unit
          },
          plotBands: this.plotBands
        },
        series: [{
          name: this.hintName,
          data: this.value,
          tooltip: {
            valueSuffix: ' ' + this.unit
          }
        }]

      });
    }
  };

  return Gauge;

};
