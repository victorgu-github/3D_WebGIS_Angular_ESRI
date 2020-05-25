'use strict';


let monitor2DMapConfig = {
    loraDevice: {
        monitor2DMapExtent: {
            center: [45.464211, 9.191383],
            zoom: 4
        },
        baseMap: "Normal.Map"
    },
    loraGateway: {
        monitor2DMapExtent: {
            center: [45.464211, 9.191383],
            zoom: 4
        },
        monitor2DMapExtentForCalgary: {
            center: [51.044270, -114.062019],
            zoom: 4
        },
        monitor2DMapExtentForShanghai: {
            center: [31.267401, 121.522179],
            zoom: 4

        },
        baseMap: "Normal.Map",
        popupTemplate: {
            title  : "Gateway SN: {GatewaySN}",
            content: "<li> Site Name                 : {SiteName}                </li>" +
                     "<li> Mac Address              : {GatewayMAC}              </li>" +
                     "<li> Report Time              : {ReportTime}              </li>" +
                     "<li> CPU                      : {Cpu}                     </li>" + 
                     "<li> Memory                   : {Mem}                     </li>" +
                     "<li> RFpacketReceived         : {RFpacketReceived}        </li>" +
                     "<li> RFpacketSent             : {RFpacketSent}            </li>" +
                     "<li> Packet Collision Rejected: {PacketCollisionRejected} </li>" +
                     "<li> Beacon Collision Rejected: {BeaconCollisionRejected} </li>" +
                     "<li> Time Late Rejected       : {TimeLateRejected}        </li>" +
                     "<li> Time Early Rejected      : {TimeEarlyRejected}       </li>" +
                     "<li> Lga Uptime               : {LgaUptime}               </li>" +
                     "<li> Lga Version              : {LgaVersion}              </li>" +
                     "<li> Health                   : {Health}                  </li>" 
        },
        //Lora Gateway Monitor Map View Data Table Header
        //1. Used to determine which fields we will display in lora gateway monitor datatable
        datatableHeader: [
            //General Data Info
            "GatewaySN",
            "SiteName",
            "GatewayMAC",

            //Dynamic Data Info
            "Health",
            "LgaVersion",
            "LgaUptime",
            "TimeEarlyRejected",
            "TimeLateRejected",
            "BeaconCollisionRejected",
            "PacketCollisionRejected",
            "RFpacketSent",
            "RFpacketReceived",
            "Mem",
            "Cpu",
            "ReportTime"
        ],
        //Lora gateway layers: 1. Calgary Test; 2. Calgary Prod; 3. Shanghai Test; 4. Shanghai Prod
        layers:[
            {
                id:    "Calgary_Test",
                title: "LoRa Gateway in Calgary Test",
                url:   "http://207.34.103.154:8100/api/lora_gw/config"
            },
            {
                id:    "Calgary_Prod",
                title: "LoRa Gateway in Calgary Prod",
                url:   "http://207.34.103.154:8000/api/lora_gw/config"
            },
            {
                id:    "Shanghai_Test",
                title: "LoRa Gateway in Shanghai Test",
                url:   "http://shanghai.3D_WebGIS_Angular_ESRI.com:8100/api/lora_gw/config"
            },
            {
                id:    "Shanghai_Prod",
                title: "LoRa Gateway in Shanghai Prod",
                url:   "http://222.73.246.22:8000/api/lora_gw/config"
            },
        ]
    },
    bleNode: {
        monitor2DMapExtentForMengyang: {
            center: [38.500000, 109.645000],
            zoom: 8
        }, 
        baseMap: "Normal.Custom",
        featureLayers:{
            mengyang: {
                url: 'http://www.3D_WebGIS_Angular_ESRI.com.cn/server/rest/services/Hosted/Mengyang_Prod/FeatureServer/1',
                style: { fillColor: '#DAA520', opacity: 0.7, color: '#000', weight: 1 }
            }
        }
    }
};

module.exports = monitor2DMapConfig;
