const InventoryItem = require("../models/InventoryItem");
const { emitToRooms } = require("../utils/socketEmitter");

const findLowStockItems = () =>
  InventoryItem.find({ $expr: { $lte: ["$stock", "$threshold"] } }).sort({ stock: 1, itemName: 1 });

const emitInventoryAlertIfNeeded = (item) => {
  if (item.stock <= item.threshold) {
    emitToRooms(["inventory-alert", "inventory:alert"], { item }, ["admin", "kitchen"]);
  }
};

const decrementInventoryForMenuItems = async (orderItems) => {
  const MenuItem = require("../models/MenuItem");

  const menuItems = await MenuItem.find({ _id: { $in: orderItems.map((item) => item.menuItem) } })
    .select("inventoryItem")
    .lean();
  const inventoryMap = new Map(menuItems.map((item) => [item._id.toString(), item.inventoryItem]));

  const updatedItems = [];
  for (const orderItem of orderItems) {
    const inventoryItemId = inventoryMap.get(orderItem.menuItem.toString());
    if (!inventoryItemId) continue;
    const quantity = Math.max(Number(orderItem.quantity) || 1, 1);

    const updated = await InventoryItem.findOneAndUpdate(
      { _id: inventoryItemId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, runValidators: true }
    );

    if (updated) {
      updatedItems.push(updated);
      emitInventoryAlertIfNeeded(updated);
    }
  }

  return updatedItems;
};

module.exports = { decrementInventoryForMenuItems, emitInventoryAlertIfNeeded, findLowStockItems };
