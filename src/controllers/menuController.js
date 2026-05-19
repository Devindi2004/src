const MenuItem = require("../models/MenuItem");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { findMenuItemOrFail, getPaginatedMenu } = require("../services/menuService");

const getMenuItems = asyncHandler(async (req, res) => {
  const { items, meta } = await getPaginatedMenu(req.query);
  successResponse(res, {
    message: "Menu items fetched.",
    data: { count: items.length, items },
    meta,
  });
});

const getMenuItem = asyncHandler(async (req, res) => {
  const item = await findMenuItemOrFail(req.params.id);
  successResponse(res, { message: "Menu item fetched.", data: { item } });
});

const createMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  successResponse(res, {
    statusCode: 201,
    message: "Menu item created.",
    data: { item },
  });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new AppError("Menu item not found.", 404);

  successResponse(res, { message: "Menu item updated.", data: { item } });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError("Menu item not found.", 404);

  successResponse(res, { message: "Menu item deleted.", data: { itemId: req.params.id } });
});

module.exports = {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  updateMenuItem,
};
