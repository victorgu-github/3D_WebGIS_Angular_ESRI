'use strict';

let LayerActionItem = require('./layerActionItem.service');
let LinkItem = require('./linkItem.service');
let MapLayer = require('./mapLayer.service');
let PanelItem = require('./panelItem.service');

module.exports = angular.module('3D_WebGIS_Angular_ESRIMap.sidebar.model', [])
  .service('PanelItem', PanelItem)
  .service('MapLayer', MapLayer)
  .service('LinkItem', LinkItem)
  .service('LayerActionItem', [LayerActionItem]);

