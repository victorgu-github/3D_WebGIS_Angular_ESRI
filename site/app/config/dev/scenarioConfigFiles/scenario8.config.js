module.exports = function (3D_WebGIS_Angular_ESRI) {
    let self = this;

    self.scenario = {
        scenarioName: "蒙羊",
        scenarioID: 8,
        thumbnail_url: "/assets/img/scenario8_icon.png",
        isActive: false,
        scenarioExtent: [],
        scenarioHeight: "1100",
        baseMap: "satellite",
        indoorBaseMap: "streets-night-vector",
        ground: "world-elevation",
        timezone: "GMT+0800 (China Standard Time)",
        init_camera_pos: {
            center: [108.401268, 41.25883],
            heading: 0,
            tilt: 25,
            zoom: 15,
            zoomZvalue: 2002
        },
        actionLayers: {//have to create it even though it is empty now
            "LoraLampOnOff": [],
            "ResizeSymbol": [],
            "ChangeHistorySize": []
        },
        dynamicLayers: {
            "APE_RealTime": {
                id: 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER,
                title: "羊群位置图层",
                sourceType: "nodeServer",
                url: "api/blenodes/active",
                initialVisible: true,
                display: "sharedLayer", //indoor/outdoor display mode: sharedLayer/outdoorModelLayer/indoorSharedLayer/indoorModelLayer
                elevationInfo: { mode: "on-the-ground" },
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
                id: "pasture3D",
                title: "牧场3D",
                visibilityMode: "independent",
                type: "GroupLayer",
                opacity: 1,
                display: "outdoorModelLayer"
            },
            {
                id: "building3D",
                title: "羊舍3D",
                url: "/Mengyang_Shed16_MainArea/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "roof3D",
                title: "羊舍屋顶",
                url: "/Mengyang_Shed16_Roof/SceneServer/layers/0",
                type: "SceneLayer",
                opacity: 1,
                inGrouplayer: true,
                display: "outdoorModelLayer"
            },
            {
                id: "pasture3DLabel",
                title: "羊舍标签",
                url: "/Mengyang_Test/FeatureServer/2",
                type: "LabelLayer",
                opacity: 1,
                inGrouplayer: true,
                attributeToShow: "name",
                display: "outdoorModelLayer"
            }
         
     
           
        ],
        scenarioIndoorLayers: [
        ]
    };
};