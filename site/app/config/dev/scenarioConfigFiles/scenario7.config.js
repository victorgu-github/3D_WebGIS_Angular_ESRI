module.exports = function (3D_WebGIS_Angular_ESRI,3D_WebGIS_Angular_ESRI_LAYER_URL) {
    let self = this;

    self.scenario = {
        scenarioName: "上海",
        scenarioID: 7,
        thumbnail_url: "/assets/img/scenario7_icon.png",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "1111",
        baseMap: "satellite",
        indoorBaseMap: "streets-night-vector",
        ground: "world-elevation",
        timezone: "GMT+0800 (China Standard Time)",
        init_camera_pos: {
            center: [121.47040, 31.18080],
            heading: 0,
            tilt: 25,
            zoom: 15,
            zoomZvalue: 10002
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
                elevationInfo: { mode: "on-the-ground" },
                dataTableConfig: {
                    icon: "globe",
                    className: "realTime",
                    initializing: true,
                    autoRefresh: true,
                    refreshTime: 30000,
                    popUpAttributes: {
                        featureId: "Node Mac",
                        Latitude: "Latitude",
                        Longitude: "Longitude"
                    }
                }
            },
            "APE_History": { //have to add based on the current code structure
                id: 3D_WebGIS_Angular_ESRI.HISTORY_TRACK_LAYER,
                title: "History Track Layer",
                sourceType: "nodeServer",
                initialVisible: false,
                historyPointNum: 5,
                display: "indoorModelLayer" // don't set as sharedLayer to prevent adding it into map
            }
        },
        scenario3Dlayers: [
            {
                id: "shbuildings3D",
                title: "上海建筑3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "osm3D",
                title: "上海建筑3D（OSM）",
                url: "/shanghai_building_outdoor_3D/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                popupEnabled: true,
                popupTemplate: {
                    title: "Name:{name}",
                    content: "<li> Nbr of Floors: {Nbr of Floors} </li>"+
                    "<li> Gross Floor Area (m2): {Gross Floor Area (m2)} </li>"+
                    "<li> Footprint Area (m2): {Footprint Area (m2)} </li>"
                },
                specialRenderer:true,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "test",
                title: "LoRa网关",
                url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.LORA_GATEWAY.TEST,
                popupEnabled: true,
                popupTemplate: {
                    title: "名称: {name}",
                    content: "<ul><li>营业时间: 9:00-18:00 </li>"
                    +"<li>电话: 021-59980325</li>"
                    +"<li>地址: 上海市嘉定区金沙江路2784号底层</li>"
                    +"<img src='/assets/img/chexiangjia_mendian.jpg'>"+"</ul>"
                },
                type: "FeatureLayer",
                symbolType: "Point3DwithCallout",
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
            }
         
     
           
        ],
        scenarioIndoorLayers: [
        ]
    };
};