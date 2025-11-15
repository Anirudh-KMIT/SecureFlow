import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    entities: { type: [String], default: [] },
    sanitized: { type: String, default: "" },
    confidence: { type: String, default: "Low" },
    originalText: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
