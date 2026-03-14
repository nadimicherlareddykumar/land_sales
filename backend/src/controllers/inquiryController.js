const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const asyncHandler = require("../middleware/asyncHandler");

const getInquiries = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.propertyId) {
    query.property = req.query.propertyId;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.search) {
    const regex = { $regex: req.query.search, $options: "i" };
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const inquiries = await Inquiry.find(query)
    .populate("property", "title propertyType price location")
    .sort({ createdAt: -1 });

  res.json({ success: true, inquiries });
});

const createInquiry = asyncHandler(async (req, res) => {
  const { property: propertyId } = req.body;

  const propertyExists = await Property.exists({ _id: propertyId });
  if (!propertyExists) {
    res.status(404);
    throw new Error("Property not found for inquiry");
  }

  const inquiry = await Inquiry.create(req.body);

  res.status(201).json({ success: true, inquiry });
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  res.json({ success: true, inquiry });
});

module.exports = {
  getInquiries,
  createInquiry,
  updateInquiryStatus
};
