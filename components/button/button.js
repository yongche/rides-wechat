// components/button.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    bindtap:{
      type: Function
    },
    content:{
      type: String
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
    btnClick: function(e){
      const eventDetail = {
        address : e.currentTarget.dataset.userConfirmId
      };
      this.triggerEvent('myevent',eventDetail,{})
    }
  }
})
