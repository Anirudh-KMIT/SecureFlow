// backend/models/logModel.js
import mongoose from "mongoose";

// =============================
// 🔐 Reusable Encrypted Field Schema
// =============================
const encryptedField = new mongoose.Schema(
  {
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
  },
  { _id: false }
);

// =============================
// 📌 Main Log Schema
// =============================
const logSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },

    eventType: {
      type: String,
      enum: ["text_scan", "file_scan"],
      default: "text_scan",
    },

    // ========== ENCRYPTED FIELDS ==========
    encryptedSummary: {
      type: encryptedField,
      required: true,
    },

    encryptedEntities: {
      type: encryptedField,
      required: true, // encrypted array of detected entities
    },

    encryptedOriginalText: {
      type: encryptedField,
      required: false, // may not exist for plain text scans
    },

    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Log", logSchema);
