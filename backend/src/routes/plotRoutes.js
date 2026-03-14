const express = require("express");
const { getPlotsByLayout, getPlotById, createPlot, updatePlot, deletePlot } = require("../controllers/plotController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/layout/:layoutId", getPlotsByLayout);
router.route("/").post(protect, createPlot);
router.route("/:id").get(getPlotById).put(protect, updatePlot).delete(protect, deletePlot);

module.exports = router;
