const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/apiResponse");
const {
  initializePayHerePayment,
  updatePaymentStatus,
  verifyPayHereNotification,
} = require("../services/paymentService");
const { requireFields } = require("../utils/validators");

const initializePayHere = asyncHandler(async (req, res) => {
  requireFields(req.body, ["orderId"]);
  const payment = await initializePayHerePayment(req.body.orderId, req.user);

  successResponse(res, {
    message: "PayHere payment initialized.",
    data: { payment },
  });
});

const handlePayHereNotify = asyncHandler(async (req, res) => {
  if (!verifyPayHereNotification(req.body)) {
    throw new AppError("Invalid PayHere notification signature.", 400);
  }

  const order = await updatePaymentStatus({
    orderNumber: req.body.order_id,
    statusCode: req.body.status_code,
  });

  successResponse(res, {
    message: "Payment notification handled.",
    data: { order },
  });
});

const markPaymentSuccess = asyncHandler(async (req, res) => {
  requireFields(req.body, ["orderNumber"]);
  const order = await updatePaymentStatus({
    orderNumber: req.body.orderNumber,
    statusCode: 2,
    user: req.user,
  });

  successResponse(res, { message: "Payment marked as successful.", data: { order } });
});

const markPaymentFailure = asyncHandler(async (req, res) => {
  requireFields(req.body, ["orderNumber"]);
  const order = await updatePaymentStatus({
    orderNumber: req.body.orderNumber,
    statusCode: -1,
    user: req.user,
  });

  successResponse(res, { message: "Payment marked as failed.", data: { order } });
});

module.exports = {
  handlePayHereNotify,
  initializePayHere,
  markPaymentFailure,
  markPaymentSuccess,
};
