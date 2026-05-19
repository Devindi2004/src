const crypto = require("crypto");
const env = require("../config/env");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const { roundMoney } = require("../utils/orderUtils");

const generatePayHereHash = ({ orderId, amount, currency }) => {
  if (!env.payhere.merchantId || !env.payhere.merchantSecret) return "";

  const hashedSecret = crypto
    .createHash("md5")
    .update(env.payhere.merchantSecret)
    .digest("hex")
    .toUpperCase();

  return crypto
    .createHash("md5")
    .update(`${env.payhere.merchantId}${orderId}${roundMoney(amount).toFixed(2)}${currency}${hashedSecret}`)
    .digest("hex")
    .toUpperCase();
};

const initializePayHerePayment = async (orderId) => {
  const order = await Order.findById(orderId).populate("customer", "name email phone");
  if (!order) throw new AppError("Order not found.", 404);

  const amount = roundMoney(order.totalAmount);
  const currency = env.payhere.currency;

  return {
    merchant_id: env.payhere.merchantId,
    return_url: env.payhere.returnUrl,
    cancel_url: env.payhere.cancelUrl,
    notify_url: env.payhere.notifyUrl,
    order_id: order.orderNumber,
    items: `DineFlow order ${order.orderNumber}`,
    currency,
    amount: amount.toFixed(2),
    first_name: order.customer?.name || "DineFlow",
    last_name: "Customer",
    email: order.customer?.email || "",
    phone: order.customer?.phone || "",
    address: "",
    city: "",
    country: "Sri Lanka",
    hash: generatePayHereHash({ orderId: order.orderNumber, amount, currency }),
  };
};

const updatePaymentStatus = async ({ orderNumber, statusCode }) => {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new AppError("Order not found.", 404);

  order.paymentStatus = statusCode === "2" || statusCode === 2 ? "paid" : "failed";
  await order.save();
  return order;
};

module.exports = { generatePayHereHash, initializePayHerePayment, updatePaymentStatus };
