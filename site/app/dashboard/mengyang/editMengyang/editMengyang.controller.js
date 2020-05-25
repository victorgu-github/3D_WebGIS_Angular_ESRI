'use strict';

module.exports = function ($scope, $window, $location, $routeParams, dashTableConfig, AccountService, CollectionUtils, dashboardSharedService, 
  MengyangSharedService, newLoraDeviceService, EditMengyangService) {
  //Const used for error message
  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };

  $scope.data = {
    overviewPageUrl: "/dashboard/mengyang/table",
    formStatus: FORM_STATUS.EDITING,
    pastureID: EditMengyangService.sheepInfo.pastureID,
    picUrl: ""
  };

  //////////////////////////////////////////////////
  //
  // Init Function
  //
  //////////////////////////////////////////////////

  //Init meng yang information
  initMengyangPage();

  $(document).ready(function () {
    //Disabled the scroll function for input [type = number]
    dashboardSharedService.disabledInputNumScroll();
  });

  /////////////////////////////////////////////////////
  //
  // Widget Function
  //
  /////////////////////////////////////////////////////

  $scope.closeAlert = function () {
    $scope.data.formStatus = FORM_STATUS.EDITING;
  };

  //////////////////////////////////////////////
  //
  // Update Lora Gateway
  //
  //////////////////////////////////////////////

  $scope.deletePicture = function () {
    $scope.closeAlert();
    let confirmResult = window.confirm("请确认你想删除图片");
    if (confirmResult === true) {
      angular.element("#picture").val("");
      angular.element("#pictureInfo").val("");
    }
  };

  $scope.resetPicture = function () {
    $scope.closeAlert();
    angular.element("#picture").val("");
    angular.element("#pictureInfo").val($scope.data.picUrl);
  };

  $scope.pictureBrowse = function () {
    let input = angular.element("#picture");
    let display = angular.element("#pictureInfo");
    newLoraDeviceService.batchFileBrowse(input, display);
  };

  $scope.finish = function (isValid) {
    $scope.closeAlert();
    if (isValid || isValid === undefined) {
      let editEntry = Object.assign({}, $scope.editEntry);
      let files = angular.element("#picture")[0].files;
      if (files.length <= 1) {
        let fd = new FormData();
        fd = assembleFd(editEntry, files, fd);
        MengyangSharedService.updateSheep($scope.data.pastureID, fd).then(function (response) {
          if (response.status === "success") {
            $scope.data.formStatus = FORM_STATUS.SUBMITTED;
            $window.alert("羊只信息成功更新");
            $window.location.href = $scope.data.overviewPageUrl;
          }
          else {
            $scope.data.formStatus = FORM_STATUS.INVALID;
            $scope.data.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
            $window.alert("错误原因: \n" + $scope.data.errorMessage);
          }
        });
      }
      else {
        $scope.data.formStatus = FORM_STATUS.INVALID;
        $scope.data.errorMessage = "上传图片不能超过1个";
        $window.alert("错误原因: \n" + $scope.data.errorMessage);
      }
    }
    else {
      $scope.data.formStatus = FORM_STATUS.INVALID;
      $scope.data.errorMessage = "标*号字段不能为空，且必须为有效值";
      $window.alert("错误原因: \n" + $scope.data.errorMessage);
    }
  };

  //////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////

  function initMengyangPage() {
    MengyangSharedService.getSheep(EditMengyangService.sheepInfo).then(function (response) {
      if (response.status === "success" && response.content !== null) {
        response.content[0].dateOfBirth = new Date(response.content[0].dateOfBirth);
        $scope.editEntry = response.content[0];
        let picArr = $scope.editEntry.picture.split('/');
        $scope.data.picUrl = picArr[picArr.length - 1];
        angular.element("#pictureInfo").val($scope.data.picUrl);
      }
      else if (response.status === "success" && response.content === null) {
        $scope.data.errorMessage = "系统中无法找到这只羊";
        $window.alert($scope.data.errorMessage);
        $scope.data.initializing = false;
        $scope.data.formStatus = FORM_STATUS.INVALID;
      }
      else {
        $scope.data.errorMessage = dashboardSharedService.parseErrorMessage(response.errors);
        $window.alert("错误原因: " + $scope.data.errorMessage);
        $scope.data.initializing = false;
        $scope.data.formStatus = FORM_STATUS.INVALID;
      }
    });
  }

  function assembleFd(editEntry, files, fd) {
    let file = files.length === 0 ? undefined : files[0];
    for (let key in editEntry) {
      if (editEntry[key] !== undefined && editEntry[key] !== null) {
        if (key === "dateOfBirth") {
          fd.append(key, (new Date(editEntry[key])).toISOString());
        }
        else if (key === "birthWeight") {
          fd.append(key, editEntry[key]);
        }
        else if (key === "picture") {
          continue;
        }
        else {
          fd.append(key, editEntry[key]);
        }
      }
    }
    let picUrl = angular.element("#pictureInfo").val();
    if (picUrl === "") {
      fd.append('picture', "");
    }
    else if (picUrl !== "" && file) {
      fd.append('picture', file);
    }
    return fd;
  }
};