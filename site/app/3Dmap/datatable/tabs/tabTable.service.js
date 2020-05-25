'use strict';

module.exports = function () {
  let TabTable = function (_id, _displayName, _icon, _refreshTime, _initializing, _autoRefresh,
                           _updateFunc, _parseResponseFunc) {
    this.id = _id;
    this.name = _displayName;
    this.icon = _icon;
    this.header = [];
    this.body = [];
    this.refreshTime = _refreshTime;
    this.initializing = _initializing;
    this.autoRefresh = _autoRefresh;
    this.updateFunc = _updateFunc;
    this.processForDataTable = _parseResponseFunc;
  };

  TabTable.prototype = {
    update: function () {
      if (this.autoRefresh || this.initializing) {
        this.updateFunc()
          .then(this.initHandler.bind(this))
          .then(this.dataTableHandler.bind(this));
      }
    },

    dataTableHandler: function (response) {
      let data = this.processForDataTable(response, this.id);
      this.header = data["header"];//used for passing data between map and datatable
      this.aliasHeader = data["aliasHeader"];//used for showing in table header
      let length = data["body"].length;
      if (length < 5 && length > 0) {
        for (let i = length; i < 5; i++) {
          data["body"].push([]);
        }
      }
      this.body = data["body"];
    },

    initHandler: function (response) {
      this.initializing = false;
      return response;
    }

  };

  return TabTable;
};
