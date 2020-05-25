"use strict";

describe("CollectionUtils", function () {
  let CollectionUtils;

  beforeEach(module('3D_WebGIS_Angular_ESRIMap'));
  beforeEach(inject(function ($injector) {
    CollectionUtils = $injector.get('CollectionUtils');
  }));

  describe('.isEmptyObject', function () {
    it('should return true when argument of an object is Empty', function () {
      let result = CollectionUtils.isEmptyObject({});
      expect(result).to.be.true;
    });

    it('should return true when argument of an object is not Empty', function () {
      let result = CollectionUtils.isEmptyObject({name:"Joe"});
      expect(result).to.be.false;
    });

  });

});
