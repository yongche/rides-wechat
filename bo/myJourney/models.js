import { COMMON }  from '../../bo/utils/common.js'
import { timeFormat, feeFormat, timeFormatMonthDay } from './formats.js'

const BusinessOrderStatus = {
  // WAIT_COMFIRM: 1,
  // WAIT_DISTRIBUTE_CAR: 2,     //正在派发车辆
  // ALREADY_DISTRIBUTE_CAR: 3,  //正在派发车辆 ●
  // DRIVER_RECEIVE_ORDER: 4,    //车辆派发成功 ●
  // DRIVER_ARRIVED: 5,          //车辆已到达 ●
  // SERVICE: 6,                 //服务开始
  // END_SERVICE: 7,             //服务结束
  // CANCEL: 8,                  //服务已取消

  OrderStatusDisabled: -1, // 无效
  OrderStatusPrecreate: 0, // 未初始化
  OrderStatusInit: 1, // 等待用户付款/未确认订单
  OrderStatusReassign: 2, // 改派订单
  OrderStatusWaitDriverConfirm: 3, // 等待司机确认()
  OrderStatusServiceReady: 4, // 司机已确认
  OrderStatusDriverArrived: 5, // 司机已到达
  OrderStatusServiceStart: 6, // 服务开始（服务中）
  OrderStatusServiceEnd: 7, // 服务结束
  OrderStatusCancelled: 8, // 订单取消
  OrderStatusServiceSuc: 9, // 预订成功
  OrderStatusServiceWaiting: 10 // 等待服务
};

const BusinessAbnormalOrderStatus = {
  OrderAbnormalHandled: -1, // 异常已经处理
  OrderAbnormalNormal: 0, // 正常状态
  OrderAbnormalSys: 1, // 系统疑义
  OrderAbnormalUser: 2, // 用户疑义
  OrderAbnormalAdmin: 3 // 后台操作人员设置的异常 (系统疑义)
};

