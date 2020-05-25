'use strict';

module.exports = function ($scope, $window, $routeParams, AccountService, CompanySharedService, CollectionUtils, 
    dashboardSharedService) {
    const correctRouteParamsArray = ["overview"];

    $scope.userInfo = AccountService.userInfo;
    $scope.data = {
        dashboardOverviewPageUrl: CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo)
    };

    ///////////////////////////////////////////
    //
    // Init Function
    //
    ///////////////////////////////////////////

    checkUrlAndInitPage();

    ///////////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////////

    function checkUrlAndInitPage() {
        let panelName = $routeParams.panelName;
        let isCorrectRouteParams = CollectionUtils.isCorrectRouteParams(panelName, correctRouteParamsArray);
        if (!isCorrectRouteParams) {
            $scope.displayPageNotFoundTemplate = true;
        }
        else {
            $scope.displayPageNotFoundTemplate = false;
            initCompanyInfo();
        }
    }

    function initCompanyInfo() {
        CompanySharedService.getCompanys().then(function (response) {
            if (response.status === "success") {
                let companys = response.content;
                let company = companys.find((company) => { return company.companyID === AccountService.userInfo.companyID; });
                $scope.companyName = company.companyName;
            }
            else {
                let errMsg = dashboardSharedService.parseErrorMessage(response.errors);
                $window.alert("Error occurred due to: " + errMsg);
            }
        });
    }
};