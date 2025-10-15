module.exports = function (req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!req.user.isAdmin) return res.status(401).json({ message: "Admin Only" });
  next();
};
