const MenuItem = require("../models/MenuItem");
const AppError = require("../utils/AppError");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildMenuQuery = ({ category, search, featured, inventoryStatus, available = "true" }) => {
  const filter = {};

  if (category) filter.category = category;
  if (featured !== undefined) filter.featured = featured === "true";
  if (inventoryStatus) filter.inventoryStatus = inventoryStatus;
  if (available !== "all") filter.isAvailable = available === "true";

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { name: new RegExp(safeSearch, "i") },
      { description: new RegExp(safeSearch, "i") },
      { category: new RegExp(safeSearch, "i") },
      { tags: new RegExp(safeSearch, "i") },
    ];
  }

  return filter;
};

const getPaginatedMenu = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;
  const filter = buildMenuQuery(query);

  const [items, total] = await Promise.all([
    MenuItem.find(filter).sort({ featured: -1, popularityScore: -1, name: 1 }).skip(skip).limit(limit),
    MenuItem.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const findMenuItemOrFail = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError("Menu item not found.", 404);
  return item;
};

module.exports = { findMenuItemOrFail, getPaginatedMenu };
