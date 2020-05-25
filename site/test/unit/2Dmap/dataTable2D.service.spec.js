"use strict";

describe("DataTable2DService", function () {
  let DataTable2DService;
  let MapLayer2DBuilder;
  let gateway;
  let camera;
  let plugbase;

  beforeEach(function () {
    module('3D_WebGIS_Angular_ESRIMap');

    inject(function ($injector) {
      DataTable2DService = $injector.get('DataTable2DService');
      MapLayer2DBuilder = $injector.get('MapLayer2DBuilder');
    });

    gateway = new MapLayer2DBuilder("gateway").withName("gateway").build();
    camera = new MapLayer2DBuilder("camera").withName("camera").build();
    plugbase = new MapLayer2DBuilder("plugbase").withName("plugbase").build();

    DataTable2DService.data.dataTableLayers = [gateway, camera, plugbase];
  });

  describe('.closeTab', function () {
    it('should close tab when close active tab', function () {
      DataTable2DService.data.currentTab = "gateway";

      DataTable2DService.closeTab("gateway");

      expect(DataTable2DService.data.currentTab).to.equal("camera");
      expect(DataTable2DService.data.dataTableLayers).to.include.members([camera, plugbase]);
      expect(DataTable2DService.data.hiddenLayers).to.include.members([gateway]);
      expect(DataTable2DService.data.noTabSelected).to.be.false;
    });

    it('should close tab when close inactive tab', function () {
      DataTable2DService.data.currentTab = "camera";

      DataTable2DService.closeTab("plugbase");

      expect(DataTable2DService.data.currentTab).to.equal("camera");
      expect(DataTable2DService.data.dataTableLayers).to.include.members([gateway, camera]);
      expect(DataTable2DService.data.hiddenLayers).to.include.members([plugbase]);
      expect(DataTable2DService.data.noTabSelected).to.be.false;
    });

    it('should set noTabSelected to true after close all tabs', function () {
      DataTable2DService.data.currentTab = "gateway";

      DataTable2DService.closeTab("camera");
      DataTable2DService.closeTab("gateway");
      DataTable2DService.closeTab("plugbase");

      expect(DataTable2DService.data.dataTableLayers).to.be.empty;
      expect(DataTable2DService.data.hiddenLayers).to.include.members([gateway, camera, plugbase]);
      expect(DataTable2DService.data.noTabSelected).to.be.true;
    });

  });

});
