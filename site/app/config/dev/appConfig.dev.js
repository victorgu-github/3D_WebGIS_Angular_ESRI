'use strict';

module.exports = function ($injector) {
  let scenarioConfig1 = $injector.get('scenarioConfig1');
  let scenarioConfig2 = $injector.get('scenarioConfig2');
  let scenarioConfig3 = $injector.get('scenarioConfig3');
  let scenarioConfig4 = $injector.get('scenarioConfig4');
  let scenarioConfig5 = $injector.get('scenarioConfig5');
  let scenarioConfig6 = $injector.get('scenarioConfig6');
  let scenarioConfig7 = $injector.get('scenarioConfig7');
  let scenarioConfig8 = $injector.get('scenarioConfig8');

  this.nodeServer = "http://207.34.103.154:8100/";
  this.locality = "en";

  // if (process.env.SHANGHAI) {
  //   this.nodeServer = "http://shanghai.3D_WebGIS_Angular_ESRI.com:8100/";
  //   this.locality = "cn";
  // } else {
  //   this.nodeServer = "http://207.34.103.154:8100/";
  //   this.locality = "en";
  // }
  this.tiledLayerBaseURL = "https://tiles.arcgis.com/tiles/gSP83wC6PGs7J2Yu/arcgis/rest/services";
  this.featureLayerBaseURL = "https://services7.arcgis.com/gSP83wC6PGs7J2Yu/ArcGIS/rest/services";
  this.TIME_TO_IDLE = 10; // If user has no action within 1 minute, enter idle phase
  this.TIME_TO_LOGOUT = 3600; // Force user to logout after one hour idle phase
  this.Scenarios = [
    //Order 1 6 2 3 4 5, follow the previous order
    scenarioConfig1.scenario,
    scenarioConfig6.scenario,
    scenarioConfig2.scenario,
    scenarioConfig3.scenario,
    scenarioConfig4.scenario,
    scenarioConfig5.scenario,
    scenarioConfig7.scenario,
    scenarioConfig8.scenario
  ];
};
