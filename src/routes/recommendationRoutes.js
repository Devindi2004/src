const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const { optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", optionalAuth, getRecommendations);

module.exports = router;
