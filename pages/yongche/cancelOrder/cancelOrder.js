// pages/yongche/cancelOrder/cancelOrder.js
import { orderCancelType } from '../../../bo/order-cancel-type.js'
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({

  data: {
    orderId: null,  //页面加载时候从url获取
    productTypeId: null,
    payFee:0,
    orderInfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      productTypeId: options.productTypeId,
      payFee: options.fee
    });
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];  //当前页面
    const prevPage = pages[pages.length - 2]; //上一个页面
    let order_info = prevPage.getOrderInfoValue();
    if (order_info != null) {
      this.setData({
          orderInfo: order_info
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 决策后取消订单
   */
  quitRequest: function() {
    //code, userId, productTypeId, orderId
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopCancelOrder, params, "POST").then(function(res) {
      if (res.errno === 0) {
        var payAmount = res.data.fee;
        if (payAmount > 0) {
          util.request(api.YopRideOrderPrepay, {
            rideOrderId: vm.data.orderId
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              const payParam = res.data;
              console.log("支付过程开始");
              wx.requestPayment({
                'timeStamp': payParam.timeStamp,
                'nonceStr': payParam.nonceStr,
                'package': payParam.packageValue,
                'signType': payParam.signType,
                'paySign': payParam.paySign,
                'success': function(res) {
                  console.log("支付过程成功");
                  util.switchTab('/pages/yongche/order/order');
                },
                'fail': function(res) {
                  console.log("支付过程失败");
                  util.showErrorToast('支付失败');
                },
                'complete': function(res) {
                  console.log("支付过程结束")
                }
              });
            } else {
              wx.hideLoading();
              wx.showToast({
                title: res.errmsg,
                icon: 'none'
              })
            }
          });
        } else {
          wx.showToast({
            title: '订单取消成功，不收取费用',
            icon: 'success',
            duration: 2000
          })
          wx.switchTab({
            url: '/pages/yongche/order/order'
          });
        }
      } else {
        wx.showToast({
          title: '订单取消失败[' + res.errmsg + ']',
          icon: 'none'
        });
      }
    });
  },
  cancel:function () {
      wx.navigateBack();
  },
  quitOrder: function () {
      this.quitRequest();
  },
  lookRules: function () {
    wx.navigateTo({
      url: '/pages/yongche/webview/webview?index=2'
    })
  }

});