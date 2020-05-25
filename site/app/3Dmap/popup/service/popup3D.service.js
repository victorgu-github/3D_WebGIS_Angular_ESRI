'use strict';

module.exports = function (PlugBasePopupService, DetectorPopupService, SceneViewPopupService, DefaultPopupService,
                           StreetlampPopupService, WaterSensorPopupService, WaterTankPopupService, CeilingLightPopupService,
                           LoraGatewayPopupService, SmokeDetectorPopupService, RealTimePopupService, GatewayPopupService,
                           Power3DPopupService, WinDoorSensorPopupService,DataTablePopupWrapper, MapClickPopupWrapper, 3D_WebGIS_Angular_ESRI) {

  const SERVICE_MAPPING = {
    [3D_WebGIS_Angular_ESRI.GATEWAY]: GatewayPopupService,
    [3D_WebGIS_Angular_ESRI.STREET_LAMP]: StreetlampPopupService,
    [3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER]: RealTimePopupService,
    [3D_WebGIS_Angular_ESRI.BUILTIN_PLUG]: PlugBasePopupService,
    [3D_WebGIS_Angular_ESRI.PLUG_BASE_CN]: PlugBasePopupService,
    [3D_WebGIS_Angular_ESRI.PLUG_BASE]: PlugBasePopupService,
    [3D_WebGIS_Angular_ESRI.DETECTOR]: DetectorPopupService,
    [3D_WebGIS_Angular_ESRI.DETECTOR_ANIMATION]: DetectorPopupService,
    [3D_WebGIS_Angular_ESRI.WATER_TANK]: WaterTankPopupService,
    [3D_WebGIS_Angular_ESRI.WATER_SENSOR_DEVICE]: WaterSensorPopupService,
    [3D_WebGIS_Angular_ESRI.CEILING_LIGHT]: CeilingLightPopupService,
    [3D_WebGIS_Angular_ESRI.LORA_GATEWAY]: LoraGatewayPopupService,
    [3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR]: SmokeDetectorPopupService,
    [3D_WebGIS_Angular_ESRI.POWER_3D_ANIMATION]: Power3DPopupService,
    [3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR]: WinDoorSensorPopupService,
    [3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR_ANIMATION]: WinDoorSensorPopupService,
  };

  // Popup layer service manager
  this.popupFromDataTable = function (layerId, data, popup, self, popupTemplate) {
    let service = SERVICE_MAPPING[layerId] ? SERVICE_MAPPING[layerId] : DefaultPopupService;

    let popupWrapper = new DataTablePopupWrapper(data, popup, self.view, self, self.scenario, layerId, popupTemplate);

    if (typeof service.popupForDataTable === "function") {
      return service.popupForDataTable(popupWrapper);
    } else {
      return DefaultPopupService.popupForDataTable(popupWrapper);
    }
  };

  this.popupFromClick = function (view, evt, controller, graphic, layer) {
    let service;
    if (layer.type === "scene") {
      service = SceneViewPopupService;
    } else {
      service = SERVICE_MAPPING[layer.id];
    }

    if (service && typeof service.popupForClick === "function") {
      let popupWrapper = new MapClickPopupWrapper(view, controller.scenario, evt, controller,
        graphic, layer.id, layer, layer.popupTemplate);

      return service.popupForClick(popupWrapper);
    }
  };

  this.getPopupTemplate = function (layerId, scenario) {
    let layer = scenario.scenario3Dlayers.find(layer => layer.id === layerId);

    if (layer) {
      return layer.popupTemplate;
    } else {
      return {
        title: "",
        content: ""
      };
    }
  };

};
