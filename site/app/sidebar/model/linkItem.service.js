'use strict';

module.exports = function () {

  let LinkItem = function (_name, _icon, _link) {
    this.name = _name;
    this.icon = _icon;
    this.link = _link;
  };

  LinkItem.prototype = {};

  return LinkItem;
};
