const util = require('../utils/util.js');
const api = require('../config/api.js');

var locationResultType = {
  locationError: 0,
  locationSuccess: 1,
  locationGeoError: 3,
  locationGeoSuccess: 4,
};

let getLocation = (callback,vm) => {
  wx.getLocation({
    type: 'gcj02',  //返回国测局坐标,对应api接口mars
    success: (res) => {
      // const latitude = res.latitude; // 经度
      // const longitude = res.longitude; // 纬度
      // vm.globalData.latitude = latitude;
      // vm.globalData.longitude = longitude;
      callback(res);
    },
    fail: (error) => {
      callback(0);
    }
  });
}
let fetchLocation = function (callback) {
  getLocation(function (res) {
    if (res != 0) {
      let vm = getApp();
      const latitude = res.latitude; // 经度
      const longitude = res.longitude; // 纬度
      vm.globalData.latitude = latitude;
      vm.globalData.longitude = longitude;
      fetchGeoSearch(callback);
    }else {
      if (callback != null) {
        callback(locationResultType.locationError);
      }
    }
  });
}
let fetchGeoSearch = function(callback) {
  let vm = getApp();
  const latitude = vm.globalData.latitude; // 经度
  const longitude = vm.globalData.longitude; // 纬度
  util.request(api.MapLocation, {
    location: longitude + "," + latitude
  }).then(function(res) {
    if (res.errno === 0) {
      vm.globalData.locationInfo = res.data.location_info;
      if (callback != null) {
          callback(locationResultType.locationGeoSuccess);
      }
    } else {
      if (callback != null) {
          callback(locationResultType.locationGeoError);
      }
    }
  });

}
let initLocation = function(callback) {
  let vm = getApp();
  if (vm != null && vm.globalData != null && vm.globalData.latitude != null && vm.globalData.longitude != null) {
    fetchGeoSearch(callback);
  } else {
    fetchLocation(callback);
  }
}
module.exports = {
  getLocation,
  initLocation,
  fetchGeoSearch,
  fetchLocation,
  locationResultType,
};
