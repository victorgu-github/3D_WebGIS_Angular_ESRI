'use strict';

module.exports = function ($rootScope, $location, $window, $cookies, $http, 3D_WebGIS_Angular_ESRI, AppConfig, dashTableConfig, 
  HttpResponseHandler, CollectionUtils, CompanySharedService) {
  let self = this;

  const ADMIN_USER =   3D_WebGIS_Angular_ESRI.ACCOUNT.ADMIN_USER;
  const GENERAL_USER = 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER;

  this.demo = {
    loraAppID: "9999"
  };

  this.userInfo = {
    firstName: "",
    lastName: "",
    email: "",
    accessRole: "anonymous",
    adminUserLoginFailedMsg: "",
    generalUserLoginFailedMsg: "",
    settings: {
      currentScenario: {
        scenarioID: null,
        bleAppID: "1",
        loraAppID: "000000000008"
      },
      tiledLayerBaseURL: AppConfig.tiledLayerBaseURL,
      featureLayerBaseURL: AppConfig.featureLayerBaseURL,
      Scenarios: AppConfig.Scenarios
    }
  };

  ////////////////////////////////////////////////////////////////
  //
  // Admin User Login
  //
  ////////////////////////////////////////////////////////////////

  this.adminUserLogin = function (userCredentials) {
    $http.post(AppConfig.nodeServer + 'api/adminuserlogin', userCredentials, { timeout: 10000 }).then(function (response) {
      let userInfo = {
        username:               response.data.result.username,
        firstName:              response.data.result.firstName,
        lastName:               response.data.result.lastName,
        email:                  response.data.result.email,
        accessRole:             response.data.result.accessRole,
        settings: {
          tiledLayerBaseURL:    response.data.result.tiledLayerBaseURL,
          featureLayerBaseURL:  response.data.result.featureLayerBaseURL,
          scenarios:            response.data.result.scenarios
        },
        appIDs:                 response.data.result.appIDs,
        companyID:              response.data.result.associatedCompanyID,
        currentUserType:        ADMIN_USER
      };

      self.userInfo.loginFailedMsg = "";

      let expireTime = new Date();
      expireTime.setDate(expireTime.getDate() + 1);
      $cookies.putObject('userInfo', userInfo, { expires: expireTime });
      
      $cookies.put('authToken', response.data.result.token, {
        expires: new Date(response.data.result.tokenExpiresAt),
        path: '/'
      });
      //Esri Token Process
      //1.If esri token exist, store the esri token into cookies, redirect to 3D map home page.
      //2.If esri token is null, which means expire happens when backend try to get esri token. Not store esri token into cookies and 
      //  redirect to dashboard overview page.
      let esriAuthInfo = response.data.result.esriAuthResult;
      if (esriAuthInfo !== null) {
        $cookies.putObject('esriToken', esriAuthInfo, { expires: new Date(esriAuthInfo.expires) });
      }
      
      self.syncSettings(userInfo);

      self.setDefaultIDs();

      //No matter esri token is available or not, we will follow the "urlBeforeLogin" to do the redirection
      $window.location.href = $rootScope.urlBeforeLogin;
    }).catch(function (error) {    
      if (error.status < 0) {
        self.userInfo.adminUserLoginFailedMsg = "Login request timeout.";
      }
      else {
        if (error.data && error.data.error) {
          self.userInfo.adminUserLoginFailedMsg = HttpResponseHandler.parseErrorMessage(error.data.error.errors);
        }
        else {
          self.userInfo.adminUserLoginFailedMsg = "Server Internal Error";
        }
      }
    });
  };

  ////////////////////////////////////////////////////////////////
  //
  // General User Login
  //
  ////////////////////////////////////////////////////////////////

  this.generalUserLogin = function (userCredentials) {
    $http.post(AppConfig.nodeServer + 'api/generaluserlogin', userCredentials, { timeout: 10000 }).then(function (response) {
      CompanySharedService.getCompanys().then(function (resp) {
        if (resp.status === "success") {
          let userInfo = {
            firstName:         response.data.firstName,
            lastName:          response.data.lastName,
            userName:          response.data.userName,
            email:             response.data.email,
            generalAppIDs:     response.data.generalAppIDs,
            companyID:         response.data.companyID,
            currentUserType:   GENERAL_USER
          };
          //Get lora application ID for general user
          let company = resp.content.find((company) => { return company.companyID === userInfo.companyID; });
          userInfo.companyName = company.companyName;
          userInfo.loraApplicationID = company.loraApplicationID;

          self.userInfo.loginFailedMsg = "";

          //Detect the device browser type, can filter: Android Mobile, iPhone, BlackBerry, Windows Mobile Phone
          userInfo.isCellPhone = isCellPhone();
    
          let expireTime = new Date();
          expireTime.setDate(expireTime.getDate() + 1);
          const isProd = process.env.NODE_ENV === 'prod';
          const shanghai = process.env.SHANGHAI;
          if (isProd && shanghai) {
            $cookies.putObject('userInfo', userInfo, {
              domain: ".3D_WebGIS_Angular_ESRI.com.cn",
              expires: expireTime
            });
            $cookies.put('authToken', response.data.token, {
              expires: new Date(response.data.tokenExpiresAt),
              domain: ".3D_WebGIS_Angular_ESRI.com.cn",
              path: '/'
            });
          } else {
            $cookies.putObject('userInfo', userInfo, { expires: expireTime });
            $cookies.put('authToken', response.data.token, {
              expires: new Date(response.data.tokenExpiresAt),
              path: '/'
            });
          }

          self.syncSettings(userInfo);
    
          //For general user:
          //1. if user want to go to 3D map, we will redirect him to dashboard overview page (default rule)
          //2. if user want to go to other page, we will follow the "urlBeforeLogin" to do the redirection
          if ($rootScope.pageNameBeforeLogin === "3D View" || $rootScope.urlBeforeLogin === "/") {
            $window.location.href = CollectionUtils.getDashboardOverviewPageUrl(userInfo);
          }
          else {
            $window.location.href = $rootScope.urlBeforeLogin;
          }
        }
        else {
          self.userInfo.generalUserLoginFailedMsg = HttpResponseHandler.parseErrorMessage(resp.data.error.errors);
        }
      });
    }).catch(function (error) {
      if (error.status < 0) {
        self.userInfo.generalUserLoginFailedMsg = "Login request timeout.";
      }
      else {
        if (error.data && error.data.error) {
          self.userInfo.generalUserLoginFailedMsg = HttpResponseHandler.parseErrorMessage(error.data.error.errors);
        }
        else {
          self.userInfo.generalUserLoginFailedMsg = "Server Internal Error";
        }
      }
    });
  };

  ///////////////////////////////////////////////////////////////
  //
  // Share Function
  //
  ///////////////////////////////////////////////////////////////

  this.logout = function () {
    const isProd = process.env.NODE_ENV === 'prod';
    const shanghai = process.env.SHANGHAI;
    const isGeneralUser = self.userInfo.currentUserType === GENERAL_USER;
    if (isProd && shanghai && isGeneralUser) {
      $cookies.remove('userInfo', {
        domain: ".3D_WebGIS_Angular_ESRI.com.cn"
      });
      $cookies.remove('authToken', {
        domain: ".3D_WebGIS_Angular_ESRI.com.cn"
      });
    }
    else {
      $cookies.remove('userInfo');
      $cookies.remove('authToken');
    }
    $cookies.remove('esriToken');
    resetUserInfoAndSettings();

    // remove added style esri-container-wrapper and esri-container
    angular.element(document.querySelector('#esri-container-wrapper')).removeAttr('style');
    angular.element(document.querySelector('#esri-container')).removeAttr('style');

    $rootScope.urlBeforeLogin = "/";
    $location.path("/login");
  };

  this.syncSettings = function (userInfo) {
    if (userInfo.currentUserType === ADMIN_USER) {
      self.userInfo.username =                     userInfo.username;
      self.userInfo.firstName =                    userInfo.firstName;
      self.userInfo.lastName =                     userInfo.lastName;
      self.userInfo.email =                        userInfo.email;
      self.userInfo.accessRole =                   userInfo.accessRole;
      self.userInfo.appIDs =                       userInfo.appIDs;
      self.userInfo.companyID =                    userInfo.companyID;
      self.userInfo.currentUserType =              userInfo.currentUserType;
  
      self.userInfo.settings.tiledLayerBaseURL =   userInfo.settings.tiledLayerBaseURL;
      self.userInfo.settings.featureLayerBaseURL = userInfo.settings.featureLayerBaseURL;
  
      let filteredScenarios = [];
      for (let i = 0; i < self.userInfo.settings.Scenarios.length; i++) {
        self.userInfo.settings.Scenarios[i].isDefault = false;
        self.userInfo.settings.Scenarios[i].isActive = false;
        for (let j = 0; j < userInfo.settings.scenarios.length; j++) {
          if (userInfo.settings.scenarios[j].id === self.userInfo.settings.Scenarios[i].scenarioID) {
            self.userInfo.settings.Scenarios[i].bleAppID = userInfo.settings.scenarios[j].bleAppID;
            self.userInfo.settings.Scenarios[i].loraAppID = userInfo.settings.scenarios[j].loraAppID;
            self.userInfo.settings.Scenarios[i].isDefault = userInfo.settings.scenarios[j].default;
            if (self.userInfo.settings.Scenarios[i].isDefault) {
              self.userInfo.settings.Scenarios[i].isActive = true;
            }
            filteredScenarios.push(self.userInfo.settings.Scenarios[i]);
            break;
          }
        }
      }
      self.userInfo.settings.Scenarios = filteredScenarios;
    }
    //How to assign the values from userInfo to self.userInfo:
    //1.Override parameters:  firstName lastName userName email
    //2.New parameters:       generalAppIDs, currentUserType
    //3.Inherited parameters: accessRole, settings
    else if (userInfo.currentUserType === GENERAL_USER) {
      self.userInfo.firstName =       userInfo.firstName;
      self.userInfo.lastName =        userInfo.lastName;
      self.userInfo.userName =        userInfo.userName;
      self.userInfo.email =           userInfo.email;
      self.userInfo.generalAppIDs =   userInfo.generalAppIDs;
      self.userInfo.companyID =       userInfo.companyID;
      self.userInfo.companyName =     userInfo.companyName;
      self.userInfo.currentUserType = userInfo.currentUserType;
      self.userInfo.loraApplicationID = userInfo.loraApplicationID;
      self.userInfo.isCellPhone =     userInfo.isCellPhone;
    }
  };

  this.updateCookie = function (userInfo) {
    let userInfoInCookie = {};
    if (userInfo.currentUserType === ADMIN_USER) {
      userInfoInCookie = {
        firstName:             userInfo.firstName,
        lastName:              userInfo.lastName,
        email:                 userInfo.email,
        accessRole:            userInfo.accessRole,
        settings: {
          tiledLayerBaseURL:   userInfo.tiledLayerBaseURL,
          featureLayerBaseURL: userInfo.featureLayerBaseURL,
          scenarios:           userInfo.scenarios
        },
        appIDs:                userInfo.appIDs,
        currentUserType:       ADMIN_USER
      };
    }
    else if (userInfo.currentUserType === GENERAL_USER) {
      CompanySharedService.getCompanys().then(function (resp) {
        userInfoInCookie = {
          firstName:             userInfo.firstName,
          lastName:              userInfo.lastName,
          userName:              userInfo.userName,
          email:                 userInfo.email,
          generalAppIDs:         userInfo.generalAppIDs,
          companyID:             userInfo.companyID,
          currentUserType:       GENERAL_USER,
          isCellPhone:           userInfo.isCellPhone
        };
        //Get lora application ID for general user
        let company = resp.content.find((company) => { return company.companyID === userInfo.companyID; });
        userInfoInCookie.loraApplicationID = company.loraApplicationID;
        $cookies.putObject('userInfo', userInfoInCookie);    
      });
    }
  };

  this.setDefaultIDs = function () {
    for (let i = 0; i < self.userInfo.settings.Scenarios.length; i++) {
      if (self.userInfo.settings.Scenarios[i].isDefault) {
        self.userInfo.settings.currentScenario.scenarioID = self.userInfo.settings.Scenarios[i].scenarioID;
        self.userInfo.settings.currentScenario.bleAppID = self.userInfo.settings.Scenarios[i].bleAppID;
        self.userInfo.settings.currentScenario.loraAppID = self.userInfo.settings.Scenarios[i].loraAppID;
        break;
      }
    }
  };

  this.setAppIDs = function (scenario) {
    if (scenario && scenario.isActive) {
      self.userInfo.settings.currentScenario.scenarioID = scenario.scenarioID;
      self.userInfo.settings.currentScenario.bleAppID = scenario.bleAppID;
      self.userInfo.settings.currentScenario.loraAppID = scenario.loraAppID;
    }
  };

  this.currentBLEAppID = function () {
    return self.userInfo.settings.currentScenario.bleAppID;
  };

  this.currentScenarioID = function () {
    return self.userInfo.settings.currentScenario.scenarioID;
  };

  this.isLoRaDemo = function () {
    return self.userInfo.settings.currentScenario.loraAppID === self.demo.loraAppID;
  };

  function resetUserInfoAndSettings() {
    self.userInfo = {
      firstName: "",
      lastName: "",
      email: "",
      accessRole: "anonymous",
      loginFailedMsg: "",
      settings: {
        currentScenario: {
          scenarioID: "1",
          bleAppID: "1",
          loraAppID: "000000000008"
        },
        tiledLayerBaseURL: AppConfig.tiledLayerBaseURL,
        featureLayerBaseURL: AppConfig.featureLayerBaseURL,
        Scenarios: AppConfig.Scenarios
      }
    };
    delete self.userInfo.currentUserType;
  }

  //Detect the device type is cell phone or not, according to html5 navigator
  function isCellPhone() {
    let is_other_cell_phone = /iPhone|BlackBerry|IEMobile/i.test(navigator.userAgent);
    let is_android_cell_phone = /^.*?\bAndroid\b.*?\bMobile\b.*?$/m.test(navigator.userAgent);
    return is_other_cell_phone || is_android_cell_phone;
  }
};
