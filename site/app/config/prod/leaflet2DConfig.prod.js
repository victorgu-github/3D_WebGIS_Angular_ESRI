'use strict';

module.exports = function(3D_WebGIS_Angular_ESRI, 3D_WebGIS_Angular_ESRI_LAYER_URL){
  this.Scenarios = [
    {
      scenarioName: "University of Calgary",
      scenarioID: 1,
      thumbnail_url: "/assets/img/scenario1_icon.png",
      scenarioExtent: {
        center: [51.084, -114.134],
        zoom: 17
      },
      baseMap: "Streets",
      scenario2Dlayers: {
        featureLayers: [
          {
            id: 3D_WebGIS_Angular_ESRI.GATEWAY,
            title: "Gateway_20170616",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.GATEWAY.PROD,
            heatMapEnabled: true,
            heatConfig: {
              isRealtime: true,
              refreshTime: 5000
            },
            popupEnabled: true,
            popupTemplate: {
              title: "Mac Address",
              titleValue: "mac_address",
              staticFields: ['objectid', 'name', 'floor']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "wifi"
          },
          {
            id: 3D_WebGIS_Angular_ESRI.CAMERA,
            title: "Camera",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.CAMERA.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "CameraID",
              titleValue: "cameraid",
              staticFields: ['cameraresolution', 'cameraframerate']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "camera"
          },
          {
            id: 3D_WebGIS_Angular_ESRI.STREET_LAMP,
            title: "Street Lamp",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.STREETLAMP.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "LampID",
              titleValue: "objectid",
              staticFields: ['size', 'city', 'region']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "lightbulb-o"
          },
          {
            id: 3D_WebGIS_Angular_ESRI.PLUG_BASE,
            title: "Plug base",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.PLUGBASE.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "Section",
              titleValue: "section",
              staticFields: ['section', 'name', 'deviceeui']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "plug"
          },
          {
            id: 3D_WebGIS_Angular_ESRI.INDOOR_2D_LAYER,
            title: "UofC 2D indoor",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.UOFC.INDOOR.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "Name",
              titleValue: "name",
              staticFields: ['name', 'bldg_uid', 'scenario']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "building-o"
          }
        ],
        realtimeLayers: [{
          id: 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER,
          title: "Realtime Layer",
          type: "realtime",
          isRealTime: true,
          refreshTime: 1000, // Milliseconds
          autoRefresh: true,
          isVisible: true,
          updateDuration: 400, // Milliseconds
          dataTableIcon: "icon-time",
          cluster: {
            defaultSize: 50
          },
          popupEnabled: true,
          popupTemplate: {
            title: "Name",
            titleValue: "name",
            staticFields: ['userID']
          }
        }]
      }
    },
    {
      scenarioName: "Shanghai",
      scenarioID: 3,
      thumbnail_url: "/assets/img/scenario2_icon.png",
      scenarioExtent: {
        center: [31.273500, 121.472000],
        zoom: 18
      },
      baseMap: "Streets",
      scenario2Dlayers: {
        featureLayers: [
          {
            id: 3D_WebGIS_Angular_ESRI.WATER_TANK,
            title: "水箱",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.WATERTANK.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "水箱名称",
              titleValue: "name",
              staticFields: ['name','communityname']
            },
            type: "FeatureLayer",
            isRealTime: true,
            isVisible: true,
            dataTableIcon: "tint",
            zoom: 22
          },
          {
            id: 3D_WebGIS_Angular_ESRI.LORA_GATEWAY,
            title: "Lora网关",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.LORA_GATEWAY.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "LoRa网关",
              titleValue: "mac_address",
              staticFields: ['name','floor']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "wifi",
            zoom: 22

          },
          {
            id: 3D_WebGIS_Angular_ESRI.DETECTOR,
            title: "人体感应器",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.DETECTOR.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "感应器ID",
              titleValue: "objectid",
              staticFields: ['name', 'floor_segm']
            },
            type: "FeatureLayer",
            isRealTime: true,
            isVisible: true,
            dataTableIcon: "street-view",
            zoom: 22
          },
          {
            id: 3D_WebGIS_Angular_ESRI.CEILING_LIGHT,
            title: "顶灯",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.CEILINGLIGHT.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "Ceiling light ID",
              titleValue: "objectid",
              staticFields: ['name', 'floor']
            },
            type: "FeatureLayer",
            isRealTime: true,
            isVisible: true,
            dataTableIcon: "lightbulb-o",
            zoom: 22
          },
          {
            id: 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR,
            title: "烟雾感应器",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.SMOKEDETECTOR.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "烟雾感应器",
              titleValue: "objectid",
              staticFields: ['floor']
            },
            type: "FeatureLayer",
            isRealTime: true,
            isVisible: true,
            dataTableIcon: "home",
            zoom: 22
          },
          {
            id: 3D_WebGIS_Angular_ESRI.PARKING_LOTS,
            title: "停车场",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.PARKINGLOT.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "车位ID",
              titleValue: "parkinglot_id",
              staticFields: ['affiliate']
            },
            type: "FeatureLayer",
            isRealTime: true,
            isVisible: true,
            dataTableIcon: "product-hunt",
            zoom: 22
          },
          {
            id: 3D_WebGIS_Angular_ESRI.SMART_CHARGER,
            title: "智能充电桩",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.SMARTCHARGER.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "充电桩名称",
              titleValue: "name",
              staticFields: ['affiliate']
            },
            type: "FeatureLayer",
            isRealTime: true,
            isVisible: true,
            dataTableIcon: "battery-three-quarters",
            zoom: 22
          },
          {
            id: 3D_WebGIS_Angular_ESRI.PLUG_BASE_CN,
            title: "外置插座（中国）",
            url: 3D_WebGIS_Angular_ESRI_LAYER_URL.HUAYUANFANG.PLUGBASECN.PROD,
            popupEnabled: true,
            popupTemplate: {
              title: "外置插座（中国）",
              titleValue: "section",
              staticFields: ['floor', 'name', 'deviceeui']
            },
            type: "FeatureLayer",
            isRealTime: false,
            isVisible: true,
            dataTableIcon: "plug",
            zoom: 22
          }],
        realtimeLayers: []
      }
    }
  ];
};
