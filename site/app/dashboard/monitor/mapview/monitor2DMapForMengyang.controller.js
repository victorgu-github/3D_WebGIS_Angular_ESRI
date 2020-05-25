'use strict';

let LabeledMarker = require('leaflet-labeled-circle');

module.exports = function ($scope, $rootScope, $translate, monitor2DMapConfig, CollectionUtils, AccountService, AreaSpline, 
    Monitor2DMapSharedService) {

    ////////////////////////////////////////////////
    //
    // Variable
    //
    ////////////////////////////////////////////////

    const DARK_THEME = "monitor-2Dmap-shared-content monitor-2Dmap-mengyang";
    const BRIGHT_THEME = "monitor-2Dmap-shared-content monitor-2Dmap-mengyang-bright";

    let mapDiv = "2DMap";
    let defaultExtent = monitor2DMapConfig.bleNode.monitor2DMapExtentForMengyang.center;
    let defaultZoom = monitor2DMapConfig.bleNode.monitor2DMapExtentForMengyang.zoom;
    let defaultBasemap = monitor2DMapConfig.bleNode.baseMap;
    let featureLayer = monitor2DMapConfig.bleNode.featureLayers.mengyang;
    let data = {
        markers: [],
        mapLayersData: {},
        leafletMap: {}
    };
    let detachedLabels = [
        {
            type: "Feature",
            properties: {
                text: "内蒙古阳光合里牧业有限公司 -- 健康羊只总数3955/3955只",
                labelPosition: [109.398430, 38.500000]
            },
            geometry: {
                type: "Point",
                coordinates: [40.820000, 111.650000]
            },
            isHighlight: true
        },
        {
            type: "Feature",
            properties: {
                text: "内蒙古丰烁农牧有限公司 -- 健康羊只总数267/267只",
                labelPosition: [108.398800, 39.266500]
            },
            geometry: {
                type: "Point",
                coordinates: [40.750000, 107.420000]
            },
            isHighlight: true
        },
        {
            type: "Feature",
            properties: {
                text: "阿拉善左旗旭日农牧业科技发展有限公司 -- 健康羊只总数581/583只",
                labelPosition: [107.980200, 37.900000]
            },
            geometry: {
                type: "Point",
                coordinates: [38.900000, 105.700000]
            },
            isHighlight: true
        },
        {
            type: "Feature",
            properties: {
                text: "阿拉善左旗和羴农牧业科技发展有限公司 -- 健康羊只总数756/790只",
                labelPosition: [107.680200, 37.500000]
            },
            geometry: {
                type: "Point",
                coordinates: [38.850000, 105.680000]
            },
            isHighlight: true
        }
    ];

    //Gateway layers info
    $scope.urls = [];
    $scope.layers = monitor2DMapConfig.loraGateway.layers;
    $scope.backToOverview = AccountService.userInfo.isCellPhone ? "DASHBOARD.BACK_TO_OVERVIEW_BRIEF" : "DASHBOARD.BACK_TO_OVERVIEW";
    $scope.overviewPageUrl = CollectionUtils.getMengyangOverviewPageUrl(AccountService.userInfo);
    $scope.initializing = true;
    //Current time
    $scope.data = {
        theme: DARK_THEME,
        themes: [
            "深色主题",
            "浅色主题"
        ],
        currentTheme: "深色主题",
        controlPanels: {
            sheepNumberPanel: {
                title: "羊只数量排名",
                isDisplay: true,
                isChecked: true,
                tableData: [
                    ["1", "蒙羊肉羊产业园区...", "3955"],
                    ["2", "阿拉善左旗吉兰泰...", "790"],
                    ["3", "巴彦卓尔蹬口县北...", "583"],
                    ["4", "巴彦卓尔杭后二道...", "267"],
                    ["5", "蒙羊肉羊产业园区...", "3955"],
                    ["6", "阿拉善左旗吉兰泰...", "790"],
                    ["7", "巴彦卓尔蹬口县北...", "583"],
                    ["8", "巴彦卓尔杭后二道...", "267"],
                ],
            },
            healthSheepNumberPanel: {
                title: "羊只健康排名",
                isDisplay: true,
                isChecked: true,
                tableData: [
                    ["1", "蒙羊肉羊产业园区...", "3953/3955"],
                    ["2", "阿拉善左旗吉兰泰...", "788/790"],
                    ["3", "巴彦卓尔蹬口县北...", "583/583"],
                    ["4", "巴彦卓尔杭后二道...", "266/267"]
                ],
            },
            dataTransferPanel: {
                title: "数据传输量",
                isDisplay: true,
                isChecked: true
            },
            sheepCategoryPanel: {
                title: "羊只分类",
                isDisplay: true,
                isChecked: true,
                tableData: [
                    ["育肥羊", "184562"],
                    ["公种羊", "56"],
                    ["母种羊", "52014"]
                ]
            },
            videoMonitorPanel: {
                title: "视频监控",
                isDisplay: true,
                isChecked: true,
                videoSource: {
                    video1: {
                        id: 1,
                        title: "视频源1",
                        shortTitle: "源1",
                        url: "/assets/img/羊群.png"
                    },
                    video2: {
                        id: 2,
                        title: "视频源2",
                        shortTitle: "源2",
                        url: "/assets/img/mengyang.png"
                    }
                },
                currentVideo: {
                    id: 1,
                    title: "视频源1",
                    shortTitle: "源1",
                    url: "/assets/img/羊群.png"
                }
            },
            currentPlanPanel: {
                title: "近期规划",
                isDisplay: true,
                isChecked: true
            }
        }
    };

    $scope.text = [
        "1. 2018.04.01 公羊引进", "2. 2018.04.02 母羊引进", "3. 2018.04.03 公羊母羊配种", "4. 2018.04.04 羊奶采集", "5. 2018.04.05 羊舍垫料，卧床日常管理", "6. 2018.04.06 育肥羊数据采集",
        "7. 2018.04.07 采木屑样本，细菌检测", "8. 2018.04.08 消毒更换木屑", "9. 2018.04.09 减少公羊应激", "10. 2018.04.10 消防卫生检查", "11. 2018.04.11 开放日活动", "12. 2018.04.12 经销商大会",
        "13. 2018.04.13 牧场入住技术人员", "14. 2018.04.14 牧场基础设施巡检", "15. 2018.04.15 接待省农业厅", "16. 2018.04.16 疫苗注射", "17. 2018.04.17 新农场设计", "18. 2018.04.18 新农场配套",
        "19. 2018.04.19 育肥羊移至新农场", "20. 2018.04.20 例行巡检",
    ];

    ///////////////////////////////////////////////////
    //
    // Init Function
    //
    ///////////////////////////////////////////////////

    initLeafletMap();
    drawDetachedLabels();
    drawHighChart();
    drawLayerControlPanel();

    ///////////////////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////////////////

    $scope.closeSheepNumberPanel = function () {
        $scope.data.controlPanels.sheepNumberPanel.isDisplay = false;
        $scope.data.controlPanels.sheepNumberPanel.isChecked = false;
    };

    $scope.closeHealthSheepNumberPanel = function () {
        $scope.data.controlPanels.healthSheepNumberPanel.isDisplay = false;
        $scope.data.controlPanels.healthSheepNumberPanel.isChecked = false;
    };

    $scope.closeDataTransferPanel = function () {
        $scope.data.controlPanels.dataTransferPanel.isDisplay = false;
        $scope.data.controlPanels.dataTransferPanel.isChecked = false;
    };

    $scope.closeSheepCategoryPanel = function () {
        $scope.data.controlPanels.sheepCategoryPanel.isDisplay = false;
        $scope.data.controlPanels.sheepCategoryPanel.isChecked = false;
    };

    $scope.closeVideoMonitorPanel = function () {
        $scope.data.controlPanels.videoMonitorPanel.isDisplay = false;
        $scope.data.controlPanels.videoMonitorPanel.isChecked = false;
    };

    $scope.closeCurrentPlanPanel = function () {
        $scope.data.controlPanels.currentPlanPanel.isDisplay = false;
        $scope.data.controlPanels.currentPlanPanel.isChecked = false;
    };

    $scope.changeVideo = function(videoSource){
        $scope.data.controlPanels.videoMonitorPanel.currentVideo = Object.assign({}, videoSource);
    };

    $scope.submit = function () {
        for (let key in $scope.data.controlPanels) {
            let panel = $scope.data.controlPanels[key];
            if (panel.isChecked) {
                panel.isDisplay = true;
            }
            else {
                panel.isDisplay = false;
            }
        }
    };

    //Change dashboard theme
    $scope.changeTheme = function () {
        let resetParameter = {};
        if ($scope.data.currentTheme === "深色主题") {
            $scope.data.theme = DARK_THEME;
            changeToDarkThemeForFrame();
            resetParameter.mapStyle = "Normal.Custom";
        }
        else if ($scope.data.currentTheme === "浅色主题") {
            $scope.data.theme = BRIGHT_THEME;
            changeToBrightThemeForFrame();
            resetParameter.mapStyle = "Normal.CustomBright";
        }
        //Reload and change theme
        data.leafletMap.remove();
      
      
        initLeafletMap(resetParameter);
        drawDetachedLabels();
        drawHighChart();
        drawLayerControlPanel();
    };

    //Listen to controller $destory event and change all the theme to dark theme
    $scope.$on('$destroy', function(){
        changeToDarkThemeForFrame();
    });

    ///////////////////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////////////////

    //Initialize leaflet 2D Map for monitor
    function initLeafletMap(resetParameter) {
        //init leaflet2D map
        data.leafletMap = Monitor2DMapSharedService.initLeaflet2DMap(L, mapDiv, defaultExtent, defaultZoom);

        //init leaflet2D base map
        if (resetParameter==null)
        {
            Monitor2DMapSharedService.initLeaflet2DMapBasemap(L, data, defaultBasemap);
        }
        else
        {
            Monitor2DMapSharedService.initLeaflet2DMapBasemap(L, data, resetParameter.mapStyle);
        }
        //Add feature layer to leaflet map
        Monitor2DMapSharedService.addFeatureLayer(L, data.leafletMap, featureLayer);

        //Add sidebar to leaflet map
        Monitor2DMapSharedService.addSidebar(L, data.leafletMap, false);

        //Add scale to leaflet map
        Monitor2DMapSharedService.addScale(L, data.leafletMap);
    }

    function changeToDarkThemeForFrame() {
        angular.element('#index-navbar').attr('class', "navbar navbar-inverse navbar-static-top navbar-dark");
        angular.element('#index-sidebar').attr('class', 'sidebar-container-dark');
        angular.element('#esri-container-footer').attr('class', "footer-dark scene-view-footer");
    }

    function changeToBrightThemeForFrame() {
        angular.element('#index-navbar').attr('class', "navbar navbar-inverse navbar-static-top navbar-bright");
        angular.element('#index-sidebar').attr('class', 'sidebar-container-bright');
        angular.element('#esri-container-footer').attr('class', "footer-bright scene-view-footer");
    }

    function drawDetachedLabels() {
        if ($scope.data.theme === DARK_THEME) {
            //Add detached lable and marker to leaflet map
            let colors = {
                markerOptColor: "#1E3D5C",
                markerOptTextColor: "#72b0e9",
                anchorOptColor: "#ffc155",
                lineOptColor: "#72b0e9"
            };
            Monitor2DMapSharedService.addDetachedLabelAndMarker(L, LabeledMarker, data.leafletMap, detachedLabels, colors);
        }
        else if ($scope.data.theme === BRIGHT_THEME) {
            //Add detached lable and marker to leaflet map
            let colors = {
                markerOptColor: "#1E3D5C",
                markerOptTextColor: "#ffffff",
                anchorOptColor: "#3EB963",
                lineOptColor: "#3EB963"
            };
            Monitor2DMapSharedService.addDetachedLabelAndMarker(L, LabeledMarker, data.leafletMap, detachedLabels, colors);
        }
    }

    function drawHighChart() {
        if ($scope.data.theme === DARK_THEME) {
            drawAreaSpline("#0d1429", "#ffffff", "#ffffff");
        }
        else if ($scope.data.theme === BRIGHT_THEME) {
            drawAreaSpline("#ffffff", "#000000", "#43B652", "#43B652", "#ffffff");
        }
    }

    function drawLayerControlPanel(){
        if ($scope.data.theme === DARK_THEME) {
            angular.element(".leaflet-bar a").css({"background-color": "#72b0e9", "color": "#000000"});
            angular.element(".leaflet-path-draggable").css("display", "none");
            angular.element(".leaflet-pane.leaflet-overlay-pane text").css("text-shadow", "5px 5px 5px #000000");
        }
        else if ($scope.data.theme === BRIGHT_THEME) {
            angular.element(".leaflet-bar a").css({"background-color": "#ffffff", "color": "#000000"});
            angular.element(".leaflet-path-draggable").css("display", "none");
            angular.element(".leaflet-pane.leaflet-overlay-pane text").css("text-shadow", "5px 5px 5px #43B652");
        }
    }

    function drawAreaSpline(bgColor, fontColor, titleColor, areaColor, areaGradientColor) {

        let containerIds = ['monitor-2D-map-mengyang'];

        let historyStartTime = new Date(Date.now() - 86400000*2);
        historyStartTime.setMinutes(0);
        historyStartTime.setSeconds(0);
        historyStartTime.setMilliseconds(0);
        let historyEndTime   = new Date(Date.now() - 86400000*1);
        historyEndTime.setMinutes(0);
        historyEndTime.setSeconds(0);
        historyEndTime.setMilliseconds(0);

        let historyInfoData = [
            [1524690000000, 1423],
            [1524686400000, 1430],
            [1524682800000, 1436],
            [1524679200000, 1412],
            [1524675600000, 1389],
            [1524672000000, 1411],
            [1524668400000, 1395]
        ];

        angular.element(document).ready(function(){
            drawAreaSplineChart(containerIds, historyInfoData, "数据传输量", "", "", bgColor, titleColor, fontColor, fontColor, fontColor, fontColor, areaColor, areaGradientColor);
        });
    }

    function drawAreaSplineChart(containerIds, historyInfoData, optionTitle, optionSubtitle, optionyAxis, chartBackgroundColor, titleColor, 
        xAxisColor, xAxisLabelsColor, yAxisColor, yAxisLabelsColor, areaColor, areaGradientColor) {
        let option = {};
        option.title = optionTitle;
        option.subtitle = optionSubtitle;
        option.yAxis = optionyAxis;
        option.series = [{
            type: 'area',
            data: historyInfoData
        }];

        let areaSpline = new AreaSpline(containerIds[0], option.title, option.subtitle, option.yAxis, option.series, chartBackgroundColor,
            titleColor, xAxisColor, xAxisLabelsColor, yAxisColor, yAxisLabelsColor, areaColor, areaGradientColor);
        areaSpline.draw();
    }
};
