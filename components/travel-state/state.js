// components/travel-state/state.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 距离 值
    miles:{
      type: String,
      value:'0'
    },
    // 预估时间
    estimate_time:{
      type: String,
      value:88
    },
    // 距离单位 米、公里
    distance_unit:{
      type: String,
      value:''
    },
    travel_state:{
      type: Number,
      value: 0
    },
    is_fee_computed:{ // 账单确认中
      type: Number,
      value: -1
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    stateTips:{
      "4":"已出发",
      "5":"已到达",
      "6":"服务中",
      "7":"行程结束",
      "8":"订单取消",
      "9":"",
      "10":"待服务"
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
