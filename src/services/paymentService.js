const crypto = require("crypto");
const env = require("../config/env");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const { roundMoney } = require("../utils/orderUtils");

const getHashedMerchantSecret = () => {
  if (!env.payhere.merchantId || !env.payhere.merchantSecret) return "";

  return crypto
    .createHash("md5")
    .update(env.payhere.merchantSecret)
    .digest("hex")
    .toUpperCase();
};

const generatePayHereHash = ({ orderId, amount, currency }) => {
  if (!env.payhere.merchantId || !env.payhere.merchantSecret) return "";

  const hashedSecret = getHashedMerchantSecret();

  return crypto
    .createHash("md5")
    .update(`${env.payhere.merchantId}${orderId}${roundMoney(amount).toFixed(2)}${currency}${hashedSecret}`)
    .digest("hex")
    .toUpperCase();
};

const verifyPayHereNotification = (payload) => {
  if (!env.payhere.merchantSecret) return true;

  const localHash = crypto
    .createHash("md5")
    .update(
      `${payload.merchant_id}${payload.order_id}${payload.payhere_amount}${payload.payhere_currency}${payload.status_code}${getHashedMerchantSecret()}`
    )
    .digest("hex")
    .toUpperCase();

  return localHash === String(payload.md5sig || "").toUpperCase();
};

const assertPaymentAccess = (order, user) => {
  if (!user || user.role === "admin") return;
  const customerId = order.customer?._id || order.customer;
  const isOwner = customerId?.toString?.() === user._id.toString();
  if (!isOwner) throw new AppError("You do not have access to this payment.", 403);
};

const initializePayHerePayment = async (orderId, user) => {
  const order = await Order.findById(orderId).populate("customer", "name email phone");
  if (!order) throw new AppError("Order not found.", 404);
  assertPaymentAccess(order, user);

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

const updatePaymentStatus = async ({ orderNumber, statusCode, user = null }) => {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new AppError("Order not found.", 404);
  if (user) assertPaymentAccess(order, user);

  order.paymentStatus = statusCode === "2" || statusCode === 2 ? "paid" : "failed";
  await order.save();
  return order;
};

module.exports = {
  assertPaymentAccess,
  generatePayHereHash,
  initializePayHerePayment,
  updatePaymentStatus,
  verifyPayHereNotification,
};
