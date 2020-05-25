'use strict';

module.exports = function ($q, $scope, $rootScope, esriLoader, LocalSceneViewService, MapLayer3DBuilder,
                           AccountService, 3D_WebGIS_Angular_ESRI) {
  let self = this;

  LocalSceneViewService.resetLocalScene();

  self.data = LocalSceneViewService.data;
  //hard code to 上海花园坊 for now
  self.currentScenarioConfig = AccountService.userInfo.settings.Scenarios.find(scenario => scenario.scenarioName === "上海花园坊");
  let shanghaiExtent = { // autocasts as new Extent()
    xmax: 121.475183,
    xmin: 121.467681,
    ymax: 31.276454,
    ymin: 31.272182,
    spatialReference: { // autocasts as new SpatialReference()
      wkid: 4326
    }
  };
  $scope.mapOption = {
    zoom: self.currentScenarioConfig.init_camera_pos.zoom, center: self.currentScenarioConfig.init_camera_pos.center, viewingMode: "local",
    // Use the exent defined in clippingArea to define the bounds of the scene
    clippingArea: shanghaiExtent,
    extent: shanghaiExtent,
    // Allows for navigating the camera below the surface
    constraints: {
      collision: {
        enabled: false
      },
      tilt: {
        max: 179.99
      }
    }
  };
  // load esri modules
  esriLoader.require([
    'esri/Map',
    "esri/layers/SceneLayer",
    "esri/layers/FeatureLayer",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/WebStyleSymbol",
    "esri/symbols/LineSymbol3D",
    "esri/symbols/PathSymbol3DLayer",
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Home",
    "esri/symbols/PointSymbol3D",
    "esri/symbols/ObjectSymbol3DLayer",
    "esri/Viewpoint"
  ], function (Map, SceneLayer, FeatureLayer, SimpleRenderer, WebStyleSymbol, LineSymbol3D, PathSymbol3DLayer, Query, QueryTask, GraphicsLayer,Home,PointSymbol3D,ObjectSymbol3DLayer,Viewpoint) {
    self.data.map = new Map({
      basemap: 'osm',
      ground: "world-elevation"
    });

     let scenario = self.currentScenarioConfig;
     AccountService.userInfo.settings.currentScenario.scenarioID = scenario.scenarioID;
    //add layers
    self.data.map.addMany(createLayers(scenario, SceneLayer, FeatureLayer, SimpleRenderer, WebStyleSymbol, LineSymbol3D, PathSymbol3DLayer,PointSymbol3D,ObjectSymbol3DLayer));
    //add dynamic graphic layers
    scenario.undergroundLayers.dynamicLayers.forEach(layer => {
      self.data.animationLayers.push(new GraphicsLayer({
        id: layer.id,
        title: layer.title,
        matchFeatureLayer: layer.matchFeatureLayer,
        geometrySource: AccountService.userInfo.settings.featureLayerBaseURL+layer.geometrySource,
        initialVisible: layer.initialVisible,
        listMode: "hide"
      }));
    });

    self.data.map.addMany(self.data.animationLayers);

    self.onViewLoaded = function (view) {
      self.view = view;
      let pos = self.currentScenarioConfig.init_camera_pos.center.concat(self.currentScenarioConfig.init_camera_pos.zoomZvalue);
      let initialViewpoint = new Viewpoint ({
        camera: {
          position: pos,
          tilt: self.currentScenarioConfig.init_camera_pos.tilt,
          heading: self.currentScenarioConfig.init_camera_pos.heading
        }
     });
      let homeBtn = new Home({
        view: view,
        viewpoint: initialViewpoint
      });
      view.ui.add(homeBtn, "top-left");


      LocalSceneViewService.updateLayerList(self.data.map.layers, view);
    };

    function createLayers(scenario, SceneLayer, FeatureLayer, SimpleRenderer, WebStyleSymbol, LineSymbol3D, PathSymbol3DLayer,PointSymbol3D,ObjectSymbol3DLayer) {

      scenario.undergroundLayers.scenario3Dlayers.forEach(layer => {
        if (layer.type === "SceneLayer") {
          self.data.layers.push(new SceneLayer({
            id: layer.id,
            title: layer.title,
            url: AccountService.userInfo.settings.tiledLayerBaseURL+layer.url,
            popupEnabled: layer.popupEnabled || false,
            popupTemplate: layer.popupTemplate
          }));
        } else if (layer.type === "FeatureLayer") {
          self.data.layers.push(new FeatureLayer({
            id: layer.id,
            title: layer.title,
            url: AccountService.userInfo.settings.featureLayerBaseURL+layer.url,
            returnZ: layer.returnZ,
            elevationInfo: layer.elevationInfo,
            popupEnabled: layer.popupEnabled || false,
            popupTemplate: layer.popupTemplate,
            symbolConfig:layer.symbolConfig
          }));
        }
      });

      // Add renderer for some layers
      self.data.layers.forEach(layer => {
        if (layer.id === "trees") {
          layer.renderer = new SimpleRenderer({
            symbol: new WebStyleSymbol({
              value: "bamboo",
              styleName: "EsriRealisticTreesStyle",
              name: "Phyllostachys"
            })
          });
        } else if (layer.id === 3D_WebGIS_Angular_ESRI.WATER_PIPES) {
          layer.renderer = new SimpleRenderer({
            symbol: new LineSymbol3D({
              symbolLayers: [new PathSymbol3DLayer({
                size: 5,  // 100,000 meters in height
                material: {color: [192, 192, 192, 0.6]}
              })]
            })
          });
        }
        else if (layer.id === 3D_WebGIS_Angular_ESRI.ELECTRIC_PIPELINES) {
          layer.renderer = new SimpleRenderer({
            symbol: new LineSymbol3D({
              symbolLayers: [new PathSymbol3DLayer({
                size: 3,  // 100,000 meters in height
                material: {color: [240,230,140, 1]}
              })]
            })
          });
        }
        else if (layer.id === 3D_WebGIS_Angular_ESRI.WATER_VALVE){
          let objectSymbol = new PointSymbol3D({
            symbolLayers: [new ObjectSymbol3DLayer({
          
              resource: {
                href: layer.symbolConfig.url
              }
            })]
          });
          layer.renderer = new SimpleRenderer({
            symbol: objectSymbol
          });
        }
      });

      return self.data.layers;
    }
  });

  $scope.$on("$destroy", function() {
    LocalSceneViewService.resetLocalScene();
  });

};
