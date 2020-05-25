"use strict";

describe("Account Service", function () {
  let AccountService;
  let AppConfig;
  let $httpBackend;
  let $cookies;
  let $timeout;

  describe('.login', function () {
    beforeEach(function () {
      module('3D_WebGIS_Angular_ESRIMap');

      inject(function ($injector, _$httpBackend_, _$cookies_, _$timeout_) {
        AccountService = $injector.get('AccountService');
        AppConfig = $injector.get('appConfig');
        $httpBackend = _$httpBackend_;
        $cookies = _$cookies_;
        $timeout = _$timeout_;
      });
    });

    afterEach(function () {
      $cookies.remove('userInfo');
      $cookies.remove('authToken');
      $cookies.remove('esriToken');
    });

    xit('should return success with scenarios and access role info', function () {
      const expirationTime = new Date().getTime() + 8640000; // one day to expire
      $httpBackend
        .when('POST', AppConfig.nodeServer + 'api/adminuserlogin', {username: "test", password: "123456"})
        .respond({
          "result": {
            "firstName": "firstName",
            "lastName": "lastName",
            "username": "test",
            "email": "test@3D_WebGIS_Angular_ESRI.com",
            "accessRole": "general",
            "tiledLayerBaseURL": "TiledLayerBaseUrl",
            "featureLayerBaseURL": "FeatureLayerBaseURL",
            "appIDs": [
              "0000000000000001",
              "0000000000000005",
              "0000000000000009"
            ],
            "scenarios": [
              {
                "id": 1,
                "bleAppID": "1",
                "loraAppID": "0000000000000008",
                "default": true
              }
            ],
            "token": "header.payload.signature",
            "tokenExpiresAt": expirationTime,
            "esriAuthResult": {
              "token": "esriToken",
              "expires": expirationTime + 8640000,
              "ssl": false
            }
          }
        });

      AccountService.adminUserLogin({username: "test", password: "123456"});

      $httpBackend.flush();

      expect(AccountService.userInfo.loginFailedMsg).to.equal("");
      let userInfo = AccountService.userInfo;
      expect(userInfo.firstName).to.equal("firstName");
      expect(userInfo.lastName).to.equal("lastName");
      expect(userInfo.email).to.equal("test@3D_WebGIS_Angular_ESRI.com");
      expect(userInfo.accessRole).to.equal("general");
      expect(userInfo.settings.tiledLayerBaseURL).to.equal("TiledLayerBaseUrl");
      expect(userInfo.settings.featureLayerBaseURL).to.equal("FeatureLayerBaseURL");
      expect(userInfo.settings.Scenarios[0].isDefault).to.be.true;
      expect(userInfo.settings.Scenarios[0].isActive).to.be.true;
      expect(userInfo.settings.Scenarios[0].bleAppID).to.equal("1");
      expect(userInfo.settings.Scenarios[0].loraAppID).to.equal("0000000000000008");
      expect(userInfo.settings.currentScenario.bleAppID).to.equal("1");
      expect(userInfo.settings.currentScenario.loraAppID).to.equal("0000000000000008");
      expect($cookies.get("authToken")).to.be.equal("header.payload.signature");
    });

    it('should return error when credential is incorrect', function () {
      $httpBackend
        .when('POST', AppConfig.nodeServer + 'api/adminuserlogin', {username: "test", password: "incorrect"})
        .respond(400, {
          error: {
            errors: [
              {
                domain: "backend",
                reason: "Bad Request",
                message: "Username or password is not correct."
              }
            ],
            code: 400,
            message: "Username or password is not correct"
          }
        });

      AccountService.adminUserLogin({username: "test", password: "incorrect"});

      $httpBackend.flush();

      expect(AccountService.userInfo.adminUserLoginFailedMsg).to.equal("1. Username or password is not correct.\n");

      let userInfo = $cookies.get('userInfo');
      expect(userInfo).to.be.undefined;
    });

    it('should return error when timeout', function () {
      $httpBackend
        .when('POST', AppConfig.nodeServer + 'api/adminuserlogin', {username: "test", password: "timeout"})
        .respond({});

      AccountService.adminUserLogin({username: "test", password: "timeout"});

      $timeout.flush(10001);

      expect(AccountService.userInfo.adminUserLoginFailedMsg).to.equal("Login request timeout.");
    });

  });

  describe('.logout', function () {
    beforeEach(function () {
      module('3D_WebGIS_Angular_ESRIMap');

      inject(function ($injector, _$cookies_) {
        AccountService = $injector.get('AccountService');
        AppConfig = $injector.get('appConfig');
        $cookies = _$cookies_;
      });
    });

    it('should clear user info after logout', function () {
      $cookies.putObject('userInfo', {
        firstName: "firstName",
        lastName: "lastName",
        email: "test@email.com",
        accessRole: "anonymous",
        loginFailedMsg: "",
        settings: {
          tiledLayerBaseURL: "url1",
          featureLayerBaseURL: "url2",
          Scenarios: [{
            "id": 1,
            "bleAppID": "01",
            "loraAppID": "000000000008",
            "default": true
          }]
        }
      });

      AccountService.logout();

      expect($cookies.get('userInfo')).to.be.undefined;
      expect($cookies.get('authToken')).to.be.undefined;
      expect($cookies.get('esriToken')).to.be.undefined;
      expect(AccountService.userInfo.accessRole).to.equal("anonymous");
      expect(AccountService.userInfo.settings.tiledLayerBaseURL).to.equal(AppConfig.tiledLayerBaseURL);
      expect(AccountService.userInfo.settings.currentScenario.bleAppID).to.equal("1");
      expect(AccountService.userInfo.settings.currentScenario.loraAppID).to.equal("000000000008");
    });
  });

});
