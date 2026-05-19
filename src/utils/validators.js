const mongoose = require("mongoose");
const AppError = require("./AppError");

const requireFields = (body, fields) => {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === "");
  if (missing.length) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}.`, 400);
  }
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = { isValidObjectId, requireFields };
