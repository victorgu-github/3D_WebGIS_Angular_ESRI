'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
    let HistoryChart = function (_container, _title, _subtitle, _yAxis, _series, _chartBackgroundColor, _titleColor, 
        _xAxisColor, _xAxisLabelsColor, _yAxisColor, _yAxisLabelsColor) {
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
    };

    HistoryChart.prototype = {
        draw: function () {
            if (!Highcharts) {
                console.log("Highcharts has not been loaded!");
                return;
            }

            let options = {
                chart: {
                    zoomType: 'x',
                    backgroundColor: this.chartBackgroundColor
                },
                title: {
                    text: this.title,
                    style: {
                        color: this.titleColor
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
                    }
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
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },
                series: this.series,
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

    return HistoryChart;

};
