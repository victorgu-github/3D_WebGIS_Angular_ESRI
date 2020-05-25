'use strict';

module.exports = function ($scope, $routeParams, $window, CollectionUtils, AccountService) {
    const correctRouteParamsArray = ["overview"];

    $scope.userInfo = AccountService.userInfo;
    $scope.settings = AccountService.userInfo.settings;
    $scope.scenario = "ACCOUNT.PROFILE.OVERVIEW.SELECT_SCENARIO";
    $scope.scenarios = AccountService.userInfo.settings.Scenarios;
    $scope.currentScenario = AccountService.userInfo.settings.currentScenario;
    $scope.currentScenarioDetail = findCurrentScenario($scope.currentScenario, $scope.scenarios);
    $scope.panels = [{
        name: "Overview",
        displayName: "ACCOUNT.PROFILE.OVERVIEW.NAME",
        icon: "tachometer",
        isActive: true,
        templateUrl: "account/profile/profile.html",
    }];

    /////////////////////////////////////////
    //
    // Init Function
    //
    /////////////////////////////////////////

    checkUrlAndInitPage();

    /////////////////////////////////////////
    //
    // Widget Function
    //
    /////////////////////////////////////////

    $scope.navigateTo = function (panel) {
        $scope.panels.forEach(function (panel) {
            panel.isActive = false;
        });
        panel.isActive = true;
    };

    /////////////////////////////////////////
    //
    // Private Function
    //
    /////////////////////////////////////////

    function checkUrlAndInitPage() {
        let panelName = $routeParams.panelName;
        let isCorrectRouteParams = CollectionUtils.isCorrectRouteParams(panelName, correctRouteParamsArray);
        if (!isCorrectRouteParams) {
            $scope.displayPageNotFoundTemplate = true;
        }
        else {
            $scope.displayPageNotFoundTemplate = false;
            initNavs();
        }
    }

    function initNavs() {
        $scope.panels.forEach(function (panel) {
            let name = panel.name.toLowerCase().replace(/ /g, "-");
            panel.isActive = name === $routeParams.panelName;
        });
    }

    //Find current scenario according current scenario id and scenarios array
    function findCurrentScenario(currentScenario, scenarios) {
        let result = {};
        let id = currentScenario.scenarioID;
        for (let index in scenarios) {
            let scenario = scenarios[index];
            if (scenario.scenarioID === id) {
                result = scenario;
            }
        }
        return result;
    }
};