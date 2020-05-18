import { formatPhoneNumber, formatPhoneNumberS, abortRequestTask } from "../../../utils/util_yongche";
import { orderStatus as _orderStatus } from '../../../bo/order-status.js'
import { payStatus } from '../../../bo/pay-status.js'
import { orderCancelType } from "../../../bo/order-cancel-type";
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

let app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    order_info: null,
    route_distance: '',
    route_duration: '',
    minutes: 0,
    seconds: 0,
    showCancelOrder: false, // 是否展示 取消订单 按钮
    serviceEnd: false, // 是否行程结束
    driverInfoType: 2, // 司机组件 风格 1：白色背景(不展示司机名字) 或者 2：透明背景(展示司机名字)
    travel_end_list: { // 行程结束 list
      waitToPayMoney: 0, // 行程结束 需支付金额
      distance: '',
      useTime: '',
      carPayMoney: '', // 车费合计
      luxuryFavMoney: '', // 豪华车车优惠金额
    },

    pay_status_tips: '',
    amount: -1, // 传递给 车费组件 的金额
    orderId: null,
    orderTips: '', //改派提示信息
    travel_status: -1, // 行程状态
    couponStatus: 1,  //优惠券选择状态 1：无可用优惠券，2：已选择，3：有可用但未选择优惠券
    // 订单信息
    startAddressInfo: null,
    endAddressInfo: null,
    estimatePrice: null,
    productTypeId: null,
    timerId: null,
    timerId_fee_computed: null,
    distanceUnit: '米',
    hasComputedSTD: false,  //是否已计算乘客起点到终点距离
    driverStartPoint: null,  //司机端起点
    clientStartPoint: null,  //乘客起点
    is_fee_computed: 1,  //0:账单结算中
    phoneNumberActionSheet: [{}, { name: '呼叫' }],
    realPhoneNumber: '',
    action_sheet_visible: false,
    showSelectedCoupon: false,//默认选择的优惠券弹窗 是否展示
    showCouponListModal: false, // 是否显示 行程中可用的优惠券 弹窗
    canUseCouponList: [], // 行程中可用的优惠券
    noUseCouponList: [], // 行程中不可用的优惠券
    no_use_coupon: false, // 行程中 用户是否 没有选择优惠券
    recommendPromotion: {}, // 推荐的优惠券 信息
    fromDispatching: true, // 是否是从派单页面来的
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const orderId = options.orderId ? options.orderId : ''; // 从行程列表或者派单页面或者订车页面的行程中浮层 拿orderId
    const driverId = options.driverId ? options.driverId : '';
    const orderTips = options.orderTips ? options.orderTips : '';
    const productTypeId = options.productTypeId ? options.productTypeId : '';
    const fromDispatching = options.fromDispatching ? options.fromDispatching : false;
    const orderStatus = options.orderStatus;
    const vm = this;
    this.setData({
      orderId: orderId,
      productTypeId: productTypeId,
      orderTips: orderTips,
      fromDispatching: fromDispatching
    });
    if (driverId != undefined && driverId != '' && driverId != '0'
      && orderStatus != null && (orderStatus == _orderStatus.orderStatusServiceReady
        || orderStatus == _orderStatus.orderStatusServiceStart)) {
      this.reqDriverLocation(driverId);
    }
    this.getOrderInfo(function (result) {
      const status = result.order.status;
      if (status == _orderStatus.orderStatusServiceReady // 司机已确认
        || status == _orderStatus.orderStatusDriverArrived  // 司机已到达
        || status == _orderStatus.orderStatusServiceStart // 服务开始（服务中）
      ) {
        vm.getOrderStatus();
      }
    });
    // 获取行程中的可用优惠券列表
  },
  onUnload: function () {
    // 停止所有请求任务
    abortRequestTask('journeyDetail');
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];  //当前页面
    const prevPage = pages[pages.length - 2]; //上一个页面
    if (prevPage) {
      if (prevPage.route.indexOf('dispatch') != -1) {// 上一个页面是 派单页面
        // 返回到用车页面
        wx.switchTab({
          url: '/pages/yongche/order/order'
        })
      }
    }
    this.stopTimer();
    // 拨打电话modal隐藏
    this.setData({
      action_sheet_visible: false
    })
  },
  phoneCall(event) {
    let phoneNumber = event.currentTarget.dataset.phoneNum + '';
    phoneNumber = '0086' + phoneNumber;
    let numberObj = {
      name: phoneNumber.length > 11 ? formatPhoneNumberS(phoneNumber) : formatPhoneNumber(phoneNumber)
    };
    wx.makePhoneCall({
      phoneNumber: numberObj.name,
    });

  },
  // 点击 车型 action_sheet item
  clickActionSheet(e) {
    const vm = this;
    vm.setData({
      action_sheet_visible: false
    });

  },
  // 关闭action-sheet
  cancelActionSheet() {
    this.setData({
      action_sheet_visible: false
    })
  },
  // 确认支付
  surePay() {
    let that = this;
    wx.showLoading({
      title: '支付中', 
    })
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

  reqOrderStatus: function () {
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopGetStatus, params).then(function(res) {
      if (res.errno === 0) {
        if (res.data.status == _orderStatus.orderStatusServiceReady) { // 已确认
          vm.setData({
            travel_status: res.data.status,
            serviceEnd: false, // 是否行程结束
            showCancelOrder: true, // 是否可以取消订单
            driverInfoType: 2
          });
        } else if (res.data.status == _orderStatus.orderStatusDriverArrived) { // 司机已到达
          vm.setData({
            travel_status: res.data.status,
            serviceEnd: false, // 是否行程结束
            showCancelOrder: true, // 是否可以取消订单
            driverInfoType: 2
          });
        } else if (res.data.status == _orderStatus.orderStatusServiceSuc) { // 预订成功

        } else if (res.data.status == _orderStatus.orderStatusServiceStart) { // 服务开始（服务中）
          vm.setData({
            travel_status: res.data.status,
            serviceEnd: false, // 是否行程结束
            showCancelOrder: false, // 是否可以取消订单
            driverInfoType: 2
          });
          // 预估乘客始发点到终点距离和时间
          vm.reqEstimateClientStartToEndAddress();
        } else if (res.data.status == _orderStatus.orderStatusServiceEnd) { // 服务结束
          vm.stopTimer();
          setTimeout(vm.refreshOrder, 1000);
        } else if (res.data.status == _orderStatus.orderStatusCancelled) { // 订单取消
          //没车
          vm.setData({
            travel_status: res.data.status,
          });
          vm.stopTimer();
        }
      } else {
        vm.setData({
          dispatching: true,
        });
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        })
      }
    });
  },
  /**
   * 获取订单状态
   */
  getOrderStatus: function () {
    let timer = setInterval(this.reqOrderStatus, 3000);
    this.setData({
      timerId: timer
    })
  },
  /**
   * 获取订单信息
   */
  getOrderInfo: function (callback) {
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopGetOrderInfo, params).then(function(res) {
      if (res.errno === 0) {
        let data = res.data;

        let pay_status_tips;
        let amount;
        if (data.order.status == _orderStatus.orderStatusServiceEnd) { // 已经结束
          if (data.order.totalAmount == 0) {
            //账单确认中
            vm.setData({
              is_fee_computed: 0,
              travel_status: data.order.status
            });
            let timer = setTimeout(vm.getOrderInfo, 3000);
            vm.setData({
              timerId_fee_computed: timer
            })
          } else {
            if (data.order.payStatus != null) {
              if (data.order.payStatus == payStatus.OrderPayStatusNone           // 未支付
                || data.order.payStatus == payStatus.OrderPayStatusPortion) {   //部分支付
                pay_status_tips = '需支付';
                amount = data.order.payAmount;
              } else if (data.order.payStatus == 3) { // 已支付
                pay_status_tips = '已支付';
                amount = data.order.totalAmount;
              }
              vm.setData({
                pay_status_tips,
                amount,
                serviceEnd: true, // 是否行程结束,
                driverInfoType: 1,
                showCancelOrder: false,
                is_fee_computed: -1, // 不在 账单确认中
              });
            }
            vm.setData({
              is_fee_computed: 1
            })
          }
        } else if (data.order.status == _orderStatus.orderStatusServiceReady) { // 司机已确认
          vm.getTravellingCouponList(data.order.rideOrderId); // 获取可用优惠券列表
          vm.setData({
            showCancelOrder: false, // 是否可以取消订单
            serviceEnd: false, // 是否行程结束,
            travel_status: data.order.status,
          });
        } else if (data.order.status == _orderStatus.orderStatusDriverArrived) { // 司机已到达
          vm.getTravellingCouponList(data.order.rideOrderId); // 获取可用优惠券列表
          vm.setData({
            showCancelOrder: false, // 是否可以取消订单
            serviceEnd: false, // 是否行程结束,
            travel_status: data.order.status,
          });
        } else if (data.order.status == _orderStatus.orderStatusServiceStart) { // 服务中
          vm.getTravellingCouponList(data.order.rideOrderId); // 获取可用优惠券列表
          vm.setData({
            showCancelOrder: false, // 是否可以取消订单
            serviceEnd: false, // 是否行程结束
            travel_status: data.order.status,
          });
        }
        if (data.order.productTypeId != null) {
          vm.setData({
            productTypeId: data.order.productTypeId
          })
        }
        vm.setData({
          order_info: data,
        });
        vm.setStartPoint(data);
        if (callback) {
          callback(data);
        }
      } else {
        wx.hideLoading();
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        })
      }
    });
  },
  /**
   * 预估接单司机到乘客起点距离和时间
   */
  getEstimateDriver: function (startLat, startLng, endLat, endLng, callback) {
    let vm = this;
    let params = {
      origins: startLng + "," + startLat,
      destination: endLng + "," + endLat,
      type: 1
    };
    util.request(api.MapDistance, params).then(function(res) {
      if (res.errno === 0) {
        var distance;
        var duration;
        var distance_unit = '米';
        if(res.data.length > 0) {
          if (res.data[0].distance < 1) {
            distance = 1;
            distance_unit = '米';
          } else if (res.data[0].distance >= 1000) {
            distance = (res.data[0].distance / 1000.0).toFixed(1);
            distance_unit = '公里';
          } else {
            distance = res.data[0].distance;
            distance_unit = '米';
          }
          if (res.data[0].duration <= 60) {
            duration = 1;
          } else {
            duration = Math.ceil(res.data[0].duration / 60);
          }
        }

        vm.setData({
          route_distance: distance,
          route_duration: duration,
          distanceUnit: distance_unit
        });
        if (callback != null) {
          callback(1);
        }
      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        })
        if (callback != null) {
          callback(0);
        }
      }
    });
  },
  /**
   * 获取起始点
   */
  getClientPoint: function () {
    var startLat;
    var startLng;
    if (this.data.startAddressInfo != null) {
      startLat = this.data.startAddressInfo.lat;
      startLng = this.data.startAddressInfo.lng;
    } else {
      startLat = app.globalData.locationInfo.lat;
      startLng = app.globalData.locationInfo.lng;
    }

    var address = {
      lat: startLat,
      lng: startLng
    }
    return address;
  },
  /**
   * 预估接单司机到乘客起点距离和时间
   */
  reqEstimateDriverToClientStartAddress: function () {
    if (this.data.clientStartPoint != null && this.data.driverStartPoint != null) {
      this.getEstimateDriver(this.data.driverStartPoint.lat, this.data.driverStartPoint.lng,
        this.data.clientStartPoint.lat, this.data.clientStartPoint.lng);
    }
  },
  /**
   * 预估乘客始发点到终点距离和时间
   */
  reqEstimateClientStartToEndAddress: function () {
    if (this.data.order_info != null) {
      var startLat = this.data.order_info.order.expectStartLatitude;
      var startLng = this.data.order_info.order.expectStartLongitude;
      var endLat = this.data.order_info.order.expectEndLatitude;
      var endLng = this.data.order_info.order.expectEndLongitude;
      let vm = this;
      this.getEstimateDriver(startLat, startLng, endLat, endLng, function (result) {
        if (result) {
          vm.setData({
            hasComputedSTD: true,
          })
        }
      });
    }

  },
  reqCancelOrder: function (userConfirmed) {
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopCancelOrder, params, "POST").then(function(res) {
      if (res.errno === 0) {
        wx.showToast({
          title: '订单取消成功，不收取费用',
          icon: 'success',
          duration: 2000
        })
        //返回首页订车页面
        wx.switchTab({
          url: '/pages/yongche/order/order',
          success: (result) => {
          },
          fail: () => {
          },
          complete: () => {
          }
        });
      } else {
        wx.showToast({
          title: '订单取消失败[' + res.errmsg + ']',
          icon: 'none'
        });
      }
    });
  },
  reqPrequitOrder: function () {
    //orderId, userId, productTypeId
    wx.showLoading({
      title: '',
    })
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopGetCancelOrderFee, params).then(function(res) {
      if (res.errno === 0) {
        wx.hideLoading();
        var allowCancel = res.data.allow_cancel;
        var cancelOrderAmount = res.data.cancel_order_amount;
        vm.setData({
          allowCancel: allowCancel
        })
        if (allowCancel == 1 && cancelOrderAmount > 0) {
          let url = '/pages/yongche/cancelOrder/cancelOrder?allowCancel=' + allowCancel + '&orderId='
            + vm.data.orderId + '&productTypeId=' + vm.data.productTypeId + '&fee=' + cancelOrderAmount;
          wx.navigateTo({
            url: url
          });
        } else if (allowCancel == 1) {
          //展现一个弹框：左按钮："不取消"，右按钮 "确认取消"， 左按钮点击返回派单页面，右按钮点击调用/order/quit接口
          wx.showModal({
            title: '',
            content: res.data.state,
            cancelText: '不取消',
            confirmText: '确定取消',
            success: function (res) {
              if (res.confirm) {
                vm.quitRequest();
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          });
        } else if(res.data.state == "该订单已经取消") {
          wx.showModal({
            title: '',
            content: res.data.state,
            cancelText: '不取消',
            confirmText: '确定取消',
            success: function (res) {
              if (res.confirm) {
                vm.quitRequest();
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          });
        } else {
          wx.showToast({
            title: '订单无法取消',
            icon: 'none'
          });
        }
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '订单取消失败',
          icon: 'none'
        });
      }
    });
  },
  reqDriverLocation: function (driverId) {
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopGetDriverLocation, params).then(function(res) {
      //mock
      res.errno = 0;
      res.data = {
        lat: 40.009772808450336,
        lng: 116.4627607541572
      }
      if (res.errno === 0) {
        let lat = res.data.lat;
        let lng = res.data.lng;
        var address = {
          lat: lat,
          lng: lng
        }
        vm.setData({
          driverStartPoint: address
        })
        vm.reqEstimateDriverToClientStartAddress();
      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        });
      }
    });
  },
  stopTimer: function () {
    if (this.data.timerId != null) {
      clearInterval(this.data.timerId);
    }
    if (this.data.timerId_fee_computed != null) {
      clearTimeout(this.data.timerId_fee_computed);
    }
    this.setData({
      timerId: null,
      timerId_fee_computed: null
    })
  },
  /**
   * 取消订单
   */
  cancelOrder() {
    this.reqPrequitOrder();
  },
  refreshOrder() {
    let vm = this;
    vm.getOrderInfo((res) => {
      vm.setData({
        travel_status: res.status,
      });
    });
  },
  getOrderInfoValue() {
    return this.data.order_info;
  },
  setStartPoint: function (result) {
    if (this.data.startPoint == null) {
      var address = {
        lat: result.order.expectStartLatitude,
        lng: result.order.expectStartLongitude,
      }
      this.setData({
        clientStartPoint: address,
      })
      this.reqEstimateDriverToClientStartAddress();
    }
  },
  continue_booking_car: function () {
    wx.switchTab({
      url: '/pages/yongche/order/order',
    })
  },
  /**
   * 决策后取消订单
   */
  quitRequest: function () {
    //code, productTypeId, orderId
    let vm = this;
    let params = {
      ride_order_id: this.data.orderId
    };
    util.request(api.YopCancelOrder, params, "POST").then(function(res) {
      if (res.errno === 0) {
        var payAmount = res.data.fee;
        if (payAmount > 0) {
          //支付？
          /*let url = '/pages/yongche/cancelOrder/cancelOrder?&orderId='
            + vm.data.orderId + '&productTypeId=' + vm.data.productTypeId + '&fee=' + payAmount;
          wx.navigateTo({
            url: url
          });*/
          wx.switchTab({
            url: '/pages/yongche/order/order'
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
  // 设置优惠券使用状态
  setCouponStatus: function (orderData) {
    if (orderData.order.couponMemberId > 0) {
      this.setData({ couponStatus: 2 })
    } else if (orderData.available_coupon_num || orderData.unavailable_coupon_num) {
      // 有优惠券显示 “请选择优惠券”
      this.setData({ couponStatus: 3 });
    } else {
      // 行程中优惠券列表无数据，显示“暂无可用优惠券”
      this.setData({ couponStatus: 1 });
    }
  },
  // 显示 可用的优惠券列表弹窗
  showCouponList: function () {
    if (this.data.couponStatus == 1) return;
    this.setData({
      showSelectedCoupon: false,
      showCouponListModal: true
    })
  },
  // 关闭 默认选择的优惠券弹窗
  confirm_check: function () {
    this.setData({ showSelectedCoupon: false });
  },
  // 关闭 行程中可用的优惠券弹窗
  closeCouponListModal: function () {
    this.setData({ showCouponListModal: false });
  },
  // 获取可用、不可用的优惠券列表
  getTravellingCouponList: function (order_id) {
    let vm = this;
    let params = {};
    util.request(api.YopGetUserCouponList, params).then(function(res) {
      if (res.errno === 0) {
        let data = res.data;
        if (!(data.available && data.available.length > 0)) {
          return;
        }
        let couponList = data.available;
        let canUseCouponList = [];
        let noUseCouponList = [];
        let showSelectedCoupon = false;
        let i = 0;
        let len = couponList.length;
        let recommendPromotion = {};
        let order_info = vm.data.order_info;
        for (; i < len; i++) {
          couponList[i].promotion.description = couponList[i].promotion.description.join(''); // 描述信息 从数组 改成 字符串
          // 格式化面额 eg: 10元 、7.8折
          if (couponList[i].promotion.coupon_type == '3' || couponList[i].promotion.coupon_type == '31' || couponList[i].promotion.coupon_type == '32') {
            couponList[i].promotion.facevalue = [couponList[i].promotion.facevalue / 10, '折'];
          } else {
            couponList[i].promotion.facevalue = [couponList[i].promotion.facevalue, '元'];
          }
          // 优惠券 是否可用
          if (couponList[i].promotion.is_available == 1) {
            canUseCouponList.push(couponList[i]);
          } else {
            noUseCouponList.push(couponList[i]);
          }
          // 如果 order 接口 coupon_member_id 有值
          if (order_info.order.couponMemberId && order_info.order.couponMemberId > 0) {
            if (couponList[i].id == order_info.order.couponMemberId) {
              couponList[i].is_selected = true; // 新增一个属性表示 优惠券是否被选中
            } else {
              couponList[i].is_selected = false;
            }
          } else { // 如果 order 接口 coupon_member_id 没有值
            // 如果是从派单页面 跳转来的
            if (vm.data.fromDispatching == "true") {
              // 看 user/promotion 接口 recommend 字段是否有值
              if (res.recommend && res.recommend.id) {
                recommendPromotion = res.recommend;
                if (couponList[i].id == recommendPromotion.id) {
                  couponList[i].is_selected = true; // 新增一个属性表示 优惠券是否被选中
                } else {
                  couponList[i].is_selected = false;
                }
              } else {
                couponList[i].is_selected = false;
              }
            } else { // 如果是从首页 浮层弹窗进来的
              couponList[i].is_selected = false;
            }
          }
        }
        // 如果 order 接口 coupon_member_id 有值
        if (order_info.order.couponMemberId && order_info.order.couponMemberId > 0) {
          // 格式化面额 eg: 10元 、7.8折
          if (order_info.order.couponType == '3' || order_info.order.couponType == '31' || order_info.order.couponType == '32') {
            order_info.order.couponFacevalue = order_info.order.couponFacevalue / 10;
          } else {
            order_info.order.couponFacevalue = parseFloat(order_info.order.couponFacevalue);
          }
          vm.setData({ order_info: order_info });
          vm.setCouponStatus(order_info); //设置优惠券状态
        } else {// 如果 order 接口 coupon_member_id 没有值
          // 如果是从派单页面 跳转来的
          if (vm.data.fromDispatching == "true") {
            // 看 user/promotion 接口 recommend 字段是否有值
            if (res.recommend && res.recommend.id) {
              recommendPromotion = res.recommend;
              // 替换order接口 的四个字段
              order_info.order.couponMemberId = recommendPromotion.id;
              order_info.order.couponName = recommendPromotion.promotion.coupon_name;
              order_info.order.couponType = recommendPromotion.promotion.coupon_type;
              // 格式化面额 eg: 10元 、7.8折
              if (order_info.order.couponType == '3' || order_info.order.couponType == '31' || order_info.order.couponType == '32') {
                order_info.order.couponFacevalue = recommendPromotion.promotion.facevalue / 10;
              } else {
                order_info.order.couponFacevalue = recommendPromotion.promotion.facevalue;
              }
              recommendPromotion.promotion.description = recommendPromotion.promotion.description.join(''); // 描述信息 从数组 改成 字符串
              let recommend_coupon_type = recommendPromotion.promotion.coupon_type;
              // 格式化面额 eg: 10元 、7.8折
              if (recommend_coupon_type == '3' || recommend_coupon_type == '31' || recommend_coupon_type == '32') {
                recommendPromotion.promotion.facevalue = [recommendPromotion.promotion.facevalue / 10, '折'];
              } else {
                recommendPromotion.promotion.facevalue = [recommendPromotion.promotion.facevalue, '元'];
              }
              console.log(order_info);
              vm.setData({ order_info: order_info });
              vm.setCouponStatus(order_info); //设置优惠券状态
            } else {
              vm.setCouponStatus(order_info); //设置优惠券状态
            }
          } else {// 如果是从首页 浮层弹窗进来的
            vm.setData({
              no_use_coupon: true
            });
            order_info.order.couponFacevalue = parseFloat(order_info.order.couponFacevalue); // 去掉最前面、最后面的0
            vm.setCouponStatus(order_info); //设置优惠券状态
          }
        }
        // 是否要弹出 默认的优惠券弹窗
        showSelectedCoupon = order_info.order.couponMemberId && order_info.order.couponMemberId > 0 && (vm.data.fromDispatching == "true");
        // if (showSelectedCoupon) {
          // 告诉后台已经选择默认推荐的优惠券
          let promotion_type = recommendPromotion.preference_type == 7 ? 2 : 1;
          let promotion_id = recommendPromotion.id;
          let params = {};
          util.request(api.YopUseCoupon, params).then(function(res) {
            if (res.errno === 0) {
              console.log('默认优惠券切换成功');
            } else {
              if(res.errno == 400){
                wx.showModal({
                  title: '',
                  content:res.errmsg,
                  showCancel: false,
                  confirmText: '好的'
                })
                vm.setData({ no_use_coupon: true});
              }
            }
          });
        // }
        vm.setData({
          canUseCouponList: canUseCouponList,
          noUseCouponList: noUseCouponList,
          recommendPromotion: recommendPromotion,
          showSelectedCoupon: showSelectedCoupon
        })
      } else {
        
      }
    });
  },
  // 行程中切换优惠券
  selectTravellingCoupon: function (e) {
    let vm = this;
    const promotion_id = e.detail.id;
    const promotion_type = e.detail.preference_type == 7 ? 2 : 1;
    let order_id = vm.data.orderId;
    let canUseCouponList = vm.data.canUseCouponList;
    for (let i = 0, len = canUseCouponList.length; i < len; i++) {
      if (canUseCouponList[i].is_selected) { // 循环当前优惠券已经被选中
        if (promotion_id == canUseCouponList[i].id) { // 循环当前的优惠券 === 点击的优惠券 
          return;
        }
      }
    }
    
    let params = {};
    util.request(api.YopUseCoupon, params).then(function(res) {
      if (res.errno === 0) {
        console.log('切换优惠券成功');
        for (let i = 0, len = canUseCouponList.length; i < len; i++) {
          if (canUseCouponList[i].is_selected) { // 循环当前优惠券已经被选中
            if (promotion_id == canUseCouponList[i].id) { // 循环当前的优惠券 === 点击的优惠券 
              vm.setData({ showCouponListModal: false });
              return;
            } else { //  循环当前的优惠券！== 点击的优惠券 
              canUseCouponList[i].is_selected = false;
            }
          } else if (promotion_id == canUseCouponList[i].id) {
            canUseCouponList[i].is_selected = true; // 循环当前优惠券 没有 被选中
          }
        }
        let order_info = vm.data.order_info;
        order_info.order.couponMemberId = e.detail.id;
        order_info.order.couponName = e.detail.promotion.coupon_name;
        order_info.order.couponType = e.detail.promotion.coupon_type;
        order_info.order.couponFacevalue = e.detail.promotion.facevalue[0];
        vm.setData({ showCouponListModal: false, order_info: order_info, canUseCouponList: canUseCouponList, no_use_coupon: false });
        vm.setCouponStatus(order_info); //设置优惠券状态
      } else {
        if (res.errno == 475) {
          wx.showToast({
            title: res.errmsg,
            icon: 'none'
          })
          for (let i = 0, len = canUseCouponList.length; i < len; i++) {
            if (promotion_id == canUseCouponList[i].id) {
              canUseCouponList[i].is_selected = true; // 循环当前优惠券 没有 被选中
              break;
            }
          }
          let order_info = vm.data.order_info;
          order_info.order.couponMemberId = e.detail.id;
          order_info.order.couponName = e.detail.promotion.coupon_name;
          order_info.order.couponType = e.detail.promotion.coupon_type;
          order_info.order.couponFacevalue = e.detail.promotion.facevalue[0];
          vm.setData({ showCouponListModal: false, order_info: order_info, canUseCouponList: canUseCouponList, no_use_coupon: false });
          vm.setCouponStatus(order_info); //设置优惠券状态
        } else {
          wx.showToast({
            title: '网络异常,请稍后重试',
            icon: 'none'
          })
        }
      }
    });
  },
  //  行程中 切换 是否不使用优惠券
  toggleNoUseCoupon: function () {
    let vm = this;
    if (this.data.no_use_coupon) {
      this.setData({
        showCouponListModal: false
      })
    } else {
      let order_id = vm.data.orderId;
      let order_info = vm.data.order_info;
      let canUseCouponList = vm.data.canUseCouponList;
      // 可用优惠券 全部 设置成 未选中
      for (let i = 0, len = canUseCouponList.length; i < len; i++) {
        canUseCouponList[i].is_selected = false;
      }
      let params = {};
      util.request(api.YopUseCoupon, params).then(function(res) {
        if (res.errno === 0) {
          console.log('切换优惠券成功');
          order_info.order.couponType = '';
          order_info.order.couponMemberId = '';
          order_info.order.couponName = '';
          order_info.order.couponFacevalue = '';
          vm.setData({ no_use_coupon: true, showCouponListModal: false, order_info: order_info, canUseCouponList: canUseCouponList });
          vm.setCouponStatus(order_info); //设置优惠券状态
        } else {
          wx.showToast({
            title: res.errmsg,
            icon: 'none'
          })
        }
      });
    }
  }
});