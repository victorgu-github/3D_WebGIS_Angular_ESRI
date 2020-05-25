"use strict";

describe("New LoraGateway Controller", function () {
  let scope;
  let loraGatewayService;
  let deferred;
  let $q;
  let $window;
  let $rootScope;

  beforeEach(function () {
    module('3D_WebGIS_Angular_ESRIMap');

    inject(function (_$rootScope_, _$timeout_, _$controller_, _$q_, $injector) {
      scope = _$rootScope_.$new();
      $q = _$q_;
      $rootScope = _$rootScope_;
      $window = {location: {href: ""}, alert: (msg) => {return msg;}};
      loraGatewayService = $injector.get('loraGatewayService');
      _$controller_('NewLoraGatewayCtrl', {
        '$scope': scope,
        '$window': $window,
        'loraGatewayService': loraGatewayService
      });
    });
  });

  xdescribe('.finish', function () {
    it('should set form status to invalid when register form fields are invalid', function () {
      scope.registerForm = {
        GatewayID: "",
        GatewayIP: "10.10.10.1"
      };

      scope.finish();

      expect(scope.formStatus).to.be.equal("invalid");
    });

    it('should stay on the current page when registration is invalid', function () {
      deferred = $q.defer();
      scope.registerForm = {
        GatewayID: "1111222233334444",
        GatewayIP: "10.10.10.255"
      };

      sinon.stub(loraGatewayService, "regLoraGateway").returns(deferred.promise);
      deferred.resolve({ status: "error", errors: ["errors1", "errors2"] });
      scope.finish();
      $rootScope.$apply();

      expect(scope.formStatus).to.be.equal("invalid");
    });

    it('should redirect to overview page when registration is successful', function () {
      deferred = $q.defer();
      scope.registerForm = {
        GatewayID: "1111222233334444",
        GatewayIP: "10.10.10.123"
      };

      sinon.stub(loraGatewayService, "regLoraGateway").returns(deferred.promise);
      deferred.resolve({ status: "success" });
      scope.finish();
      $rootScope.$apply();

      expect(scope.formStatus).to.be.equal("submitted");
      expect($window.location.href).to.be.equal('/#/dashboard/overview');

    });

  });

});