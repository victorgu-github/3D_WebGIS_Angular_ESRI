'use strict';

module.exports = function (esriLoader, AccountService, SceneViewService, Popup3DService, 3D_WebGIS_Angular_ESRI) {
  let factory = {};

  factory.dataTableLayers = [];

  factory.buildLayers = function (controller) {
    factory.dataTableLayers = [];
    for (let layer in SceneViewService.data.animationLayers) {
      if (SceneViewService.data.animationLayers.hasOwnProperty(layer)) {
        delete SceneViewService.data.animationLayers[layer];
      }
    }

    return esriLoader.require([
      'esri/layers/TileLayer',
      "esri/layers/SceneLayer",
      "esri/layers/GroupLayer",
      "esri/layers/FeatureLayer",
      "esri/symbols/WebStyleSymbol",
      "esri/symbols/PictureMarkerSymbol",
      "esri/renderers/SimpleRenderer",
      "esri/symbols/TextSymbol",
      "esri/layers/support/LabelClass",
      "esri/layers/GraphicsLayer",
      "esri/symbols/PointSymbol3D",
      "esri/symbols/ObjectSymbol3DLayer",
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask",
      "esri/Graphic",
      "esri/symbols/PolygonSymbol3D",
      "esri/symbols/ExtrudeSymbol3DLayer",
      "esri/renderers/UniqueValueRenderer"
    ]).then(function (modules) {
      let TileLayer = modules[0];
      let SceneLayer = modules[1];
      let GroupLayer = modules[2];
      let FeatureLayer = modules[3];
      let WebStyleSymbol = modules[4];
      let PictureMarkerSymbol = modules[5];
      let SimpleRenderer = modules[6];
      let TextSymbol = modules[7];
      let LabelClass = modules[8];
      let GraphicsLayer = modules[9];
      let PointSymbol3D = modules[10];
      let ObjectSymbol3DLayer = modules[11];
      let Query = modules[12];
      let QueryTask = modules[13];
      let Graphic = modules[14];
      let PolygonSymbol3D = modules[15];
      let ExtrudeSymbol3DLayer = modules[16];
      let UniqueValueRenderer = modules[17];

      buildESRILayer(controller, TileLayer, SceneLayer, GroupLayer, FeatureLayer,
        WebStyleSymbol, PictureMarkerSymbol, SimpleRenderer,
        TextSymbol, LabelClass, GraphicsLayer, PointSymbol3D, ObjectSymbol3DLayer, Query, QueryTask, Graphic, PolygonSymbol3D, ExtrudeSymbol3DLayer, UniqueValueRenderer);
      buildDynamicLayer(controller, GraphicsLayer);

    });
  };

  factory.hitTestHandler = function (response, self, evt) {
    // Get the layer of the clicked building
    let view = self.view;
    // this may cause error if user click at nowhere. but the error can be captured map itself
    let layer = response.results[0].graphic.layer;

    return Popup3DService.popupFromClick(view, evt, self, response.results[0].graphic, layer);
  };

  function addDataTableLayer(layer) {
    factory.dataTableLayers.push(layer);
  }

  function buildESRILayer(controller, TileLayer, SceneLayer, GroupLayer, FeatureLayer,
                          WebStyleSymbol, PictureMarkerSymbol, SimpleRenderer,
                          TextSymbol, LabelClass, GraphicsLayer, PointSymbol3D, ObjectSymbol3DLayer, Query,
                          QueryTask, Graphic, PolygonSymbol3D, ExtrudeSymbol3DLayer,UniqueValueRenderer) {

    let groupLayer;
    for (let i = 0; i < controller.scenario.scenario3Dlayers.length; i++) {
      let layer;
      if (controller.scenario.scenario3Dlayers[i].type === "GroupLayer") {
        groupLayer = new GroupLayer({
          id: controller.scenario.scenario3Dlayers[i].id,
          title: controller.scenario.scenario3Dlayers[i].title,
          opacity: !controller.scenario.scenario3Dlayers[i].opacity ? 1 : controller.scenario.scenario3Dlayers[i].opacity,
          visibilityMode: controller.scenario.scenario3Dlayers[i].visibilityMode
        });

        // add layer to its container
        pushLayerToController(controller.scenario.scenario3Dlayers[i], controller, groupLayer);
        continue;
      } else if (controller.scenario.scenario3Dlayers[i].type === "SceneLayer") {

        layer = new SceneLayer({
          id: controller.scenario.scenario3Dlayers[i].id,
          title: controller.scenario.scenario3Dlayers[i].title,
          url: AccountService.userInfo.settings.tiledLayerBaseURL + controller.scenario.scenario3Dlayers[i].url,
          opacity: !controller.scenario.scenario3Dlayers[i].opacity ? 1 : controller.scenario.scenario3Dlayers[i].opacity,
          popupEnabled: controller.scenario.scenario3Dlayers[i].popupEnabled || false,
          popupTemplate: controller.scenario.scenario3Dlayers[i].popupTemplate,
          renderer: controller.scenario.scenario3Dlayers[i].specialRenderer?getUniqueValueRenderer():null
        });
      } else if (controller.scenario.scenario3Dlayers[i].type === 'FeatureLayer') {
        // As Gateway belongs to BLE device, so should be skipped when bleAppId not exists.
        if (controller.scenario.scenario3Dlayers[i].id === 3D_WebGIS_Angular_ESRI.GATEWAY && AccountService.currentBLEAppID() === null) {
          continue;
        }
        layer = new FeatureLayer({
          id: controller.scenario.scenario3Dlayers[i].id,
          title: controller.scenario.scenario3Dlayers[i].title,
          url: AccountService.userInfo.settings.featureLayerBaseURL + controller.scenario.scenario3Dlayers[i].url,
          outFields: ["*"],
          popupEnabled: controller.scenario.scenario3Dlayers[i].popupEnabled,
          popupTemplate: controller.scenario.scenario3Dlayers[i].popupTemplate,
          elevationInfo: controller.scenario.scenario3Dlayers[i].elevationInfo,
          returnZ: !controller.scenario.scenario3Dlayers[i].returnZ ? false : controller.scenario.scenario3Dlayers[i].returnZ,
          opacity: !controller.scenario.scenario3Dlayers[i].opacity ? 1 : controller.scenario.scenario3Dlayers[i].opacity,
          visible:controller.scenario.scenario3Dlayers[i].visible==null ? true : controller.scenario.scenario3Dlayers[i].visible
        });

        //apply Symbol render if have
        if (controller.scenario.scenario3Dlayers[i].symbolType === "WebStyleSymbol") {
          layer.renderer = new SimpleRenderer({
            symbol: new WebStyleSymbol(controller.scenario.scenario3Dlayers[i].symbolConfig)
          });

        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "mutiWebStyleSymbol") {
          layer.renderer = new UniqueValueRenderer({
             field: controller.scenario.scenario3Dlayers[i].symbolAttribute,
             defaultSymbol: new WebStyleSymbol(controller.scenario.scenario3Dlayers[i].symbolConfig[0])
          });
          for (let j=1;j<controller.scenario.scenario3Dlayers[i].symbolConfig.length;j++)
          {
             layer.renderer.addUniqueValueInfo(controller.scenario.scenario3Dlayers[i].symbolConfig[j].value,
                new WebStyleSymbol(controller.scenario.scenario3Dlayers[i].symbolConfig[j])
             );
          }

        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "mutiPoint3DSymbol") {
          layer.renderer = new UniqueValueRenderer({
             field: controller.scenario.scenario3Dlayers[i].symbolAttribute,
             defaultSymbol: new PointSymbol3D({
              symbolLayers: [new ObjectSymbol3DLayer({
                width: controller.scenario.scenario3Dlayers[i].symbolConfig[0].width,
                height: controller.scenario.scenario3Dlayers[i].symbolConfig[0].height,
                depth:controller.scenario.scenario3Dlayers[i].symbolConfig[0].depth,
                heading:controller.scenario.scenario3Dlayers[i].symbolConfig[0].heading,
                resource: {
                  href: controller.scenario.scenario3Dlayers[i].symbolConfig[0].url
                }
              })]
            })
          });
          for (let j=1;j<controller.scenario.scenario3Dlayers[i].symbolConfig.length;j++)
          {
             layer.renderer.addUniqueValueInfo(controller.scenario.scenario3Dlayers[i].symbolConfig[j].value,
              new PointSymbol3D({
                symbolLayers: [new ObjectSymbol3DLayer({
                  width: controller.scenario.scenario3Dlayers[i].symbolConfig[j].width,
                  height: controller.scenario.scenario3Dlayers[i].symbolConfig[j].height,
                  depth:controller.scenario.scenario3Dlayers[i].symbolConfig[j].depth,
                  heading:controller.scenario.scenario3Dlayers[i].symbolConfig[j].heading,
                  resource: {
                    href: controller.scenario.scenario3Dlayers[i].symbolConfig[j].url
                  }
                })]
              })
             );
          }

        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "PictureMarkerSymbol") {
          layer.renderer = new SimpleRenderer({
            symbol: new PictureMarkerSymbol(controller.scenario.scenario3Dlayers[i].symbolConfig)
          });
        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "Point3DSymbol") {
          let objectSymbol = new PointSymbol3D({
            symbolLayers: [new ObjectSymbol3DLayer({
              width: controller.scenario.scenario3Dlayers[i].symbolConfig.width,
              height: controller.scenario.scenario3Dlayers[i].symbolConfig.height,
              depth:controller.scenario.scenario3Dlayers[i].symbolConfig.depth,
              heading:controller.scenario.scenario3Dlayers[i].symbolConfig.heading,
              resource: {
                href: controller.scenario.scenario3Dlayers[i].symbolConfig.url
              }
            })]
          });
          layer.renderer = new SimpleRenderer({
            symbol: objectSymbol
          });
        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "Point3DwithCallout") {
          let objectSymbol = {
            type: "point-3d", // autocasts as new PointSymbol3D()
            symbolLayers: [{
              type: "icon", // autocasts as new IconSymbol3DLayer()
              resource: {
                href: "/assets/img/chexiangjia.png"
              },
              size: 20,
              outline: {
                color: "white",
                size: 2
              }
            }],
  
            verticalOffset:  {
              screenLength: 40,
              maxWorldLength: 200,
              minWorldLength: 35
            },
  
            callout: {
              type: "line", // autocasts as new LineCallout3D()
              color: "white",
              size: 2,
              border: {
                color: "#56B2D6"
              }
            }
          };
          layer.renderer = new SimpleRenderer({
            symbol: objectSymbol
          });
          layer.labelingInfo = [
            {
              labelExpressionInfo: {
                value: "{Name}"
              },
              symbol: {
                type: "label-3d", // autocasts as new LabelSymbol3D()
                symbolLayers: [{
                  type: "text", // autocasts as new TextSymbol3DLayer()
                  material: {
                    color: "white"
                  },
                  // we set a halo on the font to make the labels more visible with any kind of background
                  halo: {
                    size: 1,
                    color: [50, 50, 50]
                  },
                  size: 10
                }]
              }
            }];
          layer.labelsVisible = true;
        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "PlugbaseSymbol") {
          // Create objectSymbol and add to renderer
          let objectSymbol = new PointSymbol3D({
            symbolLayers: [new ObjectSymbol3DLayer({
              width: 0.5,
              height: 1,
              resource: {
                primitive: "cylinder"
              },
              material: {
                color: [255, 255, 255, 0.7]
              }
            })]
          });
          layer.renderer = new SimpleRenderer({
            symbol: objectSymbol
          });
        }
        else if (controller.scenario.scenario3Dlayers[i].symbolType === "Polygon3DSymbol") {
          layer.renderer = new SimpleRenderer({
            symbol: new PolygonSymbol3D({
              symbolLayers: [new ExtrudeSymbol3DLayer({
                material: {
                  color: [167, 198, 54, 0.7]
                },
                size: 2
              })]
            })
          });
        }
        if (controller.scenario.scenario3Dlayers[i].bindWithNodeServer) {
          layer.bindWithNodeServer = controller.scenario.scenario3Dlayers[i].bindWithNodeServer;
        }
        //add all feature layers into datatable for now
        // addDataTableLayer(layer);

      }
      else if (controller.scenario.scenario3Dlayers[i].type === 'LabelLayer') {
        layer = new FeatureLayer({
          id: controller.scenario.scenario3Dlayers[i].id,
          title: controller.scenario.scenario3Dlayers[i].title,
          url: AccountService.userInfo.settings.featureLayerBaseURL + controller.scenario.scenario3Dlayers[i].url,
          outFields: ["*"],
          subtype:"label",
          opacity: !controller.scenario.scenario3Dlayers[i].opacity ? 1 : controller.scenario.scenario3Dlayers[i].opacity,
          elevationInfo: {
            mode: "absolute-height"
          },
          returnZ: true
        });
        let statesLabelClass = new LabelClass({
          labelExpressionInfo: {value: "{" + controller.scenario.scenario3Dlayers[i].attributeToShow + "}"},//"{value:}"+ controller.scenario.scenario3Dlayers[i].attributeToShow+"}",
          symbol: new TextSymbol({
            color: "black",
            haloSize: 1,
            haloColor: "white",
            font: {  // autocast as esri/symbols/Font
              size: 12,
              family: "sans-serif",
              weight: "bolder"
            }
          })
        });
        layer.labelsVisible = true;
        layer.labelingInfo = [statesLabelClass];
      }
      else if (controller.scenario.scenario3Dlayers[i].type === 'MapServiceLayer') {
        //TODO
      }
      else if (controller.scenario.scenario3Dlayers[i].type === 'TiledLayer') {
        //TODO
      }
      if (layer) {
        // add layer to its container
        if (controller.scenario.scenario3Dlayers[i].inGrouplayer) {
          groupLayer.add(layer);
        } else {
          pushLayerToController(controller.scenario.scenario3Dlayers[i], controller, layer);
        }
      }

    }

    for (let i = 0; i < controller.scenario.scenarioIndoorLayers.length; i++) {
      let layer;
      if (controller.scenario.scenarioIndoorLayers[i].type === 'SceneLayer') {
        layer = new SceneLayer({
          id: controller.scenario.scenarioIndoorLayers[i].id,
          title: controller.scenario.scenarioIndoorLayers[i].title,
          url: AccountService.userInfo.settings.tiledLayerBaseURL + controller.scenario.scenarioIndoorLayers[i].url,
          opacity: !controller.scenario.scenarioIndoorLayers[i].opacity ? 1 : controller.scenario.scenarioIndoorLayers[i].opacity,
          relatedLayerExpressions:controller.scenario.scenarioIndoorLayers[i].relatedLayerExpressions
        });
      }

      // add layer to its container
      pushLayerToController(controller.scenario.scenarioIndoorLayers[i], controller, layer);
    }

    // add layers to controller's displaying layer
    controller.layers = controller.layers.concat(controller.outdoorModelLayersContainer.layers, controller.sharedLayersContainer.layers);
    //add shared layer and outdoormodel layer to datatable array by default since always go to outdoor of a scenario
    //it will pass scenelayer to datatable but datatable has filter on layer type to feature, so would not impact datatable
    factory.dataTableLayers = factory.dataTableLayers.concat(controller.sharedLayersContainer.layers,controller.outdoorModelLayersContainer.layers);

    // add layer to map
    controller.map.addMany(controller.layers);
  }

  function buildDynamicLayer(controller, GraphicsLayer) {
    //contorller dynamic layers are building with business logic deeply in that hard to fully move into config.
    if (AccountService.userInfo.settings.currentScenario.bleAppID !== null) {
      //if dynamicLayer.display is sharedLayer, then we display it in the home page layer list
      if (controller.scenario.dynamicLayers.APE_RealTime) {
        controller.realtimeLayer = new GraphicsLayer({
          id: controller.scenario.dynamicLayers.APE_RealTime.id,
          title: controller.scenario.dynamicLayers.APE_RealTime.title,
          elevationInfo: controller.scenario.dynamicLayers.APE_RealTime.elevationInfo
        });
        controller.realtimeLayer.visible = controller.scenario.dynamicLayers.APE_RealTime.initialVisible;

        if (controller.scenario.dynamicLayers.APE_RealTime.display === "sharedLayer") {
          controller.map.add(controller.realtimeLayer);
        }
        pushLayerToController(controller.scenario.dynamicLayers.APE_RealTime,
          controller, controller.realtimeLayer);

        controller.historyLayer = new GraphicsLayer({
          id: controller.scenario.dynamicLayers.APE_History.id,
          title: controller.scenario.dynamicLayers.APE_History.title
        });
        controller.historyLayer.visible = controller.scenario.dynamicLayers.APE_History.initialVisible;
        controller.historyLayer.historyPointNum = controller.scenario.dynamicLayers.APE_History.historyPointNum;
        if (controller.scenario.dynamicLayers.APE_History.display === "sharedLayer") {
          controller.map.add(controller.historyLayer);
        }
        pushLayerToController(controller.scenario.dynamicLayers.APE_History,
          controller, controller.historyLayer);

        // only add realtimeLayer as datatablelyer
        addDataTableLayer(controller.realtimeLayer);
      }
    }
    //have to put windoor and indoor seg animation at top. if put them at bottom, they would show sometimes.
   //add window door graphic layer for animation
   if (controller.scenario.dynamicLayers.WinDoorAnimation) {
    let WinDoorAnimation = controller.scenario.dynamicLayers.WinDoorAnimation;
    SceneViewService.data.animationLayers[WinDoorAnimation.matchFeatureLayer]= new GraphicsLayer({
      id: WinDoorAnimation.id,
      title: WinDoorAnimation.title,
      listMode: "hide",
      matchFeatureLayer: WinDoorAnimation.matchFeatureLayer,
      visible: WinDoorAnimation.initialVisible
    });
    let animationLayer = SceneViewService.data.animationLayers[WinDoorAnimation.matchFeatureLayer];
    if (controller.scenario.dynamicLayers.WinDoorAnimation.display === "sharedLayer") {
      controller.map.add(animationLayer);
    }
    pushLayerToController(WinDoorAnimation, controller, animationLayer);
  }
    //add indoor seg graphic layer for animation
    if (controller.scenario.dynamicLayers.IndoorSegAnimation) {
      let IndoorSegAnimation = controller.scenario.dynamicLayers.IndoorSegAnimation;
      SceneViewService.data.animationLayers[IndoorSegAnimation.matchFeatureLayer]= new GraphicsLayer({
        id: IndoorSegAnimation.id,
        title: IndoorSegAnimation.title,
        listMode: "hide",
        matchFeatureLayer: IndoorSegAnimation.matchFeatureLayer,
        visible: IndoorSegAnimation.initialVisible
      });
      let animationLayer = SceneViewService.data.animationLayers[IndoorSegAnimation.matchFeatureLayer];
      if (controller.scenario.dynamicLayers.IndoorSegAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(IndoorSegAnimation, controller, animationLayer);
    }
    // add ceiling light graphic layer for animation
    if (controller.scenario.dynamicLayers.CeilingLightAnimation) {
      let CeilingLightAnimation = controller.scenario.dynamicLayers.CeilingLightAnimation;
      SceneViewService.data.animationLayers[CeilingLightAnimation.matchFeatureLayer]= new GraphicsLayer({
        id: CeilingLightAnimation.id,
        title: CeilingLightAnimation.title,
        listMode: "hide",
        matchFeatureLayer: CeilingLightAnimation.matchFeatureLayer,
        geometrySource:AccountService.userInfo.settings.featureLayerBaseURL+controller.scenario.dynamicLayers.CeilingLightAnimation.geometrySource
      });
      let animationLayer = SceneViewService.data.animationLayers[CeilingLightAnimation.matchFeatureLayer];
      animationLayer.visible = CeilingLightAnimation.initialVisible;
      if (CeilingLightAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(CeilingLightAnimation, controller,animationLayer);
    }
    if (controller.scenario.dynamicLayers.PlugbaseAnimation) {
      let plugbaseAnimation = controller.scenario.dynamicLayers.PlugbaseAnimation;
      SceneViewService.data.animationLayers[plugbaseAnimation.matchFeatureLayer] = new GraphicsLayer({
        id: plugbaseAnimation.id,
        title: plugbaseAnimation.title,
        listMode: "hide",
        matchFeatureLayer: plugbaseAnimation.matchFeatureLayer
      });
      let animationLayer = SceneViewService.data.animationLayers[plugbaseAnimation.matchFeatureLayer];
      animationLayer.visible = plugbaseAnimation.initialVisible;
      if (controller.scenario.dynamicLayers.PlugbaseAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(plugbaseAnimation, controller, animationLayer);
    }

    if (controller.scenario.dynamicLayers.BuiltinPlugAnimation) {
      let plugbaseAnimation = controller.scenario.dynamicLayers.BuiltinPlugAnimation;
      SceneViewService.data.animationLayers[plugbaseAnimation.matchFeatureLayer] = new GraphicsLayer({
        id: plugbaseAnimation.id,
        title: plugbaseAnimation.title,
        listMode: "hide",
        matchFeatureLayer: plugbaseAnimation.matchFeatureLayer
      });
      let animationLayer = SceneViewService.data.animationLayers[plugbaseAnimation.matchFeatureLayer];
      animationLayer.visible = plugbaseAnimation.initialVisible;
      if (controller.scenario.dynamicLayers.BuiltinPlugAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(plugbaseAnimation, controller, animationLayer);
    }

    //it is not a mandatory layer for every scenario
    //add detector graphic layer for animation
    if (controller.scenario.dynamicLayers.DetectorAnimation) {
      let detectorAnimation = controller.scenario.dynamicLayers.DetectorAnimation;
      SceneViewService.data.animationLayers[detectorAnimation.matchFeatureLayer] = new GraphicsLayer({
        id: detectorAnimation.id,
        title: detectorAnimation.title,
        listMode: "hide",
        matchFeatureLayer: detectorAnimation.matchFeatureLayer
      });
      let animationLayer = SceneViewService.data.animationLayers[detectorAnimation.matchFeatureLayer];
      animationLayer.visible = detectorAnimation.initialVisible;
      if (controller.scenario.dynamicLayers.DetectorAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(detectorAnimation, controller, animationLayer);
    }


       // add water tank graphic layer for animation
    if (controller.scenario.dynamicLayers.WaterTankAnimition) {
      controller.waterTankGraphicLayer = new GraphicsLayer({
        id: controller.scenario.dynamicLayers.WaterTankAnimition.id,
        title: controller.scenario.dynamicLayers.WaterTankAnimition.title,
        listMode: "hide",
        matchFeatureLayer: controller.scenario.dynamicLayers.WaterTankAnimition.matchFeatureLayer
      });
      controller.waterTankGraphicLayer.visible = controller.scenario.dynamicLayers.WaterTankAnimition.initialVisible;
      if (controller.scenario.dynamicLayers.WaterTankAnimition.display === "sharedLayer") {
        controller.map.add(controller.waterTankGraphicLayer);
      }
      pushLayerToController(controller.scenario.dynamicLayers.WaterTankAnimition, controller, controller.waterTankGraphicLayer);
    }

    if (controller.scenario.dynamicLayers.WaterSensorAnimation) {
      controller.waterSensorGraphicLayer = new GraphicsLayer({
        id: controller.scenario.dynamicLayers.WaterSensorAnimation.id,
        title: controller.scenario.dynamicLayers.WaterSensorAnimation.title,
        listMode: "hide",
        matchFeatureLayer: controller.scenario.dynamicLayers.WaterSensorAnimation.matchFeatureLayer,
        geometrySource:controller.scenario.dynamicLayers.WaterSensorAnimation.geometrySource
      });
      if (controller.scenario.dynamicLayers.WaterSensorAnimation.display === "sharedLayer") {
        controller.map.add(controller.waterSensorGraphicLayer);
      }
      pushLayerToController(controller.scenario.dynamicLayers.WaterSensorAnimation, controller, controller.waterSensorGraphicLayer);
    }

           // add power 3D graphic layer for animation
    if (controller.scenario.dynamicLayers.Power3DAnimition) {
      controller.Power3DGraphicLayer = new GraphicsLayer({
        id: controller.scenario.dynamicLayers.Power3DAnimition.id,
        title: controller.scenario.dynamicLayers.Power3DAnimition.title,
        listMode: "hide",
        matchFeatureLayer: controller.scenario.dynamicLayers.Power3DAnimition.matchFeatureLayer
      });
      controller.Power3DGraphicLayer.visible = controller.scenario.dynamicLayers.Power3DAnimition.initialVisible;
      if (controller.scenario.dynamicLayers.Power3DAnimition.display === "sharedLayer") {
        controller.map.add(controller.Power3DGraphicLayer);
      }
      pushLayerToController(controller.scenario.dynamicLayers.Power3DAnimition, controller, controller.Power3DGraphicLayer);
    }

    // add smoke detector graphic layer for animation
    if (controller.scenario.dynamicLayers.SmokeDetectorAnimation) {
      let SmokeDetectorAnimation = controller.scenario.dynamicLayers.SmokeDetectorAnimation;
      SceneViewService.data.animationLayers[SmokeDetectorAnimation.matchFeatureLayer]= new GraphicsLayer({
        id: SmokeDetectorAnimation.id,
        title: SmokeDetectorAnimation.title,
        listMode: "hide",
        matchFeatureLayer: SmokeDetectorAnimation.matchFeatureLayer,
        visible: SmokeDetectorAnimation.initialVisible
      });
      let animationLayer = SceneViewService.data.animationLayers[SmokeDetectorAnimation.matchFeatureLayer];
      if (controller.scenario.dynamicLayers.SmokeDetectorAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(SmokeDetectorAnimation, controller, animationLayer);
    }

    // add parking lot graphic layer for animation
    if (controller.scenario.dynamicLayers.ParkinglotAnimation) {
      let ParkinglotAnimation = controller.scenario.dynamicLayers.ParkinglotAnimation;
      SceneViewService.data.animationLayers[ParkinglotAnimation.matchFeatureLayer]= new GraphicsLayer({
        id: ParkinglotAnimation.id,
        title: ParkinglotAnimation.title,
        listMode: "hide",
        matchFeatureLayer: ParkinglotAnimation.matchFeatureLayer,
        visible: ParkinglotAnimation.initialVisible
      });
      let animationLayer = SceneViewService.data.animationLayers[ParkinglotAnimation.matchFeatureLayer];
      if (controller.scenario.dynamicLayers.ParkinglotAnimation.display === "sharedLayer") {
        controller.map.add(animationLayer);
      }
      pushLayerToController(ParkinglotAnimation, controller, animationLayer);
    }

 
  }


  function pushLayerToController(layerConfig, controller, layer) {
    if (layerConfig.display.indexOf("indoorModelLayer") >= 0) {
      controller.indoorModelLayersContainer.layers.push(layer);
      controller.indoorModelLayersContainer.length += 1;
      controller.indoorModelLayersContainer.camPositions.push(layerConfig.init_camera_pos);
    } else if (layerConfig.display.indexOf("indoorSharedLayer") >= 0) {
      controller.indoorSharedLayersContainer.layers.push(layer);
      controller.indoorSharedLayersContainer.length += 1;
    } else if (layerConfig.display.indexOf("outdoorModelLayer") >= 0) {
      controller.outdoorModelLayersContainer.layers.push(layer);
      controller.outdoorModelLayersContainer.length += 1;
    } else if (layerConfig.display.indexOf("sharedLayer") >= 0) {
      controller.sharedLayersContainer.layers.push(layer);
      controller.sharedLayersContainer.length += 1;
    } else {
      console.error("Improper Display Label for " + layerConfig.title);
    }
  }

  //generate render for scenelayer
  function getUniqueValueRenderer() {
    let renderer = {
      type: "class-breaks",  // autocasts as new ClassBreaksRenderer()
      field: "Nbr of Floors",
      defaultSymbol: {
        type: "mesh-3d", // autocasts as new MeshSymbol3D()
        symbolLayers: [{
          type: "fill", // autocasts as new FillSymbol3DLayer()
          material: {
            color: [230, 230, 230, 0.7],
            // We are not interested in these buildings, but we keep them for context
            // We want to remove the texture so we set the colorMixMode to replace
            colorMixMode: "replace"
          }
        }]
      },
      classBreakInfos: [{
        minValue: 121,
        maxValue: 140,
        symbol: {
          type: "mesh-3d", // autocasts as new MeshSymbol3D()
          symbolLayers: [{
            type: "fill", // autocasts as new FillSymbol3DLayer()
            material: {
              color: "#F5D5A9",
              colorMixMode: "tint"
            }
          }]
        }
      },
      {
        minValue: 119,
        maxValue: 120,
        symbol: {
          type: "mesh-3d", // autocasts as new MeshSymbol3D()
          symbolLayers: [{
            type: "fill", // autocasts as new FillSymbol3DLayer()
            material: {
              color: "#B22222",
              colorMixMode: "tint"
            }
          }]
        }
      }]
    };

    return renderer;
  }

  return factory;

};
