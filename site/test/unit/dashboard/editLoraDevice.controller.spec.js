"use strict";

describe("Edit Lora Device Controller", function () {
  let scope;
  let loraDeviceService;
  let formValidator;
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
      formValidator = $injector.get('formValidator');
      //There are three funtions will be called during initialization process,
      //We need to sinon.stub these three functions, otherwise there will be some error
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
            {
              class: 0
            }
          ]
        }
      });

      sinon.stub(loraDeviceService, "getLoraDevice").resolves({
        //Attributes from gw server
        ApplicationID: "0000000000000005",
        DevEUI: "FFFFFFFFFFFFAAAA",
        AppEUI: "00000000000098FE",
        DevType: "streetlight",
        DevAddr: "001A467788",
        NwkSKey: "2B7E151628AED2A6ABF7158809CF4F3C",
        FCntUp: 0,
        FCntDown: 0,
        RelaxFCnt: "1",
        Rx1DROffset: 0,
        RxDelay: 2,
        Rx2DR: 0,
        ADRInterval: 0,
        InstallationMargin: 5,
        TxPower: 2,
        NbTrans: 0,
        RxWindowNumber: 0,
        PktLossRate: 0,
        BandID: "0",
        TimeoutInterval: 60,
        Class: 0,
        PingNbClassB: 2,
        PingOffsetClassB: 0,
        FreqClassBC: 923.3,
        DrClassBC: 8,

        //Attributes from app server
        Name: "Default Name",
        Description: "Default Description",
        UseAppSetting: "true",
        AppKey: "00000000000000001234432156788765",
        ABP: "true",
        IsClassC: "true",
        AppSKey: "2B7E151628AED2A6ABF7158809CF4F3C",
        EncryptedMacCmds: "",
        UnencryptedMacCmds: "",
        UserPayloadData: "",
        DownlinkConfirmed: false,
        FPort: 1,
        EncryptedMacCmdsPrev: "",
        UnencryptedMacCmdsPrev: "",
        HasEncryptedMacCmdDelivered: "00",
        HasUnencryptedMacCmdDelivered: "00",
        HasUserPayloadDataDelivered: "00",
        UserPayloadDataLen: 0,
        MulticastAddrArray: [],
        ValidMulticastAddrNum: 0,
      });

      _$controller_('EditLoraDeviceCtrl', {
        '$scope': scope,
        '$window': $window,
        'loraDeviceService': loraDeviceService,
        'formValidator': formValidator
      });
    });
  });

  xdescribe('.finish', function () {
    //Edit form invalid under Class 1 situation
    it('should set form status to invalid when edit form fields are invalid, such as MulticastAddrArray invalid', function () {
      deferred = $q.defer();
      scope.editEntry = {
        Class: 1,
        MulticastAddrArray: ["123456789"]
      };

      console.log(scope.editEntry);
      scope.finish();

      expect(scope.formStatus).to.be.equal("invalid");
    });

    //Edit form invalid under Class 1 and Class 2 situation
    it('should set form status to invalid when edit form fields are invalid', function () {
      deferred = $q.defer();
      scope.editEntry = {
        ApplicationID: "0000000000000005",
        DevEUI: "AAAAAAAAAAAAAAAF",
        Class: 1,
        DevAddr: "12345678",
        MulticastAddrArray: ["12345678"]
      };

      sinon.stub(loraDeviceService, "updateLoraDevice").returns(deferred.promise);
      deferred.reject({ status: "error", errors: ["errors1"]});
      scope.finish();
      $rootScope.$apply();

      expect(scope.formStatus).to.be.equal("invalid");
    });

    //Edit form valid under Class 0 situation
    it('should redirect to overview page when registration is successful', function () {
      deferred = $q.defer();
      scope.editEntry = {
        ApplicationID: "0000000000000005",
        DevEUI: "FFFFFFFFFFFFAAAA",
        AppEUI: "00000000000098FE",
        DevType: "streetlight",
        DevAddr: "001A467788",
        NwkSKey: "2B7E151628AED2A6ABF7158809CF4F3C",
        FCntUp: 0,
        FCntDown: 0,
        RelaxFCnt: "1",
        Rx1DROffset: 0,
        RxDelay: 2,
        Rx2DR: 0,
        ADRInterval: 0,
        InstallationMargin: 5,
        TxPower: 2,
        NbTrans: 0,
        RxWindowNumber: 0,
        PktLossRate: 0,
        BandID: "0",
        TimeoutInterval: 60,
        Class: 0,
        PingNbClassB: 2,
        PingOffsetClassB: 0,
        FreqClassBC: 923.3,
        DrClassBC: 8,

        Name: "Default Name",
        Description: "Default Description",
        UseAppSetting: "true",
        AppKey: "00000000000000001234432156788765",
        ABP: "true",
        IsClassC: "true",
        AppSKey: "2B7E151628AED2A6ABF7158809CF4F3C",
        EncryptedMacCmds: "",
        UnencryptedMacCmds: "",
        UserPayloadData: "",
        DownlinkConfirmed: false,
        FPort: 1,
        EncryptedMacCmdsPrev: "",
        UnencryptedMacCmdsPrev: "",
        HasEncryptedMacCmdDelivered: "00",
        HasUnencryptedMacCmdDelivered: "00",
        HasUserPayloadDataDelivered: "00",
        UserPayloadDataLen: 0
      };

      sinon.stub(loraDeviceService, "updateLoraDevice").returns(deferred.promise);
      deferred.resolve({ status: "success" });
      scope.finish();
      $rootScope.$apply();

      expect(scope.formStatus).to.be.equal("submitted");
      expect($window.location.href).to.be.equal('/#/dashboard/device/loraDevices');
    });

    //Edit form valid under Class 1 and Class 2 situation
    it('should redirect to overview page when registration is successful', function () {
      deferred = $q.defer();
      scope.editEntry = {
        ApplicationID: "0000000000000005",
        DevEUI: "FFFFFFFFFFFFAAAA",
        AppEUI: "00000000000098FE",
        DevType: "streetlight",
        DevAddr: "001A467788",
        NwkSKey: "2B7E151628AED2A6ABF7158809CF4F3C",
        FCntUp: 0,
        FCntDown: 0,
        RelaxFCnt: "1",
        Rx1DROffset: 0,
        RxDelay: 2,
        Rx2DR: 0,
        ADRInterval: 0,
        InstallationMargin: 5,
        TxPower: 2,
        NbTrans: 0,
        RxWindowNumber: 0,
        PktLossRate: 0,
        BandID: "0",
        TimeoutInterval: 60,
        Class: 0,
        PingNbClassB: 2,
        PingOffsetClassB: 0,
        FreqClassBC: 923.3,
        DrClassBC: 8,

        Name: "Default Name",
        Description: "Default Description",
        UseAppSetting: "true",
        AppKey: "00000000000000001234432156788765",
        ABP: "true",
        IsClassC: "true",
        AppSKey: "2B7E151628AED2A6ABF7158809CF4F3C",
        EncryptedMacCmds: "",
        UnencryptedMacCmds: "",
        UserPayloadData: "",
        DownlinkConfirmed: false,
        FPort: 1,
        EncryptedMacCmdsPrev: "",
        UnencryptedMacCmdsPrev: "",
        HasEncryptedMacCmdDelivered: "00",
        HasUnencryptedMacCmdDelivered: "00",
        HasUserPayloadDataDelivered: "00",
        UserPayloadDataLen: 0
      };

      sinon.stub(loraDeviceService, "parseMulticastAddrArray").returns("12345678");
      sinon.stub(loraDeviceService, "updateLoraDevice").returns(deferred.promise);
      deferred.resolve({ status: "success" });
      scope.finish();
      $rootScope.$apply();

      expect(scope.formStatus).to.be.equal("submitted");
      expect($window.location.href).to.be.equal('/#/dashboard/device/loraDevices');
    });
  });
});