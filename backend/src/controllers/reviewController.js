const Review = require("../models/Review");
const Property = require("../models/Property");

// @desc    Add a review for a property
// @route   POST /api/reviews
// @access  Private (User)
const addReview = async (req, res) => {
  try {
    const { property_id, rating, comment } = req.body;

    if (!property_id || !rating) {
      return res.status(400).json({ message: "property_id and rating are required" });
    }

    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const existingReview = await Review.findOne({ user_id: req.user._id, property_id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this property" });
    }

    const review = await Review.create({
      user_id: req.user._id,
      property_id,
      rating: Number(rating),
      comment
    });

    await review.populate("user_id", "name");

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property_id: req.params.propertyId })
      .populate("user_id", "name")
      .sort("-createdAt");

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Allow owner of review OR an agent managing the property
    const isOwner = review.user_id.toString() === req.user._id.toString();
    const isAgentForProperty =
      req.user.role === "agent" &&
      (await Property.exists({ _id: review.property_id, agent_id: req.user._id }));

    if (!isOwner && !isAgentForProperty) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getPropertyReviews, deleteReview };
