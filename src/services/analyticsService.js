const InventoryItem = require("../models/InventoryItem");
const Order = require("../models/Order");

const getAnalyticsOverview = async () => {
  const [summary] = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  const topSellingFoods = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItem",
        name: { $first: "$items.name" },
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 8 },
  ]);

  const chartData = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const [recentOrders, lowStockAlerts] = await Promise.all([
    Order.find().populate("customer", "name email").sort({ createdAt: -1 }).limit(10),
    InventoryItem.find({ $expr: { $lte: ["$stock", "$threshold"] } }).sort({ stock: 1 }).limit(10),
  ]);

  return {
    revenue: Number((summary?.revenue || 0).toFixed(2)),
    totalOrders: summary?.totalOrders || 0,
    averageOrderValue: Number((summary?.averageOrderValue || 0).toFixed(2)),
    topSellingFoods,
    recentOrders,
    lowStockAlerts,
    chartData: chartData.map((point) => ({
      date: point._id,
      revenue: Number(point.revenue.toFixed(2)),
      orders: point.orders,
    })),
  };
};

module.exports = { getAnalyticsOverview };
