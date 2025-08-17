const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");
const User = require("../models/User");

//get profile
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
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

module.exports = router;
