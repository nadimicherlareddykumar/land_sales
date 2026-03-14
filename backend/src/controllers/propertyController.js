const Property = require("../models/Property");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
};

const buildQuery = (params) => {
  const query = {};
  const andClauses = [];

  if (params.keyword) {
    const regex = { $regex: params.keyword.trim(), $options: "i" };
    andClauses.push({
      $or: [
        { title: regex },
        { description: regex },
        { "location.area": regex },
        { "location.city": regex },
        { "location.state": regex }
      ]
    });
  }

  if (params.location) {
    const regex = { $regex: params.location.trim(), $options: "i" };
    andClauses.push({
      $or: [
        { "location.area": regex },
        { "location.city": regex },
        { "location.state": regex },
        { "location.country": regex }
      ]
    });
  }

  if (params.city) {
    query["location.city"] = { $regex: params.city.trim(), $options: "i" };
  }

  if (params.state) {
    query["location.state"] = { $regex: params.state.trim(), $options: "i" };
  }

  if (params.country) {
    query["location.country"] = { $regex: params.country.trim(), $options: "i" };
  }

  if (params.propertyType) {
    const propertyTypes = params.propertyType
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (propertyTypes.length === 1) {
      query.propertyType = propertyTypes[0];
    }

    if (propertyTypes.length > 1) {
      query.propertyType = { $in: propertyTypes };
    }
  }

  if (params.listingType) {
    query.listingType = params.listingType;
  }

  if (params.status) {
    query.status = params.status;
  }

  if (params.facing) {
    query["landDetails.facing"] = params.facing;
  }

  if (params.zoningType) {
    query["landDetails.zoningType"] = params.zoningType;
  }

  const roadAccess = parseBoolean(params.roadAccess);
  if (roadAccess !== undefined) {
    query["landDetails.roadAccess"] = roadAccess;
  }

  const minPrice = parseNumber(params.minPrice);
  const maxPrice = parseNumber(params.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const minPlotSize = parseNumber(params.minPlotSize);
  const maxPlotSize = parseNumber(params.maxPlotSize);
  if (minPlotSize !== undefined || maxPlotSize !== undefined) {
    query["landDetails.plotSize"] = {};
    if (minPlotSize !== undefined) query["landDetails.plotSize"].$gte = minPlotSize;
    if (maxPlotSize !== undefined) query["landDetails.plotSize"].$lte = maxPlotSize;
  }

  if (andClauses.length > 0) {
    query.$and = andClauses;
  }

  return query;
};

const getProperties = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const skip = (page - 1) * limit;

  const query = buildQuery(req.query);

  const allowedSortBy = ["createdAt", "price", "landDetails.plotSize", "title"];
  const sortBy = allowedSortBy.includes(req.query.sortBy)
    ? req.query.sortBy
    : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const [properties, total] = await Promise.all([
    Property.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(query)
  ]);

  res.json({
    success: true,
    properties,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  });
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({ success: true, property });
});

const getMyProperties = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const query = { agent_id: req.user._id };

  const [properties, total] = await Promise.all([
    Property.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Property.countDocuments(query)
  ]);

  res.json({
    success: true,
    properties,
    pagination: { total, page, pages: Math.ceil(total / limit), limit, hasNextPage: page * limit < total, hasPrevPage: page > 1 }
  });
});

const createProperty = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  // Stamp agent_id if the request comes from an authenticated agent
  if (req.user?._id && req.user?.role === "agent") {
    body.agent_id = req.user._id;
  }
  const property = await Property.create(body);
  res.status(201).json({ success: true, property });
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({ success: true, property });
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({ success: true, message: "Property deleted successfully" });
});

module.exports = {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty
};
