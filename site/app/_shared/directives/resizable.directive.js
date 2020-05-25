/* eslint-disable no-unused-vars */
module.exports = function () {
  return {
    restrict: 'A',
    scope: {
      initHeight: "@initHeight"
    },
    link: function (scope, element, attr) {
      let table = element[0],
        tableStyle = window.getComputedStyle(table, ""),
        tableHeight = parseInt(tableStyle.getPropertyValue("height")),
        container = element.parent()[0],
        containerStyle = window.getComputedStyle(container, ""),
        containerOffset = parseInt(containerStyle.getPropertyValue("bottom")),
        start,
        dragDir,
        drag = function (e) {
          let offset;
          if (e.clientY < start) {
            dragDir = 'upward';
            offset = start - e.clientY;
          } else {
            dragDir = 'downward';
            offset = e.clientY - start;
          }

          switch (dragDir) {
            case 'upward':
              if (tableHeight + offset >= 400) {
                table.style.height = '400px';
                container.style.bottom = '230px';
              } else {
                table.style.height = tableHeight + 0.97 * offset + 'px';
                container.style.bottom = containerOffset + 0.97 * offset + 'px';
              }
              break;
            case 'downward':
              if (tableHeight - offset <= 210) {
                table.style.height = '210px';
                container.style.bottom = '93px';
              } else {
                table.style.height = tableHeight - offset + 'px';
                container.style.bottom = containerOffset - 0.97 * offset + 'px';
              }
              break;
          }
        },
        dragStart = function (e) {
          start = e.clientY;
          console.log("Drag start: " + start);

          document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', drag, false);
            tableHeight = parseInt(tableStyle.getPropertyValue("height"));
            containerOffset = parseInt(containerStyle.getPropertyValue("bottom"));
            console.log("tableHeight: " + tableHeight);
            console.log("containerOffset: " + containerOffset);

          });
          document.addEventListener('mousemove', drag, false);
        };


      (function () {
        let grabber = document.createElement('div');
        grabber.setAttribute('class', 'rg-top');
        grabber.innerHTML = '';
        table.appendChild(grabber);
        grabber.ondragstart = function () {
          return false;
        };
        grabber.addEventListener('mousedown', function (e) {
          dragStart(e);
        });
      }());

    }
  };
};
