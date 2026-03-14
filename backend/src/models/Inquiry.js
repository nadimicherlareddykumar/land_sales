const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    inquiryType: {
      type: String,
      enum: ["General", "Site Visit", "Callback"],
      default: "General"
    },
    preferredVisitDate: { type: Date },
    status: {
      type: String,
      enum: ["New", "Contacted", "Closed"],
      default: "New"
    }
  },
  { timestamps: true }
);

inquirySchema.index({ property: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
