'use strict';

module.exports = function ($q, MapLayer3D, esriLoader, dataFactory, AccountService, MapLayer3DBuilder, 3D_WebGIS_Angular_ESRI) {

  // devEUI key name for streetlamp
  const DEV_EUI = 3D_WebGIS_Angular_ESRI.DEVICE_EUI;

  let StreetlampLayer = function (_mapLayer, _animationLayer, _view, _id, _title, _items, _layers, _opacity) {
    let layerAttributes = MapLayer3DBuilder.buildAttributes(_mapLayer, streetlampLayerUpdater);

    this.view = _view;
    this.devEUIs = [];
    this._super.call(this, _mapLayer, _animationLayer, _id, _title, _items, _layers, _opacity, false, false,
      layerAttributes.displayName, layerAttributes.icon, layerAttributes.refreshTime, layerAttributes.initializing,
      layerAttributes.autoRefresh, streetlampLayerUpdater, processForDataTable, processForMapView);

    this.resizeSymbol = true;
    if (_mapLayer && _mapLayer.sizeFactor) {
      this.sizeFactor = _mapLayer.sizeFactor;
    } else {
      this.sizeFactor = 1;
    }
    // Size factor for streetlamp
    this.symbolSizeSlideOptions = {
      floor: 1,
      ceil: 10,
      onEnd: function (id, newValue) {
        enlarge(this.mapLayer, newValue);
      }.bind(this)
    };

  };

  function enlarge(layer, factor) {
    //backup symbol
    if (!layer.originalSymbol) {
      layer.originalSymbol = layer.renderer.symbol.clone();
    }
    if (layer && layer.originalSymbol.type === "web-style-symbol") {
      layer.originalSymbol.fetchSymbol().then(function (pointSymbol3D) {
        // clone the retrieved symbol, as properties on it are immutable
        let newSymbol = pointSymbol3D.clone();
        // the first symbolLayer contains the properties that can be modified
        let symbolLayer = newSymbol.symbolLayers.getItemAt(0);
        // change for example the height of the object
        if (symbolLayer.width) {
          symbolLayer.height *= factor;
          symbolLayer.width *= factor;
          symbolLayer.depth *= factor;

        }
        // do something with newSymbol, like setting it on a layer renderer
        let newRenderer = layer.renderer.clone();
        newRenderer.symbol = newSymbol;
        layer.sizeFactor = factor;
        layer.renderer = newRenderer;
      });
    } else if (layer && layer.originalSymbol.type === "point-symbol-3d") {
      let newRenderer = layer.renderer.clone();
      newRenderer.symbol.symbolLayers.items[0].width = layer.originalSymbol.symbolLayers.items[0].width * factor;
      newRenderer.symbol.symbolLayers.items[0].height = layer.originalSymbol.symbolLayers.items[0].height * factor;
      newRenderer.symbol.symbolLayers.items[0].depth = layer.originalSymbol.symbolLayers.items[0].depth * factor;
      layer.sizeFactor = factor;
      layer.renderer = newRenderer;
    }
  }

  function streetlampLayerUpdater() {
    let self = this;
    let staticQuery = esriLoader.require([
      "esri/tasks/support/Query",
      "esri/tasks/QueryTask"
    ]).then(function (modules) {

      return featureLayerQuery(this, modules[1], modules[0]);
    }.bind(this));

    let defer = $q.defer();
    defer.resolve({"deviceStatuses": []});

    let dynamicQuery = defer.promise;

    // Only send request when there are devEUIs, for performance.
    if (this.devEUIs.length > 0) {
      // In case the streetlight deveui contains '-'
      let longDevEUI = this.devEUIs.map(deveui => deveui.replace(/-/g, "").toLowerCase()).join(",");
      dynamicQuery = dataFactory.getLORAdeviceStatus("streetlight", longDevEUI).then((response) => {
        return response.status === "success" ? response.content : {"deviceStatuses": []};
      });
    }

    return $q.all({staticData: staticQuery, dynamicData: dynamicQuery}).then(function (response) {
      // Add dynamic status into feature layer object
      response.staticData.features.forEach(feature => {
        let deviceEUI = feature.attributes[DEV_EUI];
        if (deviceEUI) {
          deviceEUI = deviceEUI.replace(/-/g, "").toLowerCase();
        }
        let found = response.dynamicData.deviceStatuses.find(device => device.devEUI.toLowerCase() === deviceEUI);
        if (found) {
          feature.attributes.dynStatus = found.status;
        } else {
          feature.attributes.dynStatus = "unknown";
        }
        feature.dynStatus = feature.attributes;
      });

      // Need to set refreshExRender to true to allow three js re-render animation.
      if (self.mapLayer) {
        self.mapLayer.dynData = response.staticData.features;
        self.mapLayer.refreshExRender = true;
      }

      return response;
    });
  }

  function featureLayerQuery(self, QueryTask, Query) {
    if (self.featureLayerData) {
      let defer = $q.defer();
      defer.resolve(self.featureLayerData);
      return defer.promise;
    } else {
      let qTask = new QueryTask({
        url: self.mapLayer.parsedUrl.path
      });
      let params = new Query({
        returnGeometry: true,
        returnZ: true,
        outFields: ["*"]
      });
      if (self.mapLayer.definitionExpression) {
        params.where = self.mapLayer.definitionExpression;
      } else {
        params.where = "1=1";
      }

      return qTask.execute(params).then(function (response) {
        self.featureLayerData = response;
        self.featureLayerData.features.forEach(feature => {
          let devEUI = feature.attributes[DEV_EUI];
          if (devEUI) {
            self.devEUIs.push(devEUI);
          }
        });
        return self.featureLayerData;
      });
    }
  }

  function processForDataTable(response) {
    let header = [];
    let staticAliasHeader=[];
    let body = [];

    if (response.staticData.features.length > 0) {
      for (let i = 0; i < response.staticData.fields.length; i++) {
        header.push(response.staticData.fields[i].name);
        staticAliasHeader.push(response.staticData.fields[i].alias);
      }
      header.push('dynStatus');
      staticAliasHeader.push('dynStatus');
      for (let i = 0; i < response.staticData.features.length; i++) {
        let row = [];

        // Get feature layer static data
        for (let j = 0; j < header.length; j++) {
          let val = response.staticData.features[i].attributes[header[j]];
          row.push(val);
        }

        body.push(row);
      }
    }

    return {
      "header": header,
      "aliasHeader": staticAliasHeader,
      "body": body
    };
  }

  function processForMapView(response) {
    return response;
  }

  // StreetlampLayer is sub layer of MapLayer3D
  MapLayer3DBuilder.extends(MapLayer3D, StreetlampLayer);

  return StreetlampLayer;
};
