import Log from "../models/logModel.js";
import pdfParse from "pdf-parse";
import fs from "fs";

// ✅ Analyze Text
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    const username = req.user?.username || "guest";

    if (!text) {
      return res.status(400).json({ message: "No text provided" });
    }

    // Detect sensitive entities
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    const foundEmails = text.match(emailRegex) || [];

    // Sanitize text
    let sanitized = text;
    foundEmails.forEach((email) => {
      sanitized = sanitized.replace(email, "[EMAIL]");
    });

    // Build log
    const newLog = await Log.create({
      username,
      entities: foundEmails.length ? ["EMAIL"] : [],
      sanitized,
      confidence: foundEmails.length ? "High" : "None",
      originalText: text,
    });

    res.status(200).json({
      sanitized,
      entities: newLog.entities,
      confidence: newLog.confidence,
    });
  } catch (error) {
    console.error("❌ Analyze error:", error.message);
    res.status(500).json({ message: "Failed to analyze text", error: error.message });
  }
};

// ✅ Fetch Logs
export const fetchLogs = async (req, res) => {
  try {
    const username = req.user?.username || "guest";
    const logs = await Log.find({ username }).sort({ createdAt: -1 }).limit(10);
    res.status(200).json(logs);
  } catch (error) {
    console.error("❌ Fetch logs error:", error.message);
    res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
};

// ✅ Upload File (PDF Only)
export const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;

    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.tempFilePath);
      const pdfData = await pdfParse(dataBuffer);
      return res.status(200).json({ extractedText: pdfData.text });
    } else {
      return res.status(400).json({ message: "Only PDF supported" });
    }
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({ message: "File processing failed", error: error.message });
  }
};
