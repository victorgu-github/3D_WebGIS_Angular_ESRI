let dashTableConfig = {
  Devices: {
    DevTableCommonUrl: "/#/dashboard/device/",
    Gateway: {
      BLE_GATEWAY_ID: "gateways",
    },
    LoraDevice: {
      LORA_DEVICE_ID: "loraDevices",
      //System parameters: Classes
      systemParams:{
        //New Lora Device Page, Edit Lora Device Page
        //Class 1 & 2 will need provide multicastAddrArray
        Class: [1, 2]
      },
      //Register urls
      oneStepRegister: {
        candidateValueUrl:     "api/lora_device/candidate_values",
        devNumUrlPrefix:       "api/lora_device/devices/Num",
        devInfoUrlPrefix:      "api/lora_device/devices",
        maintainPrefix:        "api/lora_device/maintenance/",
      },
      //Single lora device registry required fields
      singleRegistryAttr: {
        ABP: {
          //Single new lora device register page, validate all ABP required fields exist
          ABP_REQUIRED_FIELDS: [
            "Name",
            "ApplicationID",
            "DevEUI",
            "DevType",
            "BandID",
            "Class",
            "DevAddr"
          ]
        },
        OTAA: {
          //Single new lora device register page, validate all OTAA required fields exist
          OTAA_REQUIRED_FIELDS: [
            "Name",
            "ApplicationID",
            "DevEUI",
            "DevType",
            "BandID",
            "Class"
          ]
        }
      },
      csvTempDownLoad: {
        ABPUrl: "api/content/loraDevice/ABP_Batch_Template.csv",
        OTAAUrl: "api/content/loraDevice/OTAA_Batch_Template.csv",
      },
      batchRegistryFile: {
        ABP: {
          requiredFields: [
            "DevEUI",
            "DevAddr",
            "Name",
          ],
          optionalFields: [
            "Description",
            "NwkSKey",
            "AppSKey",
            "RefLat",
            "RefLon",
            "RefAlt"
          ],
          invalidFields: [
          ]
        },
        OTAA: {
          requiredFields: [
            "DevEUI",
            "Name",
          ],
          optionalFields: [
            "Description",
            "AppKey",
            "AppEUI",
            "RefLat",
            "RefLon",
            "RefAlt"
          ],
          invalidFields: [
          ]
        },
        //Text fields in csv file need to transfer to number
        numFields: [
          "RefAlt",
          "RefLat",
          "RefLon"
        ]
      },
      registerDefaultValue: {
        ABP_DEFAULT_VALUES: {
          Name: "Default name",
          DevEUI: "0004A30B001A4677",
          DevAddr: "001A4677",
          ABP: true
        },
        OTAA_DEFAULT_VALUES: {
          Name: "Default name",
          DevEUI: "0004A30B001A4677",
          ABP: false
        }
      },
      //Define the attributes which could be updated and need to send to backend
      //Exception: 1.DevEUI 2.ApplicationID, these two attributes is disabled but need to send to backend as index
      updatedAttributes: [
        "Name",
        "DevEUI",
        "ApplicationID",
        "DevType",
        "SubType",
        "MulticastAddrArray",
        "NwkSKey",
        "AppKey",
        "AppSKey",
        "Description",
        "ADRInterval",
        "DrClassBC",
        "FreqClassBC",
        "InstallationMargin",
        "NbTrans",
        "Rx1DROffset",
        "Rx2DR",
        "RxDelay",
        "RxWindowNumber",
        "TxPower",
        "RelaxFCnt",
        "UseAppSetting",
        "RefAlt",
        "RefLat",
        "RefLon",
        "TimeoutInterval"
      ],
      devTableHeader: {
        Name         : "Name",
        Description  : "Description",
        ApplicationID: "ApplicationID",
        DevEUI       : "DevEUI",
        DevAddr      : "DevAddr",
        DevType      : "DevType",
        FCntUp       : "FCntUp",
        FCntDown     : "FCntDown",
        InMaintenance: "InMaintenance"
      },
      zmqPayload: {
        baseUrl: "api/lora_device/zmq_payload/",
        zmqPayloadTimeIntervalRange: [1, 12],
        zmqPayloadTimeIntervalDefaultVal: 6,
      },
      channelHistory: {
        url: "api/loraDevice/channelHistory/",
        //timeDuration is the gap between end time and start time:
        //For exampe,
        //1.end time:     20/03/2018 10:00, 
        //2.timeDuration: 6(hours), 
        //3.start time:   20/03/2018 04:00 (start time = end time - time duration)
        timeDuration: 6,
        fileName: "channelHistoryData.csv"
      },
      sortHeader: {
        APPID: "ApplicationID",
        DEVEUI: "DevEUI",
        MAINTANENCE: "InMaintenance",
      },
      cssStyles: {
        DEVICE_TABLE_HIGH_BOTTOM: "62px",
        DEVICE_TABLE_LOW_BOTTOM: "10px",
      }
    },
    LoraGateway: {
      LORA_GATEWAY_ID: "loraGateways",
      baseUrl: {
        urlPrefix: "api/lora_gw/config",
        urlSuffix: ""
      },
      //Url forwarding to the lora gateway table
      LoraGatewayTableCommonUrl: "/#/dashboard/loraGateway/loraGatewayTable",
      //Lora gateway register required fields and optional fields
      //Required fields:
      //1. Used for validation, if required fields have been provide, will send error message
      //2. Used for determine if we need to show the start * in register page, for example, GatewaySN *
      //Optional fields: defined the range of optional fields
      //1. If optional field exist and not empty string, send the optional fields
      registerAttrs: {
        requiredAttrs: [
          "GatewaySN",
          "GatewayMAC",
          "CoreBoardVersion",
          "BandID",
          "MotherboardVersion"
        ],
        optionalAttrs: [
          "Description",
          "SiteID",
          "4gModule",
          "4gSimCardID",
          "ReverseTunnelPort",
          "InstallationNumber",
          "InstallationDate",
          "WiredNetwork",
          "WiFi",
          "4gLTE",
          "GpsRefLat",
          "GpsRefLon",
          "GpsRefAlt",
          "SiteName",
          "SiteAddress",
          "SiteRegion",
          "SiteType",
          "SiteDescription",
          "SiteCondition",
          "SiteSource",
          "Comments",
          "CoverageInKM"       
        ]
      },
      //Define the attributes which could be updated and need to send to backend
      //Exception: 1.GatewayMAC, this attribute is disabled but need to send to backend as index
      updatedAttributes: [
        //Important Fields
        "4gLTE",
        "4gModule",
        "4gSimCardID",
        "BandID",
        "CoreBoardVersion",
        "Description",
        "GatewayMAC",
        "InstallationDate",
        "InstallationNumber",
        "MotherboardVersion",
        "ReverseTunnelPort",
        "WiFi",
        "WiredNetwork",

        //Optional Fields
        "SiteID",
        "GpsRefAlt",
        "GpsRefLat",
        "GpsRefLon",
        "SiteName",
        "SiteAddress",
        "SiteRegion",
        "SiteType",
        "SiteDescription",
        "SiteCondition",
        "SiteSource",
        "Comments",
        "CoverageInKM",

        //Other Fields
        "AntennaGain",
        "BeaconBandwidth",
        "BeaconDataRate",
        "BeaconFreq",
        "BeaconFreqNum",
        "BeaconFreqStep",
        "BeaconInfoDesc",
        "BeaconPeriod",
        "BeaconPower",
        "ClkBias",
        "ClkDrift",
        "DownlinkChan",
        "FskEnable",
        "GpsEnable",
        "KeepAliveInternal",
        "LgsIP",
        "LgsPort",
        "LoRaWanPublic",
        "NtpLatency",
        "NtpLevel",
        "PpsLevel",
        "UplinkChan"
      ]
    },
  },
  //General user application config for admin user
  GeneralUserApplication: {
    GernalUserAppTableCommonUrl: "/#/dashboard/general/generalUserApp",
    GENERAL_USER_APPLICATION_ID: "generalUserApplication",
    baseUrl            : "api/generaluserapplication",
    baseUrlForLora     : "api/generaluserapplication/lora",
    createdByUrlV2     : "api/v2/generaluser/applications/createdby",
    urlV2              : "api/v2/generaluser/applications",
    devTableHeader: {
      key1: "Name",
      key2: "Description",
      key3: "DevEUI",
      key4: "DevAddr",
      key5: "DevType",
      key6: "InMaintenance"
    },
    appTableHeader: {
      key1: "generalUserApplicationID",
      key2: "createdTime",
      key3: "modifiedTime",
      key4: "generalUserApplicationName",
      key5: "loraApplicationID",
      key6: "devEUIs",
      key7: "scenarioID"
    },
    sortHeader: {
      GENERAL_USER_APP_ID: "generalUserApplicationID",
    },
    //transHeader: we need to transfer the devEUIs devices info -> devEUIs devices number
    transHeader: {
      DEV_EUIS: "devEUIs",
      DEV_EUIS_NUM: "devEUIsNum",
    },
    //dateHeader: we need to transfer the ISO time -> locale time, for fields "createdTime" & "modifiedTime"
    dateHeader: {
      CREATED_TIME: "createdTime",
      MODIFIED_TIME: "modifiedTime",
    },
    editGenUsrAppConst: {
      EXIST_ROW_CLASS:      "data-table-row-exit",
      NOT_EXIST_ROW_CLASS:  "data-table-row-not-exist",
      DEVICE_NOT_EXIST_MSG: "Error record, device has been deleted.",
      EMPTY_SCENARIO_ID:    "--",
      EMPTY_LORA_APP_ID:    "--"
    },
  },
  //General user application config for general user
  GeneralUserApplicationForGenUsr: {
    //Base url to call web api and get exist_device info
    baseUrl:                   "api/generaluserapplication/exist_device",
    urlForExistDeviceV2:       "api/v2/generaluser/applications/existingdevices",
    //Url locate to general user application table
    generalUsrAppTableUrl:     "/#/dashboard/general/generalUserAppForGenUsr",
    //Url locate to general user application show page
    SHOW_GENERAL_USER_APP_URL: "/dashboard/generalUserAppForGenUsr/show/",
    //Url locate to general user application edit page
    EDIT_GENERAL_USER_APP_URL: "/dashboard/generalUserAppForGenUsr/edit/",
    //Url locate to create a new lora device for general user application
    NEW_LORA_DEV_URL:          "/dashboard/loraDevForGenUsrApp/new",
    //Required Fields
    loraDevRegRequiredFields: {
      ABP: [
        "Name",
        "DevEUI",
        "DevType",
        "BandID",
        "Class",
        "DevAddr"
      ],
      OTAA: [
        "Name",
        "DevEUI",
        "DevType",
        "BandID",
        "Class"
      ]
    }
  },
  GeneralUser: {
    GENERAL_USER_ID: "generalUser",
    GeneralUserTableCommonUrl: "/#/dashboard/general/generalUser",
    GenearlUserEditCommonUrl:  "/dashboard/generalUserApp/edit/",
    baseUrl:                   "api/generaluser",
    baseUrlForRegistry:        "api/generaluserregistry",
    companyInfoUrl:            "api/companyInfo",
    generalUserAppHeader: {
      key1: "generalUserApplicationID",
      key2: "generalUserApplicationName",
      key3: "loraApplicationID",
      key4: "scenarioID"
    },
    sortHeader: {
      GENERAL_USER_NAME: "userName",
    },
  },
  MulticastGroup: {
    MulticastGroupTableCommonUrl: "/#/dashboard/general/multicastGroup",
    MulticastGroupEditPageCommonUrl: "/dashboard/multicastGroup/edit/",
    MULTICAST_GROUP_ID: "multicastGroup",
    baseUrl: "api/lora_device/multicastgroups",
    systemParams: {
      //New Multicast Group Page
      //Multicast Group Class 1 & 2 allow to display 
      Class:                [1, 2]
    },
    updateAttributes: {
      //These attributes will not include in the multicast group update request body, you should make sure
      //an attribute is disabled or hide in the multicast group edit page when you add this attribute into
      //this array
      notUpdateAttributes: [
        "Class",
        "AppEUI",
        "DevType",
        "BandID",
        "SubType",
        "NwkSKey",
        "ValidMulticastGwNum",
        "PingSlotNumScheduled",
        "BeaconTimeUtcScheduled",
        "MulticastGwMac",
        "AppSKey",
        "ValidGatewayArrayNum",
        "EncryptedMacCmdsPrev",
        "UnencryptedMacCmdsPrev",
        "UserPayloadDataLen",
        "HasEncryptedMacCmdDelivered",
        "HasUnencryptedMacCmdDelivered",
        "HasUserPayloadDataDelivered",
        "GatewayArray"
      ]
    },
    popUpAttributes: [
      "Class",
      "ApplicationID",
      "DevType",
      "BandID",

      "Freq",
      "Dr",
      "SubType",
      "FCntDown",

      "TxPower",
      "NwkSKey",
      "MulticastAddr",
      "AppEUI",

      "PingNbClassB",
      "PingOffsetClassB",
      "ValidMulticastGwNum",
      "PingSlotNumScheduled",

      "BeaconTimeUtcScheduled",
      "MulticastGwMac",
      "AppSKey",
      "Name",

      "Description",
      "ValidGatewayArrayNum",
      "EncryptedMacCmds",
      "EncryptedMacCmdsPrev",

      "UnencryptedMacCmds",
      "UnencryptedMacCmdsPrev",
      "UserPayloadData",
      "UserPayloadDataLen",

      "HasEncryptedMacCmdDelivered",
      "HasUnencryptedMacCmdDelivered",
      "HasUserPayloadDataDelivered",
      "Confirmed",

      "FPort",
      "GatewayArray"
    ],
    sortHeader: {
      APPLICATION_ID: "ApplicationID",
      MULTICAST_ADDR: "MulticastAddr"
    },
  },
  BleApplication: {
    url: "api/ble/applications",
    createdByUrl: "api/ble/applications/createdBy"
  },
  BleNode: {
    url: "api/ble/applications/"
  },
  Mengyang: {
    url: "api/mengyang/pasture/",
    pastureIDs: [
      "1"
    ],
    companyID: "4"
  },
  CommonSortAttr: {
    sortAttribute: {
      ASC_SORT: "ascending",
      DSC_SORT: "descending",
      ASC_NUM: 1,
      DSC_NUM: -1,
    },
  },
  //LoRa device and multicast group mapping dictionary. Used to convert the classes' number to classes' string, vice versa.
  CommonMapAttr: {
    Class: {
      0: "A",
      1: "B",
      2: "C"
    },
    //Edit Lora Device Error Message Map, use map to change error message, 
    //1."DrClassBC should within the range..." => "DrClassB should within the range..."
    //2."FreqClassBC should within the range..." => "FreqClassB should within the range..."
    EditLoraDevErrMsgMap: {
      DrClassBC  : "DrClassB",
      FreqClassBC: "FreqClassB"
    }
  },
  MonitorAttributes: {
    //summary info duratioin for datastream, we grep this duration data stream data from 
    //web api, and then render it to the summary info high chart
    //we grep datastream data of one week by default
    summaryInfoDurationForDatastream: {
      "days": 7
    },
    summaryInfoUrlForDatastream: {
      baseUrl: {
        urlPrefix: "api/lora/rssi/aggregated_data/time_unit/day/",
        urlSuffix: ""
      },
    },
    //limitation of datastream history info, we grep data stream data from 
    //web api, if the number of records extends the limitation, we alert error
    //limitation is set to 1000 by default
    historyInfoLimitationForDatastream: {
      "numOfRecord": 1000
    },
    historyInfoUrlForDatastream: {
      baseUrl: {
        urlPrefix: "api/lora/rssi/aggregated_data/time_unit/hour/",
        urlSuffix: ""
      },
    },
    //We set the first device type as the default type, the default device attribute will
    //depend on this default device type for history info monitor
    updateDeviceTypesAndAttributes: {
      "all": [
        "dataStream"
      ],
      "bodysensor": [
        "dataStream"
      ],
      "plugbase": [
        "dataStream"
      ],
      "streetlight": [
        "dataStream"
      ],
      "ceilinglight": [
        "dataStream"
      ]
    },
    dataTable: {
      dynamicDataAttributes: {
        //Constant attribute used for monitor datatable service, used for condition judgement
        checkStatusAttr: "status",
        checkTimestampAttr: "timestamp",
        checkAppIDAttr: "applicationID",
        checkDeviceTypeAttr: "devType",
        checkDeviceEUIAttr: "devEUI",
        checkRelayNumAttr: "relayNum",
        //Common attributes will always diplay for every kind of device type, if they have the "current status" 
        //and "latest usage"
        commonAttr: [
          "applicationID",
          "devEUI",
          "devType"
        ],
        //If attribute in headerOrder also exsit in result query from "current status" and "latest usage",
        //display attribute according to order below, otherwise, will not display the attribute
        headerOrder: [
          "status",
          "devEUI",
          "relayNum",
          "devType",
          "subType",
          "applicationID"
        ],
        REFRESH_TIME: 5000,
        bodysensor: {
          latestUsageAttr: [
            "timestamp",
            "humidity",
            "temperature",
            "bodyCount"
          ],
          default: false,                                //different devType will have diff dynamic table, we need set default devType

        },
        streetlight: {
          currentStatusAttr: [
            "status"
          ],
          default: true,

        },
        ceilinglight: {
          default: false,

        },
        builtinplug: {
          currentStatusAttr: [
            "status"
          ],
          latestUsageAttr: [
            "timestamp",
            "voltage",
            "current",
            "power"
          ],
          default: false,

        },
        smartswitch: {
          subTypes: {
            ceilinglight: {
              currentStatusAttr: [
                "relayNum",
                "status"
              ],
              specialControlAttr: "relayNum",
            }
          },
          default: false,
        },
        smokedetector: {
          latestUsageAttr: [
            "timestamp",
            "battLevel",
            "packetFlag"
          ],
          default: false
        },
        plugbase: {
          currentStatusAttr: [
            "status"
          ],
          latestUsageAttr: [
            "timestamp",
            "voltage",
            "current",
            "power"
          ],
          default: false,

        },
        externPlugUS915: {
          currentStatusAttr: [
            "status"
          ],
          latestUsageAttr: [
            "timestamp",
            "voltage",
            "current",
            "power"
          ],
          default: false,

        },
        externPlugCN470: {
          currentStatusAttr: [
            "status"
          ],
          latestUsageAttr: [
            "timestamp",
            "voltage",
            "current",
            "power"
          ],
          default: false,
        },
        //Attributes used to control lora device on and off status
        datatableDevCtrl: {
          ON: {
            status:    "On",
            operation: "/turn_on?"
          },
          OFF: {
            status:    "Off",
            operation: "/turn_off?"
          }
        }
      }
    }
  },
};

module.exports = dashTableConfig;