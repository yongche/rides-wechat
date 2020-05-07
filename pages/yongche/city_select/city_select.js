// pages/yongche/city_select/city_select.js
import { wholeCountryCity } from '../../../bo/wholeCountryCity';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cities: [],
    city_data:[], // 出发地城市数组
    flag: 1, // 1:出发地 2:目的地
  },
  onChange(event) {
    console.log(event)
  },
  city_select(e) {
    console.log(e);
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];  //当前页面
    const prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      city_selected: e.currentTarget.dataset.name,
      city_short: e.currentTarget.dataset.cityshort,
      inputValue:'', // 清空 搜索地址页面的输入框内容 和 地址列表内容
      show_clear:false,
      result:[],
      search_null: false
    })
    wx.navigateBack({
      delta: 1
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.flag){
      this.setData({
        flag: options.flag
      })
    }
    const city_data = wx.getStorageSync('yopCityList');
    this.setData({
      city_data: city_data.cities
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let storeCity = new Array(26);
    const words = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    words.forEach((item, index) => {
      storeCity[index] = {
        key: item,
        city_short:'',
        list: []
      }
    })
    if (this.data.flag == 1) {
      // 出发地循环
      this.data.city_data.forEach((item) => {
        let firstName = item.en.substring(0, 1);
        let index = words.indexOf(firstName.toUpperCase());
        storeCity[index].list.push({
          name: item.name,
          key: firstName,
          city_short:item.city_short
        });
      })
    } else {
      // 目的地 循环
      wholeCountryCity.forEach((item) => {
        let firstName = item.cn_phonetic.substring(0, 1);
        let index = words.indexOf(firstName.toUpperCase());
        storeCity[index].list.push({
          name: item.city_name,
          key: firstName,
          city_short:item.yd_code
        });
      })
    }
    // 去掉 没有城市的 城市首拼字母
    for(let i = storeCity.length - 1,length = storeCity.length;i >= 0;i--){
      if(storeCity[i].list.length == 0){
        storeCity.splice(i,1);
      }
    };
    console.log(storeCity);
    // 获取所有城市信息
    this.data.cities = storeCity;
    this.setData({
      cities: this.data.cities
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})