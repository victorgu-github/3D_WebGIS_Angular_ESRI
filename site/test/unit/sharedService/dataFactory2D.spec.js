"use strict";

describe("DataFactory", function () {
  let dataFactory2D;
  let $httpBackend;
  let AppConfig;
  let $timeout;
  let sensorType = 'temp_sensor';

  beforeEach(module('3D_WebGIS_Angular_ESRIMap'));
  beforeEach(inject(function (_$timeout_, _$q_, _$httpBackend_, $injector) {
    $timeout = _$timeout_;
    dataFactory2D = $injector.get('dataFactory2D');
    AppConfig = $injector.get('appConfig');
    $httpBackend = _$httpBackend_;
  }));

  describe('.getGWsensorValues', function () {
    it('should return success response', function (done) {
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/1/latest_gw_records/sens/' + sensorType)
        .respond(
          {
            "gw_sensor_recs": [
              {
                "gw_mac": "5C:31:3E:06:88:BD",
                "name": "Gateway 1",
                "temp_sensor": {
                  "sensor_type": "temp_sensor",
                  "resv_mode": 0,
                  "value": -11.93,
                  "unit": "C",
                  "_id": "5995368976a9d803201d2c8b"
                }
              }]
          });

      dataFactory2D.getGWsensorValues('', sensorType).then((result) => {
        expect(result.status).to.equal('success');
        expect(result.content.gw_sensor_recs.length).to.equal(1);
        done();
      });

      $httpBackend.flush();
    });

    it('should return errors when timeout', function () {
      $httpBackend
        .when('GET', AppConfig.nodeServer + 'api/1/latest_gw_records/sens/' + sensorType)
        .respond({
          "gw_sensor_recs": []
        });

      dataFactory2D.getGWsensorValues('', sensorType).then((result) => {
        expect(result.status).to.equal('error');
      });

      // TIME_OUT is 5 seconds, so 5.1 seconds should trigger timeout.
      $timeout.flush(20100);
    });

  });

});
