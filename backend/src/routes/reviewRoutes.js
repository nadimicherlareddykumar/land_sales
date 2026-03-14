const express = require("express");
const router = express.Router();
const {
  addReview,
  getPropertyReviews,
  deleteReview
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, addReview);

router.get("/property/:propertyId", getPropertyReviews);

router.delete("/:id", protect, deleteReview);

module.exports = router;
