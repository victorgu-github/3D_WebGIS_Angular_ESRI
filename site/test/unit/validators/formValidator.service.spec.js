"use strict";

describe("formValidator", function () {
  let Validatenotempty;

  beforeEach(module('3D_WebGIS_Angular_ESRIMap.shared.validators'));
  beforeEach(inject(function ($injector) {
    Validatenotempty = $injector.get('formValidator');
  }));

  describe('.validateNotEmpty', function () {
    it('should return false when argument is Empty', function () {
      expect(Validatenotempty.validateAttributesNotEmpty({})).to.be.false;
    });

    it('should return false when argument is null', function () {
      expect(Validatenotempty.validateAttributesNotEmpty(null)).to.be.false;
    });

    it('should return false when argument is undefined', function () {
      expect(Validatenotempty.validateAttributesNotEmpty()).to.be.false;
    });

    it('should return false when part of properties of argument are empty', function () {
      expect(Validatenotempty.validateAttributesNotEmpty({name: "johnny", age: ""})).to.be.false;
    });

    it('should return true when properties of argument are not empty', function () {
      expect(Validatenotempty.validateAttributesNotEmpty({name: "johnny"})).to.be.true;
    });

  });

});
