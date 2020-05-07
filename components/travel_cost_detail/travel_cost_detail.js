// components/travel_cost_detail/travel_cost_detail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**
     * 需支付 pay_amount
     * 已支付 total_amount
     * 是否已支付 pay_status
     *    1; // 未支付
          0; // 不需要支付
          3; // 已支付
          2; // 部分支付
     * 是否是出租车 is_taxi  0、 1
     * main_fee_data {
     *  title '车费合计
     *  value ‘10元
     *  content ’(行驶25公里，用时29分钟)
     * }
     */
    // 需支付 或者 已支付 金额
    amount:{
      type:Number,
      value:0
    },
    pay_status:{
      type:Number,
      value:-1
    },
    pay_status_tips:{
      type:String,
      value:''
    },
    main_fee_data: {
      type: Object,
      value: {}
    },
    orderId: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
  
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到行程结束 列表详情
    travel_end_list_detail(e) {
      wx.navigateTo({
        url: '/pages/yongche/cost_detail/cost_detail?orderId=' + e.currentTarget.dataset.orderid,
      })
    },
  }
})
