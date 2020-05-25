'use strict';

module.exports = function ($scope, $translate, appConfig) {

  let self = this;

  self.setLanguage = function (lang) {
    if (lang === 'cn') {
      $scope.currentLanguage = "简体中文";
    } else {
      $scope.currentLanguage = "English";
    }
    $translate.use(lang);
  };

  // If appConfig.locality exists, it means it's prod env, we should hide switch list.
  if (appConfig.locality) {
    $scope.hidden = true;
    self.setLanguage(appConfig.locality);
  } else {
    // English by default
    self.setLanguage('en');
  }

};
