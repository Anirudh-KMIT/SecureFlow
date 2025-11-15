import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

import authRoutes from "./routes/authRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/secureflow", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/privacy", privacyRoutes);

// ✅ Default Route
app.get("/", (req, res) => res.send("SecureFlow API running 🚀"));

// ✅ Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
