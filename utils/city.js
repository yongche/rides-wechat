/**
 * city相关服务
 */
const util = require('../utils/util.js');
const api = require('../config/api.js');
import { yopCityList } from '../bo/city-data';

function saveData(cityList, version) {
  let cities = [];
  for(var i in cityList) {
      cities.push(cityList[i]);
  }
  let data = {
    cities: cities,
    version: version
  }
  wx.setStorageSync('yopCityList', data);
}

/**
 * initCity
 */
function initCity() {
  let cityData = wx.getStorageSync('yopCityList');
  let params = {};
  if(cityData) {
    let date = new Date();
    date = util.formatDay(date)
    console.log(date);
    if(cityData.version > date) {
      wx.removeStorageSync('yopCityList');
      util.request(api.YopGetAvailableService, params).then(function(res) {
          if (res.errno === 0) {
              let cityList = res.data.cityList;
              let version = res.data.version;
              saveData(cityList, version);
          } else {
              saveData(yopCityList.cityList, yopCityList.version);
          }
      });
    } else {
      console.log("exists");
    }
  } else {
    util.request(api.YopGetAvailableService, params).then(function(res) {
        if (res.errno === 0) {
            let cityList = res.data.cityList;
            let version = res.data.version;
            saveData(cityList, version);
        } else {
            saveData(yopCityList.cityList, yopCityList.version);
        }
    });
  }
}

module.exports = {
  initCity,
};