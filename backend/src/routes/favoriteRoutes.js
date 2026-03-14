const express = require("express");
const router = express.Router();
const {
  addFavorite,
  getMyFavorites,
  removeFavorite
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

// All favorite routes require authentication
router.use(protect);

router.route("/")
  .post(addFavorite)
  .get(getMyFavorites);

router.delete("/:propertyId", removeFavorite);

module.exports = router;
