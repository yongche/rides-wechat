
// 转换今天\明天
function formatDay(time) {
  var currentTime = Date.parse(new Date());
  var dateTime = time;//后台传递来的时间
  var d_day = Date.parse(new Date(dateTime));
  var day = parseInt((d_day - currentTime) / 1000 / 3600 / 24);
  if(day > 0) {
    switch (day) {
      case 0:
        return '今天';
      case 1:
        return '明天'
    }
  }
  
  return '';
}

// 将long类型转化为mm月dd日类型时间
function formatMonthDay(time) {
  var d = new Date(time);
  var day = d.getDate();
  var month = +d.getMonth() + 1;
  var f = month + '月' + day + '日';
  return f;
}

// 将long类型转化为hh:mm类型时间
function formatHourMinute(time) {
  var d = new Date(time);
  var hour = d.getHours();
  var minute = d.getMinutes();
  var f = formatNumber(hour) + ":" + formatNumber(minute);
  return f;
}

// 格式化数字 '*->0*'
function formatNumber(d) {
  return d > 9 ? d : '0' + d;
}

function timeFormat(time) {
  var fDay = formatDay(time);
  if (fDay == '') {
    fDay = formatMonthDay(time);
  }
  var fHM = formatHourMinute(time);

  return fDay + ' ' + fHM;
}

function timeFormatMonthDay(time) {
  // var fDay = formatDay(time);
  // if (fDay == '') {
  //   fDay = formatMonthDay(time);
  // }
  var fHM = formatHourMinute(time);

  return formatMonthDay(time) + ' ' + fHM;
}
/**
 *格式化时间戳为 年月日 时间
 *
 * @param {timeStamp}} time
 * @returns
 */
function timeFormatYearMonthDay(time) {
  const fYear = new Date(time*1000).getFullYear();
  let fDay = formatDay(time);
  if (fDay == '') {
    fDay = formatMonthDay(time);
  }
  const fHM = formatHourMinute(time);

  return fYear + '年' + fDay + ' ' + fHM;
}

// 费用格式化，如：1.00显示为1，1.10显示为1.10，1.01显示为1.01，1.0显示为1，...
function feeFormat(x) {
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  return s;
}

module.exports = {
  timeFormat: timeFormat,
  feeFormat: feeFormat,
  timeFormatMonthDay: timeFormatMonthDay,
  timeFormatYearMonthDay: timeFormatYearMonthDay
}  