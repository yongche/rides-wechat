// pages/yongche/dispatch.js
const app = getApp();
import { abortRequestTask } from '../../../utils/util_yongche';
import orderCancelType from '../../../bo/order-cancel-type.js'
import { orderStatus } from '../../../bo/order-status.js'
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    count: 0, // 派单正计时
    minutes: 0,
    seconds: 0,
    route_distance: '', // 预估距离
    route_duration: 0, // 预估时间
    dispatching: true, // 是否正在派单进行中
    travel_end_list: { // 行程结束 list
      waitToPayMoney: 0, // 行程结束 需支付金额
      distance: '45',
      useTime: '33',
      carPayMoney: '123.12', // 车费合计
      luxuryFavMoney: '-12', // 豪华车车优惠金额
    },
    no_servering_city_tips: '抱歉，您附近的司机都在服务中，请稍后再试',
    pay_finished: false, // 行程是否完成支付
    orderId: null,
    travel_status: 10, // 行程状态 
    order_info: {
      vehicle_number: '', //车牌
      car_brand: '', //车品牌
      driver_photo_id: '' //司机头像
    }, // 订单信息
    startAddressInfo: null,
    endAddressInfo: null,
    estimatePrice: null,
    driverInfoType: 1,
    productTypeId: null,
    timerId_1: null,
    timerId_2: null,
  },
  // 取消订单
  /**
   * 
   * @param {*} userConfirmed 0 :首次取消    1：用户二次确认的取消（有责的取消有惩罚，需要用户二次确认）
   */
  cancelOrderAction(event) {
    const _this = this;
    //返回首页订车页面
    wx.showModal({
      title: '',
      content: '现在取消服务将不会扣除您的任何费用，确认要取消本次用车服务',
      cancelText: '不取消',
      confirmText: '确定取消',
      success: function (res) {
        if (res.confirm) {
          _this.reqCancelOrder(event.currentTarget.dataset.userconfirmid);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options != null) {
      if (options.productTypeId != null) {
          this.setData({
              productTypeId: options.productTypeId,
          });
      }
      if (options.orderId != null) {
        this.setData({
            orderId: options.orderId
        })
      }
    }
    this.initData();
    this.reqOrderStatus();
    this.dispatching_positive_timing();
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
    this.clearTimerInterval();
    // 从拍单页面返回上一个页面时  自动取消订单
    if(this.data.dispatching) {
      let params = {
        ride_order_id: this.data.orderId
      };
      util.request(api.YopCancelOrder, params, "POST").then(function(res) {
        if (res.errno === 0) {
          abortRequestTask('dispatch');
          wx.navigateBack({
            delta: 1
          });
        }
      });
    } else {
      abortRequestTask('dispatch');
    }
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
   * 初始化数据
   */
  initData: function () {
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];  //当前页面
    const prevPage = pages[pages.length - 2]; //上一个页面

    this.setData({
      endAddressInfo: prevPage.getEndAddress(),
      estimatePrice: prevPage.getSelectedEstimatePrice(),
    });
    if (prevPage.getStartAddress() != null) {
      this.setData({
        startAddressInfo: prevPage.getStartAddress(),
      });
    }

  },
  // 重新订车按钮 回订车页面
  goBackOrder(){
    wx.navigateBack({
      delta: 1
    });
  },
  reqOrderStatus: function () {
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopGetStatus, params).then(function(res) {
      if (res.errno === 0) {
        if (res.data.status == orderStatus.orderStatusWaitDriverConfirm) { // 等待司机确认
          //没车
          vm.setData({
            travel_status: res.data.status,
            dispatching: true,
          });

          vm.getOrderStatus();
        } else if (res.data.status == orderStatus.orderStatusServiceReady) { // 司机接单
          vm.setData({
            travel_status: res.data.status,
            dispatching: false,
            driverInfoType: 1
          });
          // 重定向到订单详情 （因为订单详情页面 点击返回 要返回到上上个 用车页面，本页面跳转不用重定向的话，订单详情返回时派单页面会闪一下，体验不好）
          wx.redirectTo({
            url: '/pages/yongche/journeyDetail/journeyDetail?orderId=' + vm.data.orderId
              + '&driverId=' + res.data.driverId + '&productTypeId=' + vm.data.productTypeId + "&orderStatus=" + res.data.status + "&fromDispatching=true",
          });
          // 清除定时器
          vm.clearTimerInterval();
        } else if (res.data.status == orderStatus.orderStatusCancelled) { // 取消
          //显示订单失败页面
          // wx.showToast({
          //     title: '订单失败',
          //     icon: 'none'
          // })
          vm.setData({
            travel_status: res.data.status,
            dispatching: false,
          });
          vm.clearTimerInterval();
        }
      } else {
        vm.setData({
          dispatching: true,
        });
        vm.getOrderStatus();
      }
    });
  },
  /**
   * 获取订单状态
   */
  getOrderStatus: function () {
    let timer = setTimeout(this.reqOrderStatus, 3000);
    this.setData({
      timerId_2: timer
    });
  },
  // 取消订单
  reqCancelOrder: function (userConfirmed) {
    wx.showLoading({
      title: '',
    })
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopCancelOrder, params, "POST").then(function(res) {
      if (res.errno === 0) {
        wx.hideLoading();
        wx.showToast({
          title: '订单取消成功，不收取费用',
          icon: 'success',
          duration: 2000
        })
        //返回首页订车页面
        wx.navigateBack();
      } else {
        wx.showToast({
          title: '订单取消失败[' + res.errmsg + ']',
          icon: 'none'
        });
      }
    });
  },
  // 派单正计时
  dispatching_positive_timing() {
    const _this = this;
    let count = 0;
    let timerId_1 = setInterval(() => {
      count++;
      let minutes = parseInt(count / 60);
      let seconds = count % 60;
      this.setData({
        minutes,
        seconds,
        count
      })
    }, 1000);
    this.setData({
      timerId_1
    });
  },
  // 取消定时器
  clearTimerInterval() {
    const _this = this;
    clearInterval(_this.data.timerId_1);
    clearInterval(_this.data.timerId_2);
    this.setData({
      minutes:0,
      seconds:0,
      count:0
    })
  }
})