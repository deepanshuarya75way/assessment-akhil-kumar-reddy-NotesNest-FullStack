const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkAdminRole = require("../middleware/checkAdminRole");

const {
  uploadDocument,
  getApprovedDocuments,
  getPendingDocuments,
  approveDocument,
  deleteDocument,
  adminLogin,
} = require("../controllers/documentController");

// Submit a new document (drive link only)
router.post("/upload", express.json(), uploadDocument);

// Admin login route (returns JWT)
router.post("/admin/login", express.json(), adminLogin);

router.get("/approved", getApprovedDocuments);
// The following routes are admin-only and require a valid JWT in the Authorization header (Bearer <token>)
// Admin-only routes: require a valid token and admin role
router.get("/pending", verifyToken, checkAdminRole, getPendingDocuments);
router.patch("/approve/:id", verifyToken, checkAdminRole, approveDocument);
router.delete("/delete/:id", verifyToken, checkAdminRole, deleteDocument);

module.exports = router;
