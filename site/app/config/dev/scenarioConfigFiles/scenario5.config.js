module.exports = function (3D_WebGIS_Angular_ESRI) {
    let self = this;

    self.scenario = {
        scenarioName: "练江（广东）",
        scenarioID: 5,
        thumbnail_url: "/assets/img/river-icon.jpg",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "100",
        baseMap: "satellite",
        ground: "world-elevation",
        timezone: "GMT+0800 (China Standard Time)",
        init_camera_pos: {
            center: [116.293076, 23.294058],
            heading: 0,
            tilt: 10,
            zoom: 14,
            zoomZvalue: 3800
        },
        actionLayers: {//have to create it even though it is empty now
            "LoraLampOnOff": [],
            "ResizeSymbol": [3D_WebGIS_Angular_ESRI.WATER_SENSOR_DEVICE],
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
            "WaterSensorAnimation": {
                id: 3D_WebGIS_Angular_ESRI.WATER_SENSOR_ANIMATION,
                title: "检测设备动画",
                matchFeatureLayer: 3D_WebGIS_Angular_ESRI.WATER_SENSOR_DEVICE,
                geometrySource: "练江",
                sourceType: "nodeServer",
                url: "",
                initialVisible: false,
                display: "sharedLayer"
            }
        },
        scenario3Dlayers: [
            {
                id: "buildingsAlongRiver",
                title: "沿河建筑3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "residentialBuildingsAlongRiver",
                title: "沿河建筑3D （住宅区）",
                url: "/lianjiang_building_residential/SceneServer",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "factoriesAlongRiver",
                title: "沿河建筑3D （工厂，防涝房）",
                url: "/lianjiang_building_popup/SceneServer",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "lianjiang",
                title: "练江",
                url: "/Lianjiang_Test/FeatureServer/0",
                type: "FeatureLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "江段序号: {segmentid}",
                    content: "<ul><li>沿河社区: {proximity}</li></ul>"
                },
                display: "sharedLayer"
            },
            {
                id: "keyReservoir",
                title: "重点水库",
                url: "/Lianjiang_Test/FeatureServer/1",
                type: "FeatureLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "水库序号: {segmentid}",
                    content: "<ul><li>沿河社区: {proximity}</li></ul>"
                },
                display: "sharedLayer"
            },
            {
                id: "communitiesAlongRiver",
                title: "沿河社区（部分）",
                url: "/Lianjiang_Test/FeatureServer/2",
                type: "FeatureLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "沿河社区: {proximity}",
                    content: "<ul><li>沿河社区: {proximity}</li></ul>"
                },
                display: "sharedLayer"
            },
            {
                id: 3D_WebGIS_Angular_ESRI.WATER_SENSOR_DEVICE,
                title: "检测设备",
                url: "/Lianjiang_Test/FeatureServer/3",
                type: "FeatureLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>设备识别号: {deveui}</li><li>沿河社区: {proximity}</li>" +
                        "<li>pH值: <span id='water-sensor-ph-value' object-id='" + "{objectid}" + "'>-</span></li>" +
                        "<li>溶解氧: <span id='water-sensor-do-value' object-id='" + "{objectid}" + "'>-</span></li>" +
                        "<li>浊度: <span id='water-sensor-ftu-value' object-id='" + "{objectid}" + "'>-</span></li>" +
                        "</ul>"
                },
                symbolType: "Point3DSymbol",
                symbolConfig: {
                    url: "/assets/3dModel/watersensor.json",
                    width: 5,
                    height: 9.3,
                    depth: 5
                },
                display: "sharedLayer",
                dataTableConfig: {
                    icon: "archive",
                    initializing: true,
                    autoRefresh: false,
                    refreshTime: 10000
                }
            }
        ],
        scenarioIndoorLayers: []
    };
};