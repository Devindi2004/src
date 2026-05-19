const env = require("../config/env");

const roundMoney = (value) => Number((Math.round((Number(value) || 0) * 100) / 100).toFixed(2));

const generateOrderNumber = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DF-${stamp}-${Date.now().toString(36).toUpperCase()}-${random}`;
};

const calculateOrderTotals = (items) => {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
  );
  const serviceCharge = roundMoney(subtotal * env.serviceChargeRate);
  const tax = roundMoney(subtotal * env.taxRate);
  const totalAmount = roundMoney(subtotal + serviceCharge + tax);

  return { subtotal, serviceCharge, tax, totalAmount };
};

module.exports = { calculateOrderTotals, generateOrderNumber, roundMoney };
