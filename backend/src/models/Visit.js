const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    plotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plot",
      required: true
    },
    layoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Layout",
      required: true
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    visitDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
