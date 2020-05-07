const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
};
// 正常手机分割
/**
 * 
 * @param {String} number 
 */
const formatPhoneNumber = (number) => {
  var tempArr = number.split('');
  tempArr.splice(3, 0, '-');
  tempArr.splice(8, 0, '-');
  return tempArr.join('');
}
//  008613122446688 格式的手机号 分割
/**
 * 
 * @param {String} number 
 */
const formatPhoneNumberS = (number) => {
  var tempArr = number.split('');
  tempArr.splice(4, 0, '-');
  return tempArr.join('');
}
/**
 *获取URL指定key的值
 * @param {string} url
 * @param {string} key
 */
const getQueryString = (url, key) => {
  const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
  const paramStr = url.substr(url.indexOf('?') + 1);
  const r = paramStr.match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
};
// 字符串里字符长度不超过 16 的字符下标
// return [param1,param2] param1代表超出16字符的下表 param2代表超出32字符的下表 如果param1、param2值为0 表示没有超出对应的限制字符
const charLength = (char) => {
  var l = char.length;
  var len = 0;
  var index = 0;
  let result = [0, 0];
  for (var i = 0; i < l; i++) {
    if ((char.charCodeAt(i) & 0xff00) != 0) {
      len++;
    }
    len++;
    if (len > 64) {
      result = [index, --i];
      return result;
    } else if (len > 32) {
      if (index == 0) {
        index = i - 1;
        result = [index, 0];
      }
    }
  }
  return result;
}
// 退出页面 停止当前页面所有的请求任务
const abortRequestTask = (task) => {
  let requestTaskObj = getApp().globalData.requestTask;
  if(requestTaskObj){
    if(requestTaskObj[task]){
      for(let i=0,length=requestTaskObj[task].length;i<length;i++){
        requestTaskObj[task][i].abort();
      }
      // 清空任务数组
      getApp().globalData.requestTask[task] = [];
    }
  }
};
/**
 * 删除对象空属性
 * @param {object} object 
 */
const deleteEmptyProperty = function (object){
  for (var i in object) {
      var value = object[i];
      if (typeof value === 'object') {
          if (Array.isArray(value)) {
              if (value.length == 0) {
                  delete object[i];
                  continue;
              }
          }
          deleteEmptyProperty(value);
          if (isEmpty(value)) {
              delete object[i];
          }
      } else {
          if (value === '' || value === null || value === undefined) {
              delete object[i];
          } else {
          }
      }
  }
  return object;
};
/**
 * 判断是否为空对象
 * @param {object} object 
 */
const isEmpty = function(object) {
  for (var name in object) {
      return false;
  }
  return true;
};
// 时间戳 根据时区 转换成 对应时区的时间
/**
 * 
 * @param {*} timestamp  时间戳
 * @param {*} timezone 时区
 */
const UTC_TO_GMT = (timestamp, timezone) => {
  let d = new Date(timestamp);
  // var localTime = d.getTime();
  let localOffset = d.getTimezoneOffset() * 60000;   //getTimezoneOffset()返回是以分钟为单位，需要转化成ms
  let utc = timestamp + localOffset;
  // offset =9; //以韩国时间为例，东9区
  destiny= utc + (3600000 * timezone);
  const nd = new Date(destiny);
  console.log("destiny time is " + nd.toLocaleString());
  return 
};
module.exports = {
  formatTime,
  getQueryString,
  charLength,
  formatPhoneNumber,
  formatPhoneNumberS,
  abortRequestTask,
  isEmpty,
  deleteEmptyProperty,
  UTC_TO_GMT
};
