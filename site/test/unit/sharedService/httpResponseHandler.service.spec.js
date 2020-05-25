"use strict";

describe("HttpResponseHandler", function () {
  let HttpResponseHandler;

  beforeEach(module('3D_WebGIS_Angular_ESRIMap.shared.services'));
  beforeEach(inject(function ($injector) {
    HttpResponseHandler = $injector.get('HttpResponseHandler');
  }));

  describe('.handleResponse', function () {
    it('should return success body when response is OK', function () {
      let response = {
        "gw_sensor_recs": [
          {
            "gw_mac": "AB:CD:EF:GH:IJ",
            "name": "Gateway 1",
            "temp_sensor": {
            }
          }]
      };

      let result = HttpResponseHandler.handleResponse(response);

      expect(result.status).to.equal("success");
      expect(result.content).to.not.be.undefined;
    });

    it('should return error when response is error', function () {
      let response = {
        "error": {
          "errorForDevEUI": "3212321321232132",
          "inAppID": "0000000000000001",
          "errors": {
            "Name": "A valid Name is required",
            "Description": "A valid Description is required"
          }
        }
      };

      let result = HttpResponseHandler.handleResponse(response);

      expect(result.status).to.equal("error");
      expect(result.errors.length).to.equal(2);
    });

    it('should return error with correct error message', function () {
      let response = {
        "error": {
          "errorForDevEUI": "3212321321232132",
          "inAppID": "0000000000000001",
          "errors": {
            "Name": "A valid Name is required",
          }
        }
      };

      let result = HttpResponseHandler.handleResponse(response);

      expect(result.status).to.equal("error");
      expect(result.errors[0].message).to.equal("A valid Name is required");
    });

  });

});
