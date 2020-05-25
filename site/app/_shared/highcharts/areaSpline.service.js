'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
    let AreaSplineChart = function (_container, _title, _subtitle, _yAxis, _series, _chartBackgroundColor, _titleColor,
        _xAxisColor, _xAxisLabelsColor, _yAxisColor, _yAxisLabelsColor, _areaColor, _areaGradientColor) {
        this.container = _container;
        this.title = _title;
        this.subtitle = _subtitle;
        this.yAxis = _yAxis;
        this.series = _series;
        this.chartBackgroundColor = _chartBackgroundColor;
        this.titleColor = _titleColor;
        this.xAxisColor = _xAxisColor;
        this.xAxisLabelsColor = _xAxisLabelsColor;
        this.yAxisColor = _yAxisColor;
        this.yAxisLabelsColor = _yAxisLabelsColor;
        this.areaColor = _areaColor;
        this.areaGradientColor = _areaGradientColor;
    };

    AreaSplineChart.prototype = {
        draw: function () {
            if (!Highcharts) {
                console.log("Highcharts has not been loaded!");
                return;
            }

            let options = {
                chart: {
                    type: 'areaspline',
                    backgroundColor: this.chartBackgroundColor
                },
                title: {
                    text: this.title,
                    align: "left",
                    style: {
                        "font-weight": "bold",
                        "color": this.titleColor
                    }
                },
                subtitle: {
                    text: this.subtitle
                },
                tooltip: {
                    formatter: function () {
                        return 'Time: <b>' + (new Date(this.x)).toString().substring(0, 21) +
                            '</b> <br> value: <b>' + this.y + '</b>';
                    }
                },
                xAxis: {
                    type: 'datetime',
                    style: {
                        color: this.xAxisColor
                    },
                    labels: {
                        style: {
                            color: this.xAxisLabelsColor
                        }
                    },
                },
                yAxis: {
                    title: {
                        text: this.yAxis,
                        style: {
                            color: this.yAxisColor
                        }
                    },
                    labels: {
                        style: {
                            color: this.yAxisLabelsColor
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    areaspline: {
                        fillColor: {
                            linearGradient: [0, 0, 0, 300],
                            stops: [
                                [0, this.areaColor ? this.areaColor : Highcharts.getOptions().colors[0]],
                                [1, this.areaGradientColor ? Highcharts.Color(this.areaGradientColor).setOpacity(0).get('rgba') : Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                            ]
                        }
                    },
                    series: {
                        lineColor: this.areaColor,
                        marker: {
                            fillColor: this.areaColor,
                            lineWidth: 2,
                            lineColor: this.areaColor // inherit from series
                        }
                    }
                },
                series: [{
                    name: 'John',
                    data: [
                        [1524668400000, 300],
                        [1524672000000, 400], 
                        [1524675600000, 300],
                        [1524679200000, 500],
                        [1524682800000, 400],
                        [1524686400000, 1000],
                        [1524690000000, 1200]
                    ]
                }],
                exporting: {
                    enabled: false
                }
            };

            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });

            Highcharts.chart(this.container, options);

        }
    };

    return AreaSplineChart;

};
