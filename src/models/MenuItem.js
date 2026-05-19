const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required."],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      maxlength: 700,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    dietaryTags: [{ type: String, trim: true, lowercase: true }],
    spiceLevel: {
      type: String,
      enum: ["none", "mild", "medium", "hot", "extra-hot"],
      default: "medium",
    },
    prepTime: {
      type: Number,
      default: 15,
      min: 1,
    },
    prepTimeMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    popularityScore: {
      type: Number,
      default: 0,
      index: true,
    },
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      default: null,
    },
    inventoryStatus: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

menuItemSchema.pre("validate", function syncAliases(next) {
  if (!this.imageUrl && this.image) this.imageUrl = this.image;
  if (!this.image && this.imageUrl) this.image = this.imageUrl;
  if (!this.prepTime && this.prepTimeMinutes) this.prepTime = this.prepTimeMinutes;
  if (!this.prepTimeMinutes && this.prepTime) this.prepTimeMinutes = this.prepTime;
  next();
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
