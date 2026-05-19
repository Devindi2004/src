const dotenv = require("dotenv");

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dineflow",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  serviceChargeRate: parseNumber(process.env.SERVICE_CHARGE_RATE, 0.1),
  taxRate: parseNumber(process.env.TAX_RATE, 0.05),
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || "",
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "",
    currency: process.env.PAYHERE_CURRENCY || "LKR",
    returnUrl: process.env.PAYHERE_RETURN_URL || "http://localhost:3000/payment/success",
    cancelUrl: process.env.PAYHERE_CANCEL_URL || "http://localhost:3000/payment/cancel",
    notifyUrl:
      process.env.PAYHERE_NOTIFY_URL ||
      "http://localhost:5000/api/v1/payments/payhere/notify",
  },
};

module.exports = env;
