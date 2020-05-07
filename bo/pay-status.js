/**
 * 商务车订单付款状态
 *
 * */

const payStatus = {
  OrderPayStatusNoNeed: 0,     //不需要付款
  OrderPayStatusNone: 1,       //未付款
  OrderPayStatusPortion: 2,    //部分付款
  OrderPayStatusOff: 3         //已付款
};
module.exports = {
  payStatus
};