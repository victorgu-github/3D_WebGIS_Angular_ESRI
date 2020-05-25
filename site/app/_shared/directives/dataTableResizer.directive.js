/* eslint-disable no-unused-vars */
'use strict';

module.exports = function ($document, $window) {

  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {

      // table-content-class-name is the class name for table content
      // we only need to change the height of table content to realize data table dynamic resize
      const tableClassName = $attrs.tableContentClassName;
      const offset = 50;
      let preview;

      $element.on('mousedown', function (event) {
        event.preventDefault();
        $attrs.startPos = event.pageY;
        $attrs.previewStartPos = event.pageY;

        if (preview) {
          preview.style.top = `-${offset}px`;
          preview.style.display = "block";
        }

        if (!preview) {
          preview = createPreview();
          $element.parent()[0].appendChild(preview);
        }

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        // Handle horizontal preview
        if (preview) {
          setPreviewPos($attrs.previewStartPos, event.pageY, preview);
        }
      }

      function mouseup(event) {
        let tableContent = $element.parent()[0].querySelector(`.${tableClassName}`);

        if (tableContent) {
          setTableHeight($attrs.startPos, event.pageY, tableContent);
        }

        if (preview) {
          preview.style.display = "none";
        }

        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }

      function setTableHeight(start, end, tableContent) {
        // 50px is the height of header
        if (end <= 100) {
          // $window.innerHeight - 150 means that we want to make sure the table not not too large
          // to cover the header
          tableContent.style.height = parseInt($window.innerHeight - 250) + 'px';
        } else if (end + 50 > $window.innerHeight) {
          // 100 px is the minimum height for table content
          tableContent.style.height = '100px';
        } else {
          // clientHeight includes padding
          let height = tableContent.clientHeight;
          if (start - end >= 0) {
            // User wants to make table larger, drag from bottom to top
            tableContent.style.height = (height + parseInt(start - end)) + 'px';
          } else {
            tableContent.style.height = (height - parseInt(end - start)) + 'px';
          }
        }
      }

      function setPreviewPos(start, end, preview) {
        preview.style.top = parseInt(end - start - offset) + 'px';
      }

      function createPreview() {
        let preview = document.createElement("resizer-preview");
        let line = document.createElement("preview-line");
        preview.appendChild(line);
        preview.style.position = "absolute";
        preview.style.width = "100%";
        preview.style.height = offset * 2 + "px";
        preview.style.zIndex = "100";
        line.style.position = "absolute";
        line.style.height = "1px";
        line.style.width = "100%";
        line.style.top = "50%";
        line.style.borderTop = "5px dashed grey";
        return preview;
      }

    }
  };

};
