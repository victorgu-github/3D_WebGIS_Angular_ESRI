'use strict';

module.exports = function (3D_WebGIS_Angular_ESRI) {

  let serviceConfig = {
    "Active Nodes": {
      "header": ["ID", "Node Mac", "Current Scenario", "Name", "Wireless Mode",
        "Setup ID", "Channel Info", "Epoch Timestamp", "Last Update Time", "__v"],
      "dataKey": "activeNodes",
      "mapping": {
        "ID": ["_id"],
        "Node Mac": ["node_mac"],
        "Current Scenario": ["curr_scenario"],
        "Name": ["displayName"],
        "Wireless Mode": ["wireless_mode"],
        "Setup ID": ["setup_id"],
        "Channel Info": ["channel_info"],
        "Epoch Timestamp": ["epoch_timestamp"],
        "Last Update Time": ["last_update_time"],
        "__v": ["__v"]
      }
    },
    [3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER]: {
      "header": ["Node Mac", "Current Scenario", "Date",
        "Gateway ID", "Latitude", "Longitude", "Height"],
      "aliasHeader": ["Node Mac", "Current Scenario", "Date",
        "Gateway ID", "Latitude", "Longitude", "Height"],
      "dataKey": "latestApeRecords",
      "mapping": {
        "Node Mac": ["node_mac"],
        "Current Scenario": ["curr_scenario"],
        "Date": ["date"],
        "Gateway ID": ["gateway_info", "_id"],
        "Latitude": ["spatial_info", "pos_lat"],
        "Longitude": ["spatial_info", "pos_lon"],
        "Height": ["spatial_info", "pos_hgt"]
      }
    },
    "Mengyang ble nodes": {
      "header": ["Node Mac", "Date",
        "Latitude", "Longitude"],
      "aliasHeader": ["Node Mac", "Date","Latitude", "Longitude"],
      "mapping": {
        "Node Mac": ["macAddress"],
        "Date": ["date"],
        "Latitude": ["latitude"],
        "Longitude": ["longitude"]
      }
    }
  };

  this.parseJson = function (response, tabName) {
    let array = [];
    let header = serviceConfig[tabName]["header"];
    let aliasHeader = serviceConfig[tabName]["aliasHeader"];
    let dataKey = serviceConfig[tabName]["dataKey"];
    let mapping = serviceConfig[tabName]["mapping"];
    let records = [];

    if (response.status === "success") {
      records = response.content[dataKey];
    }

    if (records) {
      records.forEach(function (record) {
        let row = doMapping(mapping, record);
        array.push(row);
      });
    }
    //hardcode for mengyang
    else if (response.content)
    {
      header = serviceConfig["Mengyang ble nodes"]["header"];
      aliasHeader = serviceConfig["Mengyang ble nodes"]["aliasHeader"];
      mapping = serviceConfig["Mengyang ble nodes"]["mapping"];
      records = response.content;
      records.forEach(function (record) {
        let row = doMapping(mapping, record);
        row[1] = new Date();
        array.push(row);
      });
    }

    return buildJson(header, aliasHeader, array);
  };

  function buildJson(header, aliasHeader, body) {
    return {
      "header": header,
      "aliasHeader": aliasHeader,
      "body": body
    };
  }

  function doMapping(map, json) {
    let results = [];
    Object.keys(map).forEach(function (key) {
      let paths = map[key];
      let value = json;

      paths.forEach(function (path) {
        if (value) {
          value = value[path];
        }
      });

      results.push(value);
    });
    return results;
  }

};
