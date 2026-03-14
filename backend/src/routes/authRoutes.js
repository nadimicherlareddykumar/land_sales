const express = require("express");
const router = express.Router();
const { registerUser, registerAgent, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/agent/register", registerAgent);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
