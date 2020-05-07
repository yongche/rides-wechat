/**
 * 改派详情页面
 * 行程列表正在改派和正在派车跳转展示此组件
 */
Component({
  properties: {
    bookingInfo:{ //订车信息
      type: Object,//类型包括：String, Number, Boolean, Object, Array, null（表示任意类型
      value:{}
    },
    orderTips: { //改派提示信息
      type: String,
      value: ''
    }
  },
  options: {
    addGlobalClass: true,
  },
  data: {

  },
  methods: {

  }
});
