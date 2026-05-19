const InventoryItem = require("../models/InventoryItem");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/apiResponse");
const { emitInventoryAlertIfNeeded, findLowStockItems } = require("../services/inventoryService");

const getInventory = asyncHandler(async (_req, res) => {
  const items = await InventoryItem.find().sort({ itemName: 1 });
  successResponse(res, {
    message: "Inventory fetched.",
    data: { count: items.length, items },
  });
});

const getInventoryAlerts = asyncHandler(async (_req, res) => {
  const items = await findLowStockItems();
  successResponse(res, {
    message: "Low stock alerts fetched.",
    data: { count: items.length, items },
  });
});

const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.create(req.body);
  emitInventoryAlertIfNeeded(item);

  successResponse(res, {
    statusCode: 201,
    message: "Inventory item created.",
    data: { item },
  });
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new AppError("Inventory item not found.", 404);

  emitInventoryAlertIfNeeded(item);
  successResponse(res, { message: "Inventory item updated.", data: { item } });
});

module.exports = {
  createInventoryItem,
  getInventory,
  getInventoryAlerts,
  updateInventoryItem,
};
