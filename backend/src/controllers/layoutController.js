const Layout = require("../models/Layout");
const Plot = require("../models/Plot");
const asyncHandler = require("../middleware/asyncHandler");

const getLayouts = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { location: { $regex: req.query.keyword, $options: "i" } }
    ];
  }
  const layouts = await Layout.find(query).sort("-createdAt");
  res.json({ success: true, layouts });
});

const getLayoutById = asyncHandler(async (req, res) => {
  const layout = await Layout.findById(req.params.id);
  if (!layout) { res.status(404); throw new Error("Layout not found"); }
  
  // also fetch plots for convenience if requested
  const plots = await Plot.find({ layoutId: layout._id }).sort("plotNumber");
  
  res.json({ success: true, layout, plots });
});

const createLayout = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const layout = await Layout.create(req.body);
  res.status(201).json({ success: true, layout });
});

const updateLayout = asyncHandler(async (req, res) => {
  const layout = await Layout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!layout) { res.status(404); throw new Error("Layout not found"); }
  res.json({ success: true, layout });
});

const deleteLayout = asyncHandler(async (req, res) => {
  const layout = await Layout.findByIdAndDelete(req.params.id);
  if (!layout) { res.status(404); throw new Error("Layout not found"); }
  await Plot.deleteMany({ layoutId: req.params.id }); // delete associated plots
  res.json({ success: true, message: "Layout deleted" });
});

module.exports = { getLayouts, getLayoutById, createLayout, updateLayout, deleteLayout };
