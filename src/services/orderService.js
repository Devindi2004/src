const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { calculateOrderTotals } = require("../utils/orderUtils");
const { sendSocketEvent } = require("../utils/socketEmitter");

const ORDER_STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];

const hydrateOrderItems = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AppError("Order items are required.", 400);
  }

  const ids = cartItems.map((item) => item.menuItem || item.menuItemId || item.id);
  const menuItems = await MenuItem.find({
    _id: { $in: ids },
    isAvailable: true,
    inventoryStatus: { $ne: "out-of-stock" },
  });
  const menuMap = new Map(menuItems.map((item) => [item._id.toString(), item]));

  return cartItems.map((cartItem) => {
    const id = cartItem.menuItem || cartItem.menuItemId || cartItem.id;
    const menuItem = menuMap.get(String(id));

    if (!menuItem) {
      throw new AppError("One or more menu items are unavailable.", 400);
    }

    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: Math.max(Number(cartItem.quantity || 1), 1),
      specialInstructions: cartItem.specialInstructions || "",
    };
  });
};

const createOrderFromPayload = async (payload, user) => {
  const items = await hydrateOrderItems(payload.items);
  const totals = calculateOrderTotals(items);
  const menuItems = await MenuItem.find({ _id: { $in: items.map((item) => item.menuItem) } });
  const maxPrep = menuItems.reduce((max, item) => Math.max(max, item.prepTime || 15), 15);

  const order = await Order.create({
    customer: user?.role === "customer" ? user._id : payload.customer || null,
    tableNumber: payload.tableNumber,
    items,
    ...totals,
    paymentMethod: payload.paymentMethod || "cash",
    paymentStatus: "pending",
    specialInstructions: payload.specialInstructions || "",
    estimatedReadyAt: new Date(Date.now() + maxPrep * 60 * 1000),
  });

  await MenuItem.updateMany(
    { _id: { $in: items.map((item) => item.menuItem) } },
    { $inc: { popularityScore: 1 } }
  );

  if (order.customer) {
    await User.findByIdAndUpdate(order.customer, {
      $inc: { loyaltyPoints: Math.floor(order.totalAmount) },
    });
  }

  emitOrderEvents(order, "order:new");
  return order;
};

const emitOrderEvents = (order, primaryEvent = "order:update") => {
  const payload = { order };
  sendSocketEvent(primaryEvent, payload, "kitchen");
  sendSocketEvent(primaryEvent, payload, "admin");
  sendSocketEvent("kitchen:update", payload, "kitchen");
  sendSocketEvent("order:update", payload, `order:${order._id}`);
  if (order.customer) sendSocketEvent("order:update", payload, `customer:${order.customer}`);
};

const updateOrderStatusById = async (orderId, status, user) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new AppError("Invalid order status.", 400);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found.", 404);

  order.status = status;
  order.statusHistory.push({ status, changedBy: user?._id || null });
  await order.save();

  emitOrderEvents(order, "order:update");
  return order;
};

module.exports = {
  ORDER_STATUSES,
  createOrderFromPayload,
  emitOrderEvents,
  hydrateOrderItems,
  updateOrderStatusById,
};
