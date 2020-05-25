"use strict";

describe("New Device Controller", function () {
  let scope;
  let loraDeviceService;
  let deferred;
  let $q;
  let $window;
  let $rootScope;

  beforeEach(function () {
    module('3D_WebGIS_Angular_ESRIMap');

    inject(function (_$rootScope_, _$timeout_, _$controller_, _$q_, $injector) {
      scope = _$rootScope_.$new();
      $rootScope = _$rootScope_;
      $q = _$q_;
      $window = {location: {href: ""}, alert: (msg) => {return msg;}};
      loraDeviceService = $injector.get('loraDeviceService');
      sinon.stub(loraDeviceService, "getDefaultCandidateValues").resolves({
        status: "",
        content: {
          BandID: [
            {
              bandID: 0,
              bandName: "US 902 -928MHz"
            }
          ],
          DevType: [
            "bodysensor",
          ],
          Class:[
            {class: 0}
          ]
        }
      });
      _$controller_('NewDeviceCtrl', {
        '$scope': scope,
        '$window': $window,
        'loraDeviceService': loraDeviceService
      });
    });
  });

  xdescribe('.finish', function () {
    it('should set form status to invalid when register form fields are invalid', function () {
      scope.ABPRegisterForm = {
        Name: "",
        Description: "Default description",
        ApplicationID: "0000000000000005",
        DevEUI: "0004A30B001A4677",
        DevType: "streetlight",
        DevAddr: "001A4677",
        BandID: "0: US 902 -928MHz",
        Class: 0,
        ABP: true
      };

      scope.finish("ABP");

      expect(scope.ABPFormStatus).to.be.equal("invalid");
    });

    it('should set form status to invalid when register form fields are invalid', function () {
      scope.OTAARegisterForm = {
        Name: "",
        Description: "Default description",
        ApplicationID: "0000000000000005",
        DevEUI: "0004A30B001A4677",
        DevType: "streetlight",
        DevAddr: "001A4677",
        BandID: "0: US 902 -928MHz",
        Class: 0,
        ABP: false
      };

      scope.finish("OTAA");

      expect(scope.OTAAFormStatus).to.be.equal("invalid");
    });

    it('should redirect to overview page when registration is successful', function () {
      deferred = $q.defer();
      scope.ABPRegisterForm = {
        Name: "Default Name",
        Description: "Default description",
        ApplicationID: "0000000000000005",
        DevEUI: "0004A30B001A4677",
        DevType: "streetlight",
        DevAddr: "001A4677",
        BandID: "0: US 902 -928MHz",
        Class: 0,
        ABP: true
      };

      sinon.stub(loraDeviceService, "regLoraDevice").returns(deferred.promise);
      deferred.resolve({ status: "success" });
      scope.finish("ABP");
      $rootScope.$apply();

      expect(scope.ABPFormStatus).to.be.equal("submitted");
      expect($window.location.href).to.be.equal('/#/dashboard/overview');
    });

    it('should redirect to overview page when registration is successful', function () {
      deferred = $q.defer();
      scope.OTAARegisterForm = {
        Name: "Default Name",
        Description: "Default description",
        ApplicationID: "0000000000000005",
        DevEUI: "0004A30B001A4677",
        DevType: "streetlight",
        DevAddr: "001A4677",
        BandID: "0: US 902 -928MHz",
        Class: 0,
        ABP: true
      };

      sinon.stub(loraDeviceService, "regLoraDevice").returns(deferred.promise);
      deferred.resolve({ status: "success" });
      scope.finish("OTAA");
      $rootScope.$apply();

      expect(scope.OTAAFormStatus).to.be.equal("submitted");
      expect($window.location.href).to.be.equal('/#/dashboard/overview');
    });
  });
});