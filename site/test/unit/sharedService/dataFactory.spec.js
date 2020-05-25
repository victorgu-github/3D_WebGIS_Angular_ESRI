"use strict";

describe("DataFactory", function () {
  let dataFactory;
  let $httpBackend;
  let AppConfig;
  let AccountService;
  let $timeout;

  beforeEach(module('3D_WebGIS_Angular_ESRIMap'));
  beforeEach(inject(function (_$timeout_, _$q_, _$httpBackend_, $injector) {
    $timeout = _$timeout_;
    dataFactory = $injector.get('dataFactory');
    AppConfig = $injector.get('appConfig');
    AccountService = $injector.get('AccountService');
    $httpBackend = _$httpBackend_;
  }));

  describe('.getLoRaDeviceLatestUsage', function () {
    it('should return empty when no record with devEUI empty', function (done) {
      AccountService.userInfo.settings.currentScenario = {
        loraAppID: "01"
      };
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/lora/plugbase/' + AccountService.userInfo.settings.currentScenario.loraAppID + '/latest_usage')
        .respond({
          "deviceConsumption": []
        });

      dataFactory.getLoRaDeviceLatestUsage("plugbase").then((result) => {
        expect(result.content.deviceConsumption).to.be.empty;
        expect(result.status).to.equal('success');
        done();
      });

      $httpBackend.flush();
    });

    it('should return errors when timeout', function () {
      AccountService.userInfo.settings.currentScenario = {
        loraAppID: "01"
      };
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/lora/plugbase/' + AccountService.userInfo.settings.currentScenario.loraAppID + '/latest_usage')
        .respond({
          "deviceConsumption": []
        });

      dataFactory.getLoRaDeviceLatestUsage("plugbase").then((result) => {
        expect(result.status).to.equal('error');
      });

      // TIME_OUT is 5 seconds, so 5.1 seconds should trigger timeout.
      $timeout.flush(5100);
    });

    it('should return error when returning 500 internal error', function(done) {
      AccountService.userInfo.settings.currentScenario = {
        loraAppID: "01"
      };
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/lora/plugbase/' + AccountService.userInfo.settings.currentScenario.loraAppID + '/latest_usage')
        .respond(500, {});

      dataFactory.getLoRaDeviceLatestUsage("plugbase").then((result) => {
        expect(result.status).to.equal('error');
        done();
      });

      $httpBackend.flush();
    });

  });

  describe('.getLoRaDeviceRecentUsage', function () {
    it('should return ok result', function (done) {
      AccountService.userInfo.settings.currentScenario = {
        loraAppID: "01"
      };
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/lora/bodysensor/' + AccountService.userInfo.settings.currentScenario.loraAppID + '/recent_usage?dev_eui=1234')
        .respond({
          "deviceInfos": [
            {
              "devEUI": "3933383351348303",
              "timestamp": "2017-07-24T16:28:00.000Z",
              "humidity": 28.2,
              "temperature": 21.7,
              "bodyCount": 0
            },
            {
              "devEUI": "3933383351348303",
              "timestamp": "2017-07-24T16:29:00.000Z",
              "humidity": 28.2,
              "temperature": 21.7,
              "bodyCount": 0
            }
          ]
        });

      dataFactory.getLoRaDeviceRecentUsage("bodysensor", "1234").then((result) => {
        expect(result.status).to.equal('success');
        expect(result.content.deviceInfos.length).to.equal(2);
        done();
      });

      $httpBackend.flush();
    });

    it('should return errors when timeout', function () {
      AccountService.userInfo.settings.currentScenario = {
        loraAppID: "01"
      };
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/lora/bodysensor/' + AccountService.userInfo.settings.currentScenario.loraAppID + '/recent_usage?dev_eui=1234')
        .respond({
          "deviceInfos": [
            {
              "devEUI": "3933383351348303",
              "timestamp": "2017-07-24T16:28:00.000Z",
              "humidity": 28.2,
              "temperature": 21.7,
              "bodyCount": 0
            }
          ]
        });

      dataFactory.getLoRaDeviceRecentUsage("bodysensor", "1234").then((result) => {
        expect(result.status).to.equal('error');
      });

      // TIME_OUT is 5 seconds, so 5.1 seconds should trigger timeout.
      $timeout.flush(5100);
    });

    it('should return error when returning 500 internal error', function(done) {
      AccountService.userInfo.settings.currentScenario = {
        loraAppID: "01"
      };
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/lora/bodysensor/' + AccountService.userInfo.settings.currentScenario.loraAppID + '/recent_usage?dev_eui=1234')
        .respond(500, {});

      dataFactory.getLoRaDeviceRecentUsage("bodysensor", "1234").then((result) => {
        expect(result.status).to.equal('error');
        done();
      });

      $httpBackend.flush();
    });

  });
});
