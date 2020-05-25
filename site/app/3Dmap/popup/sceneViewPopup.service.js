'use strict';

module.exports = function ($translate, esriLoader) {
  const BUILDING_FLOORS = "BUILDING_FLOORS";
  const GO_TO_LEVEL = "GO_TO_LEVEL";

  this.popupForClick = function (popupWrapper) {
    let {view, evt, controller, graphic, layer} = popupWrapper;
    let OID = graphic.attributes.OID;

    view.whenLayerView(layer).then(function (lyrView) {
      esriLoader.require(["esri/tasks/support/Query"], function (Query) {
        let query = new Query();
        // set query to retrieve data by OID
        query.objectIds = [OID];
        // the query should return all attributes
        query.outFields = ["*"];
        // perform the query
        lyrView.queryFeatures(query).then(function (result) {
          //return if 3d scene layer does not meet with data requirement
          if (result.features[0].attributes.levels === undefined) {
            return;
          }
          view.popup.title = result.features[0].attributes.name;
          view.popup.location = evt.mapPoint;
          let buildingFloors = $translate.instant(BUILDING_FLOORS);
          let content = `<ul><li> ${buildingFloors}: ${result.features[0].attributes.levels} </li></ul>`;
          if (result.features[0].attributes.indoorModels === "yes") {
            let actions = view.popup.actions.filter(function (action) {
              return action.id === "zoom-to";
            });
            let array = result.features[0].attributes.indoorLevels.split(' ');
            for (let i = 0; i < array.length; i++) {
              let action = {
                title: $translate.instant(GO_TO_LEVEL) + " " + array[i],
                id: "gotoinsidelvl",
                className: "esri-icon-organization"
              };
              // add actions to footer
              actions.push(action);
            }
            view.popup.actions = actions;
          }
          view.popup.content = content;
          view.popup.visible = true;
          controller.selectedBuilding = result.features[0];
        });
      });
    });
  };
};
