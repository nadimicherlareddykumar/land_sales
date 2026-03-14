const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAgentBookings,
  updateBookingStatus
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Routes for both buyers and agents
router.post("/", protect, createBooking);

router.get("/mybookings", protect, getMyBookings);

// Routes for agents only
router.get("/agent", protect, authorize("agent"), getAgentBookings);
router.patch("/:id/status", protect, authorize("agent"), updateBookingStatus);

module.exports = router;
