// pages/yongche/cancel-pay/cancel-pay.js
import {orderStatus as _orderStatus} from "../../../bo/order-status";
import {payStatus} from "../../../bo/pay-status";
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    order_info: null,
    productTypeId: null,
    pay_status_tips: '',
    amount: -1, // 传递给 车费组件 的金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const orderId = options.orderId;
    if (orderId != null) {
      this.setData({
        orderId
      })
    }
    this.getOrderInfo();
  },

  /**
   * 获取订单信息
   */
  getOrderInfo: function () {
    wx.showLoading({
      title: '',
    });
    let vm = this;
    //TODO
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopGetOrderInfo, params).then(function(res) {
      if (res.errno === 0) {
        /**
         * result.vehicle_number 车牌
         * result.car_brand 车品牌
         * result.driver_photo_id 司机头像
         * result.driver_phone 司机手机号
         */
        wx.hideLoading();
        let pay_status_tips;
        let amount;
        let data = res.data.order;
        if (data.status == _orderStatus.orderStatusServiceEnd    // 已经结束
            || data.status == _orderStatus.orderStatusCancelled) {   //已经取消的
          if (data.payStatus != null) {
            if (data.payStatus == payStatus.OrderPayStatusNone           // 未支付
                || data.payStatus == payStatus.OrderPayStatusPortion) {   //部分支付
              pay_status_tips = '需支付';
              amount = data.payAmount;
            } else if (data.payStatus == 3) { // 已支付
              pay_status_tips = '已支付';
              amount = data.totalAmount;
            }
            vm.setData({
              pay_status_tips,
              amount,
            });
            console.log("amount:" + vm.data.amount);
          }
        }
        if (data.productTypeId != null) {
          vm.setData({
            productTypeId: data.productTypeId
          })
        }
        vm.setData({
          order_info: res.data,
        });
      } else {
        wx.hideLoading();
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        })
      }
    });
  },
  payForOrder:function () {
    var that = this;
    util.request(api.YopRideOrderPrepay, {
      rideOrderId: that.data.orderId
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
  },
  lookRules: function () {
    wx.navigateTo({
      url: '/pages/yongche/webview/webview?index=2'
    })
  }
});