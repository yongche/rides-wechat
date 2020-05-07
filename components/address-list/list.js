// components/address-list/list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    icon_color:{
      type:String,
      value:''
    },
    leftText: {
      type: String,
      value: '出发地'
    },
    rightText:{
      type: String,
      value:'目的地',
    },
    rightActive:{
      type: String,
      value:''
    },
    rightDefault:{
      type:String,
      value:''
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
    click() {
      this.triggerEvent('clickevent', {}, {});
    },
  }
})