"use strict";

describe("mapLayer 2D service builder", function(){
    let MapLayer2DBuilder;
    let $q;
    let $rootScope;
    beforeEach(module('3D_WebGIS_Angular_ESRIMap.2Dmap'));
    beforeEach(
        inject(function($injector, _$q_, _$rootScope_){
            MapLayer2DBuilder = $injector.get('MapLayer2DBuilder');
            $q = _$q_;
            $rootScope = _$rootScope_;
        })
    );

    describe('.build', function(){
        it('Should return default values when no input parameters', function(){
            let result = new MapLayer2DBuilder().build();

            //Random checking default values of some fields
            expect(result.displayName).to.be.equal("Default name");
            expect(result.clusterSize).to.be.equal(50);
            expect(result.isRealTime).to.be.equal(false);

        });
    });

    describe('.clusterOptions.onStart', function(){
       it('Should update cluster size when given new values', function(){
           let id = 1;
           let newValue = 32;
           let highValue = 100;
           let pointerType = 0;
           let mapLayer = {
               Cluster:{size: 40},
               ProcessView: function(){}
           };

           let result = new MapLayer2DBuilder("result").withMapLayer(mapLayer).build();
           result.clusterOptions.onStart(id, newValue, highValue, pointerType);
           expect(result.clusterSize).to.be.equal(32);
        });

    });

    describe('.update', function(){
        it('Should update when autofresh is true', function(){
           let autoFresh = true;
           let deferred = $q.defer();
           let popupEnabled = false;
           let content = "";

           let result = new MapLayer2DBuilder("result")
               .withAutoRefresh(autoFresh)
               .withPopupUpEnabled(popupEnabled)
               .withUpdateFunc(function () {
                 content = "updated";
                  return deferred.promise;
               })
               .build();
           // Set last update timestamp to 1s ago
           result.lastUpdate -= 1000;

           result.update();
           $rootScope.$apply();
           expect(content).to.equal("updated");

        });

        it('Should update when initializing is true', function(){
           let initializing = true;
           let deferred = $q.defer();
           let popupEnabled = false;
           let content = "updated";

           let result = new MapLayer2DBuilder("result")
               .withInitializing(initializing)
               .withPopupUpEnabled(popupEnabled)
               .withUpdateFunc(function () {
                  content = "updated";
                  return deferred.promise;
               })
               .build();

           result.update();
           $rootScope.$apply();
           expect(content).to.be.equal("updated");

        });


     });

    describe('.setLayerVisibility', function(){
        it('Should update layer visibility when changing layer visibility', function(){
            let newVisibility = 19;
            
            let result = new MapLayer2DBuilder("result")
                .withVisible(50)
                .build();
            result.setLayerVisibility(newVisibility);
            expect(result.visible).to.be.equal(newVisibility);
        });
    });

    describe('.changeLayerOpacity', function(){
        it('Should update map layer opacity when changing layer opacity', function(){
            let newOpacity = 70;
            let mapLayer = {
                opacity:100
            };

            let result = new MapLayer2DBuilder("result")
                .withMapLayer(mapLayer)
                .build();
            result.changeLayerOpacity(newOpacity);

            expect(result.opacity).to.be.equal(70);
            expect(result.mapLayer.opacity).to.be.equal(0.7);

        });
    });

});