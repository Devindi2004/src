const InventoryItem = require("../models/InventoryItem");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { emitInventoryAlert } = require("../socket");

const getAnalytics = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [salesByDay, popularItems, totals, lowStockItems] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]),
    InventoryItem.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }).sort({ stock: 1 }),
  ]);

  res.json({
    success: true,
    analytics: {
      salesByDay: salesByDay.map((day) => ({ date: day._id, revenue: day.revenue, orders: day.orders })),
      popularItems,
      totals: totals[0] || { revenue: 0, orders: 0, averageOrderValue: 0 },
      lowStockItems,
    },
  });
});

const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const updateUser = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "role", "isActive", "loyaltyPoints", "preferences"];
  const data = {};

  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) data[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({ success: true, user });
});

const getInventory = asyncHandler(async (_req, res) => {
  const items = await InventoryItem.find().sort({ name: 1 });
  res.json({ success: true, count: items.length, items });
});

const upsertInventoryItem = asyncHandler(async (req, res) => {
  const item = req.params.id
    ? await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    : await InventoryItem.create(req.body);

  if (item.stock <= item.lowStockThreshold) emitInventoryAlert(item);

  res.status(req.params.id ? 200 : 201).json({ success: true, item });
});

const getAdminMenu = asyncHandler(async (_req, res) => {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  res.json({ success: true, count: items.length, items });
});

module.exports = {
  getAnalytics,
  getUsers,
  updateUser,
  getInventory,
  upsertInventoryItem,
  getAdminMenu,
};
