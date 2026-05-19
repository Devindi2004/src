const express = require("express");
const {
  getAdminMenu,
  getAnalytics,
  getInventory,
  getUsers,
  updateUser,
  upsertInventoryItem,
} = require("../controllers/adminController");
const { authorize, protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.get("/inventory", getInventory);
router.post("/inventory", upsertInventoryItem);
router.patch("/inventory/:id", upsertInventoryItem);
router.get("/menu", getAdminMenu);

module.exports = router;
