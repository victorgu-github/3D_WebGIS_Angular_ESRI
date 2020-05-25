'use strict';

const Highcharts = window.Highcharts;

module.exports = function () {
    let SemiCircleChart = function (_container, _title, _series) {
        this.container  = _container;
        this.title      = _title;
        this.series     = _series;
    };

    SemiCircleChart.prototype = {
        draw: function () {
            if (!Highcharts) {
                console.log("Highcharts has not been loaded!");
                return;
            }
            

            let options = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false,
                    //Contorl the height of chart
                    height: 200
                },
                exporting: {
                    enabled: false
                },
                title: {
                    text: this.title,
                    align: 'center',
                    verticalAlign: 'middle',
                    style: {
                        "fontSize": "38px",
                        "fontWeight": "bold"
                    },
                    //Control the vertical position of title
                    y: 12
                },
                tooltip: {
                    //Control the display format of tooltip, point.name = name, point.y = value, point.percetage = percetage
                    pointFormat: '<b>{point.name}</b>: {point.y}'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: true,
                            //Control the dataLabel inside or outside the ring, how far about the distance
                            distance: 2,
                            style: {
                                fontWeight: 'bold',
                                color: '#000000'
                            }
                        },
                        //Defined colors for each pie element, "blue" for health, same as marker icon
                        colors:[
                            "#0000ff",
                            "#ffa500",
                            "#ff0000",
                            "#808080"
                        ],
                        //Control the appearance of circle, semi circle: -90 - 90, full circle: -90 - 270
                        //Center control the position of circle in the chart
                        startAngle: -90,
                        endAngle: 270,
                        center: ['50%', '50%']
                    }
                },
                series: this.series
            };

            Highcharts.chart(this.container, options);
        }
    };

    return SemiCircleChart;
};