var JourneyModels = {

  PageItem: {
    proto: {
      showTravelState: false,
      isDoubt: false,
      travelState: '易到开放平台',
      feePayed: '-',
      showCancel: false,
      isCompanyAccount: false,
      showTopTitle: false,
      dateTime: '-',
      showPassenger: false,
      passengerInfo: '-',
      showProblemTips: false,
      problemTips: '-',
      showBottomTitle: false,
      bottomTitle: '-',
      showBottomTitleRight: false,
      bottomTitleRight: '-',
      showAddress: false,
      startAddress: '-',
      endAddress: '-',
      stateDesc: '-',
      showFeePaying: false,
      feePaying: '-'
    },
    new: function() {
      return COMMON.deepClone(JourneyModels.PageItem.proto);
    },
  },

  setTimeAndPassenger: function (pageItem, entity, expect_start_time) {
    var phone = entity.passengerPhone;
    let userInfo = null;
    if (!COMMON.isEmpty(entity.passengerPhone) && userInfo != null &&
      phone !== userInfo.cellphone) { // 非本人乘车
      pageItem.showTopTitle = true;
      pageItem.dateTime = expect_start_time;
      pageItem.showPassenger = true;
      var name = entity.passengerName.lenth <= 5 ? entity.passengerName : entity.passengerName.substr(0,5) + '...';
      pageItem.passengerInfo = name + "乘车";
    } else {
      if (!(entity.productTypeId == 17)) {
        pageItem.showTopTitle = true;
        pageItem.dateTime = expect_start_time;
      }
    }
  },

  newUnfinishedPageItem: function(entity) {
    var pageItem = JourneyModels.PageItem.new();

    var car_brand = entity.carBrand; // 车型 奥迪黑
    var color = entity.carColor;
    var carBrandAndColor;
    if (entity.isTaxi == 1) {
      carBrandAndColor = "出租车";
    } else {
      carBrandAndColor = car_brand + (COMMON.isEmpty(color) ? "" : "(" + color + ")");
    }
    var vehicle_number = entity.vehicleNumber; // 车牌
    var pay_status = entity.payStatus; // 是否需要支付 1需要全部,2需要部分,0不需要
    var pay_amount = entity.payAmount; // 还需支付金额

    var expect_start_time = timeFormat(entity.expectStartTime*1000); // 期望开始时间，暂不考虑时区[TODO]
    var expect_start_time_MD = timeFormatMonthDay(entity.expectStartTime * 1000)

    switch (entity.status) {
      case BusinessOrderStatus.OrderStatusDisabled: // 无效
      case BusinessOrderStatus.OrderStatusPrecreate:
      case BusinessOrderStatus.OrderStatusInit:
        pageItem.showTravelState = true;
        // pageItem.showTopTitle = true;
        // pageItem.dateTime = expect_start_time;
        pageItem.showAddress = true;
        pageItem.startAddress = entity.startPosition;
        pageItem.endAddress = entity.endPosition;
        break;
      case BusinessOrderStatus.OrderStatusReassign:
        pageItem.showTravelState = true;
        pageItem.travelState = '正在改派';
        pageItem.showTopTitle = true;
        pageItem.dateTime = expect_start_time_MD;
        pageItem.stateDesc = '正在为您调派其他司机';
        break;
      case BusinessOrderStatus.OrderStatusWaitDriverConfirm:
        pageItem.showTravelState = true;
        pageItem.showTopTitle = true;
        pageItem.dateTime = expect_start_time_MD;
        var driver_id = entity.driverId;
        if (driver_id == 0) {
          pageItem.travelState = '正在派车';
          pageItem.stateDesc = '正在派车，请稍候...';
        } else {
          pageItem.travelState = '等待确认';
          pageItem.stateDesc = '等待乘客确认订单';
        }
        break;
      case BusinessOrderStatus.OrderStatusServiceReady:
        var serviceStatus = "";
        var is_departed = entity.isDeparted == 1;
        if (!is_departed) { // 司机未出发就是预定成功
          if (entity.productTypeId == 17) {
            serviceStatus = "司机出发";
          } else {
            serviceStatus = "预订成功";
          }
        } else {
          serviceStatus = "司机出发";
        }
        pageItem.showTravelState = true;
        pageItem.travelState = serviceStatus;
        
        // pageItem.showTopTitle = true;
        // pageItem.dateTime = expect_start_time;

        JourneyModels.setTimeAndPassenger(pageItem, entity, expect_start_time);

        pageItem.showBottomTitle = true;
        pageItem.bottomTitle = carBrandAndColor;
        pageItem.showBottomTitleRight = true;
        pageItem.bottomTitleRight = vehicle_number;
        pageItem.showAddress = true;
        pageItem.startAddress = entity.startPosition;
        pageItem.endAddress = entity.endPosition;
        break;
      case BusinessOrderStatus.OrderStatusDriverArrived:
        pageItem.showTravelState = true;
        pageItem.travelState = '司机到达';

        // pageItem.showTopTitle = true;
        // pageItem.dateTime = expect_start_time;

        JourneyModels.setTimeAndPassenger(pageItem, entity, expect_start_time);

        pageItem.showBottomTitle = true;
        pageItem.bottomTitle = carBrandAndColor;
        pageItem.showBottomTitleRight = true;
        pageItem.bottomTitleRight = vehicle_number;
        pageItem.showAddress = true;
        pageItem.startAddress = entity.startPosition;
        pageItem.endAddress = entity.endPosition;
        break;
      case BusinessOrderStatus.OrderStatusServiceStart:
        pageItem.showTravelState = true;
        pageItem.travelState = '行程开始';

        // pageItem.showTopTitle = true;
        // pageItem.dateTime = expect_start_time;

        JourneyModels.setTimeAndPassenger(pageItem, entity, expect_start_time);

        pageItem.showBottomTitle = true;
        pageItem.bottomTitle = carBrandAndColor;
        pageItem.showBottomTitleRight = true;
        pageItem.bottomTitleRight = vehicle_number;
        pageItem.showAddress = true;
        pageItem.startAddress = entity.startPosition;
        pageItem.endAddress = entity.endPosition;
        break;
      case BusinessOrderStatus.OrderStatusServiceEnd: // 行程结束
        // OrderAbnormalNormal = 0, // 正常状态
        // OrderAbnormalSys = 1, // 系统疑议
        // OrderAbnormalUser = 2, // 用户疑议
        // OrderAbnormalAdmin = 3; // 后台操作人员设置的异常 (系统疑议)
        var abnormal = "";
        switch (entity.abnormalMark) {
          case -1: // 疑议已经处理 没有break
          case BusinessAbnormalOrderStatus.OrderAbnormalNormal: // 没有疑议
            pageItem.showTravelState = true;
            pageItem.travelState = '行程结束';
            // pageItem.showTopTitle = true;
            // pageItem.dateTime = expect_start_time_MD;
            var is_fee_computed = 1; // 司机是否确认账单
            if (!is_fee_computed) { // 司机未确认账单
              pageItem.showBottomTitle = true;
              pageItem.bottomTitle = '账单确认中，请稍候...';
              pageItem.showAddress = true;
              pageItem.startAddress = entity.startPosition;
              pageItem.endAddress = entity.endPosition;
            } else {
              if (pay_status == 1 || pay_status == 2) { // 需要支付或者需要部分支付
                pageItem.showTopTitle = true;
                pageItem.dateTime = expect_start_time_MD;
                pageItem.stateDesc = '需支付';
                pageItem.showFeePaying = true;
                pageItem.feePaying = feeFormat(pay_amount);
              } else {
                pageItem.showTopTitle = true;
                pageItem.dateTime = expect_start_time_MD;
                pageItem.showProblemTips = true;
                pageItem.problemTips = '问题已处理';
                pageItem.showBottomTitle = true;
                pageItem.bottomTitle = carBrandAndColor;
                pageItem.showBottomTitleRight = true;
                pageItem.bottomTitleRight = vehicle_number;
                pageItem.showAddress = true;
                pageItem.startAddress = entity.startPosition;
                pageItem.endAddress = entity.endPosition;
              }
            }
            break;
          case BusinessAbnormalOrderStatus.OrderAbnormalSys:
            pageItem.showTravelState = true;
            pageItem.isDoubt = true;
            pageItem.travelState = '系统疑议';
            pageItem.showTopTitle = true;
            pageItem.dateTime = timeFormatMonthDay(entity.startTime*1000);
            pageItem.showBottomTitle = true;
            pageItem.bottomTitle = '账单疑问正在核实中...';
            pageItem.showAddress = true;
            pageItem.startAddress = entity.startPosition;
            pageItem.endAddress = entity.endPosition;
            break;
          case BusinessAbnormalOrderStatus.OrderAbnormalUser: // 用户疑议
            pageItem.showTravelState = true;
            pageItem.isDoubt = true;
            pageItem.travelState = '费用疑问';
            pageItem.showTopTitle = true;
            pageItem.dateTime = timeFormatMonthDay(entity.startTime*1000);
            pageItem.showBottomTitle = true;
            pageItem.bottomTitle = '账单疑议正在核查中...';
            pageItem.showAddress = true;
            pageItem.startAddress = entity.startPosition;
            pageItem.endAddress = entity.endPosition;
            break;
          case BusinessAbnormalOrderStatus.OrderAbnormalAdmin:
            pageItem.showTravelState = true;
            pageItem.travelState = '行程结束';
            pageItem.showTopTitle = true;
            pageItem.dateTime = expect_start_time;
            pageItem.stateDesc = '正在计算账单费用';

            // TODO (歧义)有产品或UI确定展示样式
            // pageItem.showTravelState = true;
            // pageItem.travelState = '行程结束';
            // pageItem.showTopTitle = true;
            // pageItem.dateTime = timeFormatMonthDay(entity.expectStartTime*1000);
            // pageItem.showBottomTitle = true;
            // pageItem.bottomTitle = '正在计算账单费用...';
            // pageItem.showAddress = true;
            // pageItem.startAddress = entity.startPosition;
            // pageItem.endAddress = entity.endPosition;
            break;
          default:
            break;
        }
        break;
      case BusinessOrderStatus.OrderStatusCancelled:
        pageItem.showTravelState = true;
        pageItem.travelState = '行程取消';
        pageItem.showTopTitle = true;
        pageItem.dateTime = expect_start_time_MD;
        var userInfo = null;
        var phone = entity.passengerPhone;
        if (!COMMON.isEmpty(entity.passengerPhone) && userInfo != null &&
          phone !== userInfo.cellphone) { // 非本人乘车
          pageItem.showPassenger = true;
          var name = entity.passengerName.lenth <= 5 ? entity.passengerName : entity.passengerName.substr(0, 5) + '...';          pageItem.passengerInfo = name + "乘车";
        }
        if ((pay_status == 1 || pay_status == 2) && pay_amount > 0) { // 需要支付或者需要部分支付
          pageItem.stateDesc = '需支付取消费';
          pageItem.showFeePaying = true;
          pageItem.feePaying = feeFormat(pay_amount);
        } else {
          pageItem.showAddress = true;
          pageItem.startAddress = entity.startPosition;
          pageItem.endAddress = entity.endPosition;
        }
        break;
      case BusinessOrderStatus.OrderStatusServiceWaiting:
        pageItem.showTravelState = true;
        pageItem.showTopTitle = true;
        pageItem.dateTime = expect_start_time;
        pageItem.showAddress = true;
        pageItem.startAddress = entity.startPosition;
        pageItem.endAddress = entity.endPosition;
        break;
      default:
        break;
    }
    return pageItem;
  },

  newHistoryPageItem: function(entity) {
    var pageItem = JourneyModels.PageItem.new();

    var startTime = timeFormatMonthDay(entity.expectStartTime*1000); // 期望开始时间，暂不考虑时区[TODO]

    if (entity.status !== BusinessOrderStatus.OrderStatusCancelled) { // 取消订单; 显示开始时间，暂不考虑时区[TODO]
      startTime = timeFormatMonthDay(entity.startTime*1000);
    }

    if (entity.status == BusinessOrderStatus.OrderStatusServiceEnd && entity.abnormalMark == -1) {
      pageItem.showProblemTips = true;
      pageItem.problemTips = '问题已处理';
    }

    console.log('corporate_id', entity.corporateId)

    pageItem.isCompanyAccount = entity.corporateId > 0;

    pageItem.showTopTitle = true;
    pageItem.dateTime = startTime;

    var userInfo = null;
    var phone = entity.passengerPhone;
    if (!COMMON.isEmpty(entity.passengerPhone) && userInfo != null &&
      phone !== userInfo.cellphone) { // 非本人乘车
      pageItem.showPassenger = true;
      var name = entity.passengerName.lenth <= 5 ? entity.passengerName : entity.passengerName.substr(0, 5) + '...';      pageItem.passengerInfo = name + "乘车";
    }

    if (entity.businessType == 60) {
      pageItem.feePayed = entity.totalAmount;
    } else if (entity.businessType == 70) {
      pageItem.showTravelState = true;
      pageItem.isHistoryDone = true;
      pageItem.travelState = '行程结束';
    } else {
      var floatAmount = entity.totalAmount;
      var historyMoney = floatAmount >= 0 ? feeFormat(floatAmount) : "    ";
      pageItem.feePayed = historyMoney;
      if (entity.abnormalMark == -1) {
        if (!COMMON.isEmpty(entity.abnormalDesc)) {
          // holder.btn_order_history_payment.setText(entity.abnormalDesc);
          // holder.btn_order_history_payment.setTextColor(Color.parseColor("#888888"));
          // holder.btn_order_history_payment.setVisibility(View.VISIBLE);
        }
      } else if (entity.status == BusinessOrderStatus.OrderStatusCancelled) {
        pageItem.showCancel = true;
      }
    }
    pageItem.showAddress = true;
    pageItem.startAddress = entity.startPosition;
    pageItem.endAddress = entity.endPosition;
    return pageItem;
  }
};

module.exports = {
  JourneyModels: JourneyModels,
  BusinessOrderStatus: BusinessOrderStatus,
  BusinessAbnormalOrderStatus: BusinessAbnormalOrderStatus
}