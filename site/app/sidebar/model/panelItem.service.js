'use strict';

module.exports = function () {

  let PanelItem = function (_name, _icon, _templateUrl, _isActive) {
    this.name = _name;
    this.icon = _icon;
    this.templateUrl = _templateUrl;
    this.isActive = _isActive;
  };

  PanelItem.prototype = {};

  return PanelItem;
};
