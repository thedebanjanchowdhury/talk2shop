/**
 * Admin Only Middleware, Checks if the user is admin
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */

module.exports = function (req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!req.user.isAdmin) return res.status(401).json({ message: "Admin Only" });
  next();
};
