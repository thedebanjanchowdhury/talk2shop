const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");
const User = require("../models/User");

//get profile
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put("/me", auth, async (req, res) => {
  try {
    const { name, address, mobile } = req.body;
    // We update fields if they are provided
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (address) user.address = address;
    if (mobile) user.mobile = mobile; // Ensure User model has 'mobile' field or add it

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// list user (admin)
router.get("/", auth, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// delete user (admin)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Missing id" });
  await User.findByIdAndDelete(id);
  res.json({ message: "User deleted" });
});

// Update user details (admin)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, address } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;

    await user.save();

    const updatedUser = await User.findById(id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error updating user" });
  }
});

module.exports = router;
