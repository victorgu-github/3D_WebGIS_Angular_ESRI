/* eslint-disable no-unused-vars,vars-on-top */
'use strict';

module.exports = function ($scope, $rootScope, $translate, esriLoader, timerService, browserDetectionService, SceneViewService,
                           layerFactory, nodeListFactory, widgetFactory, externalRenderFactory, dataFactory, AccountService, 
                           CollectionUtils, Popup3DService, 3D_WebGIS_Angular_ESRI) {
  let self = this;
  let esriToken = CollectionUtils.getEsriToken();
  $scope.esriTokenExist = esriToken ? true : false;
  self.viewLoaded = false;
  self.data = SceneViewService.data;
  //set default scenario
  self.scenario = SceneViewService.getScenario();
  self.scenarios = AccountService.userInfo.settings.Scenarios;
  self.colorSetting = 3D_WebGIS_Angular_ESRI.COLOR_PALETTE;
  // prepare to pass scenario to other controller by $scope
  $scope.scenario = self.scenario;
  self.nodeQueryChanged = true;
  self.allNode = {
    visible: false,
    visibleIcon: "esri-icon-non-visible",
    counter: 0
  };
  // $scope.indoor = true;
  $scope.sceneTitle = "Indoor";
  $scope.backToBtnDisplay = false;
  self.indoor = false;

  $scope.isCellPhone = AccountService.userInfo.isCellPhone;

  //create two new array outdoorModelVisibility and indoorModelVisibility to record the
  //visibility status of outdoorModel and indoorModel
  self.outdoorModelVisibility = [];
  self.indoorModelVisibility = [];

  $scope.$on("$destroy", function() {
    timerService.clearIntervalObject(self.data.timerServices);
  });

  $scope.$on('IdleStart', function() {
    console.log("===============");
    console.log("Into idle mode.");
    console.log("===============");
  });

  $scope.$on('IdleTimeout', function() {
    console.log("===================");
    console.log("Force to logout after user idle timeout.");
    console.log("===================");
    AccountService.logout();
  });

  $scope.$on('IdleEnd', function() {
    console.log("User is back.");
  });

  // load esri modules
  esriLoader.require([
    'esri/Map',
    "esri/Graphic",
    "esri/symbols/WebStyleSymbol",
    "esri/widgets/Popup",
    "esri/views/3d/externalRenderers",
    "esri/geometry/SpatialReference",
    "esri/geometry/Multipoint",
    "esri/layers/ElevationLayer",
    "esri/layers/BaseElevationLayer",
    "esri/Viewpoint"
  ], function (Map, Graphic, WebStyleSymbol, Popup, externalRenderers, SpatialReference, Multipoint,ElevationLayer,BaseElevationLayer,Viewpoint) {
    //  check that the device/browser can support WebGL
    //  by inspecting the userAgent and
    //  by handling the scene view directive's on-error
    //self.showViewError = browserDetectionService.isMobile();
    self.onViewError = function () {
      self.showViewError = true;
    };
    let customElevationLayer=  CustomElevationBuilder();
    self.map = new Map({
      basemap: self.scenario.baseMap,
      ground: self.scenario.ground==="custom"?{ layers: [new customElevationLayer()]}:self.scenario.ground
    });

    self.layers = [];
    self.indoorSharedLayersContainer = {layers: [], length: 0};
    self.indoorModelLayersContainer = {layers: [], length: 0, camPositions: []};
    self.outdoorModelLayersContainer = {layers: [], length: 0};
    self.sharedLayersContainer = {layers: [], length: 0};

    self.camPosition;
    self.targetCamPositions = [];

    self.initScenario = function () {
      // Get active nodes and update to nodeList
      nodeListFactory.getNodeList(self);
      //initialize layers for this scenario
      if (!self.map) {
        self.map = new Map({
          basemap: self.scenario.baseMap,
          ground: self.scenario.ground==="custom"?{ layers: [new customElevationLayer()]}:self.scenario.ground
        });
      } else {
        self.map.removeAll();
        self.map.basemap = self.scenario.baseMap;
        if (self.scenario.ground==="custom") {
          self.map.ground.layers=[];
         
          self.map.ground.layers.add(new customElevationLayer());
        }
        else {
          self.map.ground = self.scenario.ground;
        }

      }
    };

    self.initScenario();

    self.onViewLoaded = function (view) {
      self.view = view;

      SceneViewService.authenticate().then(function () {
        return layerFactory.buildLayers(self);
      }).then(function () {
        SceneViewService.updateLayerList(self.map.layers, self.view, self.scenario);

        $rootScope.$broadcast('MapLayersInitialized', {
          mapLayers: self.map.layers,
          mapView: self.view,
          controller: self
        });
      }).then(function () {
        //just watch data change and then redraw.
        self.data.timerServices["Timer Service"] = timerService.updateViewFromNodeServer(self);


        self.view.environment.lighting.cameraTrackingEnabled = false;
        //self.view.environment.lighting.directShadowsEnabled=true;
        self.externalRenderers = externalRenderFactory.createExternalRenderer(self.view, externalRenderers, SpatialReference, Multipoint, self.scenario);
        externalRenderers.add(self.view, self.externalRenderers);
        //communicate with datatable
        $rootScope.$broadcast('syncLayerListDataTable', {
          dataTableLayers: layerFactory.dataTableLayers
        });

        // add real time layer to scope for watching purpose
        $scope.realtimeLayer = self.realtimeLayer;
      }).then(function () {

        $scope.$watch('realtimeLayer.visible', function (newVal) {
          if (newVal !== undefined) {
            // temporary disable for demo
            // $scope.historyLayer.toggleLayerVisibility(newVal);

            changeNodeListDisplayVisiblily();
          }
        });


        // self.realtimeLayer.watch('visible', function (evt) {
        //     // change node list visibility
        //     changeNodeListDisplayVisiblily();
        // });
      });

      $scope.$on("BackToGlobalScene", function (event, args) {
        switchView("outdoor");
      });

      // register controller to listen for click on data row event
      $scope.$on("zoomToFeature", function (event, arg) {
        //get the corresponding feature
        let targetFeature;
        let targetLayerView;
        let layerId = arg.layerId;
        let objectid = arg.data.objectid;
        let devEUI = arg.data.deviceeui;
        let selectedIndex = arg.rowIndex;
        let latitude;
        let longitude;
        let altitude;
        let rows = document.querySelectorAll('.dynamic-data-table div.active table tbody tr');

        for (let i = 0; i < rows.length; i++) {
          if (i === selectedIndex) {
            rows[i].classList.add('selected');
          } else {
            rows[i].classList.remove('selected');
          }
        }

        //zoom to object
        if (layerId === 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER) {
          latitude = arg.data.Latitude;
          longitude = arg.data.Longitude;
        } else {
          //find feature based on layer id and objectid
          self.view.layerViews.items.filter(item => item.layer.id === layerId)
            .forEach(item => {
              if (item.controller) {//it is a feature layer's layerview
                targetLayerView = item;
                // Filter will return one-element array
                item.controller.graphics.items.filter(item => {
                  return item.attributes.objectid === objectid;
                }).forEach(item => {
                  //note: right now cannot find the type attribute in indoor2D layer,
                  //      so we use targetFeature.geometry.centroid to determine if
                  //      object is a point or a polygon.
                  targetFeature = item;
                  if (targetFeature.geometry.hasZ) {
                    altitude = targetFeature.geometry.z;
                  }
                  if (targetFeature.geometry.centroid) { //polygon
                    latitude = targetFeature.geometry.centroid.latitude;
                    longitude = targetFeature.geometry.centroid.longitude;
                  } 
                  else if (targetFeature.geometry.paths) { //polyline
                    latitude = targetFeature.geometry.extent.center.latitude;
                    longitude = targetFeature.geometry.extent.center.longitude;
                    altitude = targetFeature.geometry.extent.center.z;
                  }
                  else { //point
                    latitude = targetFeature.geometry.latitude;
                    longitude = targetFeature.geometry.longitude;
                  }
           
                });
              }
            });
        }

        // cannot use goto feature since it is not working with Z value properly, i.e., solar panel
        //   self.view.goTo({
        //     target: targetFeature
        //   })
        if (altitude) {
          //after addomg tilt and heading, no need to zoom to xy first
             self.view.goTo({
                position: { // autocasts as new Point()
                  x: longitude,
                  y: latitude,
                  z: altitude
                },
                tilt:0,
                heading:0
              }).then(function () {
                if (self.view.zoom > 24) //cannot set zoom or scale on go to xyz. so capture zoom value after zooming and reset to the max zoom
                {
                  self.view.zoom = 24;
                }
              });

        } else {
          self.view.goTo(
            {
              center: [longitude, latitude],
              zoom: self.view.zoom < 22 ? self.view.zoom + 2 : 24
            }
          );
        }
        // if a feature is already highlighted, then remove the highlight
        if (self.highlightSelect) {
            self.highlightSelect.remove();
        }
        //highlight zoomeed feature
        if (targetFeature && targetLayerView) {
          self.highlightSelect = targetLayerView.highlight(targetFeature);
        }
        //Object popup, dealing with popup according to the object's tab name
        //recreate popup obj
        let popup = SceneViewService.createNewDatatablePopup(Popup, longitude, latitude, devEUI, self);
        let popupTemplate = Popup3DService.getPopupTemplate(layerId, self.scenario);

        Popup3DService.popupFromDataTable(layerId, arg.data, popup, self, popupTemplate);
      });

      //init prelocation for track
      if (self.view && !self.preLocation) {
        self.preLocation = self.view.center;
      }
      self.view.watch('center,zoom,scale,rotation,viewpoint', function (evt) {
        $scope.$applyAsync('self.view');
        $scope.$applyAsync('self.view.viewpoint');
        $scope.$applyAsync('self.view.viewpoint.carema.position');
      });

      self.view.watch('zoom', function (evt) {

        for (let i = 0; i < this.map.layers.length; i++) {
          //the problem is gone once seperate into 3 scenelayers. may not need the code below
          //turn off u of c scenelayer if zoom out 14.8
          if (this.map.layers.items[i].title === "University of Calgary" && evt < 14.8) {
            this.map.layers.items[i].visible = false;
          }
          //turn on u of c scenelayer if zoom in 14.8
          else if (this.map.layers.items[i].title === "University of Calgary" && evt >= 14.8 && this.preZoom < 14.8) {
            this.map.layers.items[i].visible = true;
          }
        }
        this.preZoom = evt;
      });

      self.viewLoaded = true;

      widgetFactory.addWidgetsToMap(self);

      // when user click in the view, it automatically close expanded widgets
      self.view.on('click', function (evt) {
        try {
          // get the click point of the click event
          let screenPoint = {
            x: evt.x,
            y: evt.y
          };
          //end follow by click anywhere
          self.followID = null;
          // if a feature is already highlighted, then remove the highlight
          if (self.highlightSelect) {
            self.highlightSelect.remove();
          } 
          SceneViewService.createNewEsriPopup(Popup, evt.mapPoint.longitude, evt.mapPoint.latitude, self);//recreate popup obj and assign to view.popup

          // perform a hitTest to retrieve the clicked building
          self.view.hitTest(screenPoint).then(function (response) {
            layerFactory.hitTestHandler(response, self, evt);
          });
        }
        catch (ex) {
          console.log(ex);
        }

      });

      // The map handles the layers' data, while the view
      // and layer views take care of renderering the layers.
      view.on('layerview-create', function (evt) {
        console.log('LayerView created!', evt.layerView);
      });
      let pos = self.scenario.init_camera_pos.center.concat(self.scenario.init_camera_pos.zoomZvalue);
      let initialViewpoint = new Viewpoint ({
        camera: {
          position: pos,
          tilt: self.scenario.init_camera_pos.tilt,
          heading: self.scenario.init_camera_pos.heading
        }
     });
      self.view.goTo(initialViewpoint);
      // view.goTo({
      //   center: self.scenario.init_camera_pos.center,
      //   heading: self.scenario.init_camera_pos.heading,
      //   zoom: self.scenario.init_camera_pos.zoom
      // });
      //pop up
      let popup = view.popup;
      popup.viewModel.on("trigger-action", function (event) {
        self.initPopup(event, self);
      }.bind(self));
    };

    self.onScenarioClick = function (scenario) {
      self.scenarios.forEach(function (scenario) {
        scenario.isActive = false;
      });
      self.scenario = scenario;
      self.scenario.isActive = true;

      // Set current APP ID for user
      AccountService.setAppIDs(scenario);

      self.indoor = false;
      widgetFactory.changeSearchSource(self);
      // pass scenario to other controller by $scope
      $scope.scenario = self.scenario;
      //apply new scenario setting and layer for externalRenderers
      self.externalRenderers.scenarioConfig = self.scenario;
      self.externalRenderers.streetLampLayer = null;
      self.externalRenderers.ceilingLightLayer = null;
      self.externalRenderers.smokeDetectorLayer = null;
      self.initScenario();
      let pos = self.scenario.init_camera_pos.center.concat(self.scenario.init_camera_pos.zoomZvalue);
      let initialViewpoint = new Viewpoint ({
        camera: {
          position: pos,
          tilt: self.scenario.init_camera_pos.tilt,
          heading: self.scenario.init_camera_pos.heading
        }
     });
      self.homeBtn.viewpoint =initialViewpoint;
      self.view.goTo(initialViewpoint);

      layerFactory.dataTableLayers.length = 0;
      self.layers.length = 0;
      resetLayerContainers();
      self.map.removeAll();
      self.map.basemap = self.scenario.baseMap;

      layerFactory.buildLayers(self).then(function () {
        SceneViewService.updateLayerList(self.map.layers, self.view, self.scenario);

        $rootScope.$broadcast('MapLayersInitialized', {
          mapLayers: self.map.layers,
          mapView: self.view,
          controller: self
        });
      }).then(function () {
        $rootScope.$broadcast('syncLayerListDataTable', {
          dataTableLayers: layerFactory.dataTableLayers
        });
      }).then(function () {
        $scope.realtimeLayer = self.realtimeLayer;
        $scope.$watch('realtimeLayer.visible', function (newVal) {
          if (newVal !== undefined) {
            changeNodeListDisplayVisiblily();
          }
        });
      });

    

      self.view.popup.visible = false;
    };

    self.onNodeClick = function (node) {
      node.display = !node.display;
      if (node.display) {
        node.visibleIcon = 'esri-icon-visible';
        self.allNode.counter += 1;
      }
      else {
        node.visibleIcon = "esri-icon-non-visible";
        self.allNode.counter -= 1;
      }
      if (self.allNode.counter === 0) {
        self.allNode.visibleIcon = "esri-icon-non-visible";
        self.allNode.visible = false;
      } else {
        self.allNode.visibleIcon = "esri-icon-visible";
        self.allNode.visible = true;
      }
      self.nodeQueryChanged = true;
      self.realtimeLayer.graphics.forEach(function (item) {
        if (item.attributes['Name'] === node.nodeData.node_mac) {
          item.visible = node.display;
        }
      });
      self.historyLayer.graphics.forEach(function (item) {
        if (item.attributes['Name'] === node.nodeData.node_mac) {
          item.visible = node.display;
        }
      });

    };

    self.updateNodes = function (data) {
      if (data.content.latestApeRecords)//previous design for showing ape records as real time layer
      {
        nodeListFactory.updateNodeInfo(self, data);
      }
      else { //hard code for mengyang
        self.mengyangData = data.content;
      }
    };

    self.onAllNodeClick = function () {
      if (self.allNode.visibleIcon === "esri-icon-non-visible") {
        self.allNode.visibleIcon = "esri-icon-visible";
        self.allNode.visible = true;
        self.allNode.counter = self.nodeList.length;
      }
      else {

        self.allNode.visibleIcon = "esri-icon-non-visible";
        self.allNode.visible = false;
        self.allNode.counter = 0;
      }

      self.nodeList.forEach(function (node) {
        node.display = self.allNode.visible;
        node.visibleIcon = self.allNode.visibleIcon;
      });
      self.nodeQueryChanged = true;

      self.realtimeLayer.graphics.forEach(function (item) {
        item.visible = self.allNode.visible;
      });
      self.historyLayer.graphics.forEach(function (item) {
        item.visible = self.allNode.visible;
      });
    };

    self.initPopup = function (event, self, devEUI) {
      if (event.action.id === "follow") {
        self.followID = event.action.followID;
      }
      else if (event.action.id === "contorlLamp") {
        self.waitingTimes = 60;
        self.targetObjectID = event.action.objectID;
        let deviceEUI = event.action.devEUI;
        if (deviceEUI) {
          deviceEUI = deviceEUI.replace(/-/g, "").toLowerCase();
        }

        if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_OFF")) {
          //call turn off first then keep checking status
          dataFactory.controlLoraDevice("streetlight", "turn_off", deviceEUI).then(function (data) {
            if (data.status === "success" && data.content.deviceStatuses[0].status === "Waiting") {
              for (let i = 0; i < self.view.streetLampLayer.dynData.length; i++) {
                if (self.view.streetLampLayer.dynData[i].attributes.objectid === self.targetObjectID) {
                  self.view.streetLampLayer.dynData[i].attributes.dynStatus = data.content.deviceStatuses[0].status;
                  self.view.streetLampLayer.refreshExRender = true;
                  break;

                }
              }
            }
          }.bind(self));
        }
        else if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_ON")) {
          //call turn on first then keep checking status
          dataFactory.controlLoraDevice("streetlight", "turn_on", deviceEUI).then(function (data) {
            if (data.status === "success" && data.content.deviceStatuses[0].status === "Waiting") {
              for (let i = 0; i < self.view.streetLampLayer.dynData.length; i++) {
                if (self.view.streetLampLayer.dynData[i].attributes.objectid === self.targetObjectID) {
                  self.view.streetLampLayer.dynData[i].attributes.dynStatus = data.content.deviceStatuses[0].status;
                  self.view.streetLampLayer.refreshExRender = true;
                  break;

                }
              }
            }
          }.bind(self));
        }

      }
      else if (event.action.id === "contorlPlugbase") {
        self.waitingTimes = 60;
        self.targetPlugbase = event.target.features[0];
        let deviceType = event.action.deviceType;
        let deviceEUI;
        if (event.target.features[0] && event.target.features[0].length !== 0) {
          deviceEUI = event.target.features[0].attributes[3D_WebGIS_Angular_ESRI.DEVICE_EUI];
        } else {
          deviceEUI = devEUI;
        }
        if (deviceEUI) {
          deviceEUI = deviceEUI.replace(/-/g, "").toLowerCase();
        }
        //use graphic layer switcherPowerlayer since it is updated by nodeserver
        if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_OFF")) {
          //call turn off first then keep checking status
          dataFactory.controlLoraDevice(deviceType, "turn_off", deviceEUI).then(function (data) {

          }.bind(self));
        }
        else if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_ON")) //turn on
        {
          //call turn on first then keep checking status
          dataFactory.controlLoraDevice(deviceType, "turn_on", deviceEUI).then(function (data) {

          }.bind(self));
        }

      }
      else if (event.action.id === "contorlCeilingLightGroup")
      {
           // if a feature is already highlighted, then remove the highlight
           if (self.highlightSelect) {
            self.highlightSelect.remove();
          }
          self.highlightSelect = event.action.lyrView.highlight(event.action.features);
          self.view.goTo({
            target: event.action.features,
            tilt: 0
          }, {
            duration: 1000,
            easing: "in-out-expo"
          });
          setTimeout(function(){ 
            self.highlightSelect.remove();
            if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_ON_GROUP"))
            {
              if (confirm($translate.instant("DEVICE_CONTROL.DEVICE_GROUP_ON_CONFIRM")) === true) {
                dataFactory.controlLoraDevice("ceilinglight", "turn_on", event.action.features[0].attributes[3D_WebGIS_Angular_ESRI.DEVICE_EUI],event.action.features[0].attributes.relay_number).then(function (data) {
                            });
               }
            }
            else if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_OFF_GROUP"))
            {
              if (confirm($translate.instant("DEVICE_CONTROL.DEVICE_GROUP_OFF_CONFIRM")) === true) {
                dataFactory.controlLoraDevice("ceilinglight", "turn_off", event.action.features[0].attributes[3D_WebGIS_Angular_ESRI.DEVICE_EUI],event.action.features[0].attributes.relay_number).then(function (data) {
                            });
               }
            }
          }, 1000);
      }
      else if (event.action.id === "contorlCeilingLight")
      {
           // if a feature is already highlighted, then remove the highlight
           if (self.highlightSelect) {
            self.highlightSelect.remove();
          }
          if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_ON"))
          {
              dataFactory.controlLoraDevice("ceilinglight", "turn_on", event.action.features[0].attributes[3D_WebGIS_Angular_ESRI.DEVICE_EUI],event.action.features[0].attributes.relay_number).then(function (data) {
                
                          }.bind(self));
          }
          else if (event.action.title === $translate.instant("DEVICE_CONTROL.TURN_OFF"))
          {
              dataFactory.controlLoraDevice("ceilinglight", "turn_off", event.action.features[0].attributes[3D_WebGIS_Angular_ESRI.DEVICE_EUI],event.action.features[0].attributes.relay_number).then(function (data) {
                
                          }.bind(self));
          }
      }
      else if (event.action.id === "gotoinsidelvl") {
        // var level = event.action.title.substring(event.action.title.length-2);
        let tokenArray = event.action.title.split(" ");
        let level = tokenArray[tokenArray.length - 1].toLowerCase();
        self.targetBuildingID = normalToLowerSnakeCase(self.selectedBuilding.attributes.name) + "_level_" + level;
        switchView("indoor");

        if (self.realtimeLayer) {
          self.prevRealtimeLayerVisiblity = self.realtimeLayer.visible;
          if (self.realtimeLayer.visible) {
            toggleRealtimeLayerVisibility();
          }
        }
      }
      else if (event.action.id === "GatewayHistory") {
        let seriesData = self.histiryGWsensorData;
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id,
          seriesData: seriesData
        });
        angular.element('#chartModal').modal('toggle');
      }
      else if (event.action.id === "EnergyUsageHistory") {
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id,
          devEUI: event.action.devEUI,
          deviceType: event.action.deviceType
        });
        angular.element('#chartModal').modal('toggle');
      }
      else if (event.action.id === "DetectorHistory") {
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id,
          devEUI: event.action.devEUI
        });
        angular.element('#chartModal').modal('toggle');
      }
      else if (event.action.id === "WaterSensorHistory") {
        // Draw river quality history chart
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id
        });
        angular.element('#chartModal').modal('toggle');
      }
      else if (event.action.id === "WaterTankHistory") {
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id
        });
        angular.element('#chartModal').modal('toggle');
      }
      else if (event.action.id === "LoRaGatewayHistory") {
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id
        });
        angular.element('#chartModal').modal('toggle');
      }
      else if (event.action.id === "SmokeDetectorHistory") {
        $rootScope.$broadcast('initializeChart', {
          chartTitle: event.target.title,
          chartId: event.action.id,
          devEUI: event.action.devEUI
        });
        angular.element('#chartModal').modal('toggle');
      }
      // make popup invisible once user chose an action
      self.view.popup.visible = false;
    };

    function toggleRealtimeLayerVisibility() {
      // only toggle visiblity if realtime layer is previously visible
      if (self.prevRealtimeLayerVisiblity) {
        self.realtimeLayer.visible = !self.realtimeLayer.visible;
      }
    }

    function changeNodeListDisplayVisiblily() {
      if (self.realtimeLayer.visible) {
        self.allNode.visibleIcon = "esri-icon-visible";
        self.allNode.visible = true;
        self.allNode.counter = self.nodeList.length;
      } else {
        self.allNode.visibleIcon = "esri-icon-non-visible";
        self.allNode.visible = false;
        self.allNode.counter = 0;
      }
      self.nodeList.forEach(function (node) {
        node.display = self.realtimeLayer.visible;
        node.visibleIcon = self.allNode.visibleIcon;
      });
      $scope.$applyAsync('self.nodeList');
      self.nodeQueryChanged = true;
    }

    function switchView(view) {

      let baseMap = "";
      let cameraPosition;
      // Set length to zero will update layers references as well
      self.layers.length = 0;
      if (view === "indoor") {
        // set outdoorModel visibility false. Vic change: don't set outdoorModel visibility. they will be removed from map and once add back their visibility will remain as before.
        // for (let i = 0; i < self.outdoorModelLayersContainer.layers.length; i++) {
        //   self.outdoorModelLayersContainer.layers[i].visible = false;
        // }
  
        // find target indoor layers from indoorModelContainer; only turn on the exact matched one
        let defaultIndoorModel;
        for (let i = 0; i < self.indoorModelLayersContainer.length; i++) {
          let snakeCaseTitle = normalToLowerSnakeCase(self.indoorModelLayersContainer.layers[i].id);
          if (snakeCaseTitle === self.targetBuildingID) {//add default floor layer and set its visible to true
            $scope.sceneTitle = self.indoorModelLayersContainer.layers[i].title;
            self.indoorModelLayersContainer.layers[i].visible = true;
            defaultIndoorModel = self.indoorModelLayersContainer.layers[i];
            cameraPosition = self.indoorModelLayersContainer.camPositions[i];
            self.layers = self.layers.concat(self.indoorModelLayersContainer.layers[i]);
          } else if (snakeCaseTitle.indexOf(self.targetBuildingID)>-1){ //if that floor has more than one layer, add extra but set their visible to false
            self.indoorModelLayersContainer.layers[i].visible = false;
            self.layers = self.layers.concat(self.indoorModelLayersContainer.layers[i]);
          }
          else { //don't add the other floor layers and set their visible to false
            self.indoorModelLayersContainer.layers[i].visible = false;
          }
        }
        // add indoorSharedLayersContainer and  sharedLayersContainer for display
        self.layers = self.layers.concat(self.indoorSharedLayersContainer.layers,self.sharedLayersContainer.layers);
        // add related layer expressions
        if (defaultIndoorModel.relatedLayerExpressions&&defaultIndoorModel.relatedLayerExpressions.length>0)
        {
          for (let i=0; i< self.layers.length;i++)
          {
            let hasLayerExpression =false;
            for (let j=0; j< defaultIndoorModel.relatedLayerExpressions.length;j++)
            {
              if (self.layers[i].id === defaultIndoorModel.relatedLayerExpressions[j].relatedLayerID)
              {
                self.layers[i].definitionExpression=defaultIndoorModel.relatedLayerExpressions[j].definitionExpression;
                hasLayerExpression = true;
              }
            }
            if (!hasLayerExpression)
            {
              //remove expression left by other indoor model or outdoor
              self.layers[i].definitionExpression=null;
            }
          }
        }
        layerFactory.dataTableLayers = self.sharedLayersContainer.layers.concat(self.indoorSharedLayersContainer.layers);
        self.indoor = true;
        baseMap = self.scenario.indoorBaseMap;
      } else {
        // set indoor model visibility false
        for (let i = 0; i < self.indoorModelLayersContainer.layers.length; i++) {
          self.indoorModelLayersContainer.layers[i].visible = false;
        }

        // add layers for display
        for (let i = 0; i < self.outdoorModelLayersContainer.layers.length; i++) {
         // self.outdoorModelLayersContainer.layers[i].visible = true; Vic change: let its visiblity remain as before
          self.indoor = false;
          baseMap = self.scenario.baseMap;
          cameraPosition = self.scenario.init_camera_pos;
        }
        // should remove sharedLayers category since the layer's definitionExpression may be overwritten by indoor model
        layerFactory.dataTableLayers = self.sharedLayersContainer.layers.concat(self.outdoorModelLayersContainer.layers);
        self.layers = self.layers.concat(self.outdoorModelLayersContainer.layers, self.sharedLayersContainer.layers);
      }

      // clean layers fron current map
      self.map.removeAll();
      // add layers to map
      self.map.basemap = baseMap;
      self.map.addMany(self.layers);
      // set home button to proper extent
      let pos = cameraPosition.center.concat(cameraPosition.zoomZvalue);
      let initialViewpoint = new Viewpoint ({
        camera: {
          position: pos,
          tilt: cameraPosition.tilt,
          heading: cameraPosition.heading
        }
     });
      self.homeBtn.viewpoint = initialViewpoint;

      self.view.goTo({tilt: cameraPosition.tilt}, {animate: false});
      // can use the code below to activate a camera view change, but sometimes it will be off.
      // self.view.goTo(cameraPosition,{ animate: false});

      // signal changes to other components in the system
      SceneViewService.updateLayerList(self.map.layers, self.view, self.scenario);

      $rootScope.$broadcast('MapLayersInitialized', {
        mapLayers: self.map.layers,
        mapView: self.view,
        controller: self
      });

      $rootScope.$broadcast('syncLayerListDataTable', {
        dataTableLayers: layerFactory.dataTableLayers
      });
    }

    self.backToGlobalScene = function () {
      switchView("outdoor");
    };

    function normalToLowerSnakeCase(input) {
      return input.toLowerCase().replace(/ +/g, "_");
    }

    function resetLayerContainers() {
      self.indoorSharedLayersContainer = {layers: [], length: 0};
      self.indoorModelLayersContainer = {layers: [], length: 0, camPositions: []};
      self.outdoorModelLayersContainer = {layers: [], length: 0};
      self.sharedLayersContainer = {layers: [], length: 0};
    }

    function CustomElevationBuilder() {
        //////////////////////////////////////////////
      //
      //   Create a subclass of BaseElevationLayer
      //
      /////////////////////////////////////////////

      let ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({

        // Add an exaggeration property whose value will be used
        // to multiply the elevations at each tile by a specified
        // factor. In this case terrain will render 100x the actual elevation.

        properties: {
          flatElevation: 32.5, //custom for huizhou area for now. still show the mountain and flat the others. that is why set threshold at 60
          threshold:60
        },

        // The load() method is called when the layer is added to the map
        // prior to it being renderered in the view.

        load: function() {
          this._elevation = new ElevationLayer({
            url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
          });

          // wait for the elevation layer to load before resolving load()
          this.addResolvingPromise(this._elevation.load());
        },

        // Fetches the tile(s) visible in the view
        fetchTile: function(level, row, col) {
          // calls fetchTile() on the elevationlayer for the tiles
          // visible in the view
          return this._elevation.fetchTile(level, row, col)
            .then(function(data) {

              let flatElevation = this.flatElevation;
              let threshold = this.threshold;
              // `data` is an object that contains the
              // the width of the tile in pixels,
              // the height of the tile in pixels,
              // and the values of each pixel
              data.values.forEach(function(value, index, values) {
              if (value<threshold) {
                values[index] = flatElevation;
              }
              
              });

              return data;
            }.bind(this));
        }
      });
      return ExaggeratedElevationLayer;
    }

  });
};
