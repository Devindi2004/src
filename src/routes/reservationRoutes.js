const express = require("express");
const {
  createReservation,
  getReservations,
  updateReservation,
} = require("../controllers/reservationController");
const { authorize, protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("customer", "waiter", "admin"), createReservation);
router.get("/", protect, authorize("admin", "waiter"), getReservations);
router.patch("/:id", protect, authorize("admin", "waiter"), updateReservation);

module.exports = router;
