'use strict';

module.exports = function (dataFactory, nodeServerParser, TabTable, esriLoader, AccountService) {

  // We adopt font awesome, so find a good icon to represent your service. See: http://fontawesome.io/cheatsheet/

  let _initializing = true;
  let _refreshTime = 10000;
  let _autoRefresh = false;
  let esriLayers;

  this.setESRILayerByScenario = function () {
    let currentScenarioID = AccountService.userInfo.settings.currentScenario.scenarioID;
    let scenario = AccountService.userInfo.settings.Scenarios.find(scenario => {
      return scenario.scenarioID === currentScenarioID;
    }) || AccountService.userInfo.settings.Scenarios[0];

    esriLayers = scenario.scenario3Dlayers;
  };

  function parseESRIfeatureLayer(response) {
    let header = [];
    let aLiasHeader = [];
    let body = [];
    if (response.features.length > 0) {
      for (let i=0;i<response.fields.length;i++)
      {
        header.push(response.fields[i].name);
        aLiasHeader.push(response.fields[i].alias);
      }
      for (let i = 0; i < response.features.length; i++) {
        let row = [];
        for (let j = 0; j < header.length; j++) {
          let val = response.features[i].attributes[header[j]];
          row.push(val);
        }
        body.push(row);
      }
    }
    return {
      "header": header,
      "aliasHeader":aLiasHeader,
      "body": body
    };
  }

  function ESRIfeatureLayerQuery(layer) {
    let self = this;
    self.layer = layer;
    self.query = function () {
      return esriLoader.require([
        "esri/tasks/support/Query",
        "esri/tasks/QueryTask"
      ]).then(function (modules) {

        let Query = modules[0],
          QueryTask = modules[1],
          qTask = new QueryTask({
            url: self.layer.parsedUrl.path
          }),
          params = new Query({
            returnGeometry: true,
            outFields: ["*"]
          });
        if (self.layer.definitionExpression) {
          params.where = self.layer.definitionExpression;
        }
        else {
          params.where = "1=1";
        }
        // executes the query and calls getResults() once the promise is resolved
        // promiseRejected() is called if the promise is rejected
        return qTask.execute(params)
          .then(function (response) {
            return response;//return all not only features
          });
      });
    };
  }

  this.generateTab = function (layer) {
    let esrIfeatureLayerQuery = new ESRIfeatureLayerQuery(layer);
    let _icon = "signal";

    let layerConfig = esriLayers.find(config => config.id === layer.id);

    if (layerConfig && layerConfig.dataTableConfig) {
      _icon = layerConfig.dataTableConfig.icon;
      _autoRefresh = layerConfig.dataTableConfig.autoRefresh;
      _refreshTime = layerConfig.dataTableConfig.refreshTime;
    }

    if (layer.bindWithNodeServer) {
      esrIfeatureLayerQuery.query()
        .then(function (data) {
          this.dynData = data;
          this.refreshExRender = true;
        }.bind(layer));
    }

    return new TabTable(layer.id, layer.title, _icon, _refreshTime, _initializing, _autoRefresh,
      esrIfeatureLayerQuery.query, parseESRIfeatureLayer);
  };

};
