'use strict';

module.exports = function (3D_WebGIS_Angular_ESRI, 3D_WebGIS_Angular_ESRI_LAYER_URL) {
    let self = this;

    self.scenario = {
        scenarioName: "上海花园坊",
        scenarioID: 3,
        thumbnail_url: "/assets/img/scenario2_icon.png",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "1111",
        baseMap: "satellite",
        indoorBaseMap: "streets-night-vector",
        ground: "world-elevation",
        timezone: "GMT+0800 (China Standard Time)",
        init_camera_pos: {
            center: [121.47040, 31.27080],
            heading: 0,
            tilt: 25,
            zoom: 18,
            zoomZvalue: 702
        },
        actionLayers: {//have to create it even though it is empty now
            "LoraLampOnOff": [],
            "ResizeSymbol": [3D_WebGIS_Angular_ESRI.STREET_LAMP, 3D_WebGIS_Angular_ESRI.LORA_GATEWAY],
            "ChangeHistorySize": [],
            "SmokeDetectorOnOff": 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR_ANIMATION
        },
        dynamicLayers: {
            "APE_RealTime": {
                id: 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER,
                title: "蓝牙设备",
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
                title: "蓝牙设备轨迹",
                sourceType: "nodeServer",
                initialVisible: false,
                historyPointNum: 5,
                display: "sharedLayer"
            },
            "WaterTankAnimition": {
                id: 3D_WebGIS_Angular_ESRI.WATER_TANK_ANIMATION,
                title: "水箱动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.WATER_TANK,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "sharedLayer"
            },
            "PlugbaseAnimation": {
                id: 3D_WebGIS_Angular_ESRI.PLUG_BASE_ANIMATION,
                title: "外置插座动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                sourceType: "nodeServer",
                url: "",
                initialVisible: false,
                display: "indoorSharedLayer"
            },
            "BuiltinPlugAnimation": {
                id: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG_ANIMATION,
                title: "内置插座（中国）",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                sourceType: "nodeServer",
                url: "",
                initialVisible: false,
                display: "indoorSharedLayer"
            },
            "DetectorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.DETECTOR_ANIMATION,
                title: "传感器动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.DETECTOR,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            },
            "CeilingLightAnimation": {
                id: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT_ANIMATION,
                title: "顶灯动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                geometrySource: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.CEILINGLIGHT_POLYGON.PROD,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            },
            "Power3DAnimition": {
                id: 3D_WebGIS_Angular_ESRI.POWER_3D_ANIMATION,
                title: "3D能源消耗动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.POWER_CONSUMPTION_3D,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "sharedLayer"
            },
            "SmokeDetectorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR_ANIMATION,
                title: "烟雾感应器动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            },
            "ParkinglotAnimation": {
                id: 3D_WebGIS_Angular_ESRI.PARKING_LOT_ANIMATION,
                title: "停车场动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                sourceType: "nodeServer",
                url: "",
                initialVisible: true,
                display: "indoorSharedLayer"
            }
        },
        scenario3Dlayers: [
            {
                id: "huayuanfang3D",
                title: "花园坊节能环保产业园3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "3DTAG",
                title: "3D标签",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.LABEL.PROD,
                type: "LabelLayer",
                opacity: 1,
                attributeToShow: "name",
                display: "outdoorModelLayer"
            },
            {
                id: "buildings",
                title: "建筑",
                url: "/building_huayuanfang_outdoor_3d/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "buildingsAllowGoIn",
                title: "建筑（可进入室内）",
                url: "/huayuanfang_specialbuilding_outdoor_3d/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "grounds",
                title: "地表",
                url: "/huayuanfang_landscape_outdoor_3d_0925/SceneServer",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "landmark",
                title: "标志地物",
                url: "/huayuanfang_addons_outdoor_3d/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "roof",
                title: "屋顶",
                url: "/huayuanfang_roofobjects_equipmentroom_3d/SceneServer/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.WATER_TANK,
                title: "水箱",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.WATERTANK.PROD,
                monitor2DMap: true,
                type: "FeatureLayer",
                opacity: 0.5,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui} </li>" +
                        "<li>pH值: <span id='water-tank-ph-value' object-id='" + "{objectid}" + "'>-</span></li>" +
                        "<li>氨氮: <span id='water-tank-nh3h-value' object-id='" + "{objectid}" + "'>-</span></li>" +
                        "<li>浊度: <span id='water-tank-ftu-value' object-id='" + "{objectid}" + "'>-</span></li>" +
                        "</ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/watertank_json/wt_frame.json"
                },
                display: "outdoorModelLayer",
                dataTableConfig: {
                    icon: "tint",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.SOLAR_PANEL,
                title: "太阳能板",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.SOLARBOARD.PROD,
                monitor2DMap: true,
                type: "FeatureLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui} </li>" +
                        "</ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "relative-to-scene" },
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/solar_board.json"
                },
                display: "outdoorModelLayer",
                dataTableConfig: {
                    icon: "sun-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.WIND_POWER_DEVICE,
                title: "风电设备",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.WIND.PROD,
                monitor2DMap: true,
                type: "FeatureLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui} </li></ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "relative-to-scene" },
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/windturbine.json"
                },
                display: "outdoorModelLayer",
                dataTableConfig: {
                    icon: "cog",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.LORA_GATEWAY,
                title: "LoRa网关",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.LORA_GATEWAY.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>物理地址: {mac_address} </li></ul>"
                },
                type: "FeatureLayer",
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/gateway_noOffet.json",
                    width: 0.2,
                    height: 0.1994,
                    depth: 0.259
                },
                searchAttributes: ["mac_address"],
                searchDisplayAttr: "mac_address",
                bindWithNodeServer: true,
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "wifi",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.STREET_LAMP,
                title: "路灯",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.STREETLAMP.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui} </li></ul>"
                },
                elevationInfo: { mode: "relative-to-scene" },
                type: "FeatureLayer",
                symbolType: "WebStyleSymbol",
                symbolConfig: {
                    styleName: "EsriRealisticStreetSceneStyle",
                    name: "Light_On_Post_-_Light_off"
                },
                searchAttributes: ["size", "floor_segm", "sub_region", "region", "city", "province", "deviceeui"],
                searchDisplayAttr: "deviceeui",
                bindWithNodeServer: true,
                display: "outdoorModelLayer",
                dataTableConfig: {
                    icon: "lightbulb-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                title: "外置插座（中国）",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.PLUGBASECN.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui}</li>"
                        + "<li>能量消耗: <span id='energy-consumption' device-type='externPlugCN470' object-id='" + "{objectid}" + "'>-</span></li></ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
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
                id: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                title: "内置插座（中国）",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.BUILTIN_PLUG.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui}</li>"
                        + "<li>能量消耗: <span id='energy-consumption' device-type='builtinplug' object-id='" + "{objectid}" + "'>-</span></li></ul>"
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
                title: "人体感应器",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.DETECTOR.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul id='detector-info'><li>设备识别号: {deviceeui}</li><li>湿度: <span id='humidity-value' object-id='" + "{objectid}" + "'>-</span></li>"
                    +"<li>探测人数（过去1小时）: " + "<span id='count-value' object-id='" + "{objectid}" + "'>-</span></li>"      
                    + "<li>温度: " + "<span id='temperature-value' object-id='" + "{objectid}" + "'>-</span></li></ul>"
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
                title: "顶灯",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.CEILINGLIGHT.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul id='ceilinglight-info'><li>设备识别号: {deviceeui}</li><li>顶灯编号: {ceilinglight_id}</li>" +
                        "<li>状态: <span id='status-value' object-id='" + "{objectid}" + "'>-</span></li>" + "</ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
                symbolType: "mutiPoint3DSymbol",
                symbolAttribute: "device_type",
                symbolConfig: [{
                    value: "biglight",
                    url: "/assets/3dModel/biglight.json",
                    heading: 47
                },
                {
                    value: "biglight_90",
                    url: "/assets/3dModel/biglight.json",
                    heading: 137
                },
                {
                    value: "smalllight",
                    url: "/assets/3dModel/smallight.json",
                    heading: 0
                }],
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
                id: 3D_WebGIS_Angular_ESRI.POWER_CONSUMPTION_3D,
                title: "3D能源消耗",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.POWER_CONSUMPTION_3D.PROD,
                popupEnabled: true,
                popupTemplate: {
                    title: "栅格编号:{cell_id}",
                    content: "<ul><li>总功率（KW）: <span id='power3D-kw-value' object-id='" + "{objectid}" + "'>-</span></li></ul>"
                },
                type: "FeatureLayer",
                display: "outdoorModelLayer",
                visible: false
            },
            {
                id: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                title: "烟雾感应器",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.SMOKEDETECTOR.PROD,
                monitor2DMap: true,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deviceeui}</li></ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/smoke_detector.json"
                },
                display: "indoorSharedLayer",
                dataTableConfig: {
                    icon: "home",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                title: "停车场",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.PARKINGLOT.PROD,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称:{name}",
                    content: "<ul id='parkinglot-info'><li>设备识别号: {deviceeui}</li><li>占用情况: <span id='occupation-value' object-id='" + "{parkinglot_id}" + "'>-</span></li>"
                        + "<li>所属建筑: {affiliate} </li></ul>"
                },
                type: "FeatureLayer",
                display: "indoorSharedLayer",
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                dataTableConfig: {
                    icon: "product-hunt",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            },
            {
                id: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                title: "智能充电桩",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.SMARTCHARGER.PROD,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称:{name}",
                    content: "<ul><li>设备识别号: {deviceeui}</li></ul>"
                },
                returnZ: true,
                elevationInfo: { mode: "absolute-height" },
                type: "FeatureLayer",
                symbolType: "mutiPoint3DSymbol",
                symbolAttribute: "heading",
                symbolConfig: [{
                    value: 225,
                    url: "/assets/3dModel/charger.json",
                    heading: 135
                },
                {
                    value: 45,
                    url: "/assets/3dModel/charger.json",
                    heading: -45
                }],
                display: "indoorSharedLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.GREEN_PLANTS,
                title: "绿化植被",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.OUTDOOR_VEGETATION.PROD,
                inGrouplayer: true,
                type: "FeatureLayer",
                symbolType: "mutiWebStyleSymbol",
                symbolAttribute: "tree_type",
                symbolConfig: [
                    {
                        value: "bamboo",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Phyllostachys"
                    },
                    {
                        value: "camphor",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Juglans"
                    },
                    {
                        value: "cedar",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Calocedrus"
                    },
                    {
                        value: "phyllo bamboo",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Larix"
                    },
                    {
                        value: "zelkova",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Eucalyptus"
                    }
                ],
                display: "outdoorModelLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                title: "室内植被",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.INDOOR_VEGETATION.PROD,
                type: "FeatureLayer",
                symbolType: "mutiWebStyleSymbol",
                symbolAttribute: "tree_type",
                symbolConfig: [
                    {
                        value: "tropical_short",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Laurus"
                    },
                    {
                        value: "tropical_tall",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Musa"
                    }
                ],
                display: "indoorSharedLayer",
                elevationInfo: { mode: "absolute-height" },
                returnZ: true
            }
        ],
        scenarioIndoorLayers: [
            {
                id: "A8 Level 3",
                title: "A8 3楼",
                url: "/building_huayuanfang_indoor_3d_A8_3F/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.471099, 31.273000],
                    heading: 0,
                    tilt: 49,
                    zoom: 32,
                    zoomZvalue: 120
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='3'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate=''"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='3'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='3'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='3'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='3'"
                    }
                    ,
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='3'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='-1'"
                    }
                ]
            },
            {
                id: "A8 Level 3 detailed",
                title: "A8 3楼细节",
                url: "/building_huayuanfang_indoor_3d_A8_3F_detail/SceneServer/layers/0",
                type: "SceneLayer",
                display: "indoorModelLayer"
            },
            {
                id: "A8 Level 6",
                title: "A8 6楼",
                url: "/huayuanfang_3D_indoor_A8_6F/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.471099, 31.273000],
                    heading: 0,
                    tilt: 49,
                    zoom: 32,
                    zoomZvalue: 120
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='6'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate=''"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='6'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='6'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='6'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='6'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='6'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='-1'"
                    }
                ]
            },
            {
                id: "A8 Level 6 detailed",
                title: "A8 6楼细节",
                url: "/huayuanfang_3D_indoor_A8_6F_detail/SceneServer/layers/0",
                type: "SceneLayer",
                display: "indoorModelLayer"
            },
            {
                id: "A8 Level 7",
                title: "A8 7楼",
                url: "/huayuanfang_3D_indoor_A8_7F/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.471099, 31.273000],
                    heading: 0,
                    tilt: 49,
                    zoom: 32,
                    zoomZvalue: 120
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='7'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate=''"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='7'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='7'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='7'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='7'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='7'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='-1'"
                    }
                ]
            },
            {
                id: "A8 Level 7 detailed",
                title: "A8 7楼细节",
                url: "/huayuanfang_3D_indoor_A8_7F_detail/SceneServer/layers/0",
                type: "SceneLayer",
                display: "indoorModelLayer"
            },
            {
                id: "A8 Level Parking",
                title: "A8 停车场",
                url: "/huayuanfang_3D_indoor_A3A8_parking/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.471500, 31.272500],
                    heading: 0,
                    tilt: 49,
                    zoom: 19.8,
                    zoomZvalue: 150
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate='A3,A8'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='A3,A8'"
                    }
                ]
            },
            {
                id: "A3 Level Parking",
                title: "A3 停车场",
                url: "/huayuanfang_3D_indoor_A3A8_parking/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.471500, 31.272500],
                    heading: 0,
                    tilt: 49,
                    zoom: 19.8,
                    zoomZvalue: 150
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate='A3,A8'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='A3,A8'"
                    }
                ]
            },
            {
                id: "A4 Level Parking",
                title: "A4 停车场",
                url: "/huayuanfang_3D_indoor_A4A5_parking/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.4705000, 31.272800],
                    heading: 0,
                    tilt: 49,
                    zoom: 13,
                    zoomZvalue: 150
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate='A4,A5'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='A4,A5'"
                    }
                ]
            },
            {
                id: "A5 Level Parking",
                title: "A5 停车场",
                url: "/huayuanfang_3D_indoor_A4A5_parking/SceneServer/layers/0",
                type: "SceneLayer",
                init_camera_pos: {
                    center: [121.4705000, 31.272800],
                    heading: 0,
                    tilt: 49,
                    zoom: 13,
                    zoomZvalue: 150
                },
                display: "indoorModelLayer",
                relatedLayerExpressions: [
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
                        definitionExpression: "affiliate='A4,A5'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.INDOOR_PLANTS,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.BUILTIN_PLUG,
                        definitionExpression: "floor='-1'"
                    },
                    {
                        relatedLayerID: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
                        definitionExpression: "affiliate='A4,A5'"
                    }
                ]
            }
        ],
        undergroundLayers: {
            dynamicLayers: [{
                id: 3D_WebGIS_Angular_ESRI.WATER_PIPE_ANIMATION,
                title: "水管动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.WATER_PIPES,
                geometrySource: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.WATER_PIPES_ANIMATION.PROD,
                initialVisible: true
            }],
            scenario3Dlayers: [
                {
                    id: "Base",
                    title: "地下层",
                    url: "/huayuanfang_outdoor_base_webmercator_underground/SceneServer",
                    type: "SceneLayer",
                    opacity: 1,
                    popupEnabled: false
                },
                {
                    id: "buildings",
                    title: "建筑",
                    url: "/huayuanfang_outdoor_building_webmercator_underground/SceneServer",
                    type: "SceneLayer",
                    opacity: 1,
                    popupEnabled: true,
                    popupTemplate: {
                        title: "建筑名称: {name}"
                    }
                }, {
                    id: "landmark",
                    title: "地标",
                    url: "/huayuanfang_landmark_webmercator/SceneServer",
                    type: "SceneLayer",
                    opacity: 1
                }, {
                    id: "trees",
                    title: "树木",
                    url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.OUTDOOR_VEGETATION_UNDERGROUND.PROD,
                    type: "FeatureLayer",
                    opacity: 1
                }, {
                    id: 3D_WebGIS_Angular_ESRI.WATER_PIPES,
                    title: "水管管线",
                    url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.WATER_PIPES.PROD,
                    type: "FeatureLayer",
                    returnZ: true,
                    elevationInfo: { mode: "absolute-height" },
                    popupEnabled: true,
                    popupTemplate: {
                        title: "空间序列号: {objectid}"
                    },
                    dataTableConfig: {
                        icon: "street-view",
                        initializing: true,
                        autoRefresh: true,
                        refreshTime: 300
                    }
                },
                {
                    id: 3D_WebGIS_Angular_ESRI.ELECTRIC_PIPELINES,
                    title: "电线管道",
                    url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.ELECTRIC_PIPELINES.PROD,
                    type: "FeatureLayer",
                    returnZ: true,
                    elevationInfo: { mode: "absolute-height" },
                    popupEnabled: true,
                    popupTemplate: {
                        title: "空间序列号: {objectid}"
                    }
                },
                {
                    id: 3D_WebGIS_Angular_ESRI.WATER_VALVE,
                    title: "阀门",
                    url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.WATER_VALVE.PROD,
                    popupEnabled: true,
                    popupTemplate: {
                        title: "空间序列号: {objectid}"
                    },
                    returnZ: true,
                    elevationInfo: { mode: "absolute-height" },
                    type: "FeatureLayer",
                    symbolType: "Point3DSymbol",
                    symbolConfig: {
                        url: "/assets/3dModel/watervalve.json"
                    }
                }]
        },
        scenario2DId: 3
    };
};