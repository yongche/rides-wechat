// components/select-coupon/select-coupon.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 1：无可用优惠券 2：已选择优惠券 3：有可用优惠券，但是没有选择
    status: {
      type: Number,
      value: ''
    },
    orderInfo: {
      type: null,
      value: {}
    }
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
    showCouponList(e) {
      console.log(e);
      this.triggerEvent('showCouponList', {}, {})
    }
  }
})
