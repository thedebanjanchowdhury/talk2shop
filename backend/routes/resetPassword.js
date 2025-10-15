const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { resetPassword } = require("../validators/authSchemas");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// RESET REQUEST
router.post("/reset-request", async (req, res) => {
  const { email } = req.body;
  try {
    const found = await User.findOne({ email });
    if (!found) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: found._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL}>`,
      to: email,
      subject: "Reset Your Talk2Shop Password🗝️",
      text: `Hello ${found.name}, you requested a password reset. Please click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.`,
    });

    return res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
    const password = req.body;
    const token = req.params.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) return res.status(404).json({ message: "User not found" });
        if(user.password === password) return res.status(400).json({ message: "New password cannot be the same as the old password" });
        

    } catch (error) {
        
    }
})