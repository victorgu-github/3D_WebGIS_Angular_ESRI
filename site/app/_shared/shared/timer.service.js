'use strict';

module.exports = function (dataFactory, sceneViewDataService) {

  this.updateViewFromNodeServer = function (self) {
    return window.setInterval(function () {
      if (self.realtimeLayer && self.realtimeLayer.visible && self.allNode.visible) {
        dataFactory.getPos4AllDisplayingNodes(self).then(function (data) {
          sceneViewDataService.process(self, data);
        });
      }
      if (self.waterTankGraphicLayer) {

        sceneViewDataService.processWaterTank(self);
      }
      if (self.waterSensorGraphicLayer) {
        sceneViewDataService.processWaterSensor(self);
      }
      if (self.Power3DGraphicLayer) {
        sceneViewDataService.processPower3D(self);
      }
    }, 10000);
  };

  this.clearIntervals = function (intervals) {
    intervals.forEach(function (intervalId) {
      window.clearInterval(intervalId);
    });
  };

  this.clearIntervalObject = function (intervalObject) {
    for (let key in intervalObject) {
      if (intervalObject.hasOwnProperty(key)) {
        window.clearInterval(intervalObject[key]);
      }
    }
  };

};
