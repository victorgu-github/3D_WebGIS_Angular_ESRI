'use strict';

module.exports = function ($scope, $location) {
    $scope.path = $location.path();
    $scope.back = function () {
        history.back();
    };
};
