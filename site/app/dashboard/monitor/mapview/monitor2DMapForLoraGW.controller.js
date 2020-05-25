'use strict';

let PruneCluster           = require('exports-loader?PruneCluster!prunecluster');
let PruneClusterForLeaflet = require('exports-loader?PruneClusterForLeaflet!prunecluster');

module.exports = function ($scope, appConfig, monitor2DMapConfig, CollectionUtils, AccountService, loraGatewayService, dashboardSharedService,
    Monitor2DMapSharedService, Monitor2DMapDatatableService) {

    ////////////////////////////////////////////////
    //
    // Variable
    //
    ////////////////////////////////////////////////

    let mapDiv             = "2DMap";
    let defaultExtent;      
    let defaultZoom;   
    let defaultBasemap     = monitor2DMapConfig.loraGateway.baseMap;
    let popupTemplate      = monitor2DMapConfig.loraGateway.popupTemplate;
    let data = {
        markers:       [],
        mapLayersData: {},
        leafletMap:    {}
    };

    let sharedData = {
        mapLayersData: {},
        leafletMap:    {}
    };
    let averageCoverArea   = 10; //coverage radius in km
    let pruneCluster;
    let coverageLayer;
    let init_done = false;

    if (AccountService.userInfo.isCellPhone && appConfig.locality ==="cn") {
        defaultExtent = monitor2DMapConfig.loraGateway.monitor2DMapExtentForShanghai.center;
        defaultZoom   = monitor2DMapConfig.loraGateway.monitor2DMapExtentForShanghai.zoom;
    }
    else if (AccountService.userInfo.isCellPhone && appConfig.locality ==="en"){
        defaultExtent = monitor2DMapConfig.loraGateway.monitor2DMapExtentForCalgary.center;
        defaultZoom   = monitor2DMapConfig.loraGateway.monitor2DMapExtentForCalgary.zoom;
    }
    else {
        defaultExtent = monitor2DMapConfig.loraGateway.monitor2DMapExtent.center;
        defaultZoom   = monitor2DMapConfig.loraGateway.monitor2DMapExtent.zoom;
    }

    //Init Number of Lora Gateway for lora-gateway-map-view-graph1
    $scope.numOfLoraGW       = { totalNum: 0, totalNumOfHeal: 0, totalNumOfUnheal: 0, totalNumOfDead: 0, totalNumOfUninitialized: 0 };
    //Init Number of Uplink Packets and Downlink Packets
    $scope.numOfPackets      = { numOfUplinkPack: 0, numOfDownlinkPack: 0 };
    $scope.numOfPacketsTable = [];
    //Init Coverage Area of Lora Gateway
    $scope.coverAreaTable    = [];
    //Gateway layers info
    $scope.urls   = [];
    $scope.layers = monitor2DMapConfig.loraGateway.layers;
    $scope.backToOverview    = AccountService.userInfo.isCellPhone ? "DASHBOARD.BACK_TO_OVERVIEW_BRIEF" : "DASHBOARD.BACK_TO_OVERVIEW";
    $scope.overviewPageUrl   = CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo);
    $scope.initializing = true;

    ///////////////////////////////////////////////////
    //
    // Init Function
    //
    ///////////////////////////////////////////////////

    //Select all, init panel and map
    $scope.$$postDigest(function () {
        $scope.initializing = true;
        $('.selectpicker').selectpicker('selectAll');
        $scope.urls = Monitor2DMapSharedService.transLayerIDToLayerUrl($('#myselect').val(), $scope.layers);
        initLeafletMap($scope.urls);
    });

    dashboardSharedService.dealWithAndroidMobileDeviceAddressBarHideIssue();

    ///////////////////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////////////////

    $('#myselect').change(function () {
        if (init_done) {
            $scope.initializing = true;
            //When datatabel is open, cannot sync the data when change the scenario
            Monitor2DMapDatatableService.closeView();
            //Clear all the data, prepare for next render
            data.leafletMap.eachLayer(function (layer) {
                if (layer._leaflet_id === pruneCluster._leaflet_id || layer._leaflet_id === coverageLayer._leaflet_id) {
                    data.leafletMap.removeLayer(layer);
                }
            });
            data.mapLayersData = [];
            data.markers = [];
            $scope.numOfLoraGW = { totalNum: 0, totalNumOfHeal: 0, totalNumOfUnheal: 0, totalNumOfDead: 0, totalNumOfUninitialized: 0 };
            $scope.numOfPackets = { numOfUplinkPack: 0, numOfDownlinkPack: 0 };
            $scope.numOfPacketsTable.splice(0, $scope.numOfPacketsTable.length);
            $scope.coverAreaTable.splice(0, $scope.coverAreaTable.length);
            $scope.urls = Monitor2DMapSharedService.transLayerIDToLayerUrl($('#myselect').val(), $scope.layers);
            initLeaflet2DMapForLoraGateway($scope.urls);
        }
    });

    ///////////////////////////////////////////////////
    //
    // Private Function
    //
    ///////////////////////////////////////////////////

    //Initialize leaflet 2D Map for monitor
    function initLeafletMap(urls) {
        //init leaflet2D map
        data.leafletMap = Monitor2DMapSharedService.initLeaflet2DMap(L, mapDiv, defaultExtent, defaultZoom);

        //init leaflet2D base map
        Monitor2DMapSharedService.initLeaflet2DMapBasemap(L, data, defaultBasemap);

        //Add sidebar to leaflet map
        Monitor2DMapSharedService.addSidebar(L, data.leafletMap, true);

        //Add scale to leaflet map
        Monitor2DMapSharedService.addScale(L, data.leafletMap);

        //init leaflet2D feature layers
        initLeaflet2DMapForLoraGateway(urls);
    }

    function initLeaflet2DMapForLoraGateway (urls) {
        //Add account service in leaflet 2D map
        pruneCluster = new PruneClusterForLeaflet();
        pruneCluster.Cluster.Size = 80;
        // set cluster marker icon and color
        pruneCluster.BuildLeafletClusterIcon = function(cluster) {
            let e = new L.Icon.MarkerCluster();
            e.stats = cluster.stats;
            e.population = cluster.population;
            return e;
        };
        loraGatewayService.getLoraGatewaysForLayers(urls).then(function (response) {
            let tableHeader = [];
            let tableBody   = [];
            if (response.status === "success") {
                let gateways = response.content;
                for (let index in gateways) {
                    let row = [];
                    let gateway = gateways[index];
                    let lat = gateway.GpsRefLat;
                    let lon = gateway.GpsRefLon;
                    let properties = gateway.Status ? gateway.Status : {};
                    properties.GatewaySN = gateway.GatewaySN;
                    properties.GatewayMAC = gateway.GatewayMAC;
                    properties.SiteName = gateway.SiteName;
                    properties.radius = gateway.CoverageInKM;
                    Monitor2DMapSharedService.generateCluster(data, PruneCluster, pruneCluster, lat, lon, popupTemplate, properties);
                    Monitor2DMapSharedService.updateNumOfLoraGW($scope.numOfLoraGW, properties);
                    Monitor2DMapSharedService.updateNumOfPackets($scope.numOfPackets, properties);
                    //Flatten gateway object and get tableBody content
                    gateway = CollectionUtils.flattenObj(gateway);
                    let tempTableHeader = Object.keys(gateway);
                    if (tableHeader.length < tempTableHeader.length) {
                        tableHeader = tempTableHeader;
                    }
                    for (let key in gateway) {
                        row.push(gateway[key]);
                    }
                    tableBody.push(row);
                }
            }
            //Only display normal layers in the select options
            //For example:
            //1.Calgary Test Env -- connection normal, return lora gateway info -- display in the options
            //2.Calgary Prod Env -- server down, connection abnormal -- not display in the options
            if (!init_done) {
                Monitor2DMapSharedService.displayOption(response.displayOptions, $scope.layers);
                $('span.filter-option.pull-left').html('LoRa Gateway in All Region');
                init_done = true;
            }
            else {
                if ($('#myselect').val().length === $scope.layers.length) {
                    $('span.filter-option.pull-left').html('LoRa Gateway in All Region');
                }
            }

            data.leafletMap.addLayer(pruneCluster);
            //Draw lora gateway number graph
            Monitor2DMapSharedService.drawNumOfLoraGWGraph('lora-gateway-map-view-graph1', $scope.numOfLoraGW);
            //Get lora gateway uplink & downlink packets table
            Monitor2DMapSharedService.getNumOfPacketsTable($scope.numOfLoraGW, $scope.numOfPackets, $scope.numOfPacketsTable);
            //Get lora gateway cover area table
            Monitor2DMapSharedService.getCoverAreaTable($scope.numOfLoraGW, $scope.coverAreaTable, averageCoverArea, data.markers);
            //Init lora gateway layer data for monitor 2D map datatable
            sharedData.mapLayersData = Monitor2DMapSharedService.initMapLayerData(data, pruneCluster, tableHeader, tableBody);

            //draw coverage layer
            //https://github.com/domoritz/leaflet-maskcanvas/blob/master/demo/main-1.0-dev.js
            coverageLayer = new L.GridLayer.MaskCanvas({
                opacity: 0.3,
                radius: averageCoverArea * 1000,
                useAbsoluteRadius: true,
                color: '#000',
                noMask: false,  // true results in normal (filled) circled, instead masked circles
                lineColor: '#A00'
            });
            let coverageData = [];
            for (let i = 0; i < data.markers.length; i++) {
                let coordPair = [];
                coordPair.push(data.markers[i].position.lat);
                coordPair.push(data.markers[i].position.lng);
               
                if (data.markers[i].radius)
                {
                    coordPair.push(data.markers[i].radius*1000);
                }
                coverageData.push(coordPair);
            }
            coverageLayer.setData(coverageData);
            data.leafletMap.addLayer(coverageLayer);

            sharedData.leafletMap = data.leafletMap;

            Monitor2DMapDatatableService.syncLoraGatewayData(sharedData);

            $scope.initializing = false;
        });
    }
};
