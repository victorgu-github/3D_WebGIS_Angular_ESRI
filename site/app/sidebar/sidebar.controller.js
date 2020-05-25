'use strict';

module.exports = function ($scope, $rootScope, $timeout, $location, SidebarService, PageNameService, AccountService) {
  $scope.sidebar     = SidebarService.sidebar;
  $scope.isCellPhone = AccountService.userInfo.isCellPhone;
  $scope.theme = "sidebar-container-dark";

  $scope.togglePanel = function (name) {
    SidebarService.togglePanel(name);
    initSlider();
  };

  $scope.filterPanelItems = function (items) {
    return items.filter(item => item.link === undefined);
  };

  $scope.$watch(PageNameService.getCurrentPageName, function (newVal) {
    $scope.items = SidebarService.getSidebarItems(newVal);
    SidebarService.closePanel();
  });

  $scope.$watch(AccountService.currentScenarioID, function (newVal) {
    if (newVal) {
      $scope.items = SidebarService.getSidebarItems(PageNameService.getCurrentPageName());
      SidebarService.closePanel();
    }
  });

  $scope.$on("ToggleSidebar", function () {
    SidebarService.toggleSidebar();
  });

  $scope.redirect = function (link) {
    $location.url(link);
  };

  function initSlider() {
    $timeout(function () {
      $scope.$broadcast('rzSliderForceRender');
    });
  }
};
