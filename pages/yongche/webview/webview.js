Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * webview 打开的url链接 数组
     * 按下标分别代表
     * 0：乘客端用户协议 
     * 1：详细计费说明
     * 2: 行程取消规则
     * 
     */
    web_data: [{
      src: 'https://www.yongche.com/cms/page/userProtocol.html',
      title: '用户协议'
    },
    {
      src: 'https://www.yongche.com/cms/page/new_jijia.html#bj_asap',
      title: '详细计费说明'
    },{
      src: 'https://www.yongche.com/cms/page/quxiaoguize.html',
      title: '行程取消规则'
    }],
    srcIndex: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.url){
      let obj = {
        src:options.url,
        title:options.title
      }
      let arr = this.data.web_data;
      arr.push(obj);
      this.setData({
        web_data: arr,
        srcIndex: arr.length - 1
      });
      wx.setNavigationBarTitle({
        title: this.data.web_data[arr.length - 1].title
      })
    }
    else if (options.index != undefined) {
      const index = options.index;
      this.setData({
        srcIndex: index
      })
      wx.setNavigationBarTitle({
        title: this.data.web_data[options.index].title
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

  }
})