'use strict';

module.exports = function () {
  return {
    isMobile: function () {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
    }
  };
};
