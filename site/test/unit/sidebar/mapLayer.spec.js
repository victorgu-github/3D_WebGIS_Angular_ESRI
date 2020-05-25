"use strict";

describe("LayerList MapLayer", function () {
  let MapLayer;
  let sceneLayer;
  let groupLayer;

  beforeEach(module('3D_WebGIS_Angular_ESRIMap'));
  beforeEach(inject(function ($injector) {
    MapLayer = $injector.get('MapLayer');
  }));

  describe('#toggleLayerVisibility', function () {
    it('should change layer to invisible when layer is visible', function () {
      sceneLayer = {
        opacity: 1,
        visible: true
      };
      let layer = new MapLayer(sceneLayer, "3D Layer", "3D Layer", [], [], 100);
      layer.toggleLayerVisibility();

      expect(layer.mapLayer.visible).to.be.false;
      expect(layer.opacity).to.equal(100);
    });

    it('should change layer to visible when layer is invisible', function () {
      sceneLayer = {
        opacity: 1,
        visible: false
      };
      let layer = new MapLayer(sceneLayer, "3D Layer", "3D Layer", [], [], 100);
      layer.toggleLayerVisibility();

      expect(layer.mapLayer.visible).to.be.true;
      expect(layer.opacity).to.equal(100);
    });

    it('should change child layers to invisible when changing layer to invisible if visible mode is inherited', function () {
      sceneLayer = {
        opacity: 1,
        visible: true
      };
      let subLayer = new MapLayer(sceneLayer, "Scene Layer", "Scene Layer", [], [], 100);
      groupLayer = {
        opacity: 1,
        visible: true,
        visibilityMode: "inherited"
      };
      let layer = new MapLayer(groupLayer, "3D Layer", "3D Layer", [], [subLayer], 100);
      layer.toggleLayerVisibility();

      expect(layer.mapLayer.visible).to.be.false;
      expect(layer.layers[0].mapLayer.visible).to.be.false;
      expect(layer.opacity).to.equal(100);
    });

  });

  describe('#changeLayerOpacity', function () {
    it('should not affect layer visibility when changing opacity', function () {
      sceneLayer = {
        opacity: 1,
        visible: true
      };
      let layer = new MapLayer(sceneLayer, "3D Layer", "3D Layer", [], [], 100);
      layer.changeLayerOpacity(50);

      expect(layer.mapLayer.visible).to.be.true;
      expect(layer.opacity).to.equal(50);
      expect(layer.mapLayer.opacity).to.equal(0.5);
    });

    it('should change sub layers opacity as well', function () {
      sceneLayer = {
        opacity: 1,
        visible: true
      };
      let subLayer = new MapLayer(sceneLayer, "Scene Layer", "Scene Layer", [], [], 100);
      groupLayer = {
        opacity: 1,
        visible: true,
        visibilityMode: "inherited"
      };

      let layer = new MapLayer(groupLayer, "3D Layer", "3D Layer", [], [subLayer], 100);
      layer.changeLayerOpacity(50);

      expect(layer.mapLayer.visible).to.be.true;
      expect(layer.opacity).to.equal(50);
      expect(layer.layers[0].opacity).to.equal(50);
      expect(layer.mapLayer.opacity).to.equal(0.5);
      expect(layer.layers[0].mapLayer.opacity).to.equal(0.5);
    });
  });

});
