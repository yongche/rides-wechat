let orderStatus = {
  orderStatusDisabled: -1,       // 无效
  orderStatusPrecreate: 0,        // 未初始化
  orderStatusInit: 1,        // 等待用户付款/未确认订单
  orderStatusWaitForCar: 2,        // 等待选择车辆,正在改派
  orderStatusWaitDriverConfirm: 3,        // 等待司机确认() 派单中  行程列表中该状态出现场景：派单中，app杀死，重新打开app，订单列表中可以看到
  orderStatusServiceReady: 4,        // 司机已确认
  orderStatusDriverArrived: 5,        // 司机已到达
  orderStatusServiceStart: 6,        // 服务开始（服务中）
  orderStatusServiceEnd: 7,        // 服务结束
  orderStatusCancelled: 8,        // 订单取消
  orderStatusServiceSuc: 9,        // 预订成功
  orderStatusServiceWaiting: 10        // 等待服务
};
let orderStatusTips = {
  '-1':'无效',
  '0':'未初始化',
  '1':'等待用户付款/未确认订单',
  '2':'等待选择车辆',
  '3':'等待司机确认',
  '4':'司机出发',
  '5':'司机已到达',
  '6':'服务开始',
  '7':'服务结束',
  '8':'订单取消',
  '9':'预订成功',
  '10':'等待服务',
};
module.exports = {orderStatus,orderStatusTips};