'use strict';

module.exports = function () {
  let self = this;

  self.createFeatureLayerPopup = function (template) {
    if (template) {
      let popup = "<div>";
      let title = template.title || "Title";
      let titleValue = template.titleValue || "Title";
      let staticFields = template.staticFields || [];

      // <h1>Title: {Title}</h1>, Title is retrieved from geo server properties, see url in layer config.
      popup += "<span class='popup2D--title'>" + title + ": {" + titleValue + "}</span>";
      popup += "<hr class='popup2D--separator'>" +
        "<div><ul class='popup2D--content'>";

      for (let i = 0; i < staticFields.length; i++) {
        let field = staticFields[i];
        popup += "<li>" + field + ": {" + field + "}</li>";
      }

      popup += "</ul></div></div>";

      return popup;
    }
  };

  self.createRealTimePopup = function (template, properties) {
    if (template) {
      let popup = "<div>";
      let title = template.title || "Title";
      let titleValue = template.titleValue || "Title";
      let staticFields = template.staticFields || [];

      // <h1>Title: {Title}</h1>, Title is retrieved from geo server properties, see url in layer config.
      popup += "<span class='popup2D--title'>" + title + ": " + properties[titleValue] + "</span>";
      popup += "<hr class='popup2D--separator'>" +
        "<div><ul class='popup2D--content'>";

      for (let i = 0; i < staticFields.length; i++) {
        let field = staticFields[i];
        popup += "<li>" + field + ": " + properties[field] + "</li>";
      }

      popup += "</ul></div></div>";

      return popup;
    }
  };

  self.getPopupContent = function(popupTemplate, rowData){
    if (popupTemplate) {
      let popup = "<div>";
      let title = popupTemplate.title || "Title";
      let titleValue = rowData[popupTemplate.titleValue] || "";
      let staticFields = popupTemplate.staticFields || [];

      // <h1>Title: {Title}</h1>, Title is retrieved from geo server properties, see url in layer config.
      popup += "<span class='popup2D--title'>" + title + ": " + titleValue + "</span>";
      popup += "<hr class='popup2D--separator'>" +
        "<div><ul class='popup2D--content'>";

      for (let i = 0; i < staticFields.length; i++) {
        let field = staticFields[i];
        popup += "<li>" + field + ": " + rowData[field] + "</li>";
      }

      popup += "</ul></div></div>";

      return popup;
    }
  };

};
