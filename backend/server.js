const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const adminRoutes = require("./routes/admin");

const documentRoutes = require("./routes/documents");
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS using a whitelist. Set FRONTEND_URLS (comma-separated) or FRONTEND_URL in environment.
const rawOrigins =
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000";
const allowedOrigins = rawOrigins
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Debug log for incoming requests (helps diagnose CORS issues)
    // Note: do not log sensitive headers in production logs.
    // If no origin (e.g. server-to-server or curl), allow it
    // Provide two ways to relax CORS in production:
    // - Set FRONTEND_URLS to a comma-separated list that includes your frontend domain(s)
    // - Or set ALLOW_ALL_CORS=true to allow any origin (use only if you understand the risks)
    const allowAll =
      String(process.env.ALLOW_ALL_CORS || "false").toLowerCase() === "true";
    // Log origin and current whitelist for easier debugging on hosts like Render
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "CORS check - origin:",
        origin,
        "allowedOrigins:",
        allowedOrigins,
        "allowAll:",
        allowAll
      );
    }

    if (!origin) return callback(null, true);
    if (allowAll) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy: Origins not allowed"), false);
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours
};

// Middlewares
console.log("Registering CORS middleware");
app.use(cors(corsOptions));
console.log(
  "Skipping explicit app.options registration (using app.use cors middleware for preflight)"
);
console.log("Registering body parsers");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
try {
  console.log(
    "Mounting route '/api/notes' with documentRoutes type:",
    typeof documentRoutes
  );
  app.use("/api/notes", documentRoutes);
  app.use("/api/admin", adminRoutes);
} catch (err) {
  console.error(
    "Error mounting /api/notes:",
    err && err.stack ? err.stack : err
  );
  // Re-throw so process exits (we want to see the original error in dev)
  throw err;
}

// Health check (useful for load balancers / readiness probes)
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Handle uncaught exceptions and unhandled rejections to avoid silent failures
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err && err.stack ? err.stack : err);
  // In production you might want to exit and rely on a process manager to restart
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// ✅ Root endpoint for quick check
app.get("/", (req, res) => {
  res.send("✅ Notes Nest backend running fine!");
});

// MongoDB Connection with retry logic. In local debug mode you can skip DB startup
// by setting SKIP_DB=true in the environment. This helps quickly test middleware
// (CORS, routes) without a real MongoDB connection. Do NOT use SKIP_DB in production.
const connectDB = (retries = 5) => {
  if (!process.env.MONGO_URI) {
    console.warn(
      "MONGO_URI not set. To run without DB, set SKIP_DB=true or provide a valid MONGO_URI."
    );
    if (String(process.env.SKIP_DB || "").toLowerCase() === "true") {
      console.log(
        "SKIP_DB=true — starting server without MongoDB for debug/testing."
      );
      app.listen(PORT, () =>
        console.log(`🚀 Server running at port ${PORT} (DB skipped)`)
      );
      return;
    }
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      // MongoDB connection options for better reliability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("✅ MongoDB Connected");
      app.listen(PORT, () => console.log(`🚀 Server running at port ${PORT}`));
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      if (retries > 0) {
        console.log(`Retrying connection... (${retries} attempts left)`);
        setTimeout(() => connectDB(retries - 1), 5000);
      } else {
        console.error("Failed to connect to MongoDB after multiple retries");
        process.exit(1);
      }
    });
};

// Initialize database connection (or start without DB if SKIP_DB=true)
connectDB();

// ✅ Error handlers (optional)
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err.stack || err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("unhandledRejection at:", promise, "reason:", reason);
});
