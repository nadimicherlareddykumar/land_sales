const mongoose = require("mongoose");

const layoutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    totalPlots: { type: Number, required: true, min: 1 },
    layoutImage: { type: String, required: true },
    description: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Layout", layoutSchema);
