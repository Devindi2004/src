const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { initializePayHerePayment, updatePaymentStatus } = require("../services/paymentService");
const { requireFields } = require("../utils/validators");

const initializePayHere = asyncHandler(async (req, res) => {
  requireFields(req.body, ["orderId"]);
  const payment = await initializePayHerePayment(req.body.orderId);

  successResponse(res, {
    message: "PayHere payment initialized.",
    data: { payment },
  });
});

const handlePayHereNotify = asyncHandler(async (req, res) => {
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
  const order = await updatePaymentStatus({
    orderNumber: req.body.orderNumber,
    statusCode: 2,
  });

  successResponse(res, { message: "Payment marked as successful.", data: { order } });
});

const markPaymentFailure = asyncHandler(async (req, res) => {
  const order = await updatePaymentStatus({
    orderNumber: req.body.orderNumber,
    statusCode: -1,
  });

  successResponse(res, { message: "Payment marked as failed.", data: { order } });
});

module.exports = {
  handlePayHereNotify,
  initializePayHere,
  markPaymentFailure,
  markPaymentSuccess,
};
