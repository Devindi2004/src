const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Inventory item name is required."],
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required."],
      min: 0,
    },
    threshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "l", "ml", "pcs", "pack", "box", "bottle"],
      default: "pcs",
    },
    supplier: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

inventoryItemSchema.virtual("isLowStock").get(function isLowStock() {
  return this.stock <= this.threshold;
});

inventoryItemSchema.pre("validate", function syncAliases(next) {
  if (!this.name && this.itemName) this.name = this.itemName;
  if (!this.itemName && this.name) this.itemName = this.name;
  if (this.threshold === undefined || this.threshold === null) {
    this.threshold = this.lowStockThreshold || 10;
  }
  if (this.lowStockThreshold === undefined || this.lowStockThreshold === null) {
    this.lowStockThreshold = this.threshold;
  }
  next();
});

inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
