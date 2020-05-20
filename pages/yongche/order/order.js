//index.js
//获取应用实例
const app = getApp();
const TAXI_ID = 78; // 出租车id
const PRODUCT_TYPE_ID_NOW = 17; // 立即用车id
let preventFlag = true;
let defaultCarKey = "is_use_cartypeid"; //存储默认车型key
let defaultCarValue = { //存储默认车型value
    carTypeId: 2,
    count: 0
};
import {
    charLength,
    abortRequestTask,
    UTC_TO_GMT
} from '../../../utils/util_yongche.js';
import {
    initLocation,
    locationResultType,
} from '../../../bo/location.js';
import { orderStatusTips, orderStatus } from '../../../bo/order-status';
import { $Toast } from '../../../iview/base/index';

const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
    data: {
        startAddress: '请选择出发位置',
        endAddress: '请选择到达位置',
        rightDefault: 'rightDefault',
        bookingCarBtnTips: '去订车',
        cityShort: 'bj',
        rightActive1: '',
        rightActive2: '',
        carTypeName: [],
        carTypeItem: '',
        selectedCarTypeItem: null,
        carType: null,
        bookingCar_ready: false, // 是否能点击 去订车按钮
        estimate_money: 0, // 预估的价钱
        discountInfo: '', //抵扣信息
        showTravelling: false, // 是否显示 正在行程中modal
        /**
         *
         */
        travelling_result: [],
        orderStatusTip: '',
        travelingTitle: '司机出发', // 正在行程中 标题
        travelingContent: '李经理 明天 8:30 用车', // 正在行程中 tips
        travelingPlateNumber: '京P·M1111', // 正在行程中 车牌号码
        travelingCarType: '奥迪A6L(黑)', // 正在行程中 车型
        travelingImg: '../../../images/order2.png', // 正在行程中 车型图片
        location_info: null,
        estimate: null,
        startAddressInfo: null,
        endAddressInfo: null, //搜索结果会存储该数据
        servering_city: true, // 当前城市是否已开通轿车服务
        carTypeSelectedIndex: 0,
        action_sheet_visible: false, // 车型action_sheet 是否显示
        estimate_fail: false, // 预估失败
        network_error: false, // 预估 网络失败
        productTypeId: '17', // 马上用车
        startCityShort: null,
        destCityShort: null,
        showCouponGifts: false, // 优惠券礼包弹窗是否展示,
        couponList: [], // 优惠券礼包弹窗 列表
        giftsImage: '', // 优惠券礼包弹窗 底部图片url
    },
    onLoad: function() {
        const vm = this;
        if (app.globalData.locationInfo != null) {
            this.initData();
        }
    },
    onUnload: function() {
        abortRequestTask('order');
       
    },
    onHide:function(){
        this.setData({
            showTravelling:false
        })
    },
    onShow: function() {
        const vm = this;
        // 网络状态
        wx.getNetworkType({
            success: function(res) {
                // 返回网络类型, 有效值：
                // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                if (res.networkType == 'none') {
                    vm.setData({
                        network_error: true
                    })
                } else {
                    vm.setData({
                        network_error: false
                    })
                }
            }
        });
        preventFlag = true;
        if(this.data.startAddress != "请选择出发位置" && this.data.endAddress != "请选择到达位置") {
          this.setData({
              bookingCar_ready: true
          })
        } else {
          this.setData({
              bookingCar_ready: false
          })
        }
        
        // 每次从后台进入前台 都初始化定位地址信息
        if (app.globalData.locationInfo == null) {
            initLocation(function(result) {
                if (result == locationResultType.locationGeoSuccess) {
                    vm.initData();
                } else if (result == locationResultType.locationGeoError) {
                    wx.showToast({
                        title: '无法获取位置',
                        icon: 'none'
                    })
                } else if (result == locationResultType.locationError) {
                    wx.showToast({
                        title: '定位失败',
                        icon: 'none'
                    })
                }
            });
        }
        if (vm.data.startCityShort) {
            vm.initCarTypeByCityShort(vm.data.startCityShort);
            vm.estimatePrice();
        } else if (app.globalData.locationInfo != null && app.globalData.locationInfo.short != null) {
            vm.initCarTypeByCityShort(app.globalData.locationInfo.short);
            vm.estimatePrice();
        }

        let hasLogin = wx.getStorageSync('hasLogin');
        if (app.globalData.hasLogin || hasLogin) {
            app.globalData.hasLogin = true;
            // 是否有正在行程中的订单
            util.request(api.YopGetCurrentAndUnpayOrder, {}).then(function(res) {
              if (res.errno === 0) {
                let currentTrip = res.data.current_trip;
                let unpayTrip = res.data.unpay_trip;
                if(currentTrip && currentTrip.length >= 1) {
                    // 行程状态标题
                    let orderStatusTip = orderStatusTips[currentTrip[0].order.status];
                    vm.setData({
                        showTravelling: true,
                        travelling_result: currentTrip[0],
                        orderStatusTip
                    })
                } else {
                    vm.setData({
                        showTravelling: false,
                        travelling_result: {},
                        orderStatusTip: ''
                    })
                }
              } else {
                vm.setData({
                    showTravelling: false,
                    travelling_result: {},
                    orderStatusTip: ''
                })
              }
            });
        } else {
            vm.setData({
                showTravelling: false,
                travelling_result: {},
                orderStatusTip: ''
            })
        }
    },
    // 该方法为空 可以在modal层弹出来时 禁止modal下面的页面滑动
    catchtouchmove() {

    },
    initData: function() {
        const cityShort = app.globalData.locationInfo.short;
        this.setData({
            cityShort: cityShort
        });
        if (cityShort != null) {
            // 处理定位获取的地址 看是否需要换行
            let startAddress = this.omitNewLine(app.globalData.locationInfo.formatted_address, 1);
            this.setData({
                startAddress
            });
            this.initCarTypeByCityShort(cityShort);
        } else {
            this._showToast('定位失败');
        }
    },
    isNumber: function(val) {
        var regPos = /^\d+(\.\d+)?$/; //非负浮点数
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if(regPos.test(val) || regNeg.test(val)) {
            return true;
        } else {
            return false;
        }
    },
    initCarTypeByCityShort: function(cityShort) {
        const vm = this;
        let params = {
            city: cityShort
        };
        util.request(api.YopGetPrice, params).then(function(res) {
            if (res.errno === 0) {
                let carTypes = [];
                let car_type_name = [];
                let cartypeObj = res.data.cartype;
                for(var i in cartypeObj) {
                    carTypes.push(cartypeObj[i]);
                    car_type_name.push({ name: cartypeObj[i].name });
                }
                if (carTypes.length === 0) {
                    setTimeout(function() {
                        vm._showToast('当前城市暂未开通服务，请选择其他城市');
                    }, 1000);
                    return;
                }
                let lastCarTypeIndex = wx.getStorageSync('lastCarTypeIndex' + vm.data.cityShort);
                let defaultIndex = 0;
                if(vm.isNumber(lastCarTypeIndex)) {
                    defaultIndex = lastCarTypeIndex;
                }
                vm.setData({
                    carType: carTypes,
                    carTypeName: car_type_name,
                    carTypeItem: car_type_name[defaultIndex].name,
                    selectedCarTypeItem: carTypes[defaultIndex],
                    carTypeSelectedIndex: defaultIndex
                });
            } else {
                setTimeout(function() {
                    vm._showToast('当前城市暂未开通服务，请选择其他城市');
                }, 1000);
            }
        });
    },
    //事件处理函数
    // 提示用户未支付订单的信息
    showUnPayOrderToast() {
        wx.showModal({
            content: '您有订单尚未付款，请支付后再继续下单(您可以在首页及我的行程页找到待支付订单)',
            showCancel: false
        })
    },
    // 选择出发地,目的地
    chooseAddress(e) {
        if (app.globalData.locationInfo != null) {
            wx.navigateTo({
                url: '/pages/yongche/searchAddress/searchAddress?flag=' + e.currentTarget.dataset.flag
            })
        } else {
            wx.showModal({
                title: '温馨提示',
                content: '获取位置信息失败，无法使用地图选取地址，请检查网络是否良好，以及是否禁用位置',
            })
        }
    },
    // 地址超过16字符换行处理 以及 第二行末尾加 省略号 并且控制字号大小
    omitNewLine(address, flag) { // flag 1:出发地样式 2:目的地样式
        const index = charLength(address)[0];
        const end = charLength(address)[1];
        let startAddress;
        if (index != 0) {
            this.setData({
                ['rightActive' + flag]: 'lessFont'
            })
            if (end != 0) {
                startAddress = address.substring(0, index + 1) + '\n' + address.substring(index + 1, end) + '...';
            } else {
                startAddress = address.substring(0, index + 1) + '\n' + address.substring(index + 1);
            }
            return startAddress;
        } else {
            this.setData({
                ['rightActive' + flag]: 'largeFont'
            })
            return address
        }
    },
    setStartAddress(address, cityShort) {
        const tempAddress = address;
        tempAddress.city_short = cityShort; // 把 城市编码 加入 地址对象
        this.setData({
            startAddressInfo: tempAddress,
            startAddress: this.omitNewLine(address.name, 1),
            startCityShort: cityShort,
            cityShort: cityShort
        });
        this.initCarTypeByCityShort(cityShort);
        this.estimatePrice();
    },
    getStartAddress() {
        return this.data.startAddressInfo
    },
    setEndAddress(address, cityShort) {
        const tempAddress = address;
        tempAddress.city_short = cityShort; // 把 城市编码 加入 地址对象
        this.setData({
            endAddressInfo: tempAddress,
            endAddress: this.omitNewLine(address.name, 2),
            destCityShort: cityShort,
        });
        this.estimatePrice();
    },
    getEndAddress() {
        return this.data.endAddressInfo;
    },
    getSelectedEstimatePrice() {
        // carTypeIds += this.data.carType[j].car_type_id;
        var price;
        const car_type_id = this.data.selectedCarTypeItem.car_type_id;
        for (var i = 0; i < this.data.estimate.length; i++) {
            if (this.data.estimate[i].car_type_id == car_type_id) {
                price = this.data.estimate[i];
            }
        }
        return price;
    },
    // 订车
    bookingCar() {
        // 按钮不可点击
        if (!this.data.bookingCar_ready) {
            return;
        }
        if (!preventFlag) return;
        preventFlag = false;
        if (app.globalData.hasLogin) {
            // wx.navigateTo({ url: '/pages/yongche/dispatch/dispatch?productTypeId=' + this.data.productTypeId });
            let userInfo = wx.getStorageSync('userInfo');
            // get mobile
            if(userInfo.mobile && userInfo.mobile != "") {
              this.reqOrder();
            } else {
              // request mobile
              wx.showModal({
                title: '提示',
                content: '根据相关规定，需要下单用户手机号，请前往个人中心绑定手机号',
                success (res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: "/pages/ucenter/index/index?fromPage=yongche"
                    });
                  } else if (res.cancel) {
                    wx.showToast({
                      title: '为您带来不便敬请谅解',
                      icon: 'none',
                      duration: 2000
                    });
                    preventFlag = true;
                  }
                }
              });
            }
        } else {
            wx.navigateTo({
              url: "/pages/auth/login/login?fromPage=yongche"
            });
        }

    },
    // 选择车型
    carChange(e) {
        if (app.globalData.locationInfo != null) {
            this.setData({
                action_sheet_visible: true
            })
        }
    },
    // 点击 车型 action_sheet item
    clickActionSheet(e) {
        const vm = this;
        const index = e.detail.index;
        wx.setStorageSync('lastCarTypeIndex' + vm.data.cityShort, index);
        vm.setData({
            carTypeItem: vm.data.carTypeName[index].name,
            selectedCarTypeItem: vm.data.carType[index],
            carTypeSelectedIndex: index,
            action_sheet_visible: false
        });
        if (vm.data.estimate != null) {
            const selectedEstimatePrice = vm.getSelectedEstimatePrice();
            let distance = selectedEstimatePrice.distance;
            if(distance == 0) {
                distance = 1;
            }
            vm.setData({
                estimate_money: selectedEstimatePrice.total_fee,
                discountInfo: distance + "公里"
            });
        }
    },
    // 关闭action-sheet
    cancelActionSheet() {
        this.setData({
            action_sheet_visible: false
        })
    },
    _showToast: function(content) {
        $Toast({
            content: content
        });
    },
    // // 未支付行程 查看详情
    // lookTravelDetail() {

    // },
    // // 未支付行程 去支付
    // goPay() {

    // },
    // 跳转到订单详情
    goTraveling() {
        wx.navigateTo({
            url: '/pages/yongche/journeyDetail/journeyDetail?orderId=' + this.data.travelling_result.order.rideOrderId +
                '&driverId=' + this.data.travelling_result.order.driverId + '&orderStatus=' + this.data.travelling_result.order.status + "&fromDispatching=false",
            success: (result) => {

            },
            fail: () => {},
            complete: () => {}
        });
    },
    estimatePrice: function() {
        const vm = this;
        wx.getNetworkType({
            success: function(res) {
                // 返回网络类型, 有效值：
                // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                var networkType = res.networkType
                if (networkType == 'none') {
                    vm.setData({
                        network_error: true
                    })
                } else {
                    vm.reqEstimate();
                }
            }
        })
    },
    reqEstimate: function() {
        const vm = this;
        const locationInfo = app.globalData.locationInfo;
        if (this.data.endAddressInfo != null && (this.data.startAddressInfo != null || locationInfo != null) &&
            this.data.carType != null) {
            wx.showLoading({
                title: '',
            });
            var carTypeIds = '';
            for (var j = 0, len = this.data.carType.length; j < len; j++) {
                carTypeIds += this.data.carType[j].car_type_id;
                if (j != len - 1) {
                    carTypeIds += ',';
                }
            }
            var startLatitude = '';
            var startLongitude = '';
            var startAddress = '';
            var endLatitude = this.data.endAddressInfo.lat;
            var endLongitude = this.data.endAddressInfo.lng;
            var cityShort;
            if (this.data.startAddressInfo != null) {
                startLatitude = this.data.startAddressInfo.lat;
                startLongitude = this.data.startAddressInfo.lng;
                startAddress = this.data.startAddressInfo.name;
                cityShort = vm.data.startCityShort;
            } else {
                startLatitude = locationInfo.lat;
                startLongitude = locationInfo.lng;
                startAddress = locationInfo.formatted_address;
                cityShort = locationInfo.short
            }
            const startTime = '' + Date.parse(new Date())/1000;
            var params = {
                city: cityShort,
                product_type_id: vm.data.productTypeId, //asap
                // corp_id: '' //企业用户id，二期先不做，不传就是个人账户支付
                car_type_id: carTypeIds,
                in_coord_type: 'mars',
                start_latitude: startLatitude,
                start_longitude: startLongitude,
                start_address: startAddress,
                end_latitude: endLatitude,
                end_longitude: endLongitude,
                end_position: this.data.endAddressInfo.name,
                time_length: '0',
                start_time: startTime,
                is_asap: '1', //随叫随到
            };

            util.request(api.YopEstimateAll, params).then(function(res) {
              if (res.errno === 0) {
                wx.hideLoading();
                vm.setData({
                    estimate: res.data,
                    bookingCar_ready: true,
                    estimate_fail: false
                });
                const selectedEstimatePrice = vm.getSelectedEstimatePrice();
                vm.setData({
                    estimate_money: selectedEstimatePrice.total_fee,
                    discountInfo: selectedEstimatePrice.distance + "公里"
                });
              } else {
                wx.hideLoading();
                vm.setData({
                    bookingCar_ready: false,
                    estimate_fail: true
                });
              }
            });
        }
    },
    /**
     * 下单
     */
    reqOrder: function() {
        wx.showLoading({
            title: '',
        })
        const vm = this;
        var locationInfo = app.globalData.locationInfo;
        var estimatePrice = this.getSelectedEstimatePrice();
        var endAddress = this.data.endAddressInfo;
        var startAddress = this.data.startAddressInfo;
        var start_time = Date.parse(new Date()) / 1000;
        var estimate_info = '';
        var distance = 0;
        var timeLength = 0;
        if (estimatePrice.distance > 0) {
            estimate_info = 'D' + estimatePrice.distance + ',';
            distance = estimatePrice.distance;
        } else {
            estimate_info = 'D0,'
        }
        if (estimatePrice.time_length > 0) {
            estimate_info += 'T' + estimatePrice.time_length;
            timeLength = estimatePrice.time_length;
        } else {
            estimate_info += 'T0';
            timeLength = 0;
        }
        var orderLat = locationInfo.lat;
        var orderLng = locationInfo.lng;
        var startPosition;
        var startAddressParam;
        var startLat;
        var startLng;
        var startCityShort;
        if (startAddress != null) {
            startPosition = startAddress.name;
            startAddressParam = startAddress.address;
            startLat = startAddress.lat;
            startLng = startAddress.lng;
            startCityShort = vm.data.startCityShort;
        } else {
            startPosition = locationInfo.formatted_address;
            startAddressParam = locationInfo.formatted_address;
            startLat = app.globalData.latitude;
            startLng = app.globalData.longitude;
            startCityShort = locationInfo.short;
        }
        let userInfo = wx.getStorageSync('userInfo');
        const is_need_manual_dispatch = 0; //是否派单失败后转人工, ASAP 强制0，其他默认1
        var params = {
            is_support_system_decision: '1',
            has_custom_decision: '0',
            order_lat: startLat,
            order_lng: startLng,
            start_address: startAddressParam, //startAddressParam,  //详细地址，比如路牌号码
            start_lat: startLat,
            start_lng: startLng,
            from_pos: startPosition, //startPosition,  //大厦名字
            end_address: endAddress.address,
            end_lat: endAddress.lat,
            end_lng: endAddress.lng,
            to_pos: endAddress.name,
            dst_city_name: endAddress.city,
            dest_city: vm.data.destCityShort,
            city: startCityShort,
            is_asap: 1, //只有随叫随到，后面需要调整
            estimate_price: estimatePrice.total_fee,
            distance: distance,
            time_length: timeLength,
            time: 0,
            car_type_id: estimatePrice.car_type_id,
            start_time: start_time,
            in_coord_type: 'mars',
            passenger_phone: userInfo.mobile,
            is_taximeter: '0', //是否打表来接
            estimate_info: estimate_info,
            product_type_id: '17', //需要从选择产品类型获取
            passenger_countryshort: 'CN', //user中获取
            passenger_name: userInfo.nickName, //user中获取
            out_coord_type: 'mars',
            is_bargain: '0', //是否支持议价
            passenger_sms: '1', //是否可以给乘客发送短信, 1 or 0
            corporate_id: '0', //企业账户
            corporate_dept_id: '0', //企业账号组id
            is_need_manual_dispatch: is_need_manual_dispatch, //是否派单失败后转人工, ASAP 强制0，其他默认1
            pa_bargain_amount: 0, //	议价金额
        };
        util.request(api.YopCreateOrder, params, "POST").then(function(res) {
            if (res.errno === 0) {
                wx.hideLoading();
                wx.setStorageSync(defaultCarKey, defaultCarValue); // 保存is_use_cartypeid===0时选择次数
                wx.setStorageSync('lastCarId', params.car_type_id); // 保存上次选择车型ID

                wx.navigateTo({
                    url: '/pages/yongche/dispatch/dispatch?orderId=' + res.data.rideOrderId + '&productTypeId=' + vm.data.productTypeId,
                })
            } else if(res.errno == 405) {
                preventFlag = true;
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '存在未付款订单，请前往个人中心完成支付',
                  success (res) {
                    if (res.confirm) {
                        wx.switchTab({
                          url: "/pages/ucenter/index/index?fromPage=yongche"
                        });
                    } else if (res.cancel) {
                        wx.showToast({
                          title: '暂时无法用车',
                          icon: 'none',
                          duration: 2000
                        });
                    }
                  }
                })
            } else {
                preventFlag = true;
                wx.hideLoading();
                wx.showToast({
                    title:res.errmsg,
                    icon:'none'
                })
            }
        });
    },
    onShareAppMessage: function() {
      return {
        title: '易到开放平台',
        desc: 'SAAS服务',
        path: '/pages/yongche/order/order'
      }
    },
    /**
     * 关闭 优惠券 礼包弹窗
     */
    closeGifts: function() {
        this.setData({
            showCouponGifts: false,
            couponList: [],
        });
        app.globalData.couponList = [];
    }
});