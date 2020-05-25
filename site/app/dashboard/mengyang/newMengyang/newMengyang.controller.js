'use strict';

module.exports = function ($scope, $window, $location, dashTableConfig, AccountService, CollectionUtils, dashboardSharedService, MengyangSharedService, 
  newLoraDeviceService) {

  const FORM_STATUS = {
    SUBMITTED: "submitted",
    EDITING:   "editing",
    INVALID:   "invalid"
  };

  $scope.data = {
    overviewPageUrl: CollectionUtils.getMengyangOverviewPageUrl(AccountService.userInfo),
    formStatus: FORM_STATUS.EDITING,
    pastureIDs: dashTableConfig.Mengyang.pastureIDs
  };

  $scope.registerEntry = {
    pastureID: $scope.data.pastureIDs[0]
  };

  $scope.batchRegisterEntry = {
    pastureID: $scope.data.pastureIDs[0]
  };

  //////////////////////////////////////////////////////////
  //
  // Widget Function
  //
  //////////////////////////////////////////////////////////

  $scope.closeAlert = function () {
    $scope.data.formStatus = FORM_STATUS.EDITING;
  };

  $scope.batchCloseAlert = function () {
    $scope.data.batchFormStatus = FORM_STATUS.EDITING;
  };

  $scope.getMengyangRegisterFormClass = function () {
    if (AccountService.userInfo.isCellPhone) {
      return "col-sm-12 col-md-12 col-lg-12 dashboard-content-body-form-mobile";
    }
    else {
      return "col-sm-12 col-md-12 col-lg-12 dashboard-content-body-form";
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Single Device Register
  //
  //////////////////////////////////////////////////////////

  $scope.resetPicture = function () {
    angular.element("#picture").val("");
    angular.element("#pictureInfo").val("");
  };

  $scope.pictureBrowse = function () {
    let input = angular.element("#picture");
    let display = angular.element("#pictureInfo");
    newLoraDeviceService.batchFileBrowse(input, display);
  };

  $scope.finish = function (isValid) {
    $scope.closeAlert();
    if (isValid || isValid === undefined) {
      let registerEntry = Object.assign({}, $scope.registerEntry);
      let files = angular.element("#picture")[0].files;
      if (files.length <= 1) {
        let fd = new FormData();
        fd = assembleFd(registerEntry, files, fd);
        MengyangSharedService.registerSheep(registerEntry.pastureID, fd).then(function (response) {
          if (response.status === "success") {
            $scope.data.formStatus = FORM_STATUS.SUBMITTED;
            $window.alert("羊只信息成功创建");
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
      $scope.data.errorMessage = "你输入了无效字段，数字字段不能输入字符串";
      $window.alert("错误原因: \n" + $scope.data.errorMessage);
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Batch Register
  //
  //////////////////////////////////////////////////////////

  $scope.batchBrowse = function () {
    let input = angular.element("#BatchFile");
    let display = angular.element("#BatchFileInfo");
    newLoraDeviceService.batchFileBrowse(input, display);
  };

  $scope.getBatchFile = function () {
    let csvContent = "";
    let csvHeader = ["MengyangID","MengyangID2","DateOfBirth","BirthWeight","Gender","Origin","FatherID","MotherID","Comments","Variety"];
    let csvBody = ["ABCD1235","5321DCBA","2018-05-04T00:00:00Z","1.3","M","somewhere","Fath","Math","Evan wrote this comment","1"];
    let csvFile = [csvHeader, csvBody];
    csvFile.forEach(function (rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });
    let blob = new Blob([csvContent], { type: 'text/csv' });
    let hiddenElement = document.createElement('a');
    hiddenElement.href = window.URL.createObjectURL(blob);
    hiddenElement.target = '_blank';
    hiddenElement.download = "蒙羊.csv";
    hiddenElement.click();
    hiddenElement.remove();
  };

  $scope.batchReset = function () {
    $scope.batchCloseAlert();
    angular.element("#BatchFile").val("");
    angular.element("#BatchFileInfo").val("");
    $scope.data.file = null;
  };

  $scope.batchUpload = function () {
    $scope.batchCloseAlert();
    let files = angular.element("#BatchFile")[0].files;
    if (files.length === 1) {
      //1.Condition 1: validate if a file is csv file
      if (newLoraDeviceService.validCSVFiles(files)) {
        $scope.data.file = files[0];
        $window.alert("批量文件上传成功!");
      }
      else {
        $scope.data.batchFormStatus = FORM_STATUS.INVALID;
        $scope.data.batchErrorMessage = "批量文件必须是csv文件!";
        $window.alert($scope.data.batchErrorMessage);
      }
    }
    else {
      $scope.data.batchFormStatus = FORM_STATUS.INVALID;
      $scope.data.batchErrorMessage = "批量文件必须上传，并且只能上传一个";
      $window.alert($scope.data.batchErrorMessage);
    }
  };

  $scope.batchFinish = function () {
    $scope.batchCloseAlert();
    // 1.Condition 1: If $scope.data.file exist, continue. Otherwise, need info user to upload the csv file.
    if ($scope.data.file) {
      let fd = new FormData();
      fd.append('file', $scope.data.file);
      // One-step batch register under  mode
      MengyangSharedService.batchRegisterSheeps($scope.batchRegisterEntry.pastureID, fd).then(function (response) {
        if (response.status === "success") {
          $scope.data.file = null;
          let resultMsg = "注册信息: \r\n";
          resultMsg += "1.成功注册羊只数量: " + response.content.numInserted + " \r\n";
          resultMsg += "2.重复耳标1数量: " + response.content.numDuplicateMengyangIDsNotInserted + " \r\n";
          resultMsg += "3.重复羊只耳标1: " + response.content.duplicateMengyangIDs + "\r\n";
          resultMsg += "4.重复耳标2数量: " + response.content.numDuplicateMengyangID2sNotInserted + " \r\n";
          resultMsg += "5.重复羊只耳标2: " + response.content.duplicateMengyangID2s + "\r\n";
          $window.alert(resultMsg);
          $window.location.href = $scope.data.overviewPageUrl;
        }
        else {
          $scope.data.batchFormStatus = FORM_STATUS.INVALID;
          $scope.data.batchErrorMessage = dashboardSharedService.parseErrorMessage(response.errors);
          $window.alert($scope.data.batchErrorMessage);
        }
      });
    }
    else {
      $scope.data.batchFormStatus = FORM_STATUS.INVALID;
      $scope.data.batchErrorMessage = "需要上传批量文件!";
      $window.alert($scope.data.batchErrorMessage);
    }
  };

  //////////////////////////////////////////////////////////
  //
  // Private Function
  //
  //////////////////////////////////////////////////////////

  function assembleFd(registerEntry, files, fd) {
    let file = files.length === 0 ? undefined : files[0];
    for (let key in registerEntry) {
      if (registerEntry[key]) {
        if (key === "dateOfBirth") {
          fd.append(key, registerEntry[key].toISOString());
        }
        else if (key === "birthWeight") {
          fd.append(key, registerEntry[key]);
        }
        else {
          fd.append(key, registerEntry[key]);
        }
      }
    }
    if (file) {
      fd.append('picture', file);
    }
    return fd;
  }
};
