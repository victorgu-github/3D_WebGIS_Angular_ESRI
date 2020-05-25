'use strict';

module.exports = function ($rootScope, $location, $cookies, $route, $window, Idle, PageNameService) {
  // to check and redirect unauthorized access to login page, checking by `authToken`
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    // Update account service current url
    if (!$rootScope.urlBeforeLogin && next.pageName !== "Login") {
      $rootScope.urlBeforeLogin = $location.$$absUrl;
    }
    else if (!$rootScope.urlBeforeLogin && next.pageName === "Login") {
      $rootScope.urlBeforeLogin = "/";
    }

    // For general user, we also need to record the pageNameBeforeLogin
    // If user want to go to 3D map, we need to use it to redirect to dashbaord overview page
    if (!$rootScope.pageNameBeforeLogin) {
      $rootScope.pageNameBeforeLogin = next.pageName;
    }
    // check user signed in or not
    $rootScope.userInfo = $cookies.getObject("userInfo");
    $rootScope.authToken = $cookies.get("authToken");

    if ($rootScope.userInfo && $rootScope.authToken) {
      $rootScope.userInfo = JSON.parse(JSON.stringify($rootScope.userInfo));
    }

    if (!$rootScope.authToken) {
      if (next.templateUrl !== "./account/loginPage/loginPage.html") {
        $location.path("/login");
      }
    } else if ($rootScope.userInfo.email === "shanghai_dashboard@3D_WebGIS_Angular_ESRI.com") {
      if (!current) {
        if (next.pageName !== "Dashboard" && next.pageName !== "Login") {
          $location.path("/dashboard/overview");
        }
      } else {
        if (next.pageName !== "Dashboard" && next.pageName !== "Login") {
          if (current.pageName === "Dashboard") {
            $window.alert(`User <${$rootScope.userInfo.email}> is only allowed to access Dashboard page.`);
            event.preventDefault();
          } else if (current.pageName === "Login") {
            $window.alert(`User <${$rootScope.userInfo.email}> is only allowed to access Dashboard page.`);
            $location.path("/dashboard/overview");
          } else {
            $location.path("/dashboard/overview");
          }
        }
      }
    }

  });
  // Change page title, based on Route information
  // Callback arguments are currentRoute and previousRoute
  $rootScope.$on("$routeChangeSuccess", function () {
    if ($route.current.pageName === "3D View") {
      Idle.watch();
    } else {
      Idle.unwatch();
    }
    PageNameService.setCurrentPageName($route.current.pageName);
  });
};