// middleware/checkAdminRole.js
// Ensures the authenticated user has admin role
module.exports = function checkAdminRole(req, res, next) {
  // `verifyToken` middleware should set req.admin
  if (!req.admin) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  if (req.admin.role !== "admin") {
    return res.status(403).json({ message: "Admin role required." });
  }

  next();
};
