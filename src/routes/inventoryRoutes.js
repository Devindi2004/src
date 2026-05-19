const express = require("express");
const {
  createInventoryItem,
  getInventory,
  getInventoryAlerts,
  updateInventoryItem,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, authorize("admin", "kitchen"));

router.get("/", getInventory);
router.get("/alerts", getInventoryAlerts);
router.post("/", authorize("admin"), createInventoryItem);
router.patch("/:id", authorize("admin"), updateInventoryItem);

module.exports = router;
