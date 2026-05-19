const Table = require("../models/Table");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");

const getTables = asyncHandler(async (_req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  successResponse(res, {
    message: "Tables fetched.",
    data: { count: tables.length, tables },
  });
});

const createTable = asyncHandler(async (req, res) => {
  const table = await Table.create(req.body);
  successResponse(res, {
    statusCode: 201,
    message: "Table created.",
    data: { table },
  });
});

const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!table) throw new AppError("Table not found.", 404);

  successResponse(res, {
    message: "Table updated.",
    data: { table },
  });
});

module.exports = { createTable, getTables, updateTable };
