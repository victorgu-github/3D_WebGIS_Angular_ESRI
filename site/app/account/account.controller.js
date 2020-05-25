'use strict';

module.exports = function ($scope, $rootScope, $http, $cookies, $location, $translate, 3D_WebGIS_Angular_ESRI, AccountService, 
  CollectionUtils) {

  const GENERAL_USER                    = 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER;
  const DROPDOWN_MENU_CLASS_FOR_DESKTOP = "dropdown-profile dropdown-menu profile-dorpdown-menu-for-desktop";
  const DROPDOWN_MENU_CLASS_FOR_MOBILE  = "dropdown-profile dropdown-menu profile-dorpdown-menu-for-mobile";

  let ADMIN_USER_DISPLAY         = "ACCOUNT.ADMIN";
  let GENERAL_USER_DISPLAY       = "ACCOUNT.GENERAL";
  let ADMIN_USER_BRIEF_DISPLAY   = "ACCOUNT.ADMIN_BRIEF";
  let GENERAL_USER_BRIEF_DISPLAY = "ACCOUNT.GENERAL_BRIEF";

  let self = this;

  $scope.adminUser = {
    userName: "",
    password: ""
  };
  $scope.generalUser = {
    userName: "",
    password: ""
  };
  $scope.userInfo = AccountService.userInfo;
  //If user device type is cell phone, we display 6 letters of first name in account panel
  //If user device type is not cell phone, we display 10 letters of first name in account panel
  if ($scope.userInfo.isCellPhone) {
    showBriefTitle();
  }
  else {
    showCompleteTitle();
  }

  $scope.siteTheme = process.env.SHANGHAI ? "Shanghai" : "Calgary";
  //Variable determine the login page is used for admin user or general user login
  $scope.adminUserLoginPage = true;
  //Variable determine the button group style
  let activeClass = 'active btn btn-primary';
  let inactiveClass = 'btn btn-primary';
  $scope.adminLoginPageClass = activeClass;
  $scope.generalLoginPageClass = inactiveClass;

  //////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  //////////////////////////////////////////////////////////

  $scope.cleanAdminUsrErrMsg = function () {
    $scope.userInfo.adminUserLoginFailedMsg = "";
  };

  $scope.cleanGeneralUsrErrMsg = function () {
    $scope.userInfo.generalUserLoginFailedMsg = "";
  };

  $scope.changeToAdminUser = function () {
    $scope.adminUserLoginPage = true;
    $scope.adminLoginPageClass = activeClass;
    $scope.generalLoginPageClass = inactiveClass;
  };

  $scope.changeToGeneralUser = function () {
    $scope.adminUserLoginPage = false;
    $scope.adminLoginPageClass = inactiveClass;
    $scope.generalLoginPageClass = activeClass;
  };

  //Redirect dashboard overview page for profile panel "Dashboard" link
  $scope.redirectToOverviewPage = function () {
    $location.url(CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo));
  };

  $scope.redirectToProfilePage = function () {
    if (AccountService.userInfo.currentUserType === "ACCOUNT.GENERAL") {
      $location.url("/login/profileForGenUsr/overview");
    }
    else {
      $location.url("/login/profile/overview");
    }
  };

  $scope.getProfileDropdownMenuClass = function () {
    return AccountService.userInfo.isCellPhone ? DROPDOWN_MENU_CLASS_FOR_MOBILE : DROPDOWN_MENU_CLASS_FOR_DESKTOP;
  };

  //////////////////////////////////////////////////////////
  //
  // User Login Function
  //
  //////////////////////////////////////////////////////////

  self.adminUserLogin = function () {
    AccountService.adminUserLogin({ username: $scope.adminUser.userName, password: $scope.adminUser.password });
    $translate('3D_WebGIS_Angular_ESRI_MAP').then((title) => {
      document.title = title;
    }).catch(() => {
      document.title = '3D_WebGIS_Angular_ESRI Map';
    });
  };

  self.generalUserLogin = function () {
    AccountService.generalUserLogin({ userName: $scope.generalUser.userName, password: $scope.generalUser.password });
    $translate('3D_WebGIS_Angular_ESRI_MAP').then((title) => {
      document.title = title;
    }).catch(() => {
      document.title = '3D_WebGIS_Angular_ESRI Map';
    });
  };

  self.logout = function() {
    AccountService.logout();
  };

  function showBriefTitle() {
    $scope.firstName = $scope.userInfo.firstName.length <= 6 ? $scope.userInfo.firstName : $scope.userInfo.firstName.substring(0, 6) + "...";
    $scope.lastName = $scope.userInfo.lastName.length <= 6 ? $scope.userInfo.lastName : $scope.userInfo.lastName.substring(0, 6) + "...";
    $scope.currentUserType = $scope.userInfo.currentUserType === GENERAL_USER ? GENERAL_USER_BRIEF_DISPLAY : ADMIN_USER_BRIEF_DISPLAY;
    $(".account-panel-container").css("margin-top", "5px");
  }

  function showCompleteTitle() {
    $scope.firstName = $scope.userInfo.firstName.length <= 50 ? $scope.userInfo.firstName : $scope.userInfo.firstName.substring(0, 50) + "...";
    $scope.lastName = $scope.userInfo.lastName.length <= 50 ? $scope.userInfo.lastName : $scope.userInfo.lastName.substring(0, 50) + "...";
    $scope.currentUserType = $scope.userInfo.currentUserType === GENERAL_USER ? GENERAL_USER_DISPLAY : ADMIN_USER_DISPLAY;
  }
  
  /////////////////////////////////////////////////////////////
  //
  // JQuery function
  //
  /////////////////////////////////////////////////////////////

  $(document).ready(function () {
    let cellPhone = isCellPhone();
    let loginPage = isLoginPage();
    if (loginPage && cellPhone) {
      $('#esri-container-footer').remove();
    }
  });

  //Detect the device type is cell phone or not, according to html5 navigator
  function isCellPhone() {
    let is_other_cell_phone = /iPhone|BlackBerry|IEMobile/i.test(navigator.userAgent);
    let is_android_cell_phone = /^.*?\bAndroid\b.*?\bMobile\b.*?$/m.test(navigator.userAgent);
    return is_other_cell_phone || is_android_cell_phone;
  }

  function isLoginPage() {
    let result = false;
    if ($location.absUrl().includes("login")) {
      result = true;
    }
    return result;
  }
};