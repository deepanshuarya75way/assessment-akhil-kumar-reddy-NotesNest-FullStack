const jwt = require("jsonwebtoken");

const checkAdmin = (req, res, next) => {
  // Support both 'Authorization' and 'authorization' header names
  const authHeader =
    req.header("Authorization") ||
    req.header("authorization") ||
    req.headers["authorization"];

  if (!authHeader)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  // Handle 'Bearer <token>' format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment");
    return res.status(500).json({ message: "Server configuration error." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // store decoded payload for later use
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = checkAdmin;
