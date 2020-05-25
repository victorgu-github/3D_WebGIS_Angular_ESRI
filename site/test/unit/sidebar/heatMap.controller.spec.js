"use strict";

describe("Heat Map Controller", function () {
  let scope;
  let $window;
  let Leaflet2DService;

  beforeEach(function () {
    module('3D_WebGIS_Angular_ESRIMap');

    inject(function (_$rootScope_, _$timeout_, _$controller_, $injector) {
      scope = _$rootScope_.$new();
      $window = {
        location: {href: ""}, alert: (msg) => {
          return msg;
        }
      };
      Leaflet2DService = $injector.get('Leaflet2DService');
      _$controller_('HeatMapCtrl', {
        '$scope': scope,
        '$window': $window,
        'Leaflet2DService': Leaflet2DService
      });
    });
  });

  describe('Init controller', function () {
    it('should initialize selected layers and attribute', function () {
      expect(scope.selectedLayer).to.be.equal("SIDEBAR.HEAT_MAP.SELECT_AN_LAYER");
      expect(scope.selectedAttribute).to.be.equal("SIDEBAR.HEAT_MAP.SELECT_AN_ATTR");
    });
  });

  describe('.onChangeLayer', function () {
    beforeEach(function () {
      scope.heatLayerMap = {
        "gateway": {
          getAttributes: function () {
            return {"Humidity": "humid_sensor"};
          }
        }
      };
    });

    it('should set layer attributes when layer changes', function () {
      scope.onChangeLayer("gateway");

      expect(scope.selectedLayer).to.be.equal("gateway");
      expect(scope.layerAttributes).to.include.members(["Humidity"]);
    });

    it('should set layer attributes to invalid value when layer not exists', function () {
      scope.onChangeLayer("detector");

      expect(scope.selectedLayer).to.be.equal("detector");
      expect(scope.layerAttributes).to.include.members(["SIDEBAR.HEAT_MAP.INVALID_LAYER"]);
    });
  });

  describe('.clearAll', function() {
    it('should clear dropdowns when status is applied', function() {
      scope.status = "applied";

      scope.clearAll();

      expect(scope.selectedLayer).to.be.equal("SIDEBAR.HEAT_MAP.SELECT_AN_LAYER");
      expect(scope.selectedAttribute).to.be.equal("SIDEBAR.HEAT_MAP.SELECT_AN_ATTR");
    });

    it('should do nothing when status is applying', function() {
      scope.status = "applying";
      scope.selectedLayer = "gateway";
      scope.selectedAttribute = "Humidity";

      scope.clearAll();

      expect(scope.selectedLayer).to.be.equal("gateway");
      expect(scope.selectedAttribute).to.be.equal("Humidity");
    });

  });


  describe('.drawHeatMap', function() {
    beforeEach(function () {
      scope.heatLayerMap = {
        "gateway": {
          generateHeatLayer: function (attribute) {
            return attribute;
          }
        }
      };
    });

    it('should do nothing when attribute is invalid', function() {
      scope.status = "applied";
      scope.selectedLayer = "gateway";
      scope.selectedAttribute = "SIDEBAR.HEAT_MAP.INVALID_LAYER";

      scope.drawHeatMap();

      expect(scope.status).to.be.equal("applied");
    });

    it('should start render heat map when attribute and layer are valid', function() {
      scope.status = "applied";
      scope.selectedLayer = "gateway";
      scope.selectedAttribute = "humid_sensor";

      scope.drawHeatMap();

      expect(scope.status).to.be.equal("applying");
    });
  });

});
