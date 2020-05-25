'use strict';

module.exports = function ($q, $http, $routeParams, appConfig, dashTableConfig, CollectionUtils, HttpResponseHandler) {

    const TIMEOUT = 30000;

    let self = this;
    let nodeServer = appConfig.nodeServer;
    let baseUrl =            dashTableConfig.GeneralUser.baseUrl;
    let baseUrlForRegistry = dashTableConfig.GeneralUser.baseUrlForRegistry;
    let companyInfoUrl =     dashTableConfig.GeneralUser.companyInfoUrl;

    ////////////////////////////////////////////////////////////
    //
    // Get General User Information
    //
    ////////////////////////////////////////////////////////////

    //OVERVIEW PAGE, DEVICE TABLE PAGE
    //Get general users in the system
    self.getGeneralUsers = function () {
        let url = nodeServer + baseUrl;
        let promise = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
            return HttpResponseHandler.handleResponse(response.data);
        }).catch(function (error) {
            return HttpResponseHandler.handleError(error, url, TIMEOUT);
        });
        return promise;
    };

    //OVERVIEW PAGE
    //Get general users according to companyID
    self.getGeneralUsersByCompanyID = function (companyIDArr) {
        let companyIDs = companyIDArr.join();
        let url = nodeServer + baseUrl + "?companyID=" + companyIDs;
        return $q(function (resolve) {
            $http.get(url, { timeout: TIMEOUT }).then(function (response) {
                resolve(HttpResponseHandler.handleResponse(response.data));
            }).catch(function (error) {
                resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
            });
        });
    };

    ////////////////////////////////////////////////////////////
    //
    // Update General User Information
    //
    ////////////////////////////////////////////////////////////

    //Update general user application in the system
    self.updateGeneralUsers = function (updateRequestBody) {
        let url = nodeServer + baseUrlForRegistry;
        let promise = $http.put(url, updateRequestBody, { timeout: TIMEOUT }).then(function (response) {
            return HttpResponseHandler.handleResponse(response.data);
        }).catch(function (error) {
            return HttpResponseHandler.handleError(error, url, TIMEOUT);
        });
        return promise;
    };

    self.updateAppForGenUsr = function (username, generalUserApplicationID) {
        return $q(function (resolve) {
            let url = nodeServer + baseUrl;
            $http.get(url, { timeout: TIMEOUT }).then(function (response) {
                let users = response.data;
                let user = users.find((user) => { return user.userName === username; });
                let up_url = nodeServer + baseUrlForRegistry;
                let updateEntry = {};
                updateEntry.userName = user.userName;
                updateEntry.generalAppIDs = user.generalAppIDs.filter((generalAppID) => { return generalAppID !== generalUserApplicationID; });
                $http.put(up_url, updateEntry, { timeout: TIMEOUT }).then(function (resp) {
                    resolve(HttpResponseHandler.handleResponse(resp.data));
                }).catch(function (error) {
                    resolve(HttpResponseHandler.handleError(error, up_url, TIMEOUT));
                });
            }).catch(function (error) {
                resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
            });
        });
    };

    //////////////////////////////////////////////////////////
    //
    // Get Company Info
    //
    //////////////////////////////////////////////////////////

    //Get Company Info
    self.getCompanyInfo = function () {
        let url = nodeServer + companyInfoUrl;
        return $q(function (resolve) {
            $http.get(url, { timeout: TIMEOUT }).then(function (response) {
                resolve(HttpResponseHandler.handleResponse(response.data));
            }).catch(function (error) {
                resolve(HttpResponseHandler.handleError(error, url, TIMEOUT));
            });
        });
    };
};