'use strict';

module.exports = function ($q, esriLoader) {

  const colors = {
    RED: [255, 0, 0, 1],
    SEMI_TRANSPARENT_RED: [255, 0, 0, 0.7],
    ORANGE: [255, 165, 0, 1],
    SEMI_TRANSPARENT_ORANGE: [255, 165, 0, 0.7],
    YELLOW: [255, 255, 0, 1],
    BLUE: [30,144,255,1],
    GREEN: [0, 255, 0, 1],
    SEMI_TRANSPARENT_GRASS: [0, 128, 0, 0.7],
    GREY:[192,192,192],
    LightHigh:[255, 147, 41,1],
    LightMedinum:[255, 197, 143,1],
    LightLow:[255, 214, 170,1],
    LightOff:[0,0,0,0]
  };
  let animation3DCount = 0;
  this.process = function (self) {
    esriLoader.require([
      "esri/Graphic",
      "esri/geometry/Point",
      "esri/geometry/Polyline",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/PointSymbol3D",
      "esri/symbols/ObjectSymbol3DLayer"
    ], function (Graphic, Point, Polyline, SimpleLineSymbol, SimpleMarkerSymbol,PointSymbol3D, ObjectSymbol3DLayer) {

      let latestGraphics = [];
      let listLength = self.nodeList.length;
 
      // add sheep obj moving demo here for scenario 8 and 7
      if (self.scenario.scenarioID === 8) {
        let pointSymbol = build3DmodelSymbol(PointSymbol3D, ObjectSymbol3DLayer);
        let data = {
          spatial_info: {
            pos_lon: 117.818,
            pos_lat: 41.745
          },
          node_mac: "牛羊跟踪器",
          date: new Date()
        };
        for (let i=0; i<self.mengyangData.length;i++)
        {
          data.spatial_info.pos_lon = self.mengyangData[i].longitude;
          data.spatial_info.pos_lat = self.mengyangData[i].latitude;
          data.node_mac = self.mengyangData[i].macAddress;
          let point = new Point(buildPoint(self, data));
          let pointGraphic = new Graphic(buildGraphic(point, data, pointSymbol));
          latestGraphics.push(pointGraphic);
        }
      }
      else if (self.scenario.scenarioID === 7) {
        let num = 50;
        let data = {
          spatial_info: {
            pos_lon: 121.47940,
            pos_lat: 31.23880
          },
          node_mac: "",
          date: ""
        };
        while (num > 0) {
          data.spatial_info.pos_lon = data.spatial_info.pos_lon - (Math.random() * 0.002 - 0.001);
          data.spatial_info.pos_lat = data.spatial_info.pos_lat - (Math.random() * 0.003 - 0.001);
          let point = new Point(buildPoint(self, data));
          let color = self.nodeList[Math.floor(Math.random() * 5)].color;
          let pointSymbol = new SimpleMarkerSymbol(buildMarkerSymbol2(color));
          let pointGraphic = new Graphic(buildGraphic(point, data, pointSymbol));
          latestGraphics.push(pointGraphic);
          num--;
        }
      }
      else // ble real time layer
      {
        for (let i = 0; i < listLength; i++) {
          if (self.nodeList[i].display) {
            let data = self.nodeList[i].nodeData;
            if (!data.spatial_info) {
              continue;
            }
  
            let point = new Point(buildPoint(self, data));
            let color = self.nodeList[i].color;
            let pointSymbol = new SimpleMarkerSymbol(buildMarkerSymbol(color));
            let pointGraphic = new Graphic(buildGraphic(point, data, pointSymbol));
            latestGraphics.push(pointGraphic);
            //update track
            updateTrack(self, pointGraphic, point);
            //update history line
            let simpleLineSymbol = new SimpleLineSymbol(buildSimpleLineSymbol(color));
            addPointToLineLayer(self, pointGraphic, simpleLineSymbol);
  

          }
        }

        // make not selected node history track to be invisible
        updateHistoryTrackVisibility(self);
      }
      
      self.realtimeLayer.graphics = latestGraphics;
    });
  };
  
  this.processCeilingLight = function (self) {
    esriLoader.require([
      "esri/Graphic",
      "esri/symbols/PolygonSymbol3D",
      "esri/symbols/FillSymbol3DLayer",
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ], function (Graphic, PolygonSymbol3D, FillSymbol3DLayer, Query, QueryTask) {
      // check whether detector layer in map and visible
      let queryURL = "";
      let definitionExpression;
      let ceilingLightLayer;

      for (let i = 0; i < self.layers.length; i++) {
        if (self.layers[i].id === self.ceilingLightGraphicLayer.matchFeatureLayer
          && self.layers[i].visible && self.layers[i].type === "feature") {
          ceilingLightLayer = self.layers[i];
          definitionExpression = self.layers[i].definitionExpression;
          queryURL = self.ceilingLightGraphicLayer.geometrySource;
        }
      }

      if (!ceilingLightLayer) {
        self.ceilingLightGraphicLayer.graphics = [];
        return;
      }


      if (self.ceilingLightGraphicLayer.graphics.length === 0) {
        //load graphics into ceilingLightGraphicLayer and then set symbol based on the value got from nodeserver
        let qTask = new QueryTask({
          url: queryURL
        });
        let params = new Query({
          returnGeometry: true,
          outFields: ["*"],
          returnZ: true
        });
        if (definitionExpression)
        {
          params.where = definitionExpression;
        }
        else
        {
          params.where = "1=1";
        }

        qTask.execute(params).then(function (results) {
          self.ceilingLightGraphicLayer.graphics = [];
          for (let i = 0; i < results.features.length; i++) {
            let g = new Graphic();
            g.geometry = results.features[i].geometry;
            g.attributes = results.features[i].attributes;
            self.ceilingLightGraphicLayer.graphics.push(g);
          }
          //get value from node server
          self.ceilingLightGraphicLayer.graphics = buildGraphicsForCeilingLight(self.view.popup, self.ceilingLightGraphicLayer.graphics,
            Graphic, PolygonSymbol3D, FillSymbol3DLayer);
        });
      } else {
        //set symbol based on the value got from nodeserver
        self.ceilingLightGraphicLayer.graphics = buildGraphicsForCeilingLight(self.view.popup, self.ceilingLightGraphicLayer.graphics,
          Graphic, PolygonSymbol3D, FillSymbol3DLayer);
      }


    });
  };

  this.processWaterTank = function (self) {
    esriLoader.require([
      "esri/Graphic",
      "esri/symbols/PointSymbol3D",
      "esri/symbols/ObjectSymbol3DLayer",
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask",
    ], function (Graphic, PointSymbol3D, ObjectSymbol3DLayer, Query, QueryTask) {
      // check whether detector layer in map and visible
      let queryURL = "";
      let definitionExpression;
      let waterTankLayer;

      for (let i = 0; i < self.layers.length; i++) {
        if (self.layers[i].id === self.waterTankGraphicLayer.matchFeatureLayer
          && self.layers[i].visible && self.layers[i].type === "feature") {
          waterTankLayer = self.layers[i];
          definitionExpression = self.layers[i].definitionExpression;
          queryURL = waterTankLayer.url + "/" + self.layers[i].layerId;
        }
      }

      if (!waterTankLayer) {
        self.waterTankGraphicLayer.graphics = [];
        return;
      }


      if (self.waterTankGraphicLayer.graphics.length === 0) {
        //load graphics into waterTankGraphicLayer and then set symbol based on the value got from nodeserver
        let qTask = new QueryTask({
          url: queryURL
        });
        let params = new Query({
          returnGeometry: true,
          outFields: ["*"],
          returnZ: true
        });
        if (definitionExpression)
        {
          params.where = definitionExpression;
        }
        else
        {
          params.where = "1=1";
        }
        qTask.execute(params).then(function (results) {
          self.waterTankGraphicLayer.graphics = [];
          for (let i = 0; i < results.features.length; i++) {
            let g = new Graphic();
            g.geometry = results.features[i].geometry;
            g.attributes = results.features[i].attributes;
            self.waterTankGraphicLayer.graphics.push(g);
          }
          //get value from node server
          self.waterTankGraphicLayer.graphics = buildGraphicsForWaterTank(self.view.popup, self.waterTankGraphicLayer.graphics,
            Graphic, PointSymbol3D, ObjectSymbol3DLayer);
        });
      } else {
        //set symbol based on the value got from nodeserver
        self.waterTankGraphicLayer.graphics = buildGraphicsForWaterTank(self.view.popup, self.waterTankGraphicLayer.graphics,
          Graphic, PointSymbol3D, ObjectSymbol3DLayer);
      }


    });
  };

  this.processPower3D = function(self) {
    esriLoader.require([
      "esri/Graphic",
      "esri/symbols/PointSymbol3D",
       "esri/symbols/SimpleFillSymbol",
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask",
       "esri/renderers/SimpleRenderer",
      "esri/symbols/PolygonSymbol3D",
      "esri/symbols/ExtrudeSymbol3DLayer"
       
    ], function (Graphic, PointSymbol3D, SimpleFillSymbol, Query, QueryTask,SimpleRenderer, PolygonSymbol3D,
      ExtrudeSymbol3DLayer) {
      // check whether water sensor layer in map and visible
      let queryURL = "";
      let definitionExpression;
      let power3DLayer;
      animation3DCount++;
      for (let i = 0; i < self.layers.length; i++) {
        if (self.layers[i].id === self.Power3DGraphicLayer.matchFeatureLayer &&
          self.layers[i].visible && self.layers[i].type === "feature") {
          power3DLayer = self.layers[i];
          definitionExpression = self.layers[i].definitionExpression;
          queryURL = self.layers[i].url + "/" + self.layers[i].layerId;
        }
      }

      if (!power3DLayer) {
        self.Power3DGraphicLayer.graphics = [];
        return;
      }


      if (self.Power3DGraphicLayer.graphics.length === 0) {
        //load graphics into Power3DGraphicLayer and then set symbol based on the value got from nodeserver
        let qTask = new QueryTask({
          url: queryURL
        });
        let params = new Query({
          returnGeometry: true,
          outFields: ["*"],
          outSpatialReference: { wkid: 4326 }
        });
        if (definitionExpression)
        {
          params.where = definitionExpression;
        }
        else
        {
          params.where = "1=1";
        }
        qTask.execute(params).then(function (results) {
          self.Power3DGraphicLayer.graphics = [];
          for (let i = 0; i < results.features.length; i++) {
            let g = new Graphic();
            g.geometry = results.features[i].geometry;
            g.attributes = results.features[i].attributes;
            self.Power3DGraphicLayer.graphics.push(g);
          }
          //get value from node server
          self.Power3DGraphicLayer.graphics = buildGraphicsForPowser3D(self.view.popup, self.Power3DGraphicLayer.graphics,
            Graphic, SimpleRenderer, PolygonSymbol3D,ExtrudeSymbol3DLayer);
        });
      } else if (animation3DCount>9){//timer refresh every 3sec but simulate updates every 30 secs
        //set symbol based on the value got from nodeserver
        self.Power3DGraphicLayer.graphics = buildGraphicsForPowser3D(self.view.popup, self.Power3DGraphicLayer.graphics,
          Graphic, SimpleRenderer, PolygonSymbol3D,ExtrudeSymbol3DLayer);
          animation3DCount=0;
      }


    });

  };

  function buildGraphicsForPowser3D(popup, graphics, Graphic, SimpleRenderer, PolygonSymbol3D,ExtrudeSymbol3DLayer) {
      let newGraphics = [];
      for (let i = 0; i < graphics.length; i++) {

        let g = new Graphic();
        let powserRandom = 5 + Math.random() * 80;
        g.geometry= graphics.items[i].geometry;
        g.attributes = graphics.items[i].attributes;

        //change river polygon outline based on zhuo du
        let color;
        if (powserRandom < 50) {
          color = colors.SEMI_TRANSPARENT_GRASS;
        } else if (powserRandom <70) {
          color = colors.SEMI_TRANSPARENT_ORANGE;
        } else {
          color = colors.SEMI_TRANSPARENT_RED;
        }
        if (graphics.items[i].symbol&&graphics.items[i].symbol.type==="polygon-symbol-3d")
        {
          //reuse symbol for reducing memery usage. don't know why garbage collection works this way
          g.symbol = graphics.items[i].symbol.clone();
          g.symbol.symbolLayers.items[0].material.color = color;
          g.symbol.symbolLayers.items[0].size = powserRandom;
        }
        else
        {
          g.symbol = new PolygonSymbol3D({
            symbolLayers: [new ExtrudeSymbol3DLayer({
              size: powserRandom,  // 100,000 meters in height
              material: { color: color }
            })]
          });
        }
        newGraphics.push(g);
      }

    // Update Popup water sensor value dynamically
     let powser3DPopup = document.querySelector('#power3D-kw-value');
     if (popup.visible && powser3DPopup) {
       let powser = document.querySelector('#power3D-kw-value');
       powser.innerHTML = 300 + Math.random() * 500; 
     }
   
    return newGraphics;
  }

  
  this.processWaterSensor = function(self) {
    esriLoader.require([
      "esri/Graphic",
      "esri/symbols/PointSymbol3D",
       "esri/symbols/SimpleFillSymbol",
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
       
    ], function (Graphic, PointSymbol3D, SimpleFillSymbol, Query, QueryTask) {
      // check whether water sensor layer in map and visible
      let queryURL = "";
      let definitionExpression;
      let waterSensorLayer;

      for (let i = 0; i < self.layers.length; i++) {
        if (self.layers[i].id === self.waterSensorGraphicLayer.matchFeatureLayer &&
          self.layers[i].visible && self.layers[i].type === "feature") {
          waterSensorLayer = self.layers[i];
        }
        else if (self.layers[i].title.indexOf(self.waterSensorGraphicLayer.geometrySource) > -1 &&  self.layers[i].type === "feature")
        {
            queryURL = self.layers[i].url + "/" + self.layers[i].layerId;
            definitionExpression = self.layers[i].definitionExpression;
        }
      }

      if (!waterSensorLayer) {
        self.waterSensorGraphicLayer.graphics = [];
        return;
      }


      if (self.waterSensorGraphicLayer.graphics.length === 0) {
        //load graphics into waterSensorGraphicLayer and then set symbol based on the value got from nodeserver
        let qTask = new QueryTask({
          url: queryURL
        });
        let params = new Query({
          returnGeometry: true,
          outFields: ["*"],
          returnZ: true,
          outSpatialReference: { wkid: 4326 }
        });
        if (definitionExpression)
        {
          params.where = definitionExpression;
        }
        else
        {
          params.where = "1=1";
        }
        qTask.execute(params).then(function (results) {
          self.waterSensorGraphicLayer.graphics = [];
          for (let i = 0; i < results.features.length; i++) {
            let g = new Graphic();
            g.geometry = results.features[i].geometry;
            g.attributes = results.features[i].attributes;
            self.waterSensorGraphicLayer.graphics.push(g);
          }
          //get value from node server
          self.waterSensorGraphicLayer.graphics = buildGraphicsForWaterSensor(self.view.popup, self.waterSensorGraphicLayer.graphics,
            Graphic, PointSymbol3D, SimpleFillSymbol);
        });
      } else {
        //set symbol based on the value got from nodeserver
        self.waterSensorGraphicLayer.graphics = buildGraphicsForWaterSensor(self.view.popup, self.waterSensorGraphicLayer.graphics,
          Graphic, PointSymbol3D, SimpleFillSymbol);
      }


    });

  };

    function buildGraphicsForWaterSensor(popup, graphics, Graphic, PointSymbol3D, SimpleFillSymbol) {
      let newGraphics = [];
      for (let i = 0; i < graphics.length; i++) {

        let g = new Graphic();
        let ftuRandom = Math.random() * 8; //zhuo du: [1-8]
        g.geometry= graphics.items[i].geometry;
        g.attributes = graphics.items[i].attributes;

        //change river polygon outline based on zhuo du
        let color;
        if (ftuRandom < 3) {
          color = colors.BLUE;
        } else if (ftuRandom <5) {
          color = colors.ORANGE;
        } else {
          color = colors.RED;
        }
 
        g.symbol = new SimpleFillSymbol({
            color: color,
            outline: { // autocasts as new SimpleLineSymbol()
              color: color,
              width: 1
            }
        });
 
        newGraphics.push(g);
      }

    // Update Popup water sensor value dynamically
    let waterSensorPopup = document.querySelector('#water-sensor-ph-value');
    if (popup.visible && waterSensorPopup) {
      let dissolvedOxygen = document.querySelector('#water-sensor-do-value');
      let ftu = document.querySelector('#water-sensor-ftu-value');
      let doValue = Math.random() * (2.5 - 1) + 1;

      waterSensorPopup.innerHTML = Math.random() * (14 - 1) + 1;
      dissolvedOxygen.innerHTML = doValue;
      ftu.innerHTML = Math.random() * 8;
    }

    return newGraphics;
  }

  function buildGraphicsForCeilingLight(popup, graphics, Graphic, PolygonSymbol3D, FillSymbol3DLayer) {
    let newGraphics = [];
    for (let i = 0; i < graphics.length; i++) {

      let g = new Graphic();
      let random = Math.floor(Math.random() * 4);//0-3 random inter
      g.geometry = graphics.items[i].geometry;
      g.attributes = graphics.items[i].attributes;
      let color;
      if (random === 0) {
        color = colors.LightOff;
        g.attributes.status = "off";
      } else if (random === 1) {
        color = colors.LightLow;
         g.attributes.status = "low";
      } else if (random === 2) {
        color = colors.LightMedinum;
         g.attributes.status = "low";
      } else {
        color = colors.LightHigh;
         g.attributes.status = "high";
      }
       g.symbol=  new PolygonSymbol3D({
        symbolLayers: [new FillSymbol3DLayer({
          material: { color: [227, 139, 79, 0] },
          outline: { // autocasts as new SimpleLineSymbol()
            color: color,
             size: "10px"
          }
        })]
      }); 

      newGraphics.push(g);
    }
    return newGraphics;
  }

  function buildGraphicsForWaterTank(popup, graphics, Graphic, PointSymbol3D, ObjectSymbol3DLayer) {
    let newGraphics = [];
    for (let i = 0; i < graphics.length; i++) {

      let g = new Graphic();
      let random = Math.floor(Math.random() * 4);//0-3 random inter
      g.geometry = graphics.items[i].geometry;
      g.attributes = graphics.items[i].attributes;

      let color;
      if (random === 0) {
        color = colors.GREY;
      } else if (random === 1) {
        color = colors.GREEN;
      } else if (random === 2) {
        color = colors.ORANGE;
      } else {
        color = colors.RED;
      }
      g.symbol = new PointSymbol3D({
        symbolLayers: [new ObjectSymbol3DLayer({
          width: 3.8,
          height: 1.2,
          resource: {
            primitive: "cylinder"
          },
          material: {
            color: color
          }
        })]
      });


      newGraphics.push(g);
    }

    // Update Popup water tank value dynamically
    let waterTankPH = document.querySelector('#water-tank-ph-value');
    if (popup.visible && waterTankPH) {
      let waterTankHN3H = document.querySelector('#water-tank-nh3h-value');
      let ftu = document.querySelector('#water-tank-ftu-value');

      waterTankPH.innerHTML = Math.random() * (14 - 1) + 1;
      waterTankHN3H.innerHTML = Math.random() * (150 - 0.02) + 0.02;
      ftu.innerHTML = Math.random() * 2.5;
    }

    return newGraphics;
  }

  function updateTrack(self, pointGraphic, point) {
    if (self.followID === pointGraphic.attributes["Name"]) {
      let location = point;
      self.view.goTo({
        center: location,
        tilt: 80,
        scale: 80,
        heading: 360 - getHeading(location, self.preLocation)
      });
      self.preLocation = location.clone();
    }
    return location;
  }

  function buildPoint(self, data) {
    return {
      x: data.spatial_info.pos_lon,
      y: data.spatial_info.pos_lat,
      z: data.spatial_info.pos_hgt < self.scenario.scenarioHeight ? parseInt(self.scenario.scenarioHeight) + 1 : data.spatial_info.pos_hgt
    };
  }

  function buildMarkerSymbol(color) {
    return {
      color: color,
      outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 2
      }
    };
  }

  //for shanghai scenario7
  function buildMarkerSymbol2(color) {
    let ram = Math.floor(Math.random() * 15) + 15;
    return {
      color: color,
      size: ram, //range 15 - 30
      outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 2
      }
    };
  }

  function build3DmodelSymbol(PointSymbol3D, ObjectSymbol3DLayer){
    return new PointSymbol3D({
      symbolLayers: [new ObjectSymbol3DLayer({
        resource: {
          href: "/assets/3dModel/sheep.json"
        }
      })]
    });
  }


  function buildNewPointAttr(data) {
    return {
      Name: data.node_mac,  // The name of the pipeline
      status: "alive",  // The owner of the pipeline
      date: data.date.toString()  // The length of the pipeline
    };
  }

  function buildGraphic(point, data, pointSymbol) {
    return {
      geometry: point,
      symbol: pointSymbol,
      attributes: buildNewPointAttr(data),
      popupTemplate: {
        title: "Mac Address: {Name}",
        content: "<ul>" +
        "<li>Status: {status}</li>" +
        "<li>Date: {date}</li><ul>", //+ "<img src='/assets/img/cam.png'>",
        // actions: [
        //   {
        //     // This text is displayed as a tool tip
        //     title: "Follow me",
        //     id: "follow",
        //     className: "esri-icon-organization",
        //     followID: data.node_mac
        //   }
        // ]
      }
    };
  }

  function buildSimpleLineSymbol(color) {
    return {
      color: color,
      width: 4
    };
  }

  function addPointToLineLayer(self, pointGraphic, lineSymbol) {
    esriLoader.require([
      "esri/Graphic",
      "esri/geometry/Point",
      "esri/geometry/Polyline"
    ], function (Graphic, Point, Polyline) {
      let targetLineGraphic = null;
      for (let i = 0; i < self.historyLayer.graphics.length; i++) {
        if (self.historyLayer.graphics.items[i].attributes["Name"] === pointGraphic.attributes["Name"]) {
          targetLineGraphic = self.historyLayer.graphics.items[i];
        }
      }
      if (targetLineGraphic == null) {
        let polyline = new Polyline([
          [pointGraphic.geometry.longitude, pointGraphic.geometry.latitude, pointGraphic.geometry.z]
        ]);
        let lineAtt = {
          Name: pointGraphic.attributes["Name"],  // The name of the pipeline
        };
        let polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: lineSymbol,
          attributes: lineAtt
        });
        self.historyLayer.add(polylineGraphic);
      }
      else {
        let g = targetLineGraphic.geometry.clone();
        let lineAttr = targetLineGraphic.attributes;
        //only keep 50 vertices
        while (g.paths[0].length > self.historyLayer.historyPointNum) {
          g.paths[0].shift();
        }
        g.paths[0].push([pointGraphic.geometry.longitude, pointGraphic.geometry.latitude, pointGraphic.geometry.z < self.scenario.scenarioHeight ? parseInt(self.scenario.scenarioHeight) + 1 : pointGraphic.geometry.z]);
        self.historyLayer.remove(targetLineGraphic);
        self.historyLayer.add(new Graphic({
          geometry: g,
          symbol: lineSymbol,
          attributes: lineAttr
        }));
      }
    });
  }

  function getHeading(point, oldPoint) {
    // get angle between two points
    const angleInDegrees = Math.atan2(point.y - oldPoint.y, point.x -
        oldPoint.x) * 180 /
      Math.PI;

    // move heading north
    return -90 + angleInDegrees;
  }

  function updateHistoryTrackVisibility(self) {
    self.nodeList.forEach(function (element) {
      for (let i = 0; i < self.historyLayer.graphics.length; i++) {
        if (self.historyLayer.graphics.items[i].attributes["Name"] === element.nodeData["node_mac"]) {
          self.historyLayer.graphics.items[i].visible = element.display;
        }
      }
    });
  }

};
