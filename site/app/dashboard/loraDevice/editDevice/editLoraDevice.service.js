'use strict';

module.exports = function () {
    let self = this;

    self.getSubTypes = function (subTypeMap, editEntry) {
        let subTypes = [];
        subTypes = subTypeMap[editEntry.DevType];
        if (subTypes !== undefined && subTypes !== null) {
            if (subTypes.length !== 0 && !subTypes.includes("")) {
                subTypes.unshift("");
            }
        }
        return subTypes;
    };
};
