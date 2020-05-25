'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let SolidGauge = function (_container, _title, _min, _max, _unit, _hintName, _value) {
    this.container = _container;
    this.title = _title;
    this.min = _min;
    this.max = _max;
    this.unit = _unit;
    this.hintName = _hintName;
    this.value = _value;
  };

  SolidGauge.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      Highcharts.chart(this.container, {
        chart: {
          type: 'solidgauge'
        },

        title: this.title,

        exporting: {
          enabled: false
        },

        credits: {
          enabled: false
        },

        yAxis: {
          min: this.min,
          max: this.max,
          stops: [
            [0.1, '#ff0000'], // very dry
            [0.3, '#fefe33'], // dry
            [0.6, '#018bb3'], // normal
            [0.9, '#0000ff'] // wet
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickAmount: 2,
          title: {
            text: this.title,
            y: -100
          },
          labels: {
            y: 16
          }
        },

        pane: {
          center: ['50%', '90%'],
          size: '100%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        plotOptions: {
          solidSolidGauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        },

        tooltip: {
          enabled: false
        },

        series: [{
          name: this.hintName,
          data: [this.value],
          dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span></div>' +
            '<div style="text-align:center"><span style="font-size:20px;color:silver">' + this.unit + '</span></div>'
          },
          tooltip: {
            valueSuffix: ' ' + this.unit
          }
        }]

      });
    }
  };

  return SolidGauge;

};
