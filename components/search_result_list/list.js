// components/search_result_list/list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    address_title:{
      type:String,
      value:'景山公园'
    },
    address_detail_tips:{
      type:String,
      value:'北京市西城区景山西街44号'
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
    click(e){
      const eventDetail = {
        address : e.currentTarget.dataset.address
      };
      this.triggerEvent('address',eventDetail,{})
    },
  }
})
