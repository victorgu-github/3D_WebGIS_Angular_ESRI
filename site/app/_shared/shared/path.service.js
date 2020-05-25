'use strict';

module.exports = function () {
  return {
    getPathParts: function (path) {
      if (!path) {
        return [];
      }
      return path.slice(path.indexOf('/') + 1).split('/');
    }
  };
};
