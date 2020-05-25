'use strict';

module.exports = function ($http, $cookies, AccountService) {

  // Run on startup
  let userInfo = $cookies.getObject("userInfo");
  if (userInfo) {
    AccountService.syncSettings(JSON.parse(JSON.stringify(userInfo)));
    AccountService.setDefaultIDs();
  }
};
