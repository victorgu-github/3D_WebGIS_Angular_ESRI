'use strict';

module.exports = function ($q, $http, appConfig, dashTableConfig, HttpResponseHandler) {

    const TIMEOUT = 30000;

    let self       = this;
    let nodeServer = appConfig.nodeServer;
    let baseUrl    = dashTableConfig.GeneralUser.companyInfoUrl;

    ////////////////////////////////////////////////////////////
    //
    // Get Company Information
    //
    ////////////////////////////////////////////////////////////

    //OVERVIEW PAGE
    //Get company information in the system
    self.getCompanys = function () {
        let url      = nodeServer + baseUrl;
        let promise  = $http.get(url, { timeout: TIMEOUT }).then(function (response) {
            return HttpResponseHandler.handleResponse(response.data);
        }).catch(function (error) {
            return HttpResponseHandler.handleError(error, url, TIMEOUT);
        });
        return promise;
    };
};