const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    layoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Layout",
      required: true
    },
    plotNumber: { type: String, required: true, trim: true },
    size: { type: Number, required: true }, // in sq. ft.
    dimensions: { type: String, required: true, trim: true }, // e.g., 30x40
    facing: { type: String, enum: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"], required: true },
    price: { type: Number, required: true, min: 0 },
    positionX: { type: Number, required: true, default: 0 }, // percentage 0-100
    positionY: { type: Number, required: true, default: 0 }, // percentage 0-100
    status: {
      type: String,
      enum: ["Available", "Reserved", "Sold"],
      default: "Available"
    }
  },
  { timestamps: true }
);

plotSchema.index({ layoutId: 1, plotNumber: 1 }, { unique: true });

module.exports = mongoose.model("Plot", plotSchema);
