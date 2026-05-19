const Table = require("../models/Table");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getTables = asyncHandler(async (_req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  res.json({ success: true, count: tables.length, tables });
});

const createTable = asyncHandler(async (req, res) => {
  const table = await Table.create(req.body);
  res.status(201).json({ success: true, table });
});

const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!table) throw new AppError("Table not found.", 404);

  res.json({ success: true, table });
});

module.exports = { getTables, createTable, updateTable };
