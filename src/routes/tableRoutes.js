const express = require("express");
const { createTable, getTables, updateTable } = require("../controllers/tableController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin", "kitchen"), getTables);
router.post("/", protect, authorize("admin"), createTable);
router.patch("/:id", protect, authorize("admin"), updateTable);

module.exports = router;
