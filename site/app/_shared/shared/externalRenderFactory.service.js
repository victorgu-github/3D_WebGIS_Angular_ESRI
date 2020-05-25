'use strict';
/* eslint-disable no-undef */

module.exports = function () {

  this.createExternalRenderer = function (view, externalRenderers, SpatialReference, Multipoint, currentScenarioConfig) {
    return {
      renderer: null,     // three.js renderer
      camera: null,       // three.js camera
      scene: null,        // three.js scene
      streetLightHeight: 4,
      streetLampLayer: null,
      lightMaterial: null,
      realTimeLayer: null,
      person3D: null,
      onLamps: [],
      refreshRate: 5,
      scenarioConfig: currentScenarioConfig,
      ceilingLightLayer:null,
      smokeDetectorLayer:null,
      /**
       * Setup function, called once by the ArcGIS JS API.
       */
      setup: function (context) {

        // initialize the three.js renderer
        //////////////////////////////////////////////////////////////////////////////////////
        this.renderer = new THREE.WebGLRenderer({
          context: context.gl,
          //premultipliedAlpha: false,
          antialias: true,
          alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(context.camera.fullWidth, context.camera.fullHeight);

        // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
        this.renderer.autoClearDepth = false;
        this.renderer.autoClearStencil = false;
        this.renderer.autoClearColor = false;

        // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
        // We have to inject this bit of code into the three.js runtime in order for it to bind those
        // buffers instead of the default ones.
        let originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
        this.renderer.setRenderTarget = function (target) {
          originalSetRenderTarget(target);
          if (!target) {
            context.bindRenderTarget();
          }
        };

        // setup the three.js scene
        ///////////////////////////////////////////////////////////////////////////////////////

        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        // setup the camera
        let cam = context.camera;
        this.camera = new THREE.PerspectiveCamera(cam.fovY, cam.aspect, cam.near, cam.far);

        //set lensflare texture
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load("/assets/img/lensflare/lensflare0.png", function (tex) {
          let blendings = ["NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending"];
          let blending = blendings[2];
          this.lightMaterial = new THREE.MeshBasicMaterial({map: tex});
          this.lightMaterial.transparent = true;
          this.lightMaterial.morphTargets = true;
          this.lightMaterial.blending = THREE[blending];
        }.bind(this));
        this.bulbGeometry = new THREE.SphereBufferGeometry(1, 160, 160);
        this.bulbGeometry.name = "normal";
        this.bulbGeometrySmall = new THREE.SphereBufferGeometry(0.2, 160, 160);
        this.bulbGeometrySmall.name = "small";
        
        //used by ceiling light
        // textureLoader.load("/assets/img/lensflare/lensflareWhiteHigh.png", function (tex) {
        //   let blendings = ["NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending"];
        //   let blending = blendings[2];
        //   this.lightWhiteHighMaterial = new THREE.MeshBasicMaterial({map: tex});
        //   this.lightWhiteHighMaterial.transparent = true;
        //   this.lightWhiteHighMaterial.morphTargets = true;
        //   this.lightWhiteHighMaterial.blending = THREE[blending];
        // }.bind(this));
        // textureLoader.load("/assets/img/lensflare/lensflareWhiteLow.png", function (tex) {
        //   let blendings = ["NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending"];
        //   let blending = blendings[2];
        //   this.lightWhiteLowMaterial = new THREE.MeshBasicMaterial({map: tex});
        //   this.lightWhiteLowMaterial.transparent = true;
        //   this.lightWhiteLowMaterial.morphTargets = true;
        //   this.lightWhiteLowMaterial.blending = THREE[blending];
        // }.bind(this));
        // this.ceilingLightShapeHigh =new THREE.SphereBufferGeometry(1.2, 160, 5);
        // this.ceilingLightShapeLow =new THREE.SphereBufferGeometry(0.8, 160, 5);
        
        //smoke mesh
        textureLoader.load("/assets/img/Smoke-Element.png", function (tex) {
          this.smokeMaterial = new THREE.SpriteMaterial({ map: tex,color:0xffffff});
          this.particleGroup = new THREE.Object3D();
          this.particleGroup.renderOrder = 1;
          this.particleAttributes = { startSize: [], startPosition: [], randomness: [] };
          let radiusRange = 1;
          for ( let i = 0; i < 50; i++ ) 
          {
            let sprite = new THREE.Sprite( this.smokeMaterial );
            sprite.scale.set( 0.5,  0.5, 1.0 ); // imageWidth, imageHeight
            sprite.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
            // for a cube:
            // sprite.position.multiplyScalar( radiusRange );
            // for a solid sphere:
            // sprite.position.setLength( radiusRange * Math.random() );
            // for a spherical shell:
            sprite.position.setLength( radiusRange * (Math.random() * 0.1 + 0.5) );
            
            // sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() ); 
            sprite.material.color.setHSL(0, 0, 0.83 ); 
            
            // sprite.opacity = 0.80; // translucent particles
            sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles
            
            this.particleGroup.add( sprite );
            // add variable qualities to arrays, if they need to be accessed later
            this.particleAttributes.startPosition.push( sprite.position.clone() );
            this.particleAttributes.randomness.push( Math.random() );
          }
       
        }.bind(this));

        //test collada 3d render
        // let colladaLoader = new ColladaLoader();
        // colladaLoader.options.convertUpAxis = true;
        // colladaLoader.load("/assets/collada/avatar.dae", function (collada) {
        //   let object = collada.scene;
        //   object.scale.set(3, 3, 3);

        //   let mesh;
        //   object.traverse(function (child) {
        //     if (child instanceof THREE.SkinnedMesh) {
        //       mesh = child.clone();
        //     }
        //   });
        //   mesh.material = new THREE.MeshBasicMaterial({map: mesh.material.map, color: mesh.material.color});
        //   mesh.rotation.x = 2.2;
        //   this.person3D = mesh;
        //   // this.scene.add(mesh);
        // }.bind(this));
        // cleanup after ourselfs
        context.resetWebGLState();
      },

      render: function (context) {
        // update camera parameters
        ///////////////////////////////////////////////////////////////////////////////////
        let cam = context.camera;

        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
        this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

        // Projection matrix can be copied directly
        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
        //get street lamp layer only allow one for now
        if (!this.streetLampLayer && this.scenarioConfig.actionLayers.LoraLampOnOff) {
          for (let i = 0; i < view.map.allLayers.items.length; i++) {
            if (this.scenarioConfig.actionLayers.LoraLampOnOff.indexOf(view.map.allLayers.items[i].id) > -1) {
              this.streetLampLayer = view.map.allLayers.items[i];
               break;
            }
   
            
            // if (view.map.allLayers.items[i].title == "Real Time Layer") {
            //     this.realTimeLayer = view.map.allLayers.items[i];
            //     continue;
            // }

          }
        }
        // if (!this.ceilingLightLayer && this.scenarioConfig.actionLayers.CeilingLightOnOff) {//get ceilig light layer 
        //    for (let i = 0; i < view.map.allLayers.items.length; i++) {
        //       if (this.scenarioConfig.actionLayers.CeilingLightOnOff === view.map.allLayers.items[i].title)
        //       {
        //         this.ceilingLightLayer= view.map.allLayers.items[i];
        //         break;
        //       }
        //    }
        // }
        if (!this.smokeDetectorLayer && this.scenarioConfig.actionLayers.SmokeDetectorOnOff) {//get smoke detector layer 
          for (let i = 0; i < view.map.allLayers.items.length; i++) {
             if (this.scenarioConfig.actionLayers.SmokeDetectorOnOff === view.map.allLayers.items[i].id)
             {
               this.smokeDetectorLayer= view.map.allLayers.items[i];
               this.smokeDetectorLayer.smokes=[];//initialize smokes array
               break;
             }
          }
       }

        if (this.streetLampLayer && this.streetLampLayer.refreshExRender && this.streetLampLayer.dynData && this.streetLampLayer.visible) {
          let points = [];
          this.onLamps = [];//to be turned on by three js
          this.alreadyOnGrphics = [];//include On and Waiting graphics set outside


          for (let i = 0; i < this.streetLampLayer.dynData.length; i++) {
            if (this.streetLampLayer.dynData[i].attributes.dynStatus === "On"
              || this.streetLampLayer.dynData[i].attributes.dynStatus === "Waiting") {
              this.alreadyOnGrphics.push(this.streetLampLayer.dynData[i]);
            }
          }
          //remove off light remove three js scene
          let objToDel = [];
          for (let i = 0; i < this.scene.children.length; i++) {
            //get lampon scene
            if (this.scene.children[i].name.indexOf("lampOn") > -1) {
              let lampObjID = this.scene.children[i].name.split('lampOn')[1];
              let exit = false;
              for (let j = 0; j < this.alreadyOnGrphics.length; j++) {
                if (this.alreadyOnGrphics[j].attributes.objectid.toString() === lampObjID) {
                  this.scene.children[i].status = this.alreadyOnGrphics[j].attributes.dynStatus;
                  if (this.scene.children[i].status === "On") {
                    this.scene.children[i].geometry = this.bulbGeometry;
                  }
                  exit = true;
                  break;
                }
              }
              if (!exit) {
                objToDel.push(this.scene.children[i]);
              }
            }

          }
          for (let i = 0; i < objToDel.length; i++) {
            objToDel[i].geometry.dispose();
            objToDel[i].material.dispose();
            this.scene.remove(objToDel[i]);
          }
          //add the last turn on lamps
          for (let j = 0; j < this.alreadyOnGrphics.length; j++) {
            let exit = false;
            for (let i = 0; i < this.scene.children.length; i++) {
              //get lampon scene
              if (this.scene.children[i].name.indexOf("lampOn") > -1) {
                let lampObjID = this.scene.children[i].name.split('lampOn')[1];
                if (this.alreadyOnGrphics[j].attributes.objectid.toString() === lampObjID) {
                  exit = true;
                  break;
                }
              }
            }
            if (!exit) {
              points.push([this.alreadyOnGrphics[j].geometry.longitude, this.alreadyOnGrphics[j].geometry.latitude]);
              this.onLamps.push(this.alreadyOnGrphics[j]);
            }
          }

          this.streetLampLayer.refreshExRender = false;
          // this.previousOnLamp = this.lampOnLayer.graphics.items.length;
          let elevationLayer = view.map.ground.layers.items[0];

          elevationLayer.queryElevation(new Multipoint(points), {returnSampleInfo: true})
            .then(function (result) {
              for (let i = 0; i < result.geometry.points.length; i++) {
                let point = result.geometry.points[i];
                this.createLightTexture(point[1], point[0], point[2] + this.streetLightHeight, this.onLamps[i].attributes.objectid, this.onLamps[i].attributes.dynStatus);
              }
            }.bind(this));

        }
        else if (this.streetLampLayer && !this.streetLampLayer.visible)//remove all scenes if layer is invisible
        {
              //remove off light remove three js scene
              let objToDel = [];
              for (let i = 0; i < this.scene.children.length; i++) {
                //get lampon scene
                if (this.scene.children[i].name.indexOf("lampOn") > -1) {
                  objToDel.push(this.scene.children[i]);
                }
    
              }
              for (let i = 0; i < objToDel.length; i++) {
                objToDel[i].geometry.dispose();
                objToDel[i].material.dispose();
                this.scene.remove(objToDel[i]);
              }
        }

        //flash waiting lamp
        if (this.refreshRate < 0) {
          for (let i = 0; i < this.scene.children.length; i++) {

            if (this.scene.children[i].name.indexOf("lampOn") > -1 &&
              this.scene.children[i].status === "Waiting") {
              //change bulbgeometry to make light bigger and smaller
              if (this.scene.children[i].geometry.name === "normal") {
                this.scene.children[i].geometry = this.bulbGeometrySmall;
              }
              else if (this.scene.children[i].geometry.name === "small") {
                this.scene.children[i].geometry = this.bulbGeometry;
              }
            }
          }
          this.refreshRate = 5;
        }
        else {
          this.refreshRate--;
        }

        // if (this.ceilingLightLayer&&this.ceilingLightLayer.visible) {
        //    for (let i = 0; i < this.ceilingLightLayer.graphics.items.length; i++) {
        //       this.createCeilingLightTexture(this.ceilingLightLayer.graphics.items[i].geometry.latitude, 
        //         this.ceilingLightLayer.graphics.items[i].geometry.longitude, this.ceilingLightLayer.graphics.items[i].geometry.z, 
        //         this.ceilingLightLayer.graphics.items[i].attributes.objectid, this.ceilingLightLayer.graphics.items[i].attributes.status);

        //   }
        // }
        if (this.smokeDetectorLayer && this.smokeDetectorLayer.visible) {
          let transform = new THREE.Matrix4();
          for (let i = 0; i < this.smokeDetectorLayer.graphics.items.length; i++) {
            let pos = this.checkSmokeExistence(this.smokeDetectorLayer.graphics.items[i].attributes.objectid,this.smokeDetectorLayer.smokes);
            // graphics.items[i].attributes.status is 0 and exist in this.smokeDetectorLayer.smokes, remove
            if (this.smokeDetectorLayer.graphics.items[i].attributes.status===0 && pos>-1)
            {
              let smokeObj = this.smokeDetectorLayer.smokes[pos].smokeObj;
              // smokeObj.geometry.dispose();
              // smokeObj.material.dispose();
              this.scene.remove(smokeObj);
              this.smokeDetectorLayer.smokes.splice(pos, 1);
            }
            //graphics.items[i].attributes.status is 1 and doesn't exist in this.smokeDetectorLayer.smokes add
            else if (this.smokeDetectorLayer.graphics.items[i].attributes.status===1 && pos===-1)
            {
                let entry = {pos: [ this.smokeDetectorLayer.graphics.items[i].geometry.longitude, this.smokeDetectorLayer.graphics.items[i].geometry.latitude, this.smokeDetectorLayer.graphics.items[i].geometry.z]};
                transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, entry.pos, SpatialReference.WGS84, new Array(16)));
                let smoke = {};
                smoke.id = this.smokeDetectorLayer.graphics.items[i].attributes.objectid;
                smoke.smokeObj=this.particleGroup.clone();
             
                let x = transform.elements[12];
                let y = transform.elements[13];
                let z = transform.elements[14];
                smoke.smokeObj.position.set(x,y,z);
        
                this.scene.add(smoke.smokeObj);
                this.smokeDetectorLayer.smokes.push(smoke);
            }
            //graphics.items[i].attributes.status is 1 and exist in this.smokeDetectorLayer.smokes update
            else if (this.smokeDetectorLayer.graphics.items[i].attributes.status===1 && pos >-1)
            {
                let time = this.clock.getElapsedTime();
                let particleGroup = this.smokeDetectorLayer.smokes[pos].smokeObj;
                for ( let c = 0; c < particleGroup.children.length; c ++ ) 
                {
                  let sprite = particleGroup.children[ c ];
              
                  // particle wiggle
                  // var wiggleScale = 2;
                  // sprite.position.x += wiggleScale * (Math.random() - 0.5);
                  // sprite.position.y += wiggleScale * (Math.random() - 0.5);
                  // sprite.position.z += wiggleScale * (Math.random() - 0.5);
                  
                  // pulse away/towards center
                  // individual rates of movement
                  let a = this.particleAttributes.randomness[c] + 1;
                  let pulseFactor = Math.sin(a * time) * 0.1 + 0.9;
                  sprite.position.x =  this.particleAttributes.startPosition[c].x * pulseFactor;
                  sprite.position.y =  this.particleAttributes.startPosition[c].y * pulseFactor;
                  sprite.position.z =  this.particleAttributes.startPosition[c].z * pulseFactor;	
                }
                particleGroup.rotation.y = time*0.1;
                particleGroup.rotation.z = time * 0.1;
            }
         }
         if (this.smokeDetectorLayer.graphics.items.length===0) //remove all animation mesh
         {
            for (let i=0;i<this.smokeDetectorLayer.smokes.length;i++)
            {
              let smokeObj = this.smokeDetectorLayer.smokes[i].smokeObj;
              this.scene.remove(smokeObj);
            }
            this.smokeDetectorLayer.smokes=[];
         }
       }
       else if (this.smokeDetectorLayer && !this.smokeDetectorLayer.visible) //remove all smoke scenes if layer is invisible
       {
         for (let i=0;i<this.smokeDetectorLayer.smokes.length;i++)
         {
           let smokeObj = this.smokeDetectorLayer.smokes[i].smokeObj;
           this.scene.remove(smokeObj);
         }
         this.smokeDetectorLayer.smokes=[];
       }
      
        // if (this.realTimeLayer.graphics.items.length > 0) {
        //     //this.scene.children.length=0;//clear all objects which is not lampOn
        //     var objToDel = [];
        //     for (var i = 0; i < this.scene.children.length; i++) {
        //         if (this.scene.children[i].name.indexOf("lampOn") < 0) {
        //             objToDel.push(this.scene.children[i]);
        //         }
        //     }
        //     for (var i = 0; i < objToDel.length; i++) {
        //         this.scene.children.splice(this.scene.children.indexOf(objToDel[i]), 1);
        //     }
        //     if (this.realTimeLayer.visible) {
        //         for (var i = 0; i < this.realTimeLayer.graphics.items.length; i++) {
        //             var entry = { pos: [this.realTimeLayer.graphics.items[i].geometry.longitude, this.realTimeLayer.graphics.items[i].geometry.latitude, 1111] };
        //             var transform = new THREE.Matrix4();
        //             transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, entry.pos, SpatialReference.WGS84, new Array(16)));
        //             var mesh = this.person3D.clone();
        //             mesh.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
        //             this.scene.add(mesh);
        //         }
        //     }
        // }


        // update lighting
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        //view.environment.lighting.date = Date.now();

        //   this.renderer.physicallyCorrectLights = true;
        //   this.renderer.gammaInput = true;
        //   this.renderer.gammaOutput = true;

        // draw the scene
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        this.renderer.resetGLState();
        //only render animation when street light layer is on
        if (this.streetLampLayer ||this.smokeDetectorLayer||this.ceilingLightLayer) {
          this.renderer.render(this.scene, this.camera);
        }


        // as we want to smoothly animate , immediately request a re-render
        externalRenderers.requestRender(view);

        // cleanup
        context.resetWebGLState();
      },

      lastPosition: null,
      lastTime: null,

      checkSmokeExistence:function(id, smokes){
        let pos=-1; 
        for (let i=0;i<smokes.length;i++)
        {
           if (smokes[i].id===id)
           {
             pos=i;
             break; 
           }
         }
         return pos;

      },

      createLightTexture: function (lat, lng, height, id, status) {

        let entry = {pos: [lng, lat, height]};
        let transform = new THREE.Matrix4();
        transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, entry.pos, SpatialReference.WGS84, new Array(16)));

        let mesh = new THREE.Mesh(this.bulbGeometry, this.lightMaterial);
        mesh.name = "lampOn" + id;
        mesh.status = status;
        mesh.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
        this.scene.add(mesh);

      },
      
      createCeilingLightTexture: function (lat, lng, height, id, status) {

        //check if already exist 
       for (let i = 0; i < this.scene.children.length; i++) {
              //get lampon scene
              if (this.scene.children[i].name.indexOf("ceilingLight") > -1) {
                let ceilingLightID = this.scene.children[i].name.split('ceilingLight')[1];
                if (ceilingLightID === id.toString()) {
                  if (this.scene.children[i].status===status)
                  {
                    this.scene.children[i].status=status; //have to add in order to pass check
                  }
                  else if (status==="off")
                  {
                   // this.scene.children[i].geometry=null;
                   this.scene.children[i].geometry.dispose();
                   this.scene.children[i].material.dispose();
                   this.scene.remove(this.scene.children[i]);
                  }
                  else if (status==="low")
                  {
                    this.scene.children[i].geometry=this.ceilingLightShapeLow;
                    this.scene.children[i].material = this.lightWhiteLowMaterial;
                  }
                  else if (status==="high")
                  {
                    this.scene.children[i].geometry=this.ceilingLightShapeHigh;
                    this.scene.children[i].material = this.lightWhiteHighMaterial;
                  }
                  this.scene.children[i].status=status;
                  return;
                }
              }
        }
        let entry = {pos: [lng, lat, height]};
        let transform = new THREE.Matrix4();
        transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, entry.pos, SpatialReference.WGS84, new Array(16)));
        let mesh;
        if (status ==="off")
        {
          return;
        }
        else if (status ==="low")
        {
          mesh = new THREE.Mesh(this.ceilingLightShapeLow, this.lightWhiteLowMaterial);
        }
        else if (status ==="high")
        {
          mesh = new THREE.Mesh(this.ceilingLightShapeHigh, this.lightWhiteHighMaterial);
        }
        mesh.name = "ceilingLight" + id;
        mesh.status = status;
        mesh.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
        this.scene.add(mesh);
      }
    };
  };
};
