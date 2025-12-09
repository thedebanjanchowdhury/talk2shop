const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Middleware
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization; // Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Auth Token" }); // <error>
  }

  const token = authHeader.split(" ")[1]; // <token>
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // <payload>
    const user = await User.findById(payload.id).select("-password"); // <user>
    if (!user) return res.status(401).json({ message: "Invalid Token" }); // <error>
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" }); // <error>
  }
};
