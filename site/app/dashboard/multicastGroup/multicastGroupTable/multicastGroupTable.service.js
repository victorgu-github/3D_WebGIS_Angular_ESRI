'use strict';

module.exports = function () {
    let self = this;

    /////////////////////////////////////////////////
    //
    // Shared Function
    //
    /////////////////////////////////////////////////

    //Find LoRa Multicast Groups Array
    self.getMulticastGroupsArray = function (multicastSessions) {
        let array = [];
        for (let index in multicastSessions) {
            let multicastSession = multicastSessions[index];
            let multicastGroups = multicastSession.data;
            array = array.concat(multicastGroups);
        }
        return array;
    };
};