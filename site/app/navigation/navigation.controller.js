'use strict';

module.exports = function ($scope, $rootScope, $window, $location, 3D_WebGIS_Angular_ESRI, AccountService, SidebarService, 
  CollectionUtils, dashboardSharedService, GeneralUserAppSharedService) {

  //Initialize sidebar and sidebar toggle according to scenarioID
  //1.User who has scenarioID will display the side bar
  //2.User who doesn't have the scenarioID won't display the side bar
  let userInfo = AccountService.userInfo;

  $scope.isCellPhone = userInfo.isCellPhone;
  $scope.copyRight   = userInfo.isCellPhone ? "COPYRIGHT_BRIEF" : "COPYRIGHT";

  ///////////////////////////////////////////////////////////
  //
  // Init Function
  //
  ///////////////////////////////////////////////////////////
  
  //Notice:This function cannot be placed in dashboard.controller.js, otherwise it will be destroied if we are not staying in the dashboard page
  display3DMapSideBar();

  /////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  /////////////////////////////////////////////////////////

  //1. If the device is mobile cell phone:
  //a. If the current page is dashboard overview page, only toggle the dashboard sidebar
  //b. If the current page is not dashboard overview page, redirect back to overview page and then toggle sidebar
  //2. If the device is desktop, no matter user is admin user or general user, toggle 3D map sidebar
  $scope.toggle = function () {
    if ($scope.isCellPhone) {
      let currentUrl = $location.absUrl();
      if (currentUrl.includes("dashboard/generalUserCellPhone")) {
        dashboardSharedService.toggleDashboardSidebar();
      }
      else {
        $location.url(CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo));
        dashboardSharedService.toggleDashboardSidebar();
      }
    }
    //1. 'ToggleSidebar' event will invoke two function:
    //a. sidebar.controller -> sidebar.service, toggle the 3D map sidebar
    //b. dashboardForGenUsr, set animation for $(".dashboard__navigation-for-gen-usr"), move it according sidebar slide  
    else if (!$scope.isCellPhone && $scope.enableToggle) {
      $rootScope.$broadcast('ToggleSidebar', {});
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  //Determine if we need to display 3D Map sidebar
  //1.If user is general user:
  //a.If user login from cell phone, don't display 3D Map sidebar;
  //b.If user login from desktop and have scenario, which comes from general user application info, then display the 3D Map sidebar
  //2.If user is admin user:
  //a.If user doesn't have scenario, don't display 3D Map sidebar;
  //b.If user have scenario, display 3D Map sidebar
  function display3DMapSideBar(){
    if (userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER) {
      $scope.enableToggle = false;
      SidebarService.sidebar.checked = false;
      let generalAppIDs = userInfo.generalAppIDs;
      if (generalAppIDs && generalAppIDs.length !== 0) {
        GeneralUserAppSharedService.getGeneralUsrAppsByGenUsrAppID(generalAppIDs).then(function (response) {
          if (response.status === "success") {
            let generalUsrApps = response.content;
            for (let index in generalUsrApps) {
              let generalUsrApp = generalUsrApps[index];
              if (!$scope.isCellPhone && generalUsrApp.scenarioID !== undefined && generalUsrApp.scenarioID !== null) {
                $scope.enableToggle = true;
                SidebarService.sidebar.checked = true;
                break;
              }
            }
          }
        });
      }
    }
    else if (userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.ADMIN_USER) {
      if (userInfo.settings.Scenarios.length === 0) {
        $scope.enableToggle = false;
        SidebarService.sidebar.checked = false;
      }
      else {
        $scope.enableToggle = true;
        SidebarService.sidebar.checked = true;
      }
    }
  }

  //Angularjs listen url change event and do following operation:
  //[Notice: these two operation will not affect admin user, because admin dashboard sidebar is not slide page]
  //1. close modal when url change
  //2. close profile page when url change
  $scope.$on('$routeChangeStart', function () {
    if (AccountService.userInfo.isCellPhone && !$location.absUrl().includes("dashboard/generalUserCellPhone/overview")) {
      dashboardSharedService.closeSidebar();
    }
    angular.element('.modal-backdrop').remove();
    angular.element('[data-toggle="dropdown"]').parent().removeClass('open');
  });
};
