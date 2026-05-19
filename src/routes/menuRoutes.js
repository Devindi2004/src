const express = require("express");
const {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  updateMenuItem,
} = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItem);
router.post("/", protect, authorize("admin"), createMenuItem);
router.patch("/:id", protect, authorize("admin"), updateMenuItem);
router.delete("/:id", protect, authorize("admin"), deleteMenuItem);

module.exports = router;
