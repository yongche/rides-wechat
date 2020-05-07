/**
 * coupon_type string 优惠券类型
 * case 2: 代金券
 * case 3: 折扣券
 * case 21: 满减代金券
 * case 22: 抵价代金券
 * case 31: 满减折扣券
 * case 32: 限价折扣券
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        couponCount: '0', //优惠券张数
        couponAmount: '0', //优惠券节省金额
        couponList: [],
        hasMoreData: true // 是否有更多数据
    },
    page: 0,
    onLoad: function(options) {
        this.page = 0;
        this.getCouponData();
    },
    getCouponData: function() {
        const vm = this;
        let tempList = this.data.couponList;
        this.page++;
        /*getAllCouponList(this.page, function(res) {
            tempList = tempList.concat(res.list);
            vm.setData({
                couponCount: res.coupon.coupon_cnt,
                couponAmount: res.coupon.coupon_amount,
                couponList: tempList,
                hasMoreData: tempList.length < res.coupon.coupon_cnt
            });
            wx.stopPullDownRefresh();
        }, function(error) {
            wx.stopPullDownRefresh();
            wx.showToast({
                title: error.ret_msg,
                icon: 'none'
            });
        })*/
    },
    onPullDownRefresh: function() {
        this.page = 0;
        this.setData({
            couponList:[]
        })
        this.getCouponData();
    },
    onReachBottom: function() {
        if (!this.data.hasMoreData) return;
        this.getCouponData();
    },
})