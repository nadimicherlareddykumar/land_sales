const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Agent = require("../models/Agent");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "real_estate_secret_2024");

      if (decoded.role === "agent") {
        req.user = await Agent.findById(decoded.id).select("-password");
        if (!req.user) {
          return res.status(401).json({ message: "Not authorized, agent not found" });
        }
        req.user = req.user.toObject();
        req.user.role = "agent";
      } else {
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
          return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = req.user.toObject();
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user ? req.user.role : "unknown"}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
