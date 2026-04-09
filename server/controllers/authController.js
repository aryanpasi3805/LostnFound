import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Restrict to college emails
  if (!email.endsWith("@college.edu")) {
    return res.status(400).json({ success: false, message: "Email must be a college email" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = email === "admin@college.edu" ? "admin" : "user";

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user; // attached by auth middleware
    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};