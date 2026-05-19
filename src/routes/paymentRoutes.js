const express = require("express");
const {
  handlePayHereNotify,
  initializePayHere,
  markPaymentFailure,
  markPaymentSuccess,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/payhere/init", protect, initializePayHere);
router.post("/payhere/notify", handlePayHereNotify);
router.post("/success", protect, markPaymentSuccess);
router.post("/failure", protect, markPaymentFailure);

module.exports = router;
