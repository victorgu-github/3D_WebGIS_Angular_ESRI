'use strict';

module.exports = function ($scope, $rootScope, $window, $location, AccountService, CollectionUtils, dashboardSharedService, GeneralUserAppSharedService, 
    GeneralUserSharedService) {

    ///////////////////////////////////////
    //
    // Variable 
    //
    ///////////////////////////////////////

    let userInfo = AccountService.userInfo;

    $scope.generalUsrAppName;

    ///////////////////////////////////////
    //
    // Widget Function
    //
    ///////////////////////////////////////

    //Submit the for and register the user application
    $scope.submit = function () {
        let registerBody = {};
        registerBody.generalUserApplicationName = $scope.generalUserApplicationName;
        //Register the new general user application
        GeneralUserAppSharedService.registerGeneralUsrApp(registerBody).then(function (regResponse) {
            if (regResponse.status === "success") {
                let generalUserApplicationID = regResponse.content.generalUserApplicationID;
                GeneralUserSharedService.getGeneralUsers().then(function (getUsrResponse) {
                    if (getUsrResponse.status === "success") {
                        let userName = userInfo.userName;
                        let users = getUsrResponse.content;
                        let user = users.find((user) => { return user.userName === userName; });
                        if (user) {
                            let updateBody = {};
                            updateBody.userName = userName;
                            updateBody.generalAppIDs = user.generalAppIDs ? user.generalAppIDs : [];
                            if (!updateBody.generalAppIDs.includes(generalUserApplicationID)) {
                                updateBody.generalAppIDs.push(generalUserApplicationID);
                            }
                            //1.Update userInfo.generalAppIDs in cookies
                            userInfo.generalAppIDs = updateBody.generalAppIDs;
                            AccountService.updateCookie(userInfo);
                            //2.Update generalAppIDs in database
                            GeneralUserSharedService.updateGeneralUsers(updateBody).then(function (updateResp) {
                                if (updateResp.status === "success") {
                                    $window.alert("Register user application successful");
                                    $location.url(CollectionUtils.getDashboardOverviewPageUrl(AccountService.userInfo));
                                }
                                else {
                                    let errorMessage = dashboardSharedService.parseErrorMessage(updateResp.errors);
                                    $window.alert("Error occurred due to: " + errorMessage);
                                }
                            });
                        }
                        else {
                            $window.alert("Current user has been deleted");
                        }
                    }
                    else {
                        let errorMessage = dashboardSharedService.parseErrorMessage(getUsrResponse.errors);
                        $window.alert("Error occurred due to: " + errorMessage);
                    }
                });
            }
            else {
                let errorMessage = dashboardSharedService.parseErrorMessage(regResponse.errors);
                $window.alert("Error occurred due to: " + errorMessage);
            }
        });
    };
};