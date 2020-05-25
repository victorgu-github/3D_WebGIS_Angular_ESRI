'use strict';

module.exports = function (AccountService) {

  this.extends = function (BaseClass, SubClass) {
    SubClass.prototype = Object.create(BaseClass.prototype);

    SubClass.prototype.constructor = SubClass;

    SubClass.prototype._super = BaseClass;
  };

  this.buildAttributes = function (layer, featureLayerQuery, isUnderground) {
    if (isUnderground) {
      return generateAttributes(layer, featureLayerQuery, true);
    } else {
      return generateAttributes(layer, featureLayerQuery, false);
    }
  };

  function generateAttributes(layer, esriFeatureLayerQuery, isUnderground) {
    let _icon = "signal";
    let currentScenarioID = AccountService.userInfo.settings.currentScenario.scenarioID;

    let currentScenario = AccountService.userInfo.settings.Scenarios.find(scenario =>
      scenario.scenarioID === currentScenarioID
    ) || AccountService.userInfo.settings.Scenarios[0].scenario3Dlayers;

    // We assume there is a matched scenario3Dlayers in config, otherwise it will throw exception.
    let esriLayers = isUnderground ? currentScenario.undergroundLayers.scenario3Dlayers : currentScenario.scenario3Dlayers;

    let targetLayer = esriLayers.find(layerType =>
      layerType.id === layer.id
    );

    let _initializing = true;
    let _refreshTime = 10000;
    let _autoRefresh = false;

    if (targetLayer) {
      _icon = targetLayer.dataTableConfig.icon;
      _autoRefresh = targetLayer.dataTableConfig.autoRefresh;
      _refreshTime = targetLayer.dataTableConfig.refreshTime;
    }

    return {
      displayName: layer.title,
      icon: _icon,
      refreshTime: _refreshTime,
      initializing: _initializing,
      autoRefresh: _autoRefresh,
      updateFunc: esriFeatureLayerQuery
    };
  }
};
