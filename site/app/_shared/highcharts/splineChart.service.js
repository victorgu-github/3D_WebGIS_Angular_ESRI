'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let SplineChart = function (_container, _title, _subTitle) {
    this.container = _container;
    this.title = _title;
    this.subTitle = _subTitle;
  };

  SplineChart.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      Highcharts.chart(this.container, {
        chart: {
          type: 'spline'
        },
        title: {
          text: this.title
        },
        subtitle: {
          text: this.subTitle
        },
        xAxis: {
          type: 'datetime',
          labels: {
            overflow: 'justify'
          }
        },
        yAxis: {
          title: {
            text: 'Water quality'
          },
          minorGridLineWidth: 0,
          gridLineWidth: 0,
          alternateGridColor: null,
          plotBands: [{ // Light air
            from: 0.3,
            to: 1.5,
            color: 'rgba(0, 191, 255, 0.1)',
            label: {
              text: 'Very Clean',
              style: {
                color: '#606060'
              }
            }
          }, { // Light breeze
            from: 1.5,
            to: 3.3,
            color: 'rgba(70, 130, 180, 0.1)',
            label: {
              text: 'Clean',
              style: {
                color: '#606060'
              }
            }
          }, { // Gentle breeze
            from: 3.3,
            to: 5.5,
            color: 'rgba(169, 169, 169, 0.1)',
            label: {
              text: 'Light Polluted',
              style: {
                color: '#606060'
              }
            }
          }, { // Moderate breeze
            from: 5.5,
            to: 8,
            color: 'rgba(139, 69, 19, 0.1)',
            label: {
              text: 'Medium Polluted',
              style: {
                color: '#606060'
              }
            }
          }, { // Fresh breeze
            from: 8,
            to: 11,
            color: 'rgba(128, 0, 0, 0.1)',
            label: {
              text: 'Highly Polluted',
              style: {
                color: '#606060'
              }
            }
          }]
        },
        tooltip: {
          valueSuffix: ' /m³'
        },
        plotOptions: {
          spline: {
            lineWidth: 4,
            states: {
              hover: {
                lineWidth: 5
              }
            },
            marker: {
              enabled: false
            },
            pointInterval: 3600000, // one hour
            pointStart: +new Date() - 3600000 * 24 * 30
          }
        },
        series: [{
          name: 'Pollution',
          data: [5.56, 9.88, 4.43, 7.51, 2.77, 3.13, 8.41, 3.92, 5.96, 3.82, 2.40, 3.92, 0.59, 1.09, 5.77, 9.90, 8.67, 0.39, 4.57, 5.05, 6.09, 6.68, 3.26, 1.81, 2.03, 3.84, 5.96, 7.67, 7.00, 1.53]

        }],
        navigation: {
          menuItemStyle: {
            fontSize: '10px'
          }

        }
  });
    }
  };

  return SplineChart;

};
