/* eslint-disable no-unused-vars */
'use strict';

module.exports = function (esriLoader, appConfig, AccountService) {

  let factory = {};

  factory.addWidgetsToMap = function (controller) {
    esriLoader.require([
      "esri/widgets/LayerList",
      "esri/widgets/Home",
      "esri/widgets/Expand",
      "esri/widgets/BasemapGallery",
      "esri/widgets/Search",
      "esri/layers/FeatureLayer",
      "esri/symbols/PictureMarkerSymbol",
      "esri/Viewpoint",
      "esri/widgets/Fullscreen"
    ], function (LayerList, Home, Expand, BasemapGallery, Search, FeatureLayer, PictureMarkerSymbol,Viewpoint,Fullscreen) {

      let pos = controller.scenario.init_camera_pos.center.concat(controller.scenario.init_camera_pos.zoomZvalue);
      let initialViewpoint = new Viewpoint ({
        camera: {
          position: pos,
          tilt: controller.scenario.init_camera_pos.tilt,
          heading: controller.scenario.init_camera_pos.heading
        }
     });
      // add home, full screen widgets
      controller.homeBtn = new Home({
        view: controller.view,
        viewpoint: initialViewpoint
      });
      controller.view.ui.add(controller.homeBtn, "top-left");
     
      controller.fullscreen = new Fullscreen({
        view: controller.view
      });
      controller.view.ui.add(controller.fullscreen, "top-left");
      // to a bug when exit from full screen, nned to manually ajust map css
      let onFullScreenChange = function(){                                           
        let fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        if (fullscreenElement==null) //exit from full screen
        {
          this.view.container.style.cssText="";
        }                                                                  
     }.bind(controller);  
     document.addEventListener("fullscreenchange", onFullScreenChange, false);
     document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
     document.addEventListener("mozfullscreenchange", onFullScreenChange, false);



      // // initialize 3D measurement widget
      // var measureWidget = new DirectLineMeasurement3D({
      //   view: controller.view
      // });
      // controller.view.ui.add(measureWidget, "top-right");

      controller.searchWidget = new Search({
        view: controller.view,
        allPlaceholder: "All Feature Layers",
        sources: []
      });
      for (let i = 0; i < controller.scenario.scenario3Dlayers.length; i++) {
        if (controller.scenario.scenario3Dlayers[i].type === 'FeatureLayer') {
          let layer = new FeatureLayer({
            id: controller.scenario.scenario3Dlayers[i].id,
            title: controller.scenario.scenario3Dlayers[i].title,
            url: AccountService.userInfo.settings.featureLayerBaseURL + controller.scenario.scenario3Dlayers[i].url,
            outFields: ["*"]
          });
          let searchItem = {
            featureLayer: layer,
            searchFields: controller.scenario.scenario3Dlayers[i].searchAttributes,
            displayField: controller.scenario.scenario3Dlayers[i].searchDisplayAttr,
            exactMatch: false,
            outFields: ["*"],
            name: controller.scenario.scenario3Dlayers[i].title
          };
          controller.searchWidget.sources.push(searchItem);
        }
      }
      // Add the search widget to the top left corner of the view
      controller.view.ui.add(controller.searchWidget, {
        position: "top-right"
      });
      controller.searchWidget.on("search-complete", function (event) {
        // The results are stored in the event Object[]
        console.log("Results of the search: ", event);
      });
    });
  };

  factory.changeSearchSource = function (controller) {
    esriLoader.require([
      "esri/widgets/Home",
      "esri/widgets/Search",
      "esri/layers/FeatureLayer"
    ], function (Home, Search, FeatureLayer) {
      controller.searchWidget.sources = [];
      for (let i = 0; i < controller.scenario.scenario3Dlayers.length; i++) {
        if (controller.scenario.scenario3Dlayers[i].type === 'FeatureLayer') {
          let layer = new FeatureLayer({
            id: controller.scenario.scenario3Dlayers[i].id,
            title: controller.scenario.scenario3Dlayers[i].title,
            url: AccountService.userInfo.settings.featureLayerBaseURL + controller.scenario.scenario3Dlayers[i].url,
            outFields: ["*"]
          });
          let searchItem = {
            featureLayer: layer,
            searchFields: controller.scenario.scenario3Dlayers[i].searchAttributes,
            displayField: controller.scenario.scenario3Dlayers[i].searchDisplayAttr,
            exactMatch: false,
            outFields: ["*"],
            name: controller.scenario.scenario3Dlayers[i].title
          };
          controller.searchWidget.sources.push(searchItem);
        }
      }

    });
  };
  return factory;
};
