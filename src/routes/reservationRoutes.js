const express = require("express");
const {
  createReservation,
  getReservations,
  updateReservation,
} = require("../controllers/reservationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("customer", "admin"), createReservation);
router.get("/", protect, authorize("customer", "admin", "kitchen"), getReservations);
router.patch("/:id", protect, authorize("customer", "admin", "kitchen"), updateReservation);

module.exports = router;
