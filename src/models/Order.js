const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["new", "preparing", "ready", "completed", "cancelled"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    tableNumber: {
      type: String,
      required: [true, "Table number is required."],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, "Order must include at least one item."],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "payhere"],
      default: "cash",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "preparing", "ready", "completed", "cancelled"],
      default: "new",
      index: true,
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    statusHistory: [statusHistorySchema],
    estimatedReadyAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function normalizeOrder(next) {
  if (!this.orderNumber) {
    const { generateOrderNumber } = require("../utils/orderUtils");
    this.orderNumber = generateOrderNumber();
  }

  if (!this.total && this.totalAmount) this.total = this.totalAmount;
  if (!this.totalAmount && this.total) this.totalAmount = this.total;

  if (!this.statusHistory.length) {
    this.statusHistory.push({ status: this.status });
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
