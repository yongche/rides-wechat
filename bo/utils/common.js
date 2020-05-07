
var COMMON = {

  // 字符判空
  isEmpty: function (str) {
    if (str == null || str == "") {
      return true;
    }
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return re.test(str);
  },
  isInArray: function (arr,value){
    for(var i = 0; i < arr.length; i++){
      if(value === arr[i]){
        return true;
      }
    }
    return false;
  },
  isArray:function (o){
    return Object.prototype.toString.call(o)=='[object Array]';
  },
  removeByValue: function (arr, val) {
    for(var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
  },
  deepClone: function (data) {
    var t = typeof(data), o, i, ni;
    var isArray = COMMON.isArray(data);
    if (isArray) {
      t = 'array';
      o = [];
    } else {
      if (t === 'object') {
        o = {};
      } else {
        return data;
      }
    }

    if (isArray) {
      for (i = 0, ni = data.length; i < ni; i++) {
        o.push(COMMON.deepClone(data[i]));
      }
      return o;
    } else if (t === 'object') {
      for (i in data) {
        o[i] = COMMON.deepClone(data[i]);
      }
      return o;
    }
  },

  OK: {
    yes: true,
    no: false
  },
  callback: {
    isExist: function(cbs, success, fail) {
      for (var cb in cbs) {
        if (cb.success === success && cb.fail === fail) {
          return true;
        }
      }
      return false;
    },
    register: function(cbs, success, fail) {
      var isExist = COMMON.callback.isExist(cbs, success, fail);
      if (!isExist) {
        var cb = COMMON.callback.new(success, fail);
        cbs.push(cb);
      }
    },
    executes: function(cbs, ok, result) {
      for (var i=0; i<cbs.length;i++) {
        COMMON.callback.execute(cbs[i], ok, result);
      }
      cbs.splice(0, cbs.length);
    },
    execute: function (cb, ok, result) {
      if (ok) {
        cb.success(result);
      } else {
        cb.fail(result);
      }
    },
    new: function (success, fail) {
      var cb = {};
      cb.success = success;
      cb.fail = fail;
      return cb;
    },
  },

};

module.exports = {
  COMMON: COMMON
}
