const Plot = require("../models/Plot");
const asyncHandler = require("../middleware/asyncHandler");

const getPlotsByLayout = asyncHandler(async (req, res) => {
  const plots = await Plot.find({ layoutId: req.params.layoutId }).sort("plotNumber");
  res.json({ success: true, plots });
});

const getPlotById = asyncHandler(async (req, res) => {
  const plot = await Plot.findById(req.params.id).populate("layoutId", "name location");
  if (!plot) { res.status(404); throw new Error("Plot not found"); }
  res.json({ success: true, plot });
});

const createPlot = asyncHandler(async (req, res) => {
  const plot = await Plot.create(req.body);
  res.status(201).json({ success: true, plot });
});

const updatePlot = asyncHandler(async (req, res) => {
  const plot = await Plot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plot) { res.status(404); throw new Error("Plot not found"); }
  res.json({ success: true, plot });
});

const deletePlot = asyncHandler(async (req, res) => {
  const plot = await Plot.findByIdAndDelete(req.params.id);
  if (!plot) { res.status(404); throw new Error("Plot not found"); }
  res.json({ success: true, message: "Plot deleted" });
});

module.exports = { getPlotsByLayout, getPlotById, createPlot, updatePlot, deletePlot };
