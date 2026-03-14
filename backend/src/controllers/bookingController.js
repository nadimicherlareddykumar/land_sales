const Booking = require("../models/Booking");
const Property = require("../models/Property");
const mongoose = require("mongoose");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const { property_id, visit_date, visit_time } = req.body;

    if (!property_id || !visit_date || !visit_time) {
      return res.status(400).json({ message: "property_id, visit_date and visit_time are required" });
    }

    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const booking = await Booking.create({
      user_id: req.user._id,
      property_id,
      visit_date,
      visit_time
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user._id })
      .populate("property_id", "title location price images propertyType")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for agent's properties
// @route   GET /api/bookings/agent
// @access  Private (Agent)
const getAgentBookings = async (req, res) => {
  try {
    const agentId = new mongoose.Types.ObjectId(req.user._id);
    const properties = await Property.find({ agent_id: agentId }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ property_id: { $in: propertyIds } })
      .populate("user_id", "name email phone")
      .populate("property_id", "title location")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Agent)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id).populate("property_id");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check agent owns the property
    if (booking.property_id.agent_id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAgentBookings, updateBookingStatus };
