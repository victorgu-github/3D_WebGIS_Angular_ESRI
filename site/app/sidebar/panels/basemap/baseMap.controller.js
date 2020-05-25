'use strict';

module.exports = function ($scope, $rootScope, $timeout, esriLoader) {

  $scope.initializing = true;

  // MapLayersInitialized is event from 3D view, so below is to create BaseMap for 3D view
  $scope.$on('MapLayersInitialized', function (event, args) {
    let mapView = args.mapView;
    let baseMapDiv = document.getElementsByClassName('baseMapDiv')[0];

    if (isBaseMapEmpty()) {
      esriLoader.require([
        "esri/widgets/BasemapGallery"
      ], function (BasemapGallery) {

        new BasemapGallery({
          view: mapView,
          container: baseMapDiv
        });

        $scope.initializing = false;
      });
    }

  });

  function isBaseMapEmpty() {
    let selectors = '.baseMapDiv .esri-basemap-gallery__item-container';
    let baseMaps = document.querySelectorAll(selectors).length;

    return baseMaps <= 0;
  }

};
