const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    contributor: { type: String, required: true },
    category: { type: String, required: true },
    // driveLink is optional because users can also upload a file
    driveLink: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ THIS is the missing part:
module.exports = mongoose.model("Document", documentSchema);
