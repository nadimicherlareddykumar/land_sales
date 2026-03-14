const User = require("../models/User");
const Agent = require("../models/Agent");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "real_estate_secret_2024";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "buyer"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new agent
// @route   POST /api/auth/agent/register
const registerAgent = async (req, res) => {
  try {
    const { name, email, password, phone, agency_name, experience } = req.body;

    if (!name || !email || !password || !phone || !agency_name) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const agentExists = await Agent.findOne({ email });
    if (agentExists) {
      return res.status(400).json({ message: "An agent with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agent = await Agent.create({
      name,
      email,
      password: hashedPassword,
      phone,
      agency_name,
      experience: experience || 0
    });

    res.status(201).json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      agency_name: agent.agency_name,
      role: "agent",
      token: generateToken(agent._id, "agent")
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user or agent
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, isAgent } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let account = null;
    let role = null;

    if (isAgent === true) {
      account = await Agent.findOne({ email });
      role = "agent";
    } else {
      account = await User.findOne({ email });
      role = account ? account.role : null;
    }

    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      _id: account._id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      role,
      token: generateToken(account._id, role)
    };

    if (role === "agent") {
      payload.agency_name = account.agency_name;
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged-in user/agent profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, registerAgent, login, getMe };
