'use strict';

module.exports = function ($injector) {
  const deployToShanghai = process.env.SHANGHAI;


  this.nodeServer = "http://www.3D_WebGIS_Angular_ESRI.com.cn:8000/";
  this.locality = "en";

  // if (deployToShanghai) {
  //   // Shanghai IDC env
  //   this.nodeServer = "http://222.73.246.22:8000/";
  //   this.locality = "cn";
  // } else {
  //   // Calgary office env by default
  //   this.nodeServer = "http://207.34.103.154:8000/";
  //   this.locality = "en";
  // }

  let scenarioConfig1 = $injector.get('scenarioConfig1');
  let scenarioConfig2 = $injector.get('scenarioConfig2');
  let scenarioConfig3 = $injector.get('scenarioConfig3');
  let scenarioConfig4 = $injector.get('scenarioConfig4');
  let scenarioConfig5 = $injector.get('scenarioConfig5');
  let scenarioConfig6 = $injector.get('scenarioConfig6');
  let scenarioConfig8 = $injector.get('scenarioConfig8');

  this.tiledLayerBaseURL = "http://appgis.3D_WebGIS_Angular_ESRI.com.cn/server/rest/services/Hosted";
  this.featureLayerBaseURL = "http://appgis.3D_WebGIS_Angular_ESRI.com.cn/server/rest/services/Hosted";
  this.TIME_TO_IDLE = 60; // If user has no action within 1 minute, enter idle phase
  this.TIME_TO_LOGOUT = 60 * 60; // Force user to logout after one hour idle phase
  this.Scenarios = [
    //Order 1 6 2 3 4 5, follow the previous order
    scenarioConfig1.scenario,
    scenarioConfig6.scenario,
    scenarioConfig2.scenario,
    scenarioConfig3.scenario,
    scenarioConfig4.scenario,
    scenarioConfig5.scenario,
    scenarioConfig8.scenario
  ];
};
