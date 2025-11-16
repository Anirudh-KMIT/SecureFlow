// backend/routes/privacyRoutes.js

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
  analyzeText,
  fetchLogs,
  getLog,
  uploadFile,
  getStats,
} from "../controllers/privacyController.js";

const router = express.Router();

// =========================
// 🔐 All privacy routes require JWT
// =========================
router.use(verifyToken);

// =========================
// 🔍 1) Analyze Text
// POST /api/privacy/analyze
// =========================
router.post("/analyze", analyzeText);

// =========================
// 📄 2) Upload + Analyze PDF
// POST /api/privacy/upload
// =========================
router.post("/upload", uploadFile);

// =========================
// 📜 3) Get Metadata List
// GET /api/privacy/logs
// =========================
router.get("/logs", fetchLogs);

// =========================
// 🔓 4) Get FULL Decrypted Log
// GET /api/privacy/log/:id
// =========================
router.get("/log/:id", getLog);

// =========================
// 📊 5) User Stats (Profile)
// GET /api/privacy/stats
// =========================
router.get("/stats", getStats);

export default router;
