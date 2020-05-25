'use strict';

module.exports = function (3D_WebGIS_Angular_ESRI, 3D_WebGIS_Angular_ESRI_LAYER_URL) {
    let self = this;

    self.scenario = {
        scenarioName: "3D_WebGIS_Angular_ESRI Canada",
        scenarioID: 1,
        thumbnail_url: "/assets/img/scenario1_icon.png",
        isActive: true,
        scenarioExtent: [],
        scenarioHeight: "1111",
        baseMap: "satellite",
        indoorBaseMap: "streets-night-vector",
        ground: "world-elevation",
        timezone: "GMT-0600 (MDT)",
        init_camera_pos: {
            center: [-114.134, 51.084],
            heading: 0,
            tilt: 0,
            zoom: 16,
            zoomZvalue: 2500
        },
        actionLayers: {//used to define layers attached to actions
            "LoraLampOnOff": [3D_WebGIS_Angular_ESRI.STREET_LAMP],//only allow one layer in array for this
            "ResizeSymbol": [3D_WebGIS_Angular_ESRI.STREET_LAMP],
            "ChangeHistorySize": [3D_WebGIS_Angular_ESRI.HISTORY_TRACK_LAYER]
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
            "PlugbaseAnimation": {
                id: 3D_WebGIS_Angular_ESRI.PLUG_BASE_ANIMATION,
                title: "PlugbaseAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.PLUG_BASE,
                sourceType: "nodeServer",
                url: "",
                initialVisible: false,
                display: "indoorSharedLayer"
            },
            "DetectorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.DETECTOR_ANIMATION,
                title: "DetectorAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.DETECTOR,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            },
            "CeilingLightAnimation": {
                id: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT_ANIMATION,
                title: "CeilingLightAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                sourceType: "nodeServer",
                geometrySource: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.CEILINGLIGHT_POLYGON.PROD,
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            },
            "WinDoorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR_ANIMATION,
                title: "WinDoorAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            },
            "IndoorSegAnimation": {
                id: 3D_WebGIS_Angular_ESRI.INDOOR_SEG_ANIMATION,
                title: "IndoorSegAnimation",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            }
        },
        scenario3Dlayers: [
            {
                id: "University of Calgary 3D",
                title: "University of Calgary 3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "UC 3Dbuilding label",
                title: "UC 3Dbuilding label",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.UC3D_LABEL.PROD,
                type: "LabelLayer",
                opacity: 1,
                attributeToShow: "name",
                display: "outdoorModelLayer"
            },
            {
                id: "U of C (P1)",
                title: "U of C (P1)",
                url: "/UofC_3DBuildings_105/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "U of C (P2)",
                title: "U of C (P2)",
                url: "/PrettyBuilding_10/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.GATEWAY,
                title: "Gateway",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.GATEWAY.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name:{name}",
                    content: "<li> Mac Address: {mac_address} </li><li> Temperature: {temperature} </li>" +
                        "<li> Humidity: {humidity} </li><li> Air quality: {airquality} </li>"
                },
                type: "FeatureLayer",
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/gateway_20cm.json"
                },
                searchAttributes: ["mac_address"],
                searchDisplayAttr: "mac_address",
                bindWithNodeServer: true,
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "wifi",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.PLUG_BASE,
                title: "Plug base",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.PLUGBASE.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul><li>DeviceEUI: {deviceeui}</li>"
                        + "<li>Energy Consumption: <span id='energy-consumption' device-type='plugbase' object-id='" + "{objectid}" + "'>-</span></li></ul>"
                },
                type: "FeatureLayer",
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                symbolType: "PlugbaseSymbol",
                searchAttributes: ["section"],
                searchDisplayAttr: "section",
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "plug",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.DETECTOR,
                title: "Body Sensor",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.DETECTOR.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul id='detector-info'><li>DeviceEUI: {deviceeui}</li><li>Humidity: <span id='humidity-value' object-id='" + "{objectid}" + "'>-</span></li>"
                    +"<li>Count (Last Hour): " + "<span id='count-value' object-id='" + "{objectid}" + "'>-</span></li>"   
                    + "<li>Temperature: " + "<span id='temperature-value' object-id='" + "{objectid}" + "'>-</span></li></ul>"
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
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "street-view",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                title: "Ceiling Light",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.CEILINGLIGHT.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul id='ceilinglight-info'><li>DeviceEUI: {deviceeui}</li><li>Ceiling light ID: {ceilinglight_id}</li>" +
                        "<li>Status: <span id='status-value' object-id='" + "{ceilinglight_id}" + "'>-</span></li>" + "</ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/ceilinglight_off.json"
                },
                searchAttributes: ["section"],
                searchDisplayAttr: "section",
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "lightbulb-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 1000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.CAMERA,
                title: "Camera",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.CAMERA.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul><li>cameraResolution:{cameraresolution}</li>" +
                        "<li>cameraFrameRate:{cameraframerate}</li></ul>"
                },
                type: "FeatureLayer",
                symbolType: "PictureMarkerSymbol",
                symbolConfig: {
                    url: "/assets/img/Martz90-Circle-Camera.ico",
                    width: "24px",
                    height: "24px"
                },
                searchAttributes: ["cameraid", "cameraresolution", "VideoFormat"],
                searchDisplayAttr: "cameraid",
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "camera",
                    initializing: true,
                    autoRefresh: false,
                    refreshTime: 10000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.STREET_LAMP,
                title: "Street Lamp",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.STREETLAMP.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name:{name}",
                    content: "<ul><li>DeviceEUI: {deviceeui}</li></ul>"
                },
                type: "FeatureLayer",
                symbolType: "WebStyleSymbol",
                symbolConfig: {
                    styleName: "EsriRealisticStreetSceneStyle",
                    name: "Light_On_Post_-_Light_off"
                },
                searchAttributes: ["size", "floor_segm", "sub_region", "region", "city", "province", "deviceeui"],
                searchDisplayAttr: "deviceeui",
                bindWithNodeServer: true,
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "lightbulb-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR,
                title: "Window/Door Sensor",
                url: "/3D_WebGIS_Angular_ESRI_Canada_Prod/FeatureServer/10",
                popupEnabled: true,
                popupTemplate: {
                    title: "Name:{name}",
                    content: "<ul id='winDoor-info'><li>DeviceEUI: {deviceeui}</li>"+
                    "<li>Status: <span id='status-value'  object-id='" + "{objectid}" + "'>-</span></li>" +"</ul>"
                },
                type: "FeatureLayer",
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                bindWithNodeServer: true,
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "lightbulb-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER,
                title: "Indoor 2D Layer",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.INDOOR.PROD,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name: {name}",
                    content: "<ul id='indoorSeg-info'>"
                        + "<li>Floor: {ndrlevel} </li>"
                        +"<li>Body Count: <span id='bodyCount-value' object-id='" + "{objectid}"+"'>-</span></li></ul>"
                },
                type: "FeatureLayer",
                //symbolType:"Polygon3DSymbol",
                bindWithNodeServer: true,
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "home",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 10000
                }
            }
        ],
        scenarioIndoorLayers: [ //indoor 3D model layers
            {
                id: "3D_WebGIS_Angular_ESRI Inc Level F1",
                title: "3D_WebGIS_Angular_ESRI Inc Level F1",
                url: "/App_F1/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13369926914985, 51.08372302265976],
                    heading: -40,
                    tilt: 51,
                    zoom: 20.778995741400998,
                    zoomZvalue: 1180
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER,
                        definitionExpression: "bldg_uid = 108 and objectid <> 5"
                    }
                ]
            },

            {
                id: "Schulich School of Engineering Level F2",
                title: "Schulich School of Engineering Level F2",
                url: "/Eng_F2/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13230204692908, 51.08006667530596],
                    heading: 0,
                    tilt: 0,
                    zoom: 20,
                    zoomZvalue: 1500
                },
                display: "indoorModelLayer"
            },

            {
                id: "Schulich School of Engineering Level GF1",
                title: "Schulich School of Engineering Level GF1",
                url: "/EngGblock_F1/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13230204692908, 51.08006667530596],
                    heading: 0,
                    tilt: 0,
                    zoom: 20,
                    zoomZvalue: 1500
                },
                display: "indoorModelLayer"
            },
            {
                id: "Schulich School of Engineering Level GF2",
                title: "Schulich School of Engineering Level GF2",
                url: "/EngGblock_F2/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13230204692908, 51.08006667530596],
                    heading: 0,
                    tilt: 0,
                    zoom: 20,
                    zoomZvalue: 1500
                },
                display: "indoorModelLayer"
            },
            {
                id: "Schulich School of Engineering Level GF3",
                title: "Schulich School of Engineering Level GF3",
                url: "/EngGblock_F3/SceneServer",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13230204692908, 51.08006667530596],
                    heading: 0,
                    tilt: 0,
                    zoom: 20,
                    zoomZvalue: 1500
                },
                display: "indoorModelLayer"
            },
            {
                id: "Schulich School of Engineering Level GF4",
                title: "Schulich School of Engineering Level GF4",
                url: "/EngGblock_F4/SceneServer",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13230204692908, 51.08006667530596],
                    heading: 0,
                    tilt: 0,
                    zoom: 20,
                    zoomZvalue: 1500
                },
                display: "indoorModelLayer"
            },
            {
                id: "Calgary Centre of Innovative Technology Level F2",
                title: "Calgary Centre of Innovative Technology Level F2",
                url: "/CCIT_F2/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13358524223111, 51.08016509717781],
                    heading: 0,
                    tilt: 0,
                    zoom: 19,
                    zoomZvalue: 1600
                },
                display: "indoorModelLayer"
            },
            {
                id: "Calgary Centre of Innovative Technology Level F3",
                title: "Calgary Centre of Innovative Technology Level F3",
                url: "/CCIT_F3/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [-114.13358524223111, 51.08016509717781],
                    heading: 0,
                    tilt: 0,
                    zoom: 19,
                    zoomZvalue: 1600
                },
                display: "indoorModelLayer"
            }
        ],
        scenario2DId: 1
    };
};