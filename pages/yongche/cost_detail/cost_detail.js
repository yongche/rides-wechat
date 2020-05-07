// pages/yongche/cost_detail/cost_detail.js
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: {},
    actual_hours: '',
    actual_minutes: '',
    use_car_time:'', // 用车时间
  },
  // 详细计费
  detail_billing() {
    wx.navigateTo({
      url: '/pages/yongche/webview/webview?index=1',
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const orderId = options.orderId;
    const _this = this;
    if (orderId) {
      let params = {
        ride_order_id: orderId
      };
      util.request(api.YopGetOrderInfo, params).then(function(res) {
        if (res.errno === 0) {
          let data = res.data.feeSnap;
          let actualMinute = Math.floor(data.actualTimeLength / 60);
          const hours = ((Math.floor(actualMinute / 60)).toString())>0 ? (Math.floor(actualMinute / 60)).toString() + '小时' : '';
          let minutes = ((actualMinute % 60).toString())>0 ? (actualMinute % 60).toString() + '分钟' : '';
          if(actualMinute == 0) {
            minutes = '0分钟'
          };
          const start_time = res.data.order.startTime*1000; // 开始时间 时间戳
          const end_time = res.data.order.endTime*1000; // 结束时间 时间戳
          const year = new Date(start_time).getFullYear();
          const month = new Date(start_time).getMonth() + 1;
          const day = new Date(start_time).getDate();
          const start_hours = new Date(start_time).getHours();
          const start_minutes = new Date(start_time).getMinutes();
          const end_hours = new Date(end_time).getHours();
          const end_minutes = new Date(end_time).getMinutes();
          // 字符串取后两位 （小时、分钟 单独处理）
          const sub_start_hours = ('0'+start_hours).substring(('0'+start_hours).length - 2);
          const sub_start_minutes = ('0'+start_minutes).substring(('0'+start_minutes).length - 2);
          const sub_end_hours = ('0'+end_hours).substring(('0'+end_hours).length - 2);
          const sub_end_minutes = ('0'+end_minutes).substring(('0'+end_minutes).length - 2);
          _this.setData({
            result: res.data,
            actual_hours:hours,
            actual_minutes:minutes,
            use_car_time:year+'年'+month+'月'+day+'日 '+sub_start_hours+':'+sub_start_minutes+'-'+sub_end_hours+':'+sub_end_minutes
          })
        } else {
          wx.showToast({
            title: res.errmsg,
            icon: 'none'
          })
        }
      })
    }
  },
  clickSubTitle(event){
    wx.navigateTo({
      url: '/pages/yongche/webview/webview?url='+event.currentTarget.dataset.suburl+'&title='+event.currentTarget.dataset.title,
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
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

  }
})