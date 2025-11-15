// ========= LOAD ENV FIRST =========
import dotenv from "dotenv";
dotenv.config();

// ========= IMPORTS AFTER ENV LOADED =========
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";

import authRoutes from "./routes/authRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";

// ========= EXPRESS APP =========
const app = express();

// ========= MIDDLEWARE (VERY IMPORTANT ORDER) =========

// Allow JSON + form data BEFORE fileUpload modifies body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Correct fileUpload config to prevent wiping req.body
app.use(
  fileUpload({
    useTempFiles: true,
    parseNested: true, // <-- CRITICAL FIX
    preserveExtension: true,
  })
);

// CORS
app.use(cors());

// Debug: Check if JWT_SECRET is loading
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

// ========= MONGODB =========
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ========= ROUTES =========
app.use("/api/auth", authRoutes);
app.use("/api/privacy", privacyRoutes);

// ========= DEFAULT =========
app.get("/", (req, res) => res.send("SecureFlow API running 🚀"));

// ========= SERVER =========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
