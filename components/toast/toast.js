const defaultToastData = {
  'show': true,
  'icon': 'none',
  'title': '',
  'duration': 2000,
  'position': 'center'
}
let ydToast = {
  /**
   * title: 弹窗文字
   * icon 弹窗图片 success : 对号 ✔️ ，fail ：❌
   * duration: 弹窗消失的时间
   * position: 弹窗的位置 top、center、bottom 默认是center
   */
  Toast: function(data) {
    var that = this;
    if (data.icon == 'success') {
      data.icon = '/images/success_icon.png';
    } else if (data.icon == 'fail') {
      data.icon = '/images/error_icon.png';
    } else {
      data.icon = 'none';
    }
    this.setData({
      _toast_: Object.assign(defaultToastData,data)
    });
    setTimeout(() => {
      that.setData({
        _toast_: { 'show': false }
      })
    }, data.duration || 2000)
  },
  /**
   * 主动隐藏弹窗
   */
  hideToast: function() {
    that.setData({
      _toast_:{
      'show': false
      }
    })
  }
}

function YdToast() {

  let pages = getCurrentPages();
  let curPage = pages[pages.length - 1];
  Object.assign(curPage, ydToast)
  curPage.ydToast = this;
  return this;
}

module.exports = {
  YdToast
}