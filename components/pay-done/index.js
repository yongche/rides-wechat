Component({
  /**
   * 组件的属性列表
   */
  properties: {
    startPosition: {
      type: String,
      value: ''
    },
    endPosition: {
      type: String,
      value: ''
    },
    amount:{
      type: String,
      value: ''
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    reOrder: function () {
      wx.switchTab({
        url: '/pages/yongche/order/order'
      });
    },
    lookRules: function () {
      wx.navigateTo({
        url: '/pages/yongche/webview/webview?index=2'
      })
    }
  }
});
