const express = require("express");
const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAnalytics);

module.exports = router;
