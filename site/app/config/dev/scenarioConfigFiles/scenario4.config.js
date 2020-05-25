module.exports = function (3D_WebGIS_Angular_ESRI) {
    let self = this;

    self.scenario = {
        scenarioName: "凯旋华府(惠州)",
        scenarioID: 4,
        thumbnail_url: "/assets/img/scenario4_icon.jpg",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "32.5",
        baseMap: "hybrid",
        ground: "custom",//custom world-elevation and flat the community
        timezone: "GMT+0800 (China Standard Time)",
        init_camera_pos: {
            center: [114.748015, 22.9754096],
            heading: 180,
            tilt: 30,
            zoom: 16.4,
            zoomZvalue: 2000
        },
        actionLayers: {//have to create it even though it is empty now
            "LoraLampOnOff": [],
            "ResizeSymbol": [3D_WebGIS_Angular_ESRI.STREET_LAMP],
            "ChangeHistorySize": []
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
                    className: "realTime",
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
            }
        },
        scenario3Dlayers: [
            {
                id: "kaixuanhuafu3D",
                title: "凯旋华府 3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "kaixuanhuafuLabel",
                title: "凯旋华府 标签",
                url: "/Huizhou_Test/FeatureServer/0",
                type: "LabelLayer",
                opacity: 1,
                attributeToShow: "name",
                display: "outdoorModelLayer"
            },
            {
                id: "residentialBuildings",
                title: "住宅楼",
                url: "/building_huihzou_mass/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "commercialBuildings",
                title: "商业建筑",
                url: "/huidong_building_commercial_3d/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "grounds",
                title: "地表",
                url: "/huidong_outdoor_landscape/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "landmark",
                title: "小区地标",
                url: "/huidong_outdoor_landmark_3d/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.GREEN_PLANTS,
                title: "绿化植被",
                url: "/Huizhou_Test/FeatureServer/1",
                inGrouplayer: true,
                type: "FeatureLayer",
                symbolType: "mutiWebStyleSymbol",
                symbolAttribute: "tree_type",
                symbolConfig: [
                    {
                        value: "palm",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Washingtonia"
                    },
                    {
                        value: "bush",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Fremontodendron"
                    },
                    {
                        value: "evergreen",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Ulmus"
                    },
                    {
                        value: "potted plants",
                        styleName: "EsriRealisticTreesStyle",
                        name: "Bulbophyllum"
                    }
                ],
                display: "outdoorModelLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.WATER_TANK,
                title: "水箱",
                url: "/Huizhou_Test/FeatureServer/2",
                type: "FeatureLayer",
                opacity: 0.5,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul>" +
                        "<li>设备识别号: {deviceeui} </li>" +
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
                id: 3D_WebGIS_Angular_ESRI.STREET_LAMP,
                title: "路灯",
                url: "/Huizhou_Test/FeatureServer/3",
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul>" +
                        "<li>设备识别号: {deviceeui} </li></ul>"
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
                display: "outdoorModelLayer",
                dataTableConfig: {
                    icon: "lightbulb-o",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 3000
                }
            }
        ],
        scenarioIndoorLayers: []
    };
};