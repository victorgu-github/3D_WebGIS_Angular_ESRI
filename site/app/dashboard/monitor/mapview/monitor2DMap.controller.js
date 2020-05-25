'use strict';

let PruneCluster           = require('exports-loader?PruneCluster!prunecluster');
let PruneClusterForLeaflet = require('exports-loader?PruneClusterForLeaflet!prunecluster');

module.exports = function (monitor2DMapConfig, AccountService, CollectionUtils, Monitor2DMapSharedService) {
        
    ////////////////////////////////////////////////
    //
    // Variable
    //
    ////////////////////////////////////////////////
    
    let mapDiv         = "2DMap";
    let defaultExtent  = monitor2DMapConfig.loraDevice.monitor2DMapExtent.center;
    let defaultZoom    = monitor2DMapConfig.loraDevice.monitor2DMapExtent.zoom;
    let defaultBasemap = monitor2DMapConfig.loraDevice.baseMap;

    let userInfo       = AccountService.userInfo;
    let scenarios      = userInfo.settings.Scenarios;

    let data = {
        markers: [],
        timerServices: [],
        mapLayers: {},
        leafletMap: {}
    };

    ////////////////////////////////////////////////
    //
    // Init Function
    //
    ////////////////////////////////////////////////

    initLeafletMap();

    ////////////////////////////////////////////////
    //
    // Private Function
    //
    ////////////////////////////////////////////////

    //Initialize leaflet 2D Map for monitor
    function initLeafletMap() {
        //init leaflet2D map
        data.leafletMap = Monitor2DMapSharedService.initLeaflet2DMap(L, mapDiv, defaultExtent, defaultZoom);

        //init leaflet2D base map
        Monitor2DMapSharedService.initLeaflet2DMapBasemap(L, data, defaultBasemap);

        //Add scale to leaflet map
        Monitor2DMapSharedService.addScale(L, data.leafletMap);

        //init feature layers
        let featureLayers = Monitor2DMapSharedService.getFeatureLayers(scenarios);

        //init leaflet2D feature layers
        initLeaflet2DMapFeatureLayers(defaultExtent, defaultZoom, featureLayers);
    }

    function initLeaflet2DMapFeatureLayers(defaultExtent, defaultZoom, defaultFeatureLayers) {
        let userInfo = AccountService.userInfo;
        let featureLayerBaseURL = userInfo.settings.featureLayerBaseURL;
        let pruneCluster = new PruneClusterForLeaflet();
        let layerLength = defaultFeatureLayers.length;
        let token = CollectionUtils.getEsriToken();
        for (let i = 0; i < layerLength; i++) {
            //if we only want display a specific type of lora device, we can use layer.subType to select
            //layer for this specific type of lora device
            let layer = defaultFeatureLayers[i];
            let url = featureLayerBaseURL + layer.url;
            Monitor2DMapSharedService.featureLayerQuery(url, token, data, PruneCluster, pruneCluster, layer).then(function () {
                data.leafletMap.setView(defaultExtent, defaultZoom);
            });
        }
    }
};
