'use strict';

module.exports = function ($translate) {

  this.popupForDataTable = function (popupWrapper) {
    let {data, view, popup} = popupWrapper;
    let mac = data.featureId;

    popup.title = mac;
    let macAddress = $translate.instant("Mac Address");
    popup.content = `<ul><li>${macAddress}: ${mac}</li></ul>`;

    view.popup = popup;
    view.popup.visible = true;

  };

};
