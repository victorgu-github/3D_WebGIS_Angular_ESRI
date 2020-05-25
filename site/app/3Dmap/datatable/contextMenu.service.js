'use strict';

module.exports = function ($translate, dataTableService, CollectionUtils) {
  const ADD_NEW_TAB = "DATATABLE.CONTROL.ADD_NEW_TAB";
  const CLOSE_VIEW = "DATATABLE.CONTROL.CLOSE_VIEW";

  let self = this;
  self.menuServices = {};

  self.generateMenuOptions = function () {
    let services = [];

    CollectionUtils.clearObject(self.menuServices);
    updateMenu(dataTableService.services);

    for (let key in self.menuServices) {
      let service = self.menuServices[key];
      services.push([service.name, function () {
        let tab = dataTableService.findTabByID(service.id);

        if (!tab) {
          dataTableService.services.push(service);
          dataTableService.openTab(service.id);
        } else {
          dataTableService.switchTab(service.id);
        }
      }]);
    }

    return [
      [$translate.instant(ADD_NEW_TAB), function () {
        // When clicking add new tab
      }, services],
      null, // Divider
      [$translate.instant(CLOSE_VIEW), function () {
        dataTableService.closeView();
      }]
    ];
  };

  function updateMenu(services) {
    for (let i = 0; i < services.length; i++) {
      let service = services[i];
      if (!self.menuServices[service.id]) {
        self.menuServices[service.id] = service;
      }
    }
  }

};
