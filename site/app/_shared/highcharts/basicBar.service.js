'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
  let BasicBar = function (_container, _title, _subtitle, _barName, _data, _series,
                           _xType, _yTitle) {
    this.container = _container;
    this.title = _title;
    this.subtitle = _subtitle;
    this.barName = _barName;
    this.series = _series;
    this.data = _data;
    this.xType = _xType;
    this.yTitle = _yTitle;
  };

  BasicBar.prototype = {
    draw: function () {
      if (!Highcharts) {
        console.log("Highcharts has not been loaded!");
        return;
      }

      Highcharts.chart(this.container, {
        chart: {
          type: 'column'
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
        xAxis: {
          type: this.xType
        },
        yAxis: {
          title: {
            text: this.yTitle
          }

        },
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              format: '{point.y:.1f}%'
            }
          }
        },

        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },

        series: [{
          name: this.barName,
          colorByPoint: true,
          data: this.data
        }],
        drilldown: {
          series: this.series
        }
      });
    }
  };

  return BasicBar;

};
