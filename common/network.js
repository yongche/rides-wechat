//添加finally：因为还有一个参数里面还有一个complete方法。
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
      value => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => {
        throw reason
      })
  );
};

//封装异步api
const wxPromise = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      };

      obj.fail = function (res) {
        reject(res)
      };

      fn(obj)
    })
  }
};

const get = (url, data,routeName, showLoadLoading = true, header, baseUrl = BASE_URL) => {
  const promise = new Promise((resolve, reject) => {
    if(showLoadLoading){
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    const requestTaskItem = wx.request({
      url: baseUrl + url,
      data: data,
      header: {
        'content-type': 'application/json; charset=UTF-8',
        ...header, // 自定义header,放最后，不要调整顺序
      },
      success: function (res) {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject(res.data);
        }
      },
      fail: function (error) {
        reject(error);
      },
      complete: function () {
        wx.hideLoading();
      }
    })
    // 每个请求任务都存入 全局变量
    /** 格式如下
     * {
     *  'yongche':[task1,task2.....],
     *  'dispatch':[task1,task2.....],
     * }
     */
    if(routeName){
      let requestTaskObj = getApp().globalData.requestTask;
      if(requestTaskObj){
        if(!requestTaskObj[routeName]){
          requestTaskObj[routeName] = [];
        }
        getApp().globalData.requestTask[routeName].push(requestTaskItem);
      }else{
        let tempArr = [];
        let tempObj = {};
        tempObj[routeName] = [];
        tempObj[routeName].push(requestTaskItem);
        getApp().globalData.requestTask = tempObj;
      }
    }
  });
  return promise;
};

const post = (url, data,routeName, showLoadLoading = true, header, baseUrl = BASE_URL) => {
  const promise = new Promise((resolve, reject) => {
    if(showLoadLoading){
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    const requestTaskItem = wx.request({
      url: baseUrl + url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        ...header,// 自定义header,放最后，不要调整顺序
      },
      success: function (res) {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject(res.data);
        }
      },
      fail: function (error) {
        reject(error);
      },
      complete: function () {
        wx.hideLoading();
      }
    })
    // 每个请求任务都存入 全局变量
    /** 格式如下
     * {
     *  'yongche':[task1,task2.....],
     *  'dispatch':[task1,task2.....],
     * }
     */
    if(routeName){
      let requestTaskObj = getApp().globalData.requestTask;
      if(requestTaskObj){
        if(!requestTaskObj[routeName]){
          requestTaskObj[routeName] = [];
        }
        getApp().globalData.requestTask[routeName].push(requestTaskItem);
      }else{
        let tempArr = [];
        let tempObj = {};
        tempObj[routeName] = [];
        tempObj[routeName].push(requestTaskItem);
        getApp().globalData.requestTask = tempObj;
      }
    }
  });
  return promise;
};

const getLocationPromise = wxPromise(wx.getLocation);//获取经纬度
const showModalPromise = wxPromise(wx.showModal);//弹窗


module.exports = {
  get,
  post,
  getLocationPromise,
  showModalPromise
};