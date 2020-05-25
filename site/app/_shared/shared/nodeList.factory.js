'use strict';

module.exports = function (dataFactory) {

  let factory = {};

  factory.getNodeList = function (controller) {
    controller.nodeList = [];
    dataFactory.getActiveNodes().then(function (data) {
      if (data.status === "success") {
        let index = 0;
        data.content.activeNodes.forEach(function (element) {
          let node = {
            nodeData: element,
            color: controller.colorSetting[index],
            display: false,
            visibleIcon: 'esri-icon-non-visible',
          };
          index++;
          controller.nodeList.push(node);
        });
      } else {
        console.error("Failed to updating active nodes due to: " + data.errors[0].message);
      }
    });
  };

  factory.updateNodeInfo = function (controller, data) {
    let records = [];
    if (data.status === "success") {
      records = data.content.latestApeRecords;
    }
    for (let i = 0; i < records.length; i++) {
      for (let j = 0; j < controller.nodeList.length; j++) {
        if (records[i].node_mac === controller.nodeList[j].nodeData['node_mac']) {
          controller.nodeList[j].nodeData = records[i];
          break;
        }
      }
    }
  };


  return factory;
};
