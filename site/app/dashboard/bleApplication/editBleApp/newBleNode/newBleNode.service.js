'use strict';

module.exports = function () {
    let self = this;
    self.getValidForeignKeys = function (foreignKeys) {
        let result = [];
        for (let index in foreignKeys) {
            let foreignKey = foreignKeys[index];
            //If foreignKey.keyName is null or "", don't send it to backend
            if (foreignKey.keyName !== undefined && (foreignKey.keyName === null || foreignKey.keyName === "")) {
                delete foreignKey.keyName;
            }
            if (foreignKey.keyValue !== undefined && (foreignKey.keyValue === null || foreignKey.keyValue === "")) {
                delete foreignKey.keyValue;
            }
            result.push(foreignKey);
        }
        return result;
    };
};