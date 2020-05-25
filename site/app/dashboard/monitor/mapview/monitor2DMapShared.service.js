'use strict';
const LGeo = require('../../../../assets/js/leaflet-geodesy');
module.exports = function ($q, $cookies, CollectionUtils, SemiCircle,appConfig) {
    const turf = window.turf;

    let self              = this;
    let Health            = "Healthy";
    let Unhealth          = "Unhealthy";
    let Dead              = "Dead";
    let Uninitialized     = "Uninitialized";
    let numOfUplinkPack   = "numOfUplinkPack";
    let numOfDownlinkPack = "numOfDownlinkPack";
    let Uplink            = "Uplink";
    let Downlink          = "Downlink";

    /////////////////////////////////////////////////
    //
    // Shared Function
    //
    /////////////////////////////////////////////////

    //Init Leaflet 2D Map
    //Applied for: 1.Lora Device Monitor Map View; 2.Lora Gateway Monitor Map View;
    self.initLeaflet2DMap = function (L, mapDiv, defaultExtent, defaultZoom) {
        let leafletMap = L.map('2DMap', 
        { zoomControl: true, crs: L.CRS.BEPSG3857,
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: 'topright'
            }
        }).setView(defaultExtent, defaultZoom);
        leafletMap.options.minZoom = 4;
        L.CRS.BEPSG3857.R= 6378137; //for setting custom scale bar
        L.CRS.BEPSG3857.distance = L.CRS.Earth.distance;
        let southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        let bounds = L.latLngBounds(southWest, northEast);
        
        return leafletMap.setMaxBounds(bounds);
    };

    self.initLeaflet2DMapBasemap = function (L, data, mapStyle) {
        let baiduLayer = new L.TileLayer.Baidu(mapStyle);
        baiduLayer.addTo(data.leafletMap);
        // can seperate map based on region
        if (appConfig.locality ==="cn")
        {
            // gaode cn L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            //     subdomains: ["1", "2", "3", "4"], //可用子域名，用于浏览器并发请求
            //     attribution: "&copy; 高德地图&3D_WebGIS_Angular_ESRI", //可以修改为其它内容
            // }).addTo(data.leafletMap);
            // google CN   L.tileLayer.chinaProvider('GoogleCN.Normal.Map', {}).addTo(data.leafletMap);
            
        }
        else if (appConfig.locality ==="en")
        {
          // ESRI EN L.esri.basemapLayer(defaultBasemap, { maxNativeZoom: 18, maxZoom: 22 }).addTo(data.leafletMap);
 
        }
    };

    //Add Feature Layer to Leaflet Map
    self.addFeatureLayer = function (L, leafletMap, featureLayer) {
        L.esri.featureLayer(featureLayer).addTo(leafletMap);
    };

    //Add image to leaflet map
    self.addImage = function (L, leafletMap, image) {
        // let imageUrl = '/assets/img/背景.png',
        // imageBounds = [[41.267900, 108.393808], [41.263237, 108.404719]];
        let imageUrl = image.url;
        let imageBounds = image.bounds;
        L.imageOverlay(imageUrl, imageBounds).addTo(leafletMap);
    };

    //Add detached labels and markers to leaflet map
    self.addDetachedLabelAndMarker = function (L, LabeledMarker, leafletMap, detachedLabels, colors) {
        for (let index in detachedLabels) {
            let detachedLabel = detachedLabels[index];
            let feature = {
                type: detachedLabel.type,
                properties: detachedLabel.properties,
                geometry: detachedLabel.geometry
            };
            new LabeledMarker(
                feature.geometry.coordinates.slice(),
                feature,
                {
                    markerOptions: {
                        stroke: false,
                        color: colors.markerOptColor,
                        textStyle: {
                            color: colors.markerOptTextColor,
                            fontSize: 14
                        }
                    },
                    anchorOptions: {
                        color: colors.anchorOptColor
                    },
                    lineOptions: {
                        color: colors.lineOptColor
                    }
                }
            ).addTo(leafletMap);
        }
    };

    //Add Sidebar to Leaflet Map
    //Applied for: 1.Lora Gateway Monitor Map View
    self.addSidebar = function (L, leafletMap, openSidebar) {
        let sidebar = L.control.sidebar('sidebar').addTo(leafletMap);
        //Default open sidebar
        if (openSidebar) {
            sidebar.open('home');
        }
    };

    //Add scale to leaflet Map
    //Applied for: 1.Lora Gateway Monitor Map View
    self.addScale = function (L, leafletMap) {

        L.control.scale(
            {  metric: true,
                imperial: false}
        ).addTo(leafletMap);
    };

    //Get Feature Layers According to Scenarios
    //Applied for: 1.Lora Device Monitor Map View;
    self.getFeatureLayers = function (scenarios) {
        let featureLayers = [];
        //1. Condition 1: if scenarios exist and is not empty array, iterate the scenarios array
        for (let index1 in scenarios) {
            let scenario = scenarios[index1];
            let scenario3DLayers = scenario.scenario3Dlayers;
            //2. Condition 2: if scenario3DLayers exist and is not empty array, iterate scenario3DLayers
            for (let index2 in scenario3DLayers) {
                let scenario3DLayer = scenario3DLayers[index2];
                if (scenario3DLayer.monitor2DMap) {
                    featureLayers.push(scenario3DLayer);
                }
            }
        }
        return featureLayers;
    };

    //Query Feature Layer Content
    //Applied for: 1.Lora Device Monitor Map View
    self.featureLayerQuery = function(url, token, data, PruneCluster, pruneCluster, layer) {
        let query = L.esri.query({ url: url });
        query.token(token);
        let deferred = $q.defer();
        query.where("1=1").run(function (error, featureCollection) {
            if (featureCollection && featureCollection.features) {
                let graphicPoints = featureCollection.features;
                for (let i = 0; i < graphicPoints.length; i++) {
                    let graphicPoint = graphicPoints[i];
                    //The data from calgary use property "properties", the data from shanghai use property "attributes"
                    let properties = (graphicPoint.hasOwnProperty('properties')) ? graphicPoint.properties : graphicPoint.attributes;
                    // Any feature layer is supposed to contain geometry
                    let latLng = {
                        lat: graphicPoint.geometry.coordinates[1],
                        lng: graphicPoint.geometry.coordinates[0]
                    };
                    let marker = new PruneCluster.Marker(latLng.lat, latLng.lng);
                    let popupTemplate = layer.popupTemplate;
                    marker.data.popup = generatePopup(popupTemplate, properties);
                    pruneCluster.RegisterMarker(marker);
                }
                data.leafletMap.addLayer(pruneCluster);
            }
            deferred.resolve();
        });
        return deferred.promise;
    };

    //Generate Cluster for Given Point
    //Applied for: 1.Lora Gateway Monitor Map View
    self.generateCluster = function (data, PruneCluster, pruneCluster, lat, lon, popupTemplate, properties) {
        let marker = new PruneCluster.Marker(lat, lon);
        marker.radius = properties.radius;
        let health = properties.Health;
        if (health === Health) {
            marker.data.icon = L.AwesomeMarkers.icon({ icon: 'download', markerColor: CollectionUtils.clusterLayerColors[0], prefix: 'fa', iconColor: 'black' });
            marker.category =0;
        }
        else if (health === Unhealth) {
            marker.data.icon = L.AwesomeMarkers.icon({ icon: 'download', markerColor: CollectionUtils.clusterLayerColors[1], prefix: 'fa', iconColor: 'black' });
            marker.category =1;
        }
        else if (health === Dead) {
            marker.data.icon = L.AwesomeMarkers.icon({ icon: 'download', markerColor: CollectionUtils.clusterLayerColors[2], prefix: 'fa', iconColor: 'black' });
            marker.category =2;
        }
        else {
            marker.data.icon = L.AwesomeMarkers.icon({ icon: 'download', markerColor: CollectionUtils.clusterLayerColors[3], prefix: 'fa', iconColor: 'black' });
            marker.category =3;
        }
        marker.data.popup = generatePopup(popupTemplate, properties);
        pruneCluster.RegisterMarker(marker);
        data.markers.push(marker);
    };

    //Update Number of Lora Gateway
    //Applied for: 1.Lora Gateway Monitor Map View
    self.updateNumOfLoraGW = function (numOfLoraGW, properties) {
        numOfLoraGW.totalNum += 1;
        switch (properties.Health) {
            case Health:
                numOfLoraGW.totalNumOfHeal   += 1;
                break;
            case Unhealth:
                numOfLoraGW.totalNumOfUnheal += 1;
                break;
            case Dead:
                numOfLoraGW.totalNumOfDead   += 1;
                break;
            default:
                numOfLoraGW.totalNumOfUninitialized  += 1;
        }
    };

    //Update Number of Packets
    //Applied for: 1.Lora Gateway Monitor Map View
    self.updateNumOfPackets = function (numOfPackets, properties) {
        if (Number.isInteger(properties.RFpacketReceived)) {
            numOfPackets.numOfUplinkPack += properties.RFpacketReceived;
        }
        if (Number.isInteger(properties.RFpacketSent)) {
            numOfPackets.numOfDownlinkPack += properties.RFpacketSent;
        }
    };

    //Draw Graph of Number of Lora Gateway
    //Applied for: 1.Lora Gateway Monitor Map View
    self.drawNumOfLoraGWGraph = function (container, numOfLoraGW) {
        let title  = numOfLoraGW.totalNum;
        let series = [{
            type: 'pie',
            name: 'Number',
            innerSize: '70%',
            data: [
                [Health,   numOfLoraGW.totalNumOfHeal],
                [Unhealth, numOfLoraGW.totalNumOfUnheal],
                [Dead,     numOfLoraGW.totalNumOfDead],
                [Uninitialized,    numOfLoraGW.totalNumOfUninitialized]
            ]
        }];
        let semiCircle = new SemiCircle(container, title, series);
        semiCircle.draw();
    };

    //Get Number of Uplink & Downlink Packets for Lora Gateway
    //Applied for: 1.Lora Gateway Monitor Map View
    self.getNumOfPacketsTable = function (numOfLoraGW, numOfPackets, numOfPacketsTable) {
        //Generate numOfPackets Table, such as ['Uplink', 36500, 12300]
        for (let key in numOfPackets) {
            let row = [];
            if (key === numOfUplinkPack) {
                row.push(Uplink);
                row.push(numOfPackets.numOfUplinkPack);
                row.push(parseInt(numOfPackets.numOfUplinkPack / numOfLoraGW.totalNum));
            }
            else if (key === numOfDownlinkPack) {
                row.push(Downlink);
                row.push(numOfPackets.numOfDownlinkPack);
                row.push(parseInt(numOfPackets.numOfDownlinkPack / numOfLoraGW.totalNum));
            }
            numOfPacketsTable.push(row);
        }
    };

    //Init Lora Gateway Map Layer
    //Applied for: 1.Lora Gateway Monitor Map View Datatable
    self.initMapLayerData = function (data, pruneCluster, tableHeader, tableBody) {
        let loraGatewayLayerData = {
            id:           "LoraGateway",
            header:       tableHeader,
            body:         tableBody,
            initializing: false,
            displayName:  "Lora Gateway",
        };

        data.mapLayersData[loraGatewayLayerData.id] = loraGatewayLayerData;
        return data.mapLayersData;
    };

    //Get Cover Area Info for Lora Gateway
    //Applied for: 1.Lora Gateway Monitor Map View
    self.getCoverAreaTable = function (numOfLoraGW, coverAreaTable, averageCoverAreaRadius, markers) {
        //Generate coverArea Table, such as ['Cover Area', '823', '23']
        let row = [];
        row.push('Cover Area');
        let copts = {
            parts: 144
        };
        let area = 0;
        if (markers && markers.length !== 0) {
            let unionTemp;
            for (let i = 0; i < markers.length; i++) {
                let radius = markers[i].radius?markers[i].radius*1000:averageCoverAreaRadius * 1000;
                let circle = LGeo.circle(markers[i].position, radius, copts);
                if (i === 0) {
                    unionTemp = circle.toGeoJSON();
                } else {
                    unionTemp = turf.union(unionTemp, circle.toGeoJSON());
                }
            }

            area = (turf.area(unionTemp) / 1000000).toFixed(2);
        }
        row.push(area + " km\u00B2");
        coverAreaTable.push(row);
    };

    //Transfer the layer ID array to layer url array
    //1."LoRa Gateway in Calgary Test" => "http://207.34.103.154:8100/api/lora_gw/config"
    self.transLayerIDToLayerUrl = function (layerIDArr, layers) {
        let urls = [];
        for (let index in layerIDArr) {
            let layerID = layerIDArr[index];
            let layer = layers.find((layer) => { return layer.id === layerID; });
            let layerUrl = layer.url;
            urls.push(layerUrl);
        }
        return urls;
    };

    self.displayOption = function (displayOptions, layers) {
        for (let i = layers.length - 1; i >= 0; i--) {
            let displayOption = displayOptions[i];
            if (!displayOption) {
                let find_str = '[value=' + layers[i].id + ']';
                $('.selectpicker').find(find_str).remove();
                layers.splice(i, 1);
            }
        }
        $('.selectpicker').selectpicker('refresh');
    };

    /////////////////////////////////////////////////////////
    //
    // Private Function
    //
    /////////////////////////////////////////////////////////

    function generatePopup(popupTemplate, properties) {
        //Parse the popupTemplate, get the popup title and popup content
        let popup   = "";
        let popupObject = {};
        let title   = popupTemplate.title.replace(/{(\w+)}/g, "${this.$1}");
        let content = popupTemplate.content.replace(/{(\w+)}/g, "${this.$1}");
        popupObject.title = CollectionUtils.parse(title, properties);
        popupObject.content = CollectionUtils.parse(content, properties);

        //Assemble the popup into a string so that it can be displayed under the 2D map
        popup += popupObject.title + "</br>" + popupObject.content;
        return popup;
    }
};