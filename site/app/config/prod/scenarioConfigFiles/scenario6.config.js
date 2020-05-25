'use strict';

module.exports = function (3D_WebGIS_Angular_ESRI) {
    let self = this;

    self.scenario = {
        scenarioName: "YYC Airport",
        scenarioID: 6,
        thumbnail_url: "/assets/img/scenario6_icon.png",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "1111",
        baseMap: "satellite",
        indoorBaseMap: "streets-night-vector",
        ground: "world-elevation",
        timezone: "GMT-0600 (MDT)",
        init_camera_pos: {
            center: [-114.01, 51.1301],
            heading: 0,
            tilt: 0,
            zoom: 16.5,
            zoomZvalue: 2400
        },
        actionLayers: {//have to create it even though it is empty now
            "LoraLampOnOff": [3D_WebGIS_Angular_ESRI.STREET_LAMP],//only allow one layer in array for this
            "ResizeSymbol": [3D_WebGIS_Angular_ESRI.STREET_LAMP],
            "ChangeHistorySize": [3D_WebGIS_Angular_ESRI.HISTORY_TRACK_LAYER],
            "SmokeDetectorOnOff": 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR_ANIMATION
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
            },
            "DetectorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.DETECTOR_ANIMATION,
                title: "DetectorAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.DETECTOR,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "sharedLayer"
            },
            "CeilingLightAnimation": {
                id: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT_ANIMATION,
                title: "CeilingLightAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                geometrySource: "/YYC_Prod/FeatureServer/0",
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "sharedLayer"
            },
            "SmokeDetectorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR_ANIMATION,
                title: "SmokeDetectorAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "sharedLayer"
            }
        },
        scenario3Dlayers: [
            {
                id: 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER,//don't need to define a dyn layer for animation. use the second way in indoorSegmentLayer.service to render animation in feature layer directly
                title: "Indoor 2D Layer",
                url: "/YYC_Prod/FeatureServer/4",
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul id='indoorSeg-info'>"
                        + "<li>Floor: {ndrlevel} </li>"
                        +"<li>Body Count: <span id='bodyCount-value' object-id='" + "{objectid}"+"'>-</span></li></ul>"
                },
                type: "FeatureLayer",
                elevationInfo: { mode: "absolute-height" },
                returnZ: true,
                //symbolType:"Polygon3DSymbol",
                bindWithNodeServer: true,
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "home",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 10000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                title: "Smoke Detector",
                url: "/YYC_Prod/FeatureServer/1",
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul><li>DeviceEUI: {deviceeui}</li></ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/smoke_detector.json"
                },
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "home",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                title: "Ceiling Light",
                url: "/YYC_Prod/FeatureServer/2",
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul id='ceilinglight-info'><li>DeviceEUI: {deviceeui}</li>" +
                        "<li>Status: <span id='status-value' object-id='" + "{ceilinglight_id}" + "'>-</span></li>" + "</ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
                symbolType: "mutiPoint3DSymbol",
                symbolAttribute: "type",
                symbolConfig: [{
                    value: 'Rectangle',
                    url: "/assets/3dModel/rectanglelight.json",
                    heading: 0
                },
                {
                    value: 'squarelight',
                    url: "/assets/3dModel/squarelight.json",
                    heading: 0
                }],
                searchAttributes: ["section"],
                searchDisplayAttr: "section",
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "lightbulb-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.DETECTOR,
                title: "Body Sensor",
                url: "/YYC_Prod/FeatureServer/3",
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul id='detector-info'><li>DeviceEUI: {deviceeui}</li><li>Humidity: <span id='humidity-value' object-id='" + "{detectorid}" + "'>-</span></li>"
                    +"<li>Count (Last Hour): " + "<span id='count-value' object-id='" + "{objectid}" + "'>-</span></li>"     
                    + "<li>Temperature: " + "<span id='temperature-value' object-id='" + "{detectorid}" + "'>-</span></li></ul>"
                },
                type: "FeatureLayer",
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/bodysensor.json"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                searchAttributes: ["deviceeui"],
                searchDisplayAttr: "deviceeui",
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "street-view",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: "YYC 3D",
                title: "YYC 3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "Buildings outdoor",
                title: "Buildings outdoor",
                url: "/yyc_airport_outdoor_3d/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec A checkin",
                title: "Departure sec A checkin",
                url: "/yyc_3D_indoor_A_checkin/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec A checkin detailed",
                title: "Departure sec A checkin detailed",
                url: "/yyc_3D_indoor_A_checkin_detail/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec A commercial",
                title: "Departure sec A commercial",
                url: "/yyc_3D_indoor_A_commercial/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec A commercial detailed",
                title: "Departure sec A commercial detailed",
                url: "/yyc_3D_indoor_A_commercial_detail/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec B checkin",
                title: "Departure sec B checkin",
                url: "/yyc_3D_indoor_B_checkin/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec B checkin detailed",
                title: "Departure sec B checkin detailed",
                url: "/yyc_3D_indoor_B_checkin_detail/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec B commercial",
                title: "Departure sec B commercial",
                url: "/yyc_3D_indoor_B_commercial/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec B commercial detailed",
                title: "Departure sec B commercial detailed",
                url: "/yyc_3D_indoor_B_commercial_detail/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec C checkin",
                title: "Departure sec C checkin",
                url: "/yyc_3D_indoor_C_checkin/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec C checkin detailed",
                title: "Departure sec C checkin detailed",
                url: "/yyc_3D_indoor_C_checkin_detail/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec C commercial",
                title: "Departure sec C commercial",
                url: "/yyc_3D_indoor_C_commercial/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "Departure sec C commercial detailed",
                title: "Departure sec C commercial detailed",
                url: "/yyc_3D_indoor_C_commercial_detail/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            }
        ],
        scenarioIndoorLayers: []
    };
};