const Favorite = require("../models/Favorite");
const Property = require("../models/Property");

// @desc    Add property to favorites
// @route   POST /api/favorites
// @access  Private (User)
const addFavorite = async (req, res) => {
  try {
    const { property_id } = req.body;

    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const exists = await Favorite.findOne({ user_id: req.user._id, property_id });
    if (exists) {
      return res.status(400).json({ message: "Property already in favorites" });
    }

    const favorite = await Favorite.create({
      user_id: req.user._id,
      property_id
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Property already in favorites" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private (User)
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user._id })
      .populate("property_id")
      .sort("-createdAt");

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private (User)
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user_id: req.user._id,
      property_id: req.params.propertyId
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await favorite.deleteOne();
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite
};
