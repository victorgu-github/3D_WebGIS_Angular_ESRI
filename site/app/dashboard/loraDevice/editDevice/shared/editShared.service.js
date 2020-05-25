'use strict';

module.exports = function () {
    let self = this;
    self.editSharedEntry = {};
    self.editOriginEntry = {};
    self.editSharedMaintenanceEntry = {};

    self.updateAttribute = function (targetObject, newObject, oldObject, key) {
        //Independant update each of the attributes
        if (newObject[key] === oldObject[key]) {
            delete targetObject[key];
        } else {
            targetObject[key] = newObject[key];
        }
    };
};
