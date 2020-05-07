let orderCancelType = {
  orderCancelForPermission: 1001,        //用户在允许的时间范围以内取消订单
  orderCancelForDriver: 1002,            //由于司机原因取消订单
  orderCancelForChance: 1003,            //用户有取消的订单的机会
  orderCancelForLastChance: 1004,        //用户最后一次取消订单的机会
  orderCancelForPay: 1005,               //用户取消订单需要付款
  orderCancelForReDispatch: 1006,        //改派的订单取消  不扣费
  orderCancelForEnterpriseAccount: 1007, //企业账户的订单的取消
};
module.exports = { orderCancelType }