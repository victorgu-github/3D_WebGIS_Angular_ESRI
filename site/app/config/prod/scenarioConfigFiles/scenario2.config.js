'use strict';

module.exports = function (3D_WebGIS_Angular_ESRI) {
    let self = this;

    self.scenario = {
        scenarioName: "Calgary Downtown",
        scenarioID: 2,
        thumbnail_url: "/assets/img/scenario3_icon.png",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "1111",
        baseMap: "satellite",
        indoorBaseMap: "streets-night-vector",
        ground: "world-elevation",
        timezone: "GMT-0600 (MDT)",
        init_camera_pos: {
            center: [-114.0653, 51.0408],
            heading: 5,
            tilt: 38,
            zoom: 16,
            zoomZvalue: 2000
        },
        actionLayers: {//have to create it even though it is empty now
            "LoraLampOnOff": [],
            "ResizeSymbol": [],
            "ChangeHistorySize": []
        },
        dynamicLayers: {
            "APE_RealTime": {
                id: 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER,
                title: "Real Time Layer",
                sourceType: "nodeServer",
                url: "api/9/latest_ape_records",
                initialVisible: false,
                display: "sharedLayer", //indoor/outdoor display mode: sharedLayer/outdoorModelLayer/indoorSharedLayer/indoorModelLayer
                dataTableConfig: {
                    icon: "globe",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000,
                    popUpAttributes: {
                        featureId: "Node Mac",
                        Latitude: "Latitude",
                        Longitude: "Longitude"
                    }
                }
            },
            "APE_History": {
                id: 3D_WebGIS_Angular_ESRI.HISTORY_TRACK_LAYER,
                title: "History Track Layer",
                sourceType: "nodeServer",
                initialVisible: false,
                historyPointNum: 5,
                display: "sharedLayer"
            }
        },
        scenario3Dlayers: [
            {
                id: "Calgary Downtown 3D",
                title: "Calgary Downtown 3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "Downtown 3Dbuilding Label",
                title: "Downtown 3Dbuilding Label",
                url: "/Calgary_Downtown_Prod/FeatureServer/0",
                type: "LabelLayer",
                opacity: 1,
                attributeToShow: "name",
                display: "outdoorModelLayer"
            },
            {
                id: "Calgary Downtown (p1)",
                title: "Calgary Downtown (p1)",
                url: "/building_outdoor_3D_downtown_mass/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Calgary Downtown (p2)",
                title: "Calgary Downtown (p2)",
                url: "/building_outdoor_3D_downtown_landmark_group/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER,
                title: "Indoor 2D Layer",
                url: "/Calgary_Downtown_Prod/FeatureServer/1",
                popupEnabled: true,
                popupTemplate: {
                    title: "Name:{name}"
                },
                type: "FeatureLayer",
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "home",
                    initializing: true,
                    autoRefresh: false,
                    refreshTime: 10000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.OUTDOOR_2D_LAYER,
                title: "Outdoor 2D Layer",
                url: "/Calgary_Downtown_Prod/FeatureServer/2",
                popupEnabled: true,
                popupTemplate: {
                    title: "Name:{name}"
                },
                type: "FeatureLayer",
                display: "sharedLayer",
                searchAttributes: ["name", "city", "province"],
                searchDisplayAttr: "name",
                dataTableConfig: {
                    icon: "home",
                    initializing: true,
                    autoRefresh: false,
                    refreshTime: 10000
                }
            }
        ],
        scenarioIndoorLayers: [
            {
                id: "Manualife 6 AVE Level 1",
                title: "Manualife 6 AVE Level 1",
                url: "/building_indoor_3D_downtown/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.07339899, 51.04801812],
                    heading: 307.8102412229805,
                    tilt: 49.48388217327113,
                    zoom: 19,
                },
                display: "indoorModelLayer"
            }
        ]
    };
};