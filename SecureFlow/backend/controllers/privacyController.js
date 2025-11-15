// controllers/privacyController.js

import * as pdfParse from "pdf-parse";   // <-- FIXED FOR ESM
import fs from "fs";
import Log from "../models/logModel.js";

// ===========================
// 🔍 1. Sensitive Data DETECTORS
// ===========================
const DETECTORS = [
  {
    type: "EMAIL",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    type: "PHONE",
    regex: /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g,
  },
  {
    type: "AADHAAR",
    regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  },
  {
    type: "PAN",
    regex: /([A-Z]{5}[0-9]{4}[A-Z]{1})/g,
  },
  {
    type: "IP_ADDRESS",
    regex:
      /\b((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  },
  {
    type: "URL",
    regex:
      /\bhttps?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi,
  },
  {
    type: "ADDRESS",
    regex:
      /\b\d{1,4}\s+(street|st|road|rd|avenue|ave|block|sector|lane)\b/gi,
  },
];

// ===========================
// 🔍 Run All Detectors
// ===========================
function runDetectors(text) {
  let results = [];

  for (const detector of DETECTORS) {
    const matches = text.match(detector.regex);
    if (matches) {
      matches.forEach((m) => {
        results.push({
          type: detector.type,
          value: m,
        });
      });
    }
  }

  return results;
}

// ===========================
// 🧼 Sanitize Text
// ===========================
function sanitizeText(text, findings) {
  let sanitized = text;
  findings.forEach((item) => {
    sanitized = sanitized.replaceAll(item.value, `[${item.type}]`);
  });
  return sanitized;
}

// ===========================
// 📌 1. Analyze Text
// ===========================
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Text required" });

    // Call ML service
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze`,
      { text }
    );

    const { entities, count, sanitized_text } = mlResponse.data;

    // Store encrypted logs later
    const log = await Log.create({
      user: req.user.username,
      eventType: "text_scan",
      detectedEntities: entities,
      summary: sanitized_text,
    });

    res.json({
      ok: true,
      entities,
      entityCount: count,
      sanitized: sanitized_text,
      logId: log._id,
    });

  } catch (error) {
    console.error("❌ ML error:", error.message);
    res.status(500).json({ error: "ML Service failed" });
  }
};

// ===========================
// 📌 2. Fetch Logs
// ===========================
export const fetchLogs = async (req, res) => {
  try {
    const username = req.user?.username || "guest";
    const logs = await Log.find({ username }).sort({ createdAt: -1 }).limit(10);

    return res.status(200).json(logs);
  } catch (err) {
    console.error("❌ Fetch logs error:", err);
    return res.status(500).json({ error: "Could not fetch logs" });
  }
};

// ===========================
// 📌 3. Upload and Analyze PDF
// ===========================
export const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;

    // Allow only PDF for now
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are supported" });
    }

    const dataBuffer = fs.readFileSync(file.tempFilePath);
    const pdfData = await pdfParse.default(dataBuffer); // <-- FIXED

    const text = pdfData.text || "";
    const findings = runDetectors(text);
    const sanitized = sanitizeText(text, findings);

    const entityTypes = findings.map((f) => f.type);

    const newLog = await Log.create({
      username: req.user?.username || "guest",
      entities: entityTypes,
      sanitized,
      confidence: findings.length ? "Medium" : "None",
      originalText: text.slice(0, 2000),
    });

    return res.status(200).json({
      ok: true,
      extractedText: text,
      findings,
      sanitized,
      logId: newLog._id,
    });
  } catch (err) {
    console.error("❌ PDF Upload error:", err);
    return res.status(500).json({ error: "Failed to process PDF file" });
  }
};
