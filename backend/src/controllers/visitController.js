const Visit = require("../models/Visit");
const Plot = require("../models/Plot");
const asyncHandler = require("../middleware/asyncHandler");

const createVisit = asyncHandler(async (req, res) => {
  const { plotId, layoutId, customerName, phone, email, visitDate } = req.body;
  if (!plotId || !layoutId || !customerName || !phone || !visitDate) {
    res.status(400); throw new Error("Please fill all required fields");
  }
  const visit = await Visit.create({ plotId, layoutId, customerName, phone, email, visitDate });
  res.status(201).json({ success: true, visit });
});

const getVisits = asyncHandler(async (req, res) => {
  // Only agents can see visits (all visits)
  const visits = await Visit.find()
    .populate("plotId", "plotNumber")
    .populate("layoutId", "name location")
    .sort("-createdAt");
  res.json({ success: true, visits });
});

const updateVisitStatus = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) { res.status(404); throw new Error("Visit not found"); }
  
  if (req.body.status) visit.status = req.body.status;
  await visit.save();
  res.json({ success: true, visit });
});

module.exports = { createVisit, getVisits, updateVisitStatus };
