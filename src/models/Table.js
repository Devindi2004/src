const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "cleaning"],
      default: "available",
      index: true,
    },
    section: {
      type: String,
      default: "main",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
