// components/coupon-item/coupon-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    coupon_name: {
      type: String,
      value: ''
    },
    coupon_effective: {
      type: String,
      value: ''
    },
    prompt: {
      type: String,
      value: ''
    },
    facevalue: {
      type: Array,
      value: []
    },
    // 是否显示 选中的右上角图标
    show_selected_coupon_logo: {
      type: Boolean,
      value: false
    },
    // 优惠券 是否可以点击选择
    can_select_coupon: {
      type: Boolean,
      value: true
    },
    // 优惠券是否被选中
    gifts_selected: {
      type: Boolean,
      value: true
    },
    // 优惠券 右侧的选择按钮 是否显示
    show_select_icon: {
      type: Boolean,
      value: false
    },
    promotion_info:{
      type:Object,
      value:{}
    },
    // 样式类别 1:首页优惠券发放弹窗的样式 2:行程中选择优惠券列表弹窗的样式
    style_type:{
      type: String,
      value: '1'
    }
  },
  // 接受外部传入的样式类
  externalClasses: ['my-class'],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    select_coupon(e) {
      // console.log(e);
      let eventDetail = e.currentTarget.dataset.promotioninfo;
      this.triggerEvent('select_coupon', eventDetail, {})
    }
  }
})
