"use strict";

describe('Lora Device Service', function () {
  let loraDeviceService;
  let $httpBackend;
  let AppConfig;
  let DashTableConfig;
  let $timeout;

  beforeEach(function () {
    module('3D_WebGIS_Angular_ESRIMap');

    inject(function (_$timeout_, _$httpBackend_, $injector) {
      loraDeviceService = $injector.get('loraDeviceService');
      AppConfig = $injector.get('appConfig');
      DashTableConfig = $injector.get('dashTableConfig');
      $httpBackend = _$httpBackend_;
      $timeout = _$timeout_;
    });
  });

  describe('.registerDevice', function () {
    let validRequest = {
      "ApplicationID": "0000000000000001",
      "DevEUI": "3212321321232132",
      "DevType": "streetlight",
      "DevAddr": "12345678"
    };
    let devAddrTooLong = {
      "ApplicationID": "0000000000000001",
      "DevEUI": "3212321321232132",
      "DevType": "streetlight",
      "DevAddr": "999999999999999999999999999999"
    };

    it('should return error message when request is invalid', function (done) {
      $httpBackend
        .when('POST', AppConfig.nodeServer + DashTableConfig.Devices.LoraDevice.oneStepRegister.devInfoUrlPrefix, devAddrTooLong)
        .respond({
          "error": {
            "errorForDevEUI": "3212321321232132",
            "inAppID": "0000000000000001",
            "errors": {
              "DevAddr": "DevAddr must have a length of 8"
            }
          }
        });

      loraDeviceService.regLoraDevice(devAddrTooLong).then(function (response) {
        expect(response.status).to.equal("error");
        expect(response.errors).to.not.empty;
        done();
      });

      $httpBackend.flush();
    });

    it('should return error when request timeout', function(done) {
      $httpBackend
        .when('POST', AppConfig.nodeServer + DashTableConfig.Devices.LoraDevice.oneStepRegister.devInfoUrlPrefix, validRequest)
        .respond({
          "Name": "12321",
          "Description": "Default Description",
          "ApplicationID": "0x0000_0000_0000_0001",
          "DevEUI": "0x3212_3213_2123_2132",
        });

      loraDeviceService.regLoraDevice(validRequest).then(function () {
      }).catch(function (error) {
        expect(error.status).to.equal("error");
        expect(error.errors).to.not.empty;
        done();
      });

      $timeout.flush(51000);
    });

    it('should return success when request valid', function(done) {
      $httpBackend
        .when('POST', AppConfig.nodeServer + DashTableConfig.Devices.LoraDevice.oneStepRegister.devInfoUrlPrefix, validRequest)
        .respond({
          "Name": "12321",
          "Description": "Default Description",
          "ApplicationID": "0x0000_0000_0000_0001",
          "DevEUI": "0x3212_3213_2123_2132",
        });

      loraDeviceService.regLoraDevice(validRequest).then(function(response) {
        expect(response.status).to.equal("success");
        expect(response.content).to.not.empty;
        done();
      });

      $httpBackend.flush();
    });

    describe('.deleteDevice', function () {
      //The web api have some problem here, no matter we successfully delete a device or failed
      //it always return the same result;
      it('should return success when successfully delete a device', function (done) {
        $httpBackend
          .when('DELETE', AppConfig.nodeServer + 'api/lora_device/devices/0000000000000010/AAAAAAAAAAAAAAAC')
          .respond({
            "status": "success",
            "content": {
              "deleteResult": {
                "DevEUI": "0x0004_A30B_001A_4501",
                "Result": {
                  "ok": 1,
                  "n": 1
                }
              }
            }
          });

        loraDeviceService.deleteLoraDevice("AAAAAAAAAAAAAAAC", "0000000000000010").then(function (response) {
          expect(response.status).to.equal("success");
          expect(response.content).to.not.empty;
          done();
        });

        $httpBackend.flush();
      });

      it('should return error when delete timeout', function (done) {
        $httpBackend
          .when('DELETE', AppConfig.nodeServer + 'api/lora_device/devices/0000000000000010/AAAAAAAAAAAAAAAC')
          .respond({
            "deleteResult": {
              "DevEUI": "0xEEEE_EEEE_EEEE_*()*",
              "Result": {
                "ok": 1,
                "n": 4
              }
            }
          });

        loraDeviceService.deleteLoraDevice("AAAAAAAAAAAAAAAC", "0000000000000010").then(function (response) {
          expect(response.status).to.equal("error");
          expect(response.errors).to.not.empty;
          done();
        });
        $timeout.flush(51000);
      });

    });
  });
});
