// pages/yongche/searchAddress/searchAddress.js
const app = getApp();
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    result: null,
    show_clear: false,
    search_null: false, // 搜索结果为空
    flag: 1, // 1：出发地 2：目的地
    city_selected: '北京', // 当前选择的城市
    city_short: 'bj',
    inputValue:'',
    search_null_content:'',
  },
  // 输入框监听
  inputChange(e) {
    this.setData({
      show_clear: e.detail.value.length > 0 ? true : false,
      inputValue:e.detail.value
    })
    this.onSearch(e.detail.value);
  },
  // 去选择城市
  select_city() {
    wx.navigateTo({
      url: '/pages/yongche/city_select/city_select?flag='+this.data.flag,
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });
  },
  // 点击 搜索地址结果
  chooseAddress(event) {
    let index = event.currentTarget.dataset.index;
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];  //当前页面
    const prevPage = pages[pages.length - 2]; //上一个页面
    if (this.data.flag == 1) {
      prevPage.setStartAddress(prevPage.omitNewLine(this.data.result[index], 1), this.data.city_short);
    } else {
      prevPage.setEndAddress(prevPage.omitNewLine(this.data.result[index], 2), this.data.city_short);
    }
    wx.navigateBack({
      delta: 1
    });
  },
  // 取消搜索
  clearInput() {
    this.setData({
      inputValue:'',
      show_clear:false,
      result:[],
      search_null:false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let cur_city = null;
    let cur_city_short = null;
    if (app.globalData.locationInfo != null) {
      cur_city = app.globalData.locationInfo.name; // 定位城市名称
      cur_city_short = app.globalData.locationInfo.short;
    }
    if(options.flag){
      this.setData({
        flag: options.flag,
        city_selected: cur_city,
        city_short:cur_city_short
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 真机输入字符不点击键盘上确认，点击返回，会提示网络错误，notice接口被中断，abort了下一页接口，暂时注释
    // 对应bug 134
    // abortRequestTask('searchAddress');
  },

  /**
   * 跳转到选择城市页面
   * 1: 选择 出发地城市
   * 2: 选择 目的地城市
   */
  goSelectCity(flag){
    wx.navigateTo({
      url:'/pages/yongche/city_select/city_select?flag='+flag
    })
  },
  /**
   * 搜索
   */
  onSearch: function (keywords) {
    //精确搜索
    const _this = this;
    if (keywords.replace(/(^\s*)/g, "").length>0) { // 去掉输入框最前面的空格
      let params = {
        city: this.data.city_selected,
        keywords,
        // radius:'',
        place_type: '1', // 1为精确搜索
        out_coord_type: 'mars', // 经纬度坐标类型
        in_coord_type: 'mars',
        local_coord_type: 'mars', // 端上用的地图类型
        cur_coord_type: "mars",
        is_inland: '1', // 是否是国内
        map_type: "1",
        address_type: "2",
        page_size:'20'
      }
      if (app.globalData.latitude != null && app.globalData.longitude != null) {
        // params.cur_lat = app.globalData.latitude;
        // params.cur_lng = app.globalData.longitude;
        params.local_lat = app.globalData.latitude; // 当前定位的经度
        params.local_lng = app.globalData.longitude; // 当前定位的经度
        params.lat = app.globalData.latitude; // 前面页面传进来的地址纬度
        params.lng = app.globalData.longitude;// 前面页面传进来的地址经度
      }
      if (app.globalData.locationInfo != null) {
        params.local_city = app.globalData.locationInfo.short; // 定位城市名称
      }
      util.request(api.MapPlaceSearch, params).then(function(res) {
        if (res.errno === 0) {
          let search_null;
          let data = res.data;
          if(data && data.length == 0) {
            search_null = true;
            let search_null_content = _this.data.inputValue;
            search_null_content = search_null_content.replace(/(^\s*)|(\s*$)/g,'')
            _this.setData({
              result:data,
              search_null,
              search_null_content
            })
          } else {
            search_null = false;
            _this.setData({
              result:data,
              search_null
            })
          }
        } else {
          wx.showToast({
            title:res.errmsg,
            icon:'none'
          })
        }
      });
    }else{
      // 删除所有的搜索内容后
      _this.setData({
        result:[],
        search_null:false
      })
    }
  },
})