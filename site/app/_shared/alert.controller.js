'use strict';

module.exports = function ($scope) {
  $scope.showAlert = false;
  $scope.hideAlert = function () {
    $scope.showAlert = false;
  };
};
