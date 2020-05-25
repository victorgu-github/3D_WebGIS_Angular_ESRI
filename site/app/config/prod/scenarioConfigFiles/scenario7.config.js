module.exports = function () {
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
            }
         
     
           
        ],
        scenarioIndoorLayers: [
        ]
    };
};