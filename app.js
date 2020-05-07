var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./utils/user.js');
var city = require('./utils/city.js');
import { post } from './common/network';
import { YdToast } from './components/toast/toast.js';
import { abortRequestTask } from './utils/util_yongche.js';

App({
  YdToast,
  isWeLogining: false,
  onLaunch: function() {
    const updateManager = wx.getUpdateManager();
    wx.getUpdateManager().onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    wx.setStorageSync('hasLogin', false);
    this.initData();
  },
  towxml:require('./towxml/index'),
  onShow: function(options) {
    user.checkLogin().then(res => {
      /*wx.showToast({
        title: 'login',
        icon: 'success',
        duration: 1000
      });*/
      wx.setStorageSync('hasLogin', true);
      this.globalData.hasLogin = true;
    }).catch(() => {
      /*wx.showToast({
        title: 'logout',
        icon: 'success',
        duration: 1000
      });*/
      wx.setStorageSync('hasLogin', false);
      this.globalData.hasLogin = false;
    });
  },
  globalData: {
    test: "hello",
    hasLogin: true,
    latitude: null,
    longitude: null,
    // 自定义弹窗初始化
    _toast_: {
      icon: 'none',
      title: '',
      show: false,
      position: 'center'
    },
    locationInfo: null,  //逆地址解析获取到的信息
    requestTasks: [],  //[{'pagename':[]},{}]
    couponList:[], // 发放的优惠券列表
  },
  initData: function () {
    // city data
    city.initCity();
  }
})