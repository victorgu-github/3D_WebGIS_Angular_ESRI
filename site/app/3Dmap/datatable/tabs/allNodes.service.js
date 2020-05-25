'use strict';

module.exports = function (dataFactory, AccountService, nodeServerParser, TabTable) {

  //Default Scenario for "Calgary University"
  let scenarioID = AccountService.userInfo.settings.currentScenario.scenarioID;

  let scenario = AccountService.userInfo.settings.Scenarios.find(scenario => scenarioID === scenario.scenarioID);

  if (!scenario) {
    scenario = AccountService.userInfo.settings.Scenarios[0];
  }

  let allNodesConfig = scenario.dynamicLayers["APE_RealTime"];

  let _displayName = allNodesConfig.title;
  let _icon = "signal";
  let _initializing = true;
  let _refreshTime = 10000;
  let _autoRefresh = false;
  if (allNodesConfig.dataTableConfig) {
    _icon = allNodesConfig.dataTableConfig.icon;
    _initializing = allNodesConfig.dataTableConfig.initializing;
    _refreshTime = allNodesConfig.dataTableConfig.refreshTime;
    _autoRefresh = allNodesConfig.dataTableConfig.autoRefresh;
  }

  return new TabTable(allNodesConfig.id, _displayName, _icon, _refreshTime, _initializing,
    _autoRefresh, dataFactory.getPos4AllNodes, nodeServerParser.parseJson);

};
