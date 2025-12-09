const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { register, login } = require("../validators/authSchemas");
const validate = require("../middlewares/validate");
const connectDB = require("../config/db");
const { updateStat } = require("../services/statsService");

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @middleware validate(register) - Validates the request body against the register schema.
 * @param {object} req - The request object containing user registration details.
 * @param {object} req.validated.body - The validated request body.
 * @param {string} req.validated.body.name - The user's full name.
 * @param {string} req.validated.body.email - The user's email address (must be unique).
 * @param {string} req.validated.body.password - The user's password.
 * @param {string} [req.validated.body.address] - The user's address (optional).
 * @param {boolean} [req.validated.body.isAdmin=false] - Flag indicating if the user is an admin (defaults to false).
 * @param {object} res - The response object.
 * @returns {object} 201 - User registered successfully.
 * @returns {object} 400 - Email already exists or validation error.
 * @returns {object} 500 - Server error.
 */
router.post("/register", validate(register), async (req, res) => {
  const { name, email, password, address, isAdmin } = req.validated.body;

  try {
    await connectDB(process.env.MONGODB_URI);
    let existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });
    const user = await User.create({ name, email, password, address, isAdmin });
    await user.save();
    if (!isAdmin) await updateStat('totalUsers', 1); // Only count customers
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 * @middleware validate(login) - Validates the request body against the login schema.
 * @param {object} req - The request object containing user login details.
 * @param {object} req.validated.body - The validated request body.
 * @param {string} req.validated.body.email - The user's email address.
 * @param {string} req.validated.body.password - The user's password.
 * @param {object} res - The response object.
 * @returns {object} 200 - User logged in successfully.
 * @returns {object} 401 - Invalid credentials.
 * @returns {object} 500 - Server error.
 */
router.post("/login", validate(login), async (req, res) => {
  const { email, password } = req.validated.body;
  try {
    await connectDB(process.env.MONGODB_URI);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid Credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
