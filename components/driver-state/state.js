// components/travel-state/state.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    driverProfile:{
      type:String,
      value:''
    },
    plateNumber: {
      type: String,
      value: '京AL6666'
    },
    carType: {
      type: String,
      value: '奥迪A8L'
    },
    phoneNumber: {
      type: String,
      value: '17611536267'
    },
    // 样式格式 目前是两种格式
    infoType: {
      type: String,
      value: '1'
    },
    driverName: {
      type: String,
      value: '刘先生'
    },
    color: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    driver_photo_id:'../../images/driver_profile@2x.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    phoneCall(e){
      console.log(e);
      let eventDetail = {
        phoneNumber : e.currentTarget.dataset.phonenumber
      }
      this.triggerEvent('callphone', eventDetail,{})
    }
  }
})
