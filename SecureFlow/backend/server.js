// ===============================
// 🌐 Load Environment First
// ===============================
import dotenv from "dotenv";
dotenv.config();

// ===============================
// 📦 Imports
// ===============================
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";

// Route files
import authRoutes from "./routes/authRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";

// ===============================
// 🚀 Initialize App
// ===============================
const app = express();

// ===============================
// 🛡 Global Middleware
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow non-browser or curl
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true); // permissive for local dev
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    credentials: false,
    maxAge: 86400,
  })
);
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ===============================
// 🗄 MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ===============================
// 🛣 Register Routes
// ===============================
app.use("/api/auth", authRoutes);       // Login + Register
app.use("/api/privacy", privacyRoutes); // Analyzer + PDF + Logs

// ===============================
// 🏠 Default Route
// ===============================
app.get("/", (req, res) => {
  res.send("SecureFlow API is running 🚀 (Backend OK)");
});

// ===============================
// 🟢 Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`)
);
