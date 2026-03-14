const mongoose = require("mongoose");

const PROPERTY_TYPES = [
  "Apartment",
  "House/Villa",
  "Residential Plot",
  "Agricultural Land",
  "Commercial Land",
  "Office Space",
  "Shop"
];

const LISTING_TYPES = ["Sale", "Rent"];
const PLOT_SIZE_UNITS = ["sqft", "sqyd", "acre", "hectare"];
const DIMENSION_UNITS = ["ft", "m"];
const FACING_DIRECTIONS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West", "NA"];
const ZONING_TYPES = ["Residential", "Agricultural", "Commercial", "Industrial", "Mixed Use", "Other"];
const STATUS_TYPES = ["Available", "Booked", "Sold", "Rented"];

const LAND_PROPERTY_TYPES = new Set([
  "Residential Plot",
  "Agricultural Land",
  "Commercial Land"
]);

const locationSchema = new mongoose.Schema(
  {
    addressLine: { type: String, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
    pincode: { type: String, trim: true },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  },
  { _id: false }
);

const landDetailsSchema = new mongoose.Schema(
  {
    plotSize: { type: Number, min: 0 },
    plotSizeUnit: { type: String, enum: PLOT_SIZE_UNITS, default: "sqft" },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      unit: { type: String, enum: DIMENSION_UNITS, default: "ft" }
    },
    roadAccess: { type: Boolean, default: false },
    facing: { type: String, enum: FACING_DIRECTIONS, default: "NA" },
    zoningType: { type: String, enum: ZONING_TYPES, default: "Residential" },
    utilities: {
      water: { type: Boolean, default: false },
      electricity: { type: Boolean, default: false },
      sewage: { type: Boolean, default: false }
    }
  },
  { _id: false }
);

const ownerContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true }
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    propertyType: {
      type: String,
      required: true,
      enum: PROPERTY_TYPES
    },
    listingType: {
      type: String,
      required: true,
      enum: LISTING_TYPES,
      default: "Sale"
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", trim: true },
    location: { type: locationSchema, required: true },
    landDetails: { type: landDetailsSchema, default: () => ({}) },
    builtUpArea: { type: Number, min: 0 },
    builtUpAreaUnit: { type: String, enum: ["sqft", "sqm"], default: "sqft" },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    parking: { type: Number, min: 0 },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    ownerContact: { type: ownerContactSchema, required: true },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent"
    },
    status: {
      type: String,
      enum: STATUS_TYPES,
      default: "Available"
    },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

propertySchema.pre("validate", function validateLandFields(next) {
  if (LAND_PROPERTY_TYPES.has(this.propertyType) && !this.landDetails?.plotSize) {
    this.invalidate("landDetails.plotSize", "plotSize is required for plot/land listings");
  }

  if (
    this.location?.latitude !== undefined &&
    this.location?.longitude === undefined
  ) {
    this.invalidate("location.longitude", "longitude is required when latitude is provided");
  }

  if (
    this.location?.longitude !== undefined &&
    this.location?.latitude === undefined
  ) {
    this.invalidate("location.latitude", "latitude is required when longitude is provided");
  }

  next();
});

propertySchema.index({
  title: "text",
  description: "text",
  "location.area": "text",
  "location.city": "text",
  "location.state": "text"
});
propertySchema.index({ propertyType: 1, listingType: 1, status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ "landDetails.plotSize": 1 });

module.exports = mongoose.model("Property", propertySchema);
