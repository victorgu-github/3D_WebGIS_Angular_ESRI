'use strict';

module.exports = function () {
  // Default page name is 3D view
  let currentPageName = "3D View";

  this.setCurrentPageName = function (pageName) {
    currentPageName = pageName;
  };

  this.getCurrentPageName = function () {
    return currentPageName;
  };

};
