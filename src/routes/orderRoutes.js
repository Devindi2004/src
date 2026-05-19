const express = require("express");
const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { optionalAuth, protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, authorize("admin", "kitchen"), updateOrderStatus);

module.exports = router;
