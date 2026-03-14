const express = require("express");
const { getLayouts, getLayoutById, createLayout, updateLayout, deleteLayout } = require("../controllers/layoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getLayouts).post(protect, createLayout);
router.route("/:id").get(getLayoutById).put(protect, updateLayout).delete(protect, deleteLayout);

module.exports = router;
