import { JourneyModels, BusinessOrderStatus, BusinessAbnormalOrderStatus } from '../../../bo/myJourney/models.js'
import { payStatus } from '../../../bo/pay-status.js'
import { COMMON } from '../../../bo/utils/common.js'
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  data: {
    scrollTop:0,
    rideOrderList: [],
    rideOrderPageList: [],
    showType: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    canLoadMore: true,
    isLoading: false,
  },
  onPageScroll(event){
    this.setData({
      scrollTop : event.scrollTop
    })
  },
  switchTab: function(event) {
    let showType = event.currentTarget.dataset.index;
    this.setData({
      scrollTop:0,
      rideOrderList: [],
      rideOrderPageList: [],
      showType: showType,
      page: 1,
      limit: 10,
      totalPages: 1,
      canLoadMore: true,
      isLoading: false
    });
    this.getOrderList();
  },
  orderDetail: function (e) {
    var order_id = e.currentTarget.dataset.item.bean.rideOrderId;
    var driver_id = e.currentTarget.dataset.item.bean.driverId;
    var product_type_id = e.currentTarget.dataset.item.bean.productTypeId;
    var status = e.currentTarget.dataset.item.bean.status;
    var pay_status = e.currentTarget.dataset.item.bean.payStatus;
    var isCompanyAccount = e.currentTarget.dataset.item.bean.corporateId > 0;
    var abnormal_mark = e.currentTarget.dataset.item.bean.abnormalMark;
    var is_taxi = e.currentTarget.dataset.item.bean.isTaxi == 1;
    var order_tip = e.currentTarget.dataset.item.bean.orderTip;
    var url;
    if (status == BusinessOrderStatus.OrderStatusCancelled) {
      if (pay_status == payStatus.OrderPayStatusPortion
          || pay_status == payStatus.OrderPayStatusNone) {
        url = '/pages/yongche/cancelPay/cancelPay?orderId=' + order_id ;
      } else {
        url = '/pages/yongche/journeyDetail/journeyDetail?orderId=' + order_id + '&driverId=' + driver_id
              + '&productTypeId=' + product_type_id + "&orderStatus=" + status;
      }
    } else if (status == BusinessOrderStatus.OrderStatusServiceEnd || isCompanyAccount || is_taxi) {
      var showToast = isCompanyAccount || is_taxi;
      switch (abnormal_mark) {
        case BusinessAbnormalOrderStatus.OrderAbnormalSys: // 系统疑议
        case BusinessAbnormalOrderStatus.OrderAbnormalUser: // 用户疑议
        case BusinessAbnormalOrderStatus.OrderAbnormalAdmin: // 后台操作人员设置的异常 (系统疑议)
          showToast = true;
        default:
          url = '/pages/yongche/journeyDetail/journeyDetail?orderId=' + order_id + '&driverId=' + driver_id + '&productTypeId=' + product_type_id + "&orderStatus=" + status;
          break;
      }
      if (showToast) {
        var msg = '存在疑议订单';
        wx.showToast({
          title: msg,
          duration: 2000,
          icon:'none'
        })
        return;
      }
    } else if (status == BusinessOrderStatus.OrderStatusReassign) {
      url = '/pages/yongche/journeyDetail/journeyDetail?orderId=' + order_id + '&driverId=' + driver_id + '&productTypeId=' + product_type_id + '&orderStatus=' + status + '&orderTips=' + order_tip;
    } else {
      url = '/pages/yongche/journeyDetail/journeyDetail?orderId=' + order_id + '&driverId=' + driver_id + '&productTypeId=' + product_type_id + "&orderStatus=" + status;
    }
    /*wx.redirectTo({
        url: url
    });*/
    wx.navigateTo({
        url: url
    });
  },

  newUnfinishedPageItem: function(entity) {
    var pageItem = JourneyModels.newUnfinishedPageItem(entity);
    pageItem.bean = entity;
    return pageItem;
  },

  newHistoryPageItem: function(entity) {
    var pageItem = JourneyModels.newHistoryPageItem(entity);
    pageItem.bean = entity;
    return pageItem;
  },

  // 更新当前页数据
  updateData: function (curPageNo, data) {
    /*this.setData({
      rideOrderList: this.data.rideOrderList.concat(data.list),
      totalPages: data.pages
    });*/
    this.setData({
      rideOrderList: data.list,
      totalPages: data.pages
    });
    let listPage = [];
    for(var i in data.list) {
      if(this.data.showType == 1 || this.data.showType == 2) {
        listPage.push(this.newUnfinishedPageItem(data.list[i]));
      } else {
        listPage.push(this.newHistoryPageItem(data.list[i]));
      }
    }
    /*this.setData({
      rideOrderPageList: this.data.rideOrderPageList.concat(listPage),
      totalPages: data.pages
    });*/
    this.setData({
      rideOrderPageList: listPage,
      totalPages: data.pages
    });

    var curDatasLength = 0;
    curDatasLength = data.list.length;
    if (curDatasLength > 0 && this.data.limit >= curDatasLength) {
      // 加载成功并存在下一页，重置pageNo++
      this.data.page = curPageNo + 1;
      this.data.canLoadMore = true;
    } else {
      this.data.canLoadMore = false;
    }
  },

  getOrderList: function () {
    if (this.data.isLoading) {
      wx.stopPullDownRefresh();
      return;
    }
    this.data.isLoading = true;
    let that = this;
    var curPageNo = this.data.page;
    let params = {
      showType: this.data.showType,
      page: this.data.page,
      limit: this.data.limit
    };
    util.request(api.YopGetOrderList, params).then(function(res) {
      if (res.errno === 0) {
        that.updateData(curPageNo, res.data);
        wx.hideLoading();
        wx.stopPullDownRefresh();
        that.data.isLoading = false;
      } else {
        that.data.isLoading = false;
        wx.hideLoading();
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      }
    });
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this
    try {
      var tab = wx.getStorageSync('ridetab');

      this.setData({
        showType: tab
      });
      this.getOrderList();
    } catch (e) {}
  },

  onShow: function() {
    // 页面显示
    //this.getOrderList();
  },

  onUnload: function(options) {
    this.data.page = 1;
    this.data.rideOrderList.splice(0, this.data.rideOrderList.length);
    this.data.rideOrderPageList.splice(0, this.data.rideOrderPageList.length);
    this.data.canLoadMore = true;
    this.data.isLoading = false;
  },

  onPullDownRefresh(){
    this.setData({
      page: 1,
      rideOrderList: [],
      rideOrderPageList: []
    });
    this.getOrderList();
  },

  onReachBottom(){
    if (this.data.canLoadMore) {
      this.getOrderList();
    } else {
      wx.showToast({
        title: '已经到底了',
        icon: 'none'
      });
    }
  }
});