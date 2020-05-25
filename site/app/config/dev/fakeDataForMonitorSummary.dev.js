let fakeDataForMonitorSummary = {
    summaryInfoByAppID: {
        unit: {
            unitForDataStream: "mbps",
            unitForStandByTime: "hrs",
        },
        data: [
            /* 1 */
            {
                "ApplicationID": "0000000000000001",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 50,
                //New field: stand by time, unit hour     
                "StandByTime": 70,
            },
            {
                "ApplicationID": "0000000000000001",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 60,
                //New field: stand by time, unit hour     
                "StandByTime": 80,
            },
            {
                "ApplicationID": "0000000000000001",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000001",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 53,
                //New field: stand by time, unit hour     
                "StandByTime": 40,
            },

            /* 2 */
            {
                "ApplicationID": "0000000000000002",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 76,
            },
            {
                "ApplicationID": "0000000000000002",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 63,
                //New field: stand by time, unit hour     
                "StandByTime": 82,
            },
            {
                "ApplicationID": "0000000000000002",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 45,
                //New field: stand by time, unit hour     
                "StandByTime": 67,
            },
            {
                "ApplicationID": "0000000000000002",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 70,
            },

            /* 3 */
            {
                "ApplicationID": "0000000000000003",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 26,
            },
            {
                "ApplicationID": "0000000000000003",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 23,
                //New field: stand by time, unit hour     
                "StandByTime": 12,
            },
            {
                "ApplicationID": "0000000000000003",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 57,
            },
            {
                "ApplicationID": "0000000000000003",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 40,
            },

            /* 4 */
            {
                "ApplicationID": "0000000000000004",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 36,
            },
            {
                "ApplicationID": "0000000000000004",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 22,
            },
            {
                "ApplicationID": "0000000000000004",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000004",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 30,
            },

            /* 5 */
            {
                "ApplicationID": "0000000000000005",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 36,
            },
            {
                "ApplicationID": "0000000000000005",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 22,
            },
            {
                "ApplicationID": "0000000000000005",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000005",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 30,
            },

            /* 6 */
            {
                "ApplicationID": "0000000000000006",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 36,
            },
            {
                "ApplicationID": "0000000000000006",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 22,
            },
            {
                "ApplicationID": "0000000000000006",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000006",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 30,
            },

            /* 7 */
            {
                "ApplicationID": "0000000000000007",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 36,
            },
            {
                "ApplicationID": "0000000000000007",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 22,
            },
            {
                "ApplicationID": "0000000000000007",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000007",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 30,
            },

            /* 8 */
            {
                "ApplicationID": "0000000000000008",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 36,
            },
            {
                "ApplicationID": "0000000000000008",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 22,
            },
            {
                "ApplicationID": "0000000000000008",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000008",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 30,
            },

            /* 9 */
            {
                "ApplicationID": "0000000000000009",
                "DevType": "streetlight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 35,
                //New field: stand by time, unit hour     
                "StandByTime": 36,
            },
            {
                "ApplicationID": "0000000000000009",
                "DevType": "plugbase",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 43,
                //New field: stand by time, unit hour     
                "StandByTime": 22,
            },
            {
                "ApplicationID": "0000000000000009",
                "DevType": "bodysensor",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 55,
                //New field: stand by time, unit hour     
                "StandByTime": 77,
            },
            {
                "ApplicationID": "0000000000000009",
                "DevType": "ceilinglight",
                //New field: data stream, unit mbps or Mbps
                "DataStream": 73,
                //New field: stand by time, unit hour     
                "StandByTime": 30,
            },
        ]
    },
    ceillightGeneralInfo: {
        unit: {
            unitForCeillightPowerUsage: "MW",
        },
        data: [
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000001",
                grossPower: 2000,
                ceilinglightOn: 3000,
                ceilinglightOff: 2500
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000002",
                grossPower: 2500,
                ceilinglightOn: 3200,
                ceilinglightOff: 2800
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000003",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000004",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000005",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000006",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000007",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000008",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
            {
                //current power usage of airport, unit W
                ApplicationID: "0000000000000009",
                grossPower: 2300,
                ceilinglightOn: 3300,
                ceilinglightOff: 2300
            },
        ],
    },
    ceillightSectionInfo: {
        unit: {
            unitForCeillightGrossPower: "MW"
        },
        sections: [
            {
                secName: "sectionA"
            },
            {
                secName: "sectionB"
            },
            {
                secName: "sectionC"
            },
            {
                secName: "sectionD"
            },
            {
                secName: "sectionE"
            },
            {
                secName: "sectionComm"
            }
        ],
        //Daily power usage of airport, unit MW, 8MW equals to 80,000W
        sectionA: [
            {
                "ApplicationID": "0000000000000001",
                "timestamp": "2017-10-05T21:11:00.000Z",
                "power": 10.21
            },
            {
                "ApplicationID": "0000000000000003",
                "timestamp": "2017-10-04T21:10:00.000Z",
                "power": 6.34
            },
            {
                "ApplicationID": "0000000000000005",
                "timestamp": "2017-10-03T21:09:00.000Z",
                "power": 11.33
            },
            {
                "ApplicationID": "0000000000000007",
                "timestamp": "2017-10-04T21:08:00.000Z",
                "power": 9.78
            },
            {
                "ApplicationID": "0000000000000009",
                "timestamp": "2017-10-04T21:07:00.000Z",
                "power": 8.99
            },
            {
                "ApplicationID": "0000000000000002",
                "timestamp": "2017-10-03T21:06:00.000Z",
                "power": 9.78
            },
        ],
        sectionB: [
            {
                "ApplicationID": "0000000000000003",
                "timestamp": "2017-10-05T21:11:00.000Z",
                "power": 10.21
            },
            {
                "ApplicationID": "0000000000000006",
                "timestamp": "2017-10-04T21:10:00.000Z",
                "power": 6.34
            },
            {
                "ApplicationID": "0000000000000009",
                "timestamp": "2017-10-03T21:09:00.000Z",
                "power": 11.33
            },
            {
                "ApplicationID": "0000000000000007",
                "timestamp": "2017-10-04T21:08:00.000Z",
                "power": 9.78
            },
            {
                "ApplicationID": "0000000000000005",
                "timestamp": "2017-10-04T21:07:00.000Z",
                "power": 8.99
            },
            {
                "ApplicationID": "0000000000000006",
                "timestamp": "2017-10-03T21:06:00.000Z",
                "power": 9.78
            },
        ],
        sectionC: [
            {
                "ApplicationID": "0000000000000007",
                "timestamp": "2017-10-05T21:11:00.000Z",
                "power": 9.64
            },
            {
                "ApplicationID": "0000000000000009",
                "timestamp": "2017-10-04T21:10:00.000Z",
                "power": 8.56
            },
            {
                "ApplicationID": "0000000000000002",
                "timestamp": "2017-10-03T21:09:00.000Z",
                "power": 12.33
            },
            {
                "ApplicationID": "0000000000000005",
                "timestamp": "2017-10-04T21:08:00.000Z",
                "power": 7.78
            },
            {
                "ApplicationID": "0000000000000004",
                "timestamp": "2017-10-04T21:07:00.000Z",
                "power": 6.99
            },
            {
                "ApplicationID": "0000000000000005",
                "timestamp": "2017-10-03T21:06:00.000Z",
                "power": 12.78
            },
        ],
        sectionD: [
            {
                "ApplicationID": "0000000000000007",
                "timestamp": "2017-10-05T21:11:00.000Z",
                "power": 11.21
            },
            {
                "ApplicationID": "0000000000000008",
                "timestamp": "2017-10-04T21:10:00.000Z",
                "power": 6.77
            },
            {
                "ApplicationID": "0000000000000002",
                "timestamp": "2017-10-03T21:09:00.000Z",
                "power": 11.54
            },
            {
                "ApplicationID": "0000000000000004",
                "timestamp": "2017-10-04T21:08:00.000Z",
                "power": 6.78
            },
            {
                "ApplicationID": "0000000000000003",
                "timestamp": "2017-10-04T21:07:00.000Z",
                "power": 10.99
            },
            {
                "ApplicationID": "0000000000000003",
                "timestamp": "2017-10-03T21:06:00.000Z",
                "power": 7.78
            },
        ],
        sectionE: [
            {
                "ApplicationID": "0000000000000007",
                "timestamp": "2017-10-05T21:11:00.000Z",
                "power": 7.25
            },
            {
                "ApplicationID": "0000000000000006",
                "timestamp": "2017-10-04T21:10:00.000Z",
                "power": 8.64
            },
            {
                "ApplicationID": "0000000000000008",
                "timestamp": "2017-10-03T21:09:00.000Z",
                "power": 12.33
            },
            {
                "ApplicationID": "0000000000000004",
                "timestamp": "2017-10-04T21:08:00.000Z",
                "power": 9.66
            },
            {
                "ApplicationID": "0000000000000005",
                "timestamp": "2017-10-04T21:07:00.000Z",
                "power": 8.75
            },
            {
                "ApplicationID": "0000000000000006",
                "timestamp": "2017-10-03T21:06:00.000Z",
                "power": 9.76
            },
        ],
        sectionComm: [
            {
                "ApplicationID": "0000000000000007",
                "timestamp": "2017-10-05T21:11:00.000Z",
                "power": 7.21
            },
            {
                "ApplicationID": "0000000000000001",
                "timestamp": "2017-10-04T21:10:00.000Z",
                "power": 6.88
            },
            {
                "ApplicationID": "0000000000000001",
                "timestamp": "2017-10-03T21:09:00.000Z",
                "power": 12.33
            },
            {
                "ApplicationID": "0000000000000008",
                "timestamp": "2017-10-04T21:08:00.000Z",
                "power": 9.23
            },
            {
                "ApplicationID": "0000000000000004",
                "timestamp": "2017-10-04T21:07:00.000Z",
                "power": 9.99
            },
            {
                "ApplicationID": "0000000000000005",
                "timestamp": "2017-10-03T21:06:00.000Z",
                "power": 7.78
            },
        ],
    },
    historyData: {
        unit: {

        },
        result: [
            {
                "aggDur": "oneHour",
                "aggStartTime": "2017-10-07T11:00:00.000Z",
                "totalNumDevices": 15,
                "totalNumGateways": 6,
                "totalRssiEntries": 34033,
                "aggregationByDevEUI": [
                    {
                        "numRssiEntries": 3330,
                        "devEUI": "3136470A1C003100"
                    },
                    {
                        "numRssiEntries": 3388,
                        "devEUI": "3539383144357B0E"
                    },
                    {
                        "numRssiEntries": 3055,
                        "devEUI": "3539383145357C0E"
                    },
                    {
                        "numRssiEntries": 382,
                        "devEUI": "373336383B36840E"
                    },
                    {
                        "numRssiEntries": 893,
                        "devEUI": "3733363848366A11"
                    },
                    {
                        "numRssiEntries": 2687,
                        "devEUI": "3933383340348403"
                    },
                    {
                        "numRssiEntries": 1499,
                        "devEUI": "3933383344348403"
                    },
                    {
                        "numRssiEntries": 3049,
                        "devEUI": "3933383346348403"
                    },
                    {
                        "numRssiEntries": 3429,
                        "devEUI": "3933383348348403"
                    },
                    {
                        "numRssiEntries": 2692,
                        "devEUI": "393338334A348403"
                    },
                    {
                        "numRssiEntries": 217,
                        "devEUI": "3933383352348403"
                    },
                    {
                        "numRssiEntries": 225,
                        "devEUI": "393338335D348303"
                    },
                    {
                        "numRssiEntries": 3360,
                        "devEUI": "3933383361348403"
                    },
                    {
                        "numRssiEntries": 2784,
                        "devEUI": "3933383365348303"
                    },
                    {
                        "numRssiEntries": 3043,
                        "devEUI": "393338336D348503"
                    }
                ],
                "aggregationByGateway": [
                    {
                        "numRssiEntries": 7860,
                        "gatewayMAC": "B827EBFFFE01C782"
                    },
                    {
                        "numRssiEntries": 6188,
                        "gatewayMAC": "B827EBFFFE2A9848"
                    },
                    {
                        "numRssiEntries": 5775,
                        "gatewayMAC": "B827EBFFFE399F99"
                    },
                    {
                        "numRssiEntries": 6505,
                        "gatewayMAC": "B827EBFFFE8E1157"
                    },
                    {
                        "numRssiEntries": 6430,
                        "gatewayMAC": "B827EBFFFEA5188E"
                    },
                    {
                        "numRssiEntries": 1275,
                        "gatewayMAC": "B827EBFFFEE6F2D6"
                    }
                ],
                "aggregationByDevType": [
                    {
                        "numRssiEntries": 30517,
                        "devType": "streetlight",
                        "devEUIs": [
                            "3136470A1C003100",
                            "3539383144357B0E",
                            "3539383145357C0E",
                            "3733363848366A11",
                            "3933383340348403",
                            "3933383344348403",
                            "3933383346348403",
                            "3933383348348403",
                            "3933383361348403",
                            "3933383365348303",
                            "393338336D348503"
                        ]
                    },
                    {
                        "numRssiEntries": 3074,
                        "devType": "plugbase",
                        "devEUIs": [
                            "373336383B36840E",
                            "393338334A348403"
                        ]
                    },
                    {
                        "numRssiEntries": 442,
                        "devType": "bodysensor",
                        "devEUIs": [
                            "3933383352348403",
                            "393338335D348303"
                        ]
                    },
                    {
                        "numRssiEntries": 599,
                        "devType": "ceilinglight",
                        "devEUIs": [
                            "393338335234FFFF",
                            "393338335D34FFFA"
                        ]
                    }
                ],
                "aggregationOnOffByDevType": [
                    {
                        "on": 3000,
                        "devType": "streetlight"
                    },
                    {
                        "on": 2800,
                        "devType": "plugbase"
                    },
                    {
                        "on": 2600,
                        "devType": "bodysensor"
                    },
                    {
                        "on": 2500,
                        "devType": "ceilinglight"
                    }
                ]
            },
        ]
    }
};

module.exports = fakeDataForMonitorSummary;
