const express = require("express");
const analyticsRoutes = require("./analyticsRoutes");
const authRoutes = require("./authRoutes");
const inventoryRoutes = require("./inventoryRoutes");
const menuRoutes = require("./menuRoutes");
const orderRoutes = require("./orderRoutes");
const paymentRoutes = require("./paymentRoutes");
const recommendationRoutes = require("./recommendationRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/payments", paymentRoutes);
router.use("/recommendations", recommendationRoutes);

module.exports = router;
