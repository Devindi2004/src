const express = require("express");
const { createTable, getTables, updateTable } = require("../controllers/tableController");
const { authorize, protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin", "waiter"), getTables);
router.post("/", protect, authorize("admin"), createTable);
router.patch("/:id", protect, authorize("admin", "waiter"), updateTable);

module.exports = router;
