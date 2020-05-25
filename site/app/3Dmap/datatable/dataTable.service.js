/* eslint-disable no-unused-vars */
'use strict';

module.exports = function (layerFactory, allNodesService, esriFeatureLayerService, appConfig, SceneViewService,
                           PlugBaseLayer, 3D_WebGIS_Angular_ESRI) {

  const openTip = "DATATABLE.OPEN";
  const closeTip = "DATATABLE.CLOSE";

  let dataTableService = this;
  let getDynamicTable = () => document.getElementsByClassName('dynamic-data-table')[0];

  dataTableService.realTimeServices = {};

  dataTableService.services = [];
  dataTableService.pageSize = 100;
  dataTableService.pageNumber = 1;
  dataTableService.pageCount = 0;
  dataTableService.tooltip = openTip;
  dataTableService.isOpen = false;

  dataTableService.serviceData = [];
  dataTableService.currentPageData = [];

  this.updateTabServices = function (layerCollection) {
    let list = [];
    // TODO: This is to update data table config, should be removed once we migrate to new layer model.
    esriFeatureLayerService.setESRILayerByScenario();

    for (let i = 0; i < layerCollection.length; i++) {
      //add visible layer into datatable
      let layer = layerCollection[i];
      // TODO: Transitional code, will refactor after wrap all layers into MapLayer3D.
      if ((PlugBaseLayer.isBelongToLayer(layer.id) || layer.id === 3D_WebGIS_Angular_ESRI.DETECTOR || layer.id === 3D_WebGIS_Angular_ESRI.WINDOOR_SENSOR||
        layer.id === 3D_WebGIS_Angular_ESRI.SMOKE_DETECTOR || layer.id === 3D_WebGIS_Angular_ESRI.STREET_LAMP ||
        layer.id === 3D_WebGIS_Angular_ESRI.CEILING_LIGHT) && layer.visible) {
        let service = SceneViewService.data.mapLayers.find(function(mapLayer) {
          return mapLayer.id === layer.id;
        });
        list.push(service);
        continue;
      }
      if (layer.id === appConfig.Scenarios[0].dynamicLayers["APE_RealTime"].id && layer.visible) {
        allNodesService.autoRefresh = true;
        list.push(allNodesService);
      }
      if (layer.type === "feature" && layer.visible && layer.subtype !== "label") {
        let tab = esriFeatureLayerService.generateTab(layer);
        list.push(tab);
      }
    }
    dataTableService.services = list;
  };

  this.toggleRefresh = function () {
    let target = dataTableService.findCurrentTab();
    if (target) {
      target.autoRefresh = dataTableService.autoRefresh;
      if (target.autoRefresh) {
        launchService(target);
      }
    }
  };

  this.openTab = function (id) {
    let currentTab = dataTableService.findCurrentTab();
    let targetTab = dataTableService.findTabByID(id);
    targetTab.initializing = true;
    if (currentTab) {
      clearInterval(currentTab.id);
    }
    setCurrentTab(targetTab);
  };

  this.switchTab = function (id) {
    let currentTab = dataTableService.findCurrentTab();
    let targetTab = dataTableService.findTabByID(id);
    if (currentTab) {
      clearInterval(currentTab.id);
    }
    setCurrentTab(targetTab);
  };

  this.slide = function () {
    let dynamicTable = getDynamicTable();
    if (parseInt(dynamicTable.style.bottom) >= 0) {
      dataTableService.closeView();
    } else {
      dataTableService.isOpen = true;
      dynamicTable.style.bottom = "50px";
      dataTableService.tooltip = closeTip;
      initTabs();
    }
  };

  this.closeView = function () {
    let dynamicTable = getDynamicTable();
    //TODO: 260 should be refactored as what 2D map does
    dynamicTable.style.bottom = -(dynamicTable.clientHeight + 260) + 'px';
    dataTableService.tooltip = openTip;
    dataTableService.isOpen = false;
    clearAllIntervals();
  };

  this.closeTab = function (id) {
    let tab = dataTableService.findTabByID(id);

    if (tab) {
      let index = removeTab(tab);
      if (dataTableService.currentTab === id) {
        let nextTab = findNextTab(index);
        if (nextTab) {
          setCurrentTab(nextTab);
        }
      }
    }
  };

  this.findCurrentTab = function () {
    return dataTableService.findTabByID(dataTableService.currentTab);
  };

  this.findTabByID = function (id) {
    for (let i = 0; i < dataTableService.services.length; i++) {
      let tab = dataTableService.services[i];
      if (id === tab.id) {
        return tab;
      }
    }
  };

  this.setCurrentPageData = function (data) {
    let start = (dataTableService.pageNumber - 1) * dataTableService.pageSize,
      totalPages = Math.ceil(dataTableService.pageCount / dataTableService.pageSize),
      lastPageStartIndex = calculatePageStartIndex(totalPages);

    if (lastPageStartIndex >= start) {
      dataTableService.currentPageData = data.slice(start, start + dataTableService.pageSize);
    } else {
      dataTableService.currentPageData = data.slice(lastPageStartIndex, dataTableService.pageCount);
    }

    if (dataTableService.currentPageData.length < dataTableService.pageSize) {
      for (let i = 0; i < dataTableService.pageSize - dataTableService.currentPageData.length; i++) {
        dataTableService.currentPageData.push([]);
      }
    }
  };

  this.parseRowData = function (layerId, dataMap, scenario) {
    //Arrange different logic to different layers, real time layer vs esri layer
    if (layerId === 3D_WebGIS_Angular_ESRI.REAL_TIME_LAYER) {
      //Find the default Scenario. If a scenario has field isDefault, then we
      //select this scenario as default scenario, otherwise we select first as default.
      //find the correct scenario from config file
      let scenarioID = scenario.scenarioID;
      let targetScenario = appConfig.Scenarios.find(s => s.scenarioID === scenarioID) || appConfig.Scenarios[0];
      let layerConfig = targetScenario.dynamicLayers["APE_RealTime"].dataTableConfig;

      return fillInPopup(layerConfig.popUpAttributes, dataMap);
    }

    // By default we return all static layer data in a map.
    return dataMap;
  };

  this.arrayToMap = function (header, row) {
    let map = {};
    for (let i = 0; i < row.length; i++) {
      map[header[i]] = row[i];
    }
    return map;
  };

  function fillInPopup(popUpAttributes, dataMap) {
    let popUpJsonData = {};

    for (let key in popUpAttributes) {
      if (popUpAttributes.hasOwnProperty(key)) {
        let val = popUpAttributes[key];
        popUpJsonData[key] = dataMap[val];
      }
    }

    return popUpJsonData;
  }

  function launchService(service) {
    if (service.initializing) {
      window.setTimeout(service.update.bind(service), 0);
    }
    if (service.isRealTime) {
      let interval = dataTableService.realTimeServices[service.id];
      if (interval) {
        window.clearInterval(interval);
      }
      dataTableService.realTimeServices[service.id] = window.setInterval(service.update.bind(service), service.refreshTime);
    }
  }

  function clearInterval(id) {
    let interval = dataTableService.realTimeServices[id];
    if (interval) {
      window.clearInterval(interval);
    }
  }

  function clearAllIntervals() {
    let intervals = dataTableService.realTimeServices;
    for (let key in intervals) {
      if (intervals.hasOwnProperty(key)) {
        window.clearInterval(intervals[key]);
      }
    }
  }

  function findNextTab(index) {
    let services = dataTableService.services;
    if (index - 1 >= 0) {
      return services[index - 1];
    } else if (services[0]) {
      return services[0];
    }
  }

  function setCurrentTab(tab) {
    launchService(tab);
    changeToVisible(document.getElementsByClassName(tab.className)[0]);
    changeToVisible(document.getElementById(tab.id));
    dataTableService.currentTab = tab.id;
    dataTableService.autoRefresh = tab.autoRefresh;
    dataTableService.pageNumber = 1;
    let target = document.getElementsByClassName('refresh-toggles')[0];
    if (!tab.isRealTime) {
      changeToInvisible(target);
    } else {
      changeToVisible(target);
    }
  }

  function initTabs() {
    dataTableService.updateTabServices(layerFactory.dataTableLayers);
    let defaultTab = dataTableService.services[0];
    dataTableService.services.forEach(function (service) {
      service.initializing = true;
    });
    if (defaultTab) {
      setCurrentTab(defaultTab);
    }
  }

  function changeToInvisible(target) {
    if (target) {
      target.classList.add("invisible");
    }
  }

  function changeToVisible(target) {
    if (target) {
      target.classList.remove("invisible");
    }
  }

  function removeTab(tab) {
    clearInterval(tab.id);
    changeToInvisible(document.getElementsByClassName(tab.className)[0]);
    changeToInvisible(document.getElementById(tab.id));
    let index = dataTableService.services.indexOf(tab);
    dataTableService.services.splice(index, 1);

    return index;
  }

  function calculatePageStartIndex(pageNumber) {
    return (pageNumber - 1) * dataTableService.pageSize;
  }

};
