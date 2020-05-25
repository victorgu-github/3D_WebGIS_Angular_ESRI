let dashboardConstant = {
  LORA_GATEWAY: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      GATEWAY_SN: {
        KEY: "GatewaySN",
        IS_DISPLAY: true
      },
      GATEWAY_MAC: {
        KEY: "GatewayMAC",
        IS_DISPLAY: true
      },
      CREATED_BY: {
        KEY: "CreatedBy",
        IS_DISPLAY: false
      },
      UPDATED_AT: {
        KEY: "UpdatedAt",
        IS_DISPLAY: false
      },
      CREATED_AT: {
        KEY: "CreatedAt",
        IS_DISPLAY: false
      },
      INSTALLATION_DATE: {
        KEY: "InstallationDate",
        IS_DISPLAY: false
      },
      BAND_ID: {
        KEY: "BandID",
        IS_DISPLAY: false
      }
    }
  },
  MULTICAST_GROUP: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      NAME: {
        KEY: "Name",
        IS_DISPLAY: true
      },
      MULTICAST_ADDRESS: {
        KEY: "MulticastAddr",
        IS_DISPLAY: true
      },
      APPLICATION_ID: {
        KEY: "ApplicationID",
        IS_DISPLAY: true,
      },
      APP_EUI: {
        KEY: "AppEUI",
        IS_DISPLAY: false
      },
      DEVICE_TYPE: {
        KEY: "DevType",
        IS_DISPLAY: true
      },
      CLASS: {
        KEY: "Class",
        IS_DISPLAY: true
      },
      BAND_ID: {
        KEY: "BandID",
        IS_DISPLAY: true
      },
      FCNT_DOWN: {
        KEY: "FCntDown",
        IS_DISPLAY: true
      },
      VALID_GATEWAY_ARRAY_NUM: {
        KEY: "ValidGatewayArrayNum",
        IS_DISPLAY: true,
        DISPLAY_NAME: "GwArrayNum"
      }
    }
  },
  GENERAL_USER: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      FIRST_NAME: {
        KEY: "firstName",
        IS_DISPLAY: true
      },
      LAST_NAME: {
        KEY: "lastName",
        IS_DISPLAY: true
      },
      USER_NAME: {
        KEY: "userName",
        IS_DISPLAY: true
      },
      EMAIL: {
        KEY: "email",
        IS_DISPLAY: true
      },
      GENERAL_APP_IDS: {
        KEY: "generalAppIDs",
        IS_DISPLAY: true
      },
      COMPANY_ID: {
        KEY: "companyID",
        IS_DISPLAY: true,
        TRANS_OBJECT: {
          KEY: "companyName"
        }
      },
      WECHAT_OPEN_ID_EXIST: {
        KEY: "wechatOpenIDExist",
        IS_DISPLAY: true
      }
    }
  },
  GENERAL_USER_APPLICATION: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      GENERAL_USER_APPLICATION_ID: {
        KEY: "generalUserApplicationID",
        IS_DISPLAY: true,
      },
      CREATED_TIME: {
        KEY: "createdTime",
        IS_DISPLAY: false,
      },
      CREATED_BY: {
        KEY: "createdBy",
        IS_DISPLAY: false
      },
      CREATOR_ACCESS_ROLE: {
        KEY: "creatorAccessRole",
        IS_DISPLAY: false
      },
      MODIFIED_TIME: {
        KEY: "modifiedTime",
        IS_DISPLAY: false,
      },
      GENERAL_USER_APPLICATION_NAME: {
        KEY: "generalUserApplicationName",
        IS_DISPLAY: true
      },
      SCENARIO_ID: {
        KEY: "scenarioID",
        IS_DISPLAY: true
      },
      LORA_APPLICATION_ID: {
        KEY: "loraApplicationID",
        IS_DISPLAY: true
      },
      DEV_EUIS: {
        KEY: "devEUIs",
        IS_DISPLAY: true,
        TRANS_OBJECT: {
          KEY: "loraDeviceNumber"
        }
      },
      BLE_APPLICATION_ID: {
        KEY: "bleAppID",
        IS_DISPLAY: true,
        DISPLAY_NAME: "bleAppIDs"
      }
    },
    BLE_NODES_TABLE_ATTRIBUTES: {
      MAC_ADDRESS: {
        KEY: "macAddress",
        IS_DISPLAY: true
      },
      NAME: {
        KEY: "name",
        IS_DISPLAY: true
      },
      DEVICE_TYPE: {
        KEY: "deviceType",
        IS_DISPLAY: false
      }
    }
  },
  GENERAL_USER_APPLICATION_FOR_GEN_USR: {
    GEN_USER_APP_TABLE_ATTRIBUTES: {
      GENERAL_USER_APPLICATION_ID: {
        KEY: "generalUserApplicationID",
        IS_DISPLAY: true,
        TRANS_OBJECT: {
          SHORT_TITLE: "ID"
        }
      },
      CREATED_TIME: {
        KEY: "createdTime",
        IS_DISPLAY: false
      },
      MODIFIED_TIME: {
        KEY: "modifiedTime",
        IS_DISPLAY: false
      },
      GENERAL_USER_APPLICATION_NAME: {
        KEY: "generalUserApplicationName",
        IS_DISPLAY: true,
        TRANS_OBJECT: {
          SHORT_TITLE: "Name"
        }
      },
      DEVICES: {
        KEY: "devices",
        IS_DISPLAY: true,
        TRANS_OBJECT: {
          KEY: "devEUIsNum",
          SHORT_TITLE: "Lora DevNum"
        }
      },
      CREATED_BY: {
        KEY: "createdBy",
        IS_DISPLAY: false
      }
    },
    DEVICE_ATTRIBUTES: {
      DEV_EUI: {
        KEY: "DevEUI",
        IS_DISPLAY: false
      },
      NAME: {
        KEY: "Name",
        IS_DISPLAY: true
      },
      DEV_TYPE: {
        KEY: "DevType",
        IS_DISPLAY: true
      },
      DESCRIPTION: {
        KEY: "Description",
        IS_DISPLAY: false
      }
    }
  },
  BLE_APPLICATION: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      BLE_APP_ID: {
        KEY: "bleAppID",
        IS_DISPLAY: true
      },
      BLE_APP_NAME: {
        KEY: "bleAppName",
        IS_DISPLAY: true
      }
    },
    OVERVIEW_TABLE_URL: "/#/dashboard/ble/bleAppTable"
  },
  BLE_NODES: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      MAC_ADDRESS: {
        KEY: "macAddress",
        IS_DISPLAY: true
      },
      NAME: {
        KEY: "name",
        IS_DISPLAY: true
      }
    }
  },
  MENG_YANG: {
    OVERVIEW_TABLE_ATTRIBUTES: {
      MENGYANG_ID: {
        KEY: "mengyangID",
        IS_DISPLAY: true,
        DISPLAY_NAME: "蒙羊耳标1"
      },
      MENGYANG_ID2: {
        KEY: "mengyangID2",
        IS_DISPLAY: true,
        DISPLAY_NAME: "蒙羊耳标2"
      },
      DATE_OF_BIRTH: {
        KEY: "dateOfBirth",
        IS_DISPLAY: true,
        DISPLAY_NAME: "出生日期",
        IS_DATE: true
      },
      BIRTH_WEIGHT: {
        KEY: "birthWeight",
        IS_DISPLAY: false,
        DISPLAY_NAME: "初生重(kg)"
      },
      GENDER: {
        KEY: "gender",
        IS_DISPLAY: true,
        DISPLAY_NAME: "性别"
      },
      ORIGIN: {
        KEY: "origin",
        IS_DISPLAY: false,
        DISPLAY_NAME: "来源"
      },
      FATHER_ID: {
        KEY: "fatherID",
        IS_DISPLAY: false,
        DISPLAY_NAME: "父耳标"
      },
      MOTHER_ID: {
        KEY: "motherID",
        IS_DISPLAY: false,
        DISPLAY_NAME: "母耳标"
      },
      COMMENTS: {
        KEY: "comments",
        IS_DISPLAY: false,
        DISPLAY_NAME: "备注"
      },
      PICTURE: {
        KEY: "picture",
        IS_DISPLAY: false,
        DISPLAY_NAME: "照片",
        IS_PICTURE: true
      },
      VARIETY: {
        KEY: "variety",
        IS_DISPLAY: false,
        DISPLAY_NAME: "品种",
      },
      PASTURE_ID: {
        KEY: "pastureID",
        IS_DISPLAY: false,
        DISPLAY_NAME: "牧场"
      }
    }
  }
};

module.exports = dashboardConstant;
