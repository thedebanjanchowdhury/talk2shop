const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { register, login } = require("../validators/authSchemas");
const validate = require("../middlewares/validate");

const connectDB = require("../config/db");

// register user
router.post("/register", validate(register), async (req, res) => {
  const { name, email, password, address, isAdmin } = req.validated.body;

  try {
    await connectDB(process.env.MONGODB_URI);
    let existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });
    const user = await User.create({ name, email, password, address, isAdmin });
    await user.save();
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

// login user
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
