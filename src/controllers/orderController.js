const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { createOrderFromPayload, updateOrderStatusById } = require("../services/orderService");
const { requireFields } = require("../utils/validators");

const createOrder = asyncHandler(async (req, res) => {
  requireFields(req.body, ["tableNumber", "items"]);
  const order = await createOrderFromPayload(req.body, req.user);

  successResponse(res, {
    statusCode: 201,
    message: "Order created.",
    data: { order },
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const { status, tableNumber, mine } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (tableNumber) filter.tableNumber = tableNumber;
  if (mine === "true" && req.user?.role === "customer") filter.customer = req.user._id;
  if (req.user?.role === "customer" && mine !== "false") filter.customer = req.user._id;
  if (req.user?.role === "customer" && mine === "false") {
    throw new AppError("Customers can only view their own orders.", 403);
  }

  const orders = await Order.find(filter)
    .populate("customer", "name email phone")
    .populate("items.menuItem", "image category")
    .sort({ createdAt: -1 });

  successResponse(res, {
    message: "Orders fetched.",
    data: { count: orders.length, orders },
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate("customer", "name email phone")
    .populate("items.menuItem", "image category")
    .sort({ createdAt: -1 });

  successResponse(res, {
    message: "My orders fetched.",
    data: { count: orders.length, orders },
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name email phone")
    .populate("items.menuItem", "image category");

  if (!order) throw new AppError("Order not found.", 404);

  const isOwner = order.customer?._id?.toString() === req.user?._id?.toString();
  const isStaff = ["admin", "kitchen"].includes(req.user?.role);

  if (!isOwner && !isStaff) {
    throw new AppError("You do not have access to this order.", 403);
  }

  successResponse(res, { message: "Order fetched.", data: { order } });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  requireFields(req.body, ["status"]);
  const order = await updateOrderStatusById(req.params.id, req.body.status, req.user);

  successResponse(res, { message: "Order status updated.", data: { order } });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
