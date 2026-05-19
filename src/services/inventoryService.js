const InventoryItem = require("../models/InventoryItem");
const { sendSocketEvent } = require("../utils/socketEmitter");

const findLowStockItems = () =>
  InventoryItem.find({ $expr: { $lte: ["$stock", "$threshold"] } }).sort({ stock: 1, itemName: 1 });

const emitInventoryAlertIfNeeded = (item) => {
  if (item.stock <= item.threshold) {
    sendSocketEvent("inventory:alert", { item }, "admin");
    sendSocketEvent("inventory:alert", { item }, "kitchen");
  }
};

module.exports = { emitInventoryAlertIfNeeded, findLowStockItems };
