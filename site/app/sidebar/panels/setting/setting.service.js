'use strict';

module.exports = function () {

  let self = this;

  self.controller = null;
  self.currentEnvironment;

  self.setting = {
    name: "SIDEBAR.SETTINGS",
    visible: true,
    templateUrl: "app/views/sidebar/views/setting.html",
    panels: [
      {
        title: "SIDEBAR.TIME_SETTINGS"
      }
    ]
  };
};
