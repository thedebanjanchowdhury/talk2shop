const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");
const User = require("../models/User");

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Current user profile.
 * @returns {object} 500 - Server error.
 */
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

/**
 * @route PUT /api/users/me
 * @desc Update current user profile
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Updated user profile.
 * @returns {object} 500 - Server error.
 */
router.put("/me", auth, async (req, res) => {
  try {
    const { name, address, mobile } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (address) user.address = address;
    if (mobile) user.mobile = mobile;

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

/**
 * @route GET /api/users
 * @desc List all users (Admin)
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - List of users.
 * @returns {object} 500 - Server error.
 */
router.get("/", auth, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user (Admin)
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - User deleted successfully.
 * @returns {object} 400 - Missing id.
 * @returns {object} 500 - Server error.
 */
router.delete("/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Missing id" });
  await User.findByIdAndDelete(id);
  res.json({ message: "User deleted" });
});

/**
 * @route PUT /api/users/:id
 * @desc Update a user (Admin)
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Updated user details.
 * @returns {object} 400 - Missing id.
 * @returns {object} 404 - User not found.
 * @returns {object} 500 - Server error.
 */
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
