/* eslint-disable no-unused-vars */
'use strict';

module.exports = function ($cookies, 3D_WebGIS_Angular_ESRI, formValidator) {
  let self = this;
  let pi2 = Math.PI * 2;
  let earthR = 6378137.0;
  self.clusterLayerColors = ['blue', 'orange', 'red', 'gray'];
  


  self.groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  self.average = function (array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }

    return parseFloat((sum / array.length).toFixed(2));
  };

  self.isEmptyObject = function (object) {
    for (let key in object) {
      return false;
    }
    return true;
  };

  self.trimEUI = function (string) {
    return string.substr(2).replace(/\_/g, "");
  };

  //change a timestamp to a date, date should be the 00:00:00 
  //For example, input timestamp: 2017-12-06T21:11:00.000Z, output date: Mon Nov 06 2017 00:00:00 GMT-0700 (MST)
  self.changeTimestampToDate = function (timestamp) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth();
    let currDate = date.getDate();
    let newDate = year + "/" + month + "/" + currDate;
    date = new Date(newDate);
    return date;
  };

  //Change array element position, according to the index
  //For example, [1,2,3,4,5]
  //changeArrayPosition(array, 1, 4)
  //result is [1,5,3,4,2]
  self.changeArrayPosition = function (array, index1, index2) {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
    return array;
  };

  self.clearObject = function (obj) {
    for (let member in obj) {
      if (obj.hasOwnProperty(member)) {
        delete obj[member];
      }
    }
  };

  self.parse = function (str, data) {
    const  template = new Function("return `"+ str +"`;");
    return template.call(data);
  };

  //Get nth col array from a 2D matrix
  self.getCol = function (matrix, n) {
    let col = [];
    for (let index in matrix) {
      let row = matrix[index];
      if (row[n]) {
        col.push(row[n]);
      }
    }
    return col;
  };

  // Flatter an json object, such as:
  // {
  //   Status: {
  //     Health: "Healthy"
  //   }
  //   Name: "test"
  // }
  // =>
  // {
  //   Health: "Healthy",
  //   Name: "test"
  // }
  self.flattenObj = function(obj) {
    let object = {};
    for (let property in obj) {
      if (formValidator.getObjectType(obj[property]) === "object") {
        object = Object.assign(object, self.flattenObj(obj[property]));
      }
      else {
        object[property] = obj[property];
      }
    }
    return object;
  };

  //Determine if two arrays are the same:
  //Consider whether the array elements are the same, regardless of the order of the elements.
  self.equalArray = function (array1, array2) {
    let result = true;
    // if the other array is a falsy value, return
    if (!array1 || !array2) {
      result = false;
    }
    // compare lengths - can save a lot of time 
    else if (array1.length !== array2.length) {
      result = false;
    }
    else {
      for (let index in array1) {
        let element = array1[index];
        if (!array2.includes(element)) {
          result = false;
          break;
        }
      }
    }
    return result;
  };

  //Return dashboard overview page url:
  //1. Default dashboard overview page url is "/dashboard/overview", admin user dashboard overview
  //2. General user cell phone dashboard overview page url is "/dashboard/generalUserCellPhone/overview"
  //3. General user desktop dashboard overview page url is "/dashboard/generalUserDesktop/overview"
  self.getDashboardOverviewPageUrl = function (userInfo) {
    let url = "/dashboard/overview";
    if (userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER && userInfo.isCellPhone) {
      url = "/dashboard/generalUserCellPhone/overview";
    }
    else if (userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER && !userInfo.isCellPhone) {
      url = "/dashboard/generalUserDesktop/overview";
    }
    return url;
  };

  self.getMengyangOverviewPageUrl = function(userInfo){
    let url = "/dashboard/overviewMengyang";
    if (userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER && userInfo.isCellPhone) {
      url = "/dashboard/generalUserCellPhone/overviewMengyang";
    }
    else if (userInfo.currentUserType === 3D_WebGIS_Angular_ESRI.ACCOUNT.GENERAL_USER && !userInfo.isCellPhone) {
      url = "/dashboard/generalUserDesktop/overviewMengyang";
    }
    return url;
  };

  self.getEsriToken = function () {
    let esriTokenObj = $cookies.getObject("esriToken");
    let esriToken = null;
    if (esriTokenObj) {
      let tokenObj = JSON.parse(JSON.stringify(esriTokenObj));
      esriToken = tokenObj.token;
    }
    return esriToken;
  };

  self.isCorrectRouteParams = function (field, urlFieldsArray) {
    let result = true;
    if (!urlFieldsArray.includes(field)) {
      result = false;
    }
    return result;
  };

  //prunecluster custom cluster marker
  L.Icon.MarkerCluster = L.Icon.extend({
    options: {
      iconSize: new L.Point(28, 28),
      className: 'prunecluster leaflet-markercluster-icon'
    },

    createIcon: function () {
      let e = document.createElement('canvas');
      this._setIconStyles(e, 'icon');
      let s = this.options.iconSize;
      e.width = s.x;
      e.height = s.y;
      this.draw(e.getContext('2d'), s.x, s.y);
      return e;
    },

    createShadow: function () {
      return null;
    },

    draw: function (canvas, width, height) {

      let lol = 0;

      let start = 0;
      for (let i = 0, l = self.clusterLayerColors.length; i < l; ++i) {

        let size = this.stats[i] / this.population;


        if (size > 0) {
          canvas.beginPath();
          canvas.moveTo(14, 14);
          canvas.fillStyle = self.clusterLayerColors[i];
          let from = start + 0.14,
            to = start + size * pi2;

          if (to < from) {
            from = start;
          }
          canvas.arc(14, 14, 14, from, to);

          start = start + size * pi2;
          canvas.lineTo(14, 14);
          canvas.fill();
          canvas.closePath();
        }

      }

      canvas.beginPath();
      canvas.fillStyle = 'white';
      canvas.arc(14, 14, 10, 0, Math.PI * 2);
      canvas.fill();
      canvas.closePath();

      canvas.fillStyle = '#555';
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.font = 'bold 12px sans-serif';

      canvas.fillText(this.population, 14, 14, 40);
    }
  });

  /**
 * Tile layer for Baidu Map
 *
 * @class BaiduLayer
 */
  L.TileLayer.Baidu = L.TileLayer.extend({
    statics: {
      attribution: '© Baidu &nbsp; © 3D_WebGIS_Angular_ESRI '
    },

    options: {
      minZoom: 3,
      maxZoom: 19
    },

    initialize: function (type, options) {
      let desc = L.TileLayer.Baidu.desc;
      type = type || 'Normal.Map';
      let parts = type.split('.');
      let mapName = parts[0],
        mapType = parts[1];
        let url = desc[mapName][mapType];
      options = options || {};
      options.subdomains = desc.subdomains;
      options.attribution = L.TileLayer.Baidu.attribution;
      L.TileLayer.prototype.initialize.call(this, url, options);
    },

    getTileUrl: function (coords) {
      let offset = Math.pow(2, coords.z - 1),
        x = coords.x - offset,
        y = offset - coords.y - 1,
        baiduCoords = L.point(x, y);
      baiduCoords.z = coords.z;
      return L.TileLayer.prototype.getTileUrl.call(this, baiduCoords);
    }
  });
  /**
   * Projection class for Baidu Spherical Mercator
   *
   * @class BaiduSphericalMercator
   */
  L.Projection.BaiduSphericalMercator = {
    /**
     * Project latLng to point coordinate
     *
     * @method project
     * @param {Object} latLng coordinate for a point on earth
     * @return {Object} leafletPoint point coordinate of L.Point
     */
    project: function (latLng) {
      const bpoint = BaiduMercator.forward([latLng.lng, latLng.lat]);

      return L.point(bpoint[0], bpoint[1]);
    },

    /**
     * unproject point coordinate to latLng
     *
     * @method unproject
     * @param {Object} bpoint baidu point coordinate
     * @return {Object} latitude and longitude
     */
    unproject: function (bpoint) {
      const blatlng = BaiduMercator.inverse([bpoint.x, bpoint.y]);

      return L.latLng(blatlng[1], blatlng[0]);
    },

    /**
     * Don't know how it used currently.
     *
     * However, I guess this is the range of coordinate.
     * Range of pixel coordinate is gotten from
     * BMap.MercatorProjection.lngLatToPoint(180, -90) and (180, 90)
     * After getting max min value of pixel coordinate, use
     * pointToLngLat() get the max lat and Lng.
     */
    bounds: (function () {
      let MAX_X = 20037726.37;
      let MIN_Y = -11708041.66;
      let MAX_Y = 12474104.17;
      let bounds = L.bounds(
        [-MAX_X, MIN_Y], //-180, -71.988531
        [MAX_X, MAX_Y]  //180, 74.000022
      );
      let MAX = 33554432;
      bounds = new L.Bounds(
        [-MAX, -MAX],
        [MAX, MAX]
      );
      return bounds;
    })()
  };
  /**
  * Coordinate system for Baidu EPSGB3857
  *
  * @class EPSGB3857
  */
  

  L.CRS.BEPSG3857 = L.extend({}, L.CRS, {
    code: 'EPSG:3857',
    projection: L.Projection.BaiduSphericalMercator,

    transformation: (function () {
      let z = -18 - 8;
      let scale = Math.pow(2, z);
      return new L.Transformation(scale, 0.5, -scale, 0.5);
    }()),

    distance: (function(latA, lngA, latB, lngB) {
      let pi180 = Math.PI / 180;
      let arcLatA = latA * pi180;
      let arcLatB = latB * pi180;
      let x = Math.cos(arcLatA) * Math.cos(arcLatB) * Math.cos((lngA - lngB) * pi180);
      let y = Math.sin(arcLatA) * Math.sin(arcLatB);
      let s = x + y;
      if (s > 1) {
          s = 1;
      }
      if (s < -1) {
          s = -1;
      }
      let alpha = Math.acos(s);
      let distance = alpha * earthR;
      return distance;
   })
  });

  L.TileLayer.Baidu.desc = {
  Normal: {
    Map: 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl',
    Custom:'http://api.map.baidu.com/customimage/tile?x={x}&y={y}&z={z}&customid=midnight',
    CustomBright:'http://api.map.baidu.com/customimage/tile?x={x}&y={y}&z={z}&customid=grassgreen'
  },
  Satellite: {
    Map: 'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46',
    Road: 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl'
  },
  subdomains: '0123456789'
};

  const BaiduMercator = {
    MCBAND: [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0],
  
    LLBAND: [75, 60, 45, 30, 15, 0],
  
    MC2LL: [
        [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331,
            200.9824383106796, -187.2403703815547, 91.6087516669843,
            -23.38765649603339, 2.57121317296198, -0.03801003308653,
            17337981.2],
        [-7.435856389565537e-9, 0.000008983055097726239,
            -0.78625201886289, 96.32687599759846, -1.85204757529826,
            -59.36935905485877, 47.40033549296737, -16.50741931063887,
            2.28786674699375, 10260144.86],
        [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616,
            59.74293618442277, 7.357984074871, -25.38371002664745,
            13.45380521110908, -3.29883767235584, 0.32710905363475,
            6856817.37],
        [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591,
            40.31678527705744, 0.65659298677277, -4.44255534477492,
            0.85341911805263, 0.12923347998204, -0.04625736007561,
            4482777.06],
        [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062,
            23.10934304144901, -0.00023663490511, -0.6321817810242,
            -0.00663494467273, 0.03430082397953, -0.00466043876332,
            2555164.4],
        [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8,
            7.47137025468032, -0.00000353937994, -0.02145144861037,
            -0.00001234426596, 0.00010322952773, -0.00000323890364,
            826088.5]],
  
    LL2MC: [
        [-0.0015702102444, 111320.7020616939, 1704480524535203,
            -10338987376042340, 26112667856603880,
            -35149669176653700, 26595700718403920,
            -10725012454188240, 1800819912950474, 82.5],
        [0.0008277824516172526, 111320.7020463578, 647795574.6671607,
            -4082003173.641316, 10774905663.51142, -15171875531.51559,
            12053065338.62167, -5124939663.577472, 913311935.9512032,
            67.5],
        [0.00337398766765, 111320.7020202162, 4481351.045890365,
            -23393751.19931662, 79682215.47186455, -115964993.2797253,
            97236711.15602145, -43661946.33752821, 8477230.501135234,
            52.5],
        [0.00220636496208, 111320.7020209128, 51751.86112841131,
            3796837.749470245, 992013.7397791013, -1221952.21711287,
            1340652.697009075, -620943.6990984312, 144416.9293806241,
            37.5],
        [-0.0003441963504368392, 111320.7020576856, 278.2353980772752,
            2485758.690035394, 6070.750963243378, 54821.18345352118,
            9540.606633304236, -2710.55326746645, 1405.483844121726,
            22.5],
        [-0.0003218135878613132, 111320.7020701615, 0.00369383431289,
            823725.6402795718, 0.46104986909093, 2351.343141331292,
            1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]],
  
  
    getRange: (v, min, max) => {
      v = Math.max(v, min);
      v = Math.min(v, max);
  
      return v;
    },
  
    getLoop: (v, min, max) => {
      let d = max - min;
      while (v > max) {
        v -= d;
      }
      while (v < min) {
        v += d;
      }
  
      return v;
    },
  
    convertor: (input, table) => {
      let px = input[0];
      let py = input[1];
      let x = table[0] + table[1] * Math.abs(px);
      let d = Math.abs(py) / table[9];
      let y = table[2]
          + table[3]
          * d
          + table[4]
          * d
          * d
          + table[5]
          * d
          * d
          * d
          + table[6]
          * d
          * d
          * d
          * d
          + table[7]
          * d
          * d
          * d
          * d
          * d
          + table[8]
          * d
          * d
          * d
          * d
          * d
          * d;
  
      return [
        x * (px < 0 ? -1 : 1),
        y * (py < 0 ? -1 : 1)
      ];
    },
  
    forward: input => {
      let lng = BaiduMercator.getLoop(input[0], -180, 180);
      let lat = BaiduMercator.getRange(input[1], -74, 74);
  
      let table = null;
      let j;
      for (j = 0; j < BaiduMercator.LLBAND.length; ++j) {
        if (lat >= BaiduMercator.LLBAND[j]) {
          table = BaiduMercator.LL2MC[j];
          break;
        }
      }
      if (table === null) {
        for (j = BaiduMercator.LLBAND.length - 1; j >= 0; --j) {
          if (lat <= -BaiduMercator.LLBAND[j]) {
            table = BaiduMercator.LL2MC[j];
            break;
          }
        }
      }
  
      return BaiduMercator.convertor([lng, lat], table);
    },
  
    inverse: input => {
      let y_abs = Math.abs(input[1]);
  
      let table = null;
      for (let j = 0; j < BaiduMercator.MCBAND.length; j++) {
        if (y_abs >= BaiduMercator.MCBAND[j]) {
          table = BaiduMercator.MC2LL[j];
          break;
        }
      }
  
      return BaiduMercator.convertor(input, table);
    }
  };
};
