// backend/controllers/privacyController.js
import axios from "axios";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
import Tesseract from "tesseract.js";
import Log from "../models/logModel.js";

import {
  encryptString,
  encryptJSON,
  decryptToString,
  decryptJSON,
} from "../utils/encryption.js";

// ===========================
// SENSITIVE DATA DETECTORS
// ===========================
const DETECTORS = [
  { type: "EMAIL", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { type: "PHONE", regex: /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g },
  { type: "AADHAAR", regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g },
  { type: "PAN", regex: /([A-Z]{5}[0-9]{4}[A-Z])/g },
  {
    type: "PASSWORD",
    // Detect standalone keywords or key-value style (password, pwd, pass, key)
    // Examples: "password", "pwd=abcd1234", "key: sk_live_..."
    regex: /\b(password|pwd|pass|key)\b(?:\s*[:=]\s*\S{4,100})?/gi,
  },
  {
    type: "DATE",
    // Dates like dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, etc., plus common separators
    regex:
      /\b(?:[0-3]?\d[\/\-.](?:0?[1-9]|1[0-2])[\/\-.](?:19|20)\d{2}|(?:19|20)\d{2}[\/\-.](?:0?[1-9]|1[0-2])[\/\-.][0-3]?\d)\b/gi,
  },
  {
    type: "PERSON_NAME",
    // Heuristic: 2-3 capitalized words (simple, may FP)
    regex: /\b([A-Z][a-z]{1,}(?:\s[A-Z][a-z]{1,}){0,2})\b/g,
  },
  {
    type: "ORG_NAME",
    // Company/org with suffix, e.g., "Acme Technologies", "Foo Labs", "Bar Corp", etc.
    regex:
      /\b([A-Z][A-Za-z&.]+(?:\s[A-Z][A-Za-z&.]+)*)\s(?:Inc\.?|Ltd\.?|LLC|Corporation|Corp\.?|Technologies|Labs|Systems|University|Institute|Enterprises|Solutions)\b/gi,
  },
  {
    type: "LAYOFF",
    // Layoff/termination related keywords
    regex:
      /\b(layoff|layoffs|laidoff|laid\s*off|layed\s*off|downsizing|retrenchment|termination|terminated|redundancy|let\s*go|fired)\b/gi,
  },
  // ===== Contextual Level 2 (Personal) =====
  {
    type: "MEDICAL_CONDITION",
    regex:
      /\b(diabetes|hiv|cancer|depression|depressed|anxiety|asthma|bipolar|autism|adhd|migraine|hypertension|blood\s*pressure|cholesterol|tuberculosis|glucose|blood\s*sugar|insulin|therapist)\b/gi,
  },
  {
    type: "POLITICAL_OPINION",
    regex:
      /\b(vote\s*for|support\s*(?:the\s*)?party|left[- ]?wing|right[- ]?wing|liberal|conservative|socialist|communist|democrat|republican|election\s+opinion|political\s+opinion)\b/gi,
  },
  {
    type: "RELIGION",
    regex:
      /\b(hindu(?:ism)?|muslim|islam|christian(?:ity)?|sikh(?:ism)?|buddhist|buddhism|jain(?:ism)?|jew(?:ish)?|atheist|agnostic)\b/gi,
  },
  {
    type: "SEXUAL_ORIENTATION",
    regex:
      /\b(gay|lesbian|bisexual|queer|lgbtq\+?|transgender|non[- ]?binary|straight|sexual\s+orientation)\b/gi,
  },
  {
    type: "FINANCIAL_STATUS",
    regex:
      /\b(bankruptcy|insolvent|loan\s+default|defaults|overdue\s+loan|debt\b|credit\s+score|poor\s+credit|mortgage\s+arrears|foreclosure)\b/gi,
  },
  {
    type: "EMPLOYMENT_PROBLEM",
    regex:
      /\b(PIP|performance\s+improvement\s+plan|warning\s+letter|disciplinary\s+action)\b/gi,
  },
  // ===== Contextual Level 3 (Corporate/Confidential) =====
  {
    type: "CORPORATE_CONFIDENTIAL",
    regex:
      /\b(confidential|internal\s+use\s+only|proprietary|under\s+nda|do\s+not\s+share|strictly\s+confidential)\b/gi,
  },
  { type: "MEETING", regex: /\b(all[- ]hands|stand[- ]?up|townhall|roadmap\s+review|meeting\s+at|zoom\s+link|google\s+meet|calendar\s+invite|agenda)\b/gi },
  { type: "PROJECT_NAME", regex: /\b(?:project|codename|initiative)\s+([A-Z][A-Za-z0-9_-]{2,})\b/g },
  { type: "ROADMAP", regex: /\b(roadmap|release\s+plan|launch\s+plan|milestone\s+plan|gTM|go[- ]to[- ]market)\b/gi },
  {
    type: "CODE_SNIPPET",
    regex: /```[\s\S]*?```|\b(function|class|def|import|package|console\.log|SELECT\s+.+\s+FROM|#include|using\s+namespace)\b/gi,
  },
  {
    type: "SECURITY_VULN",
    regex:
      /\b(sql\s+injection|xss|buffer\s+overflow|cve-\d{4}-\d{4,7}|rce|remote\s+code\s+execution|privilege\s+escalation|csrf|directory\s+traversal|vulnerability|exploit)\b/gi,
  },
  {
    type: "INTERNAL_METRIC",
    regex:
      /\b(arr|mrr|revenue|gross\s+margin|retention|churn|dau|mau|growth\s*%|pipeline|burn\s+rate|runway)\b/gi,
  },
  {
    type: "DEFENSE_INFO",
    regex:
      /\b(classified|secret|top\s+secret|eyes\s+only|military|defen[cs]e|weapon\s+system|missile|drone|security\s+clearance|nato)\b/gi,
  },
  // ===== Contextual Level 4 (High-Risk Inferential) =====
  {
    type: "INFER_HEALTH",
    regex: /\b(pattern|indicator|likely|suggests|tends\s+to)\b[^.\n]{0,40}\b(health|medical|disease|condition)\b/gi,
  },
  {
    type: "INFER_FRAUD",
    regex: /\b(pattern|indicator|anomaly|suspicious)\b[^.\n]{0,40}\b(fraud|scam|money\s+laundering)\b/gi,
  },
  {
    type: "INFER_SUPPLY_CHAIN",
    regex: /\b(pattern|risk|indicator)\b[^.\n]{0,40}\b(supply\s+chain|logistics|shortage)\b/gi,
  },
  {
    type: "INFER_INSIDER",
    regex: /\b(pattern|hint|suspicion)\b[^.\n]{0,40}\b(insider\s+trading|non[- ]public\s+info)\b/gi,
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
    regex: /\b\d{1,4}\s+(street|st|road|rd|avenue|ave|block|sector|lane)\b/gi,
  },
];

// Run local detectors with index capture and light filtering
function runDetectors(text) {
  const STOPWORDS = new Set([
    "has","been","was","were","is","are","the","a","an","and","or","to","of","in","on","at","by","with","from",
    "laidoff","layoff","layoffs","downsizing","termination","terminated","redundancy","fired","let","go"
  ]);

  const found = [];
  // Custom password value extraction: mask the value, not the keyword
  const detectPasswords = () => {
    const results = [];
    const patterns = [
      /\b(?:password|pwd|pass|key)\b\s*(?:is|was|:=|:|=|->|-)?\s*(?:"([^"]{3,100})"|'([^']{3,100})'|([^\s,;]{3,100}))/gi,
      /\b(?:password|pwd|pass|key)\s+([^\s,;]{3,100})/gi,
    ];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(text)) !== null) {
        const val = m[1] || m[2] || m[3];
        if (!val) continue;
        // compute index of captured value within the match substring
        const rel = m[0].indexOf(val);
        const start = m.index + (rel >= 0 ? rel : 0);
        results.push({ type: "PASSWORD", value: val, index: start, length: val.length });
        if (p.lastIndex === m.index) p.lastIndex++;
      }
    }
    return results;
  };

  for (const det of DETECTORS) {
    const re = new RegExp(det.regex); // clone to avoid shared lastIndex issues
    re.lastIndex = 0;

    if (det.type === "PASSWORD") {
      found.push(...detectPasswords());
      continue;
    }
    let match;
    while ((match = re.exec(text)) !== null) {
      const value = match[0];

      // Filter PERSON_NAME to reduce obvious false positives
      if (det.type === "PERSON_NAME") {
        const parts = value.trim().split(/\s+/);
        const ok = parts.every((w) => w.length >= 3 && !STOPWORDS.has(w.toLowerCase()));
        if (!ok) {
          // Fallback: try single-word lowercase names within the span
          const wordRe = /\b[A-Za-z][a-z]{2,}\b/g;
          let sub;
          while ((sub = wordRe.exec(value)) !== null) {
            const w = sub[0];
            if (STOPWORDS.has(w.toLowerCase())) continue;
            found.push({
              type: "PERSON_NAME",
              value: w,
              index: match.index + sub.index,
              length: w.length,
            });
          }
          if (re.lastIndex === match.index) re.lastIndex++;
          continue;
        }
      }

      found.push({ type: det.type, value, index: match.index, length: value.length });

      if (re.lastIndex === match.index) re.lastIndex++;
    }
  }
  return found;
}

// Sanitize detected text
function sanitizeText(text, findings, allowedTypes) {
  let sanitized = text;
  const sorted = [...findings].sort((a, b) => b.value.length - a.value.length);

  for (const f of sorted) {
    if (!allowedTypes || allowedTypes.has(f.type)) {
      const escaped = f.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      sanitized = sanitized.replace(new RegExp(escaped, "g"), `[${f.type}]`);
    }
  }
  return sanitized;
}

// Prefer more specific entity types over generic PERSON_NAME on overlaps
function resolveOverlaps(findings) {
  const priority = new Map([
    ["EMAIL", 100],
    ["PASSWORD", 95],
    ["AADHAAR", 95],
    ["PAN", 95],
    ["CREDIT_CARD", 95],
    ["IFSC", 90],
    ["SECURITY_VULN", 93],
    ["CODE_SNIPPET", 92],
    ["CORPORATE_CONFIDENTIAL", 91],
    ["PROJECT_NAME", 90],
    ["ROADMAP", 90],
    ["INTERNAL_METRIC", 89],
    ["DEFENSE_INFO", 89],
    ["MEETING", 88],
    ["MEDICAL_CONDITION", 88],
    ["RELIGION", 88],
    ["SEXUAL_ORIENTATION", 88],
    ["POLITICAL_OPINION", 87],
    ["FINANCIAL_STATUS", 87],
    ["EMPLOYMENT_PROBLEM", 87],
    ["INFER_HEALTH", 70],
    ["INFER_FRAUD", 70],
    ["INFER_SUPPLY_CHAIN", 70],
    ["INFER_INSIDER", 70],
    ["IP_ADDRESS", 90],
    ["URL", 85],
    ["LAYOFF", 82],
    ["DATE", 80],
    ["ORG_NAME", 75],
    ["ADDRESS", 70],
    ["PHONE", 70],
    ["PERSON_NAME", 10],
  ]);

  // Sort by start index, then by higher priority, then longer length
  const items = [...findings].sort((a, b) => {
    if (a.index !== b.index) return a.index - b.index;
    const pa = priority.get(a.type) || 0;
    const pb = priority.get(b.type) || 0;
    if (pa !== pb) return pb - pa;
    return b.length - a.length;
  });

  const kept = [];
  for (const f of items) {
    const end = f.index + f.length;
    const overlaps = kept.some((k) => {
      const kEnd = k.index + k.length;
      return !(end <= k.index || f.index >= kEnd);
    });
    if (!overlaps) kept.push(f);
  }
  return kept;
}

// Map maskLevel -> set of entity types to mask
function getAllowedTypes(maskLevel) {
  const lvl = Math.max(10, Math.min(100, parseInt(maskLevel || 100, 10)));
  const steps = [
    { t: 10, add: ["EMAIL"] },
    { t: 20, add: ["PASSWORD"] },
    { t: 30, add: ["PHONE"] },
    { t: 40, add: ["URL"] },
    { t: 50, add: ["IP_ADDRESS"] },
    { t: 60, add: ["DATE"] },
    { t: 70, add: ["ORG_NAME", "MEDICAL_CONDITION", "RELIGION", "SEXUAL_ORIENTATION", "POLITICAL_OPINION", "FINANCIAL_STATUS", "EMPLOYMENT_PROBLEM"] },
    { t: 80, add: ["AADHAAR", "PAN", "PASSPORT", "IFSC", "CREDIT_CARD", "CORPORATE_CONFIDENTIAL", "MEETING", "PROJECT_NAME", "ROADMAP", "CODE_SNIPPET", "SECURITY_VULN", "INTERNAL_METRIC", "DEFENSE_INFO"] },
    { t: 90, add: ["PERSON_NAME", "LAYOFF", "ADDRESS"] },
    { t: 100, add: ["INFER_HEALTH", "INFER_FRAUD", "INFER_SUPPLY_CHAIN", "INFER_INSIDER"] },
  ];
  const set = new Set([
    // Always mask these sensitive contextual categories regardless of level (Levels 2 & 3)
    "MEDICAL_CONDITION",
    "POLITICAL_OPINION",
    "RELIGION",
    "SEXUAL_ORIENTATION",
    "FINANCIAL_STATUS",
    "EMPLOYMENT_PROBLEM",
    // Corporate / confidential (Level 3) always masked now
    "CORPORATE_CONFIDENTIAL",
    "PROJECT_NAME",
    "MEETING",
    "ROADMAP",
    "CODE_SNIPPET",
    "SECURITY_VULN",
    "INTERNAL_METRIC",
    "DEFENSE_INFO",
    // High-risk inferential (Level 4) now always masked
    "INFER_HEALTH",
    "INFER_FRAUD",
    "INFER_SUPPLY_CHAIN",
    "INFER_INSIDER",
  ]);
  for (const s of steps) {
    if (lvl >= s.t) s.add.forEach((x) => set.add(x));
  }
  return set;
}

// ===========================
// 1) ANALYZE TEXT
// ===========================
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    // ML Entities from Roshan's service
    let mlEntities = [];
    try {
      const ML = await axios.post(`${process.env.ML_SERVICE_URL}/analyze`, {
        text,
      });
      mlEntities = ML.data.entities || [];
    } catch {
      console.warn("ML service offline → using local detections");
    }

    let localFindings = runDetectors(text);
    localFindings = resolveOverlaps(localFindings);
    const allowed = getAllowedTypes(req.body?.maskLevel);
    const sanitized = sanitizeText(text, localFindings, allowed);

    // Local types are ground truth for response/logs to avoid false positives
    const localTypes = Array.from(new Set(localFindings.map((x) => String(x.type).toUpperCase())));

    // Encrypt fields
    const encryptedSummary = encryptString(sanitized);
    const encryptedEntities = encryptJSON(localTypes);
    const encryptedOriginal = encryptString(text);

    // Save encrypted log
    const log = await Log.create({
      username: req.user.username,
      eventType: "text_scan",
      encryptedSummary,
      encryptedEntities,
      encryptedOriginalText: encryptedOriginal,
    });

    return res.json({
      ok: true,
      entities: localTypes,
      sanitized,
      logId: log._id,
    });
  } catch (err) {
    console.error("❌ Analyze error:", err);
    return res.status(500).json({ error: "Analyze failed" });
  }
};

// ===========================
// 2) FETCH LOG METADATA
// ===========================
export const fetchLogs = async (req, res) => {
  try {
    const username = req.user.username;

    const logs = await Log.find({ username })
      .select("_id eventType createdAt encryptedSummary encryptedEntities")
      .sort({ createdAt: -1 })
      .lean();

    const shaped = logs.map((l) => {
      let summary = null;
      let detectedEntities = [];
      try {
        summary = l.encryptedSummary ? decryptToString(l.encryptedSummary) : null;
      } catch {}
      try {
        const arr = l.encryptedEntities ? decryptJSON(l.encryptedEntities) : [];
        detectedEntities = Array.isArray(arr)
          ? Array.from(new Set(arr.map((e) => String(e).toUpperCase())))
          : [];
      } catch {}

      return {
        _id: l._id,
        eventType: l.eventType,
        createdAt: l.createdAt,
        summary,
        detectedEntities,
      };
    });

    return res.json(shaped);
  } catch (err) {
    console.error("❌ Fetch logs error:", err);
    return res.status(500).json({ error: "Logs fetch failed" });
  }
};

// ===========================
// 3) GET FULL DECRYPTED LOG
// ===========================
export const getLog = async (req, res) => {
  try {
    const id = req.params.id;

    const log = await Log.findById(id).lean();
    if (!log) return res.status(404).json({ error: "Log not found" });

    if (log.username !== req.user.username)
      return res.status(403).json({ error: "Forbidden" });

    return res.json({
      summary: decryptToString(log.encryptedSummary),
      entities: decryptJSON(log.encryptedEntities),
      originalText: decryptToString(log.encryptedOriginalText),
      createdAt: log.createdAt,
    });
  } catch (err) {
    console.error("❌ Get log error:", err);
    return res.status(500).json({ error: "Decryption failed" });
  }
};

// ===========================
// 4) FILE UPLOAD + ANALYZE
// ===========================
export const uploadFile = async (req, res) => {
  try {
    if (!req.files?.file)
      return res.status(400).json({ message: "No file uploaded" });

    const file = req.files.file;
    const isPDF = file.mimetype === "application/pdf";
    const isImage = /^image\/(png|jpe?g)$/i.test(file.mimetype);
    if (!isPDF && !isImage) {
      return res.status(400).json({ message: "Upload PDF or image (PNG/JPG)" });
    }

    let text = "";
    if (isPDF) {
      const buffer = fs.readFileSync(file.tempFilePath);
      const pdfData = await pdfParse(buffer);
      text = pdfData.text || "";
    } else if (isImage) {
      try {
        const result = await Tesseract.recognize(file.tempFilePath, "eng");
        text = result?.data?.text || "";
      } catch (ocrErr) {
        console.warn("OCR failed", ocrErr);
        return res.status(500).json({ error: "Image OCR failed" });
      }
    }

    // Trim excessively long text to avoid huge logs
    if (text.length > 20000) text = text.slice(0, 20000);
    let findings = runDetectors(text);
    findings = resolveOverlaps(findings);
    const allowed = getAllowedTypes(req.body?.maskLevel);
    const sanitized = sanitizeText(text, findings, allowed);
    const entityTypes = [...new Set(findings.map((f) => f.type))];

    const encryptedSummary = encryptString(sanitized);
    const encryptedEntities = encryptJSON(entityTypes);
    const encryptedOriginal = encryptString(text.slice(0, 2000));

    const log = await Log.create({
      username: req.user.username,
      eventType: "file_scan",
      encryptedSummary,
      encryptedEntities,
      encryptedOriginalText: encryptedOriginal,
    });

    return res.json({
      ok: true,
      findings,
      entities: entityTypes,
      sanitized,
      logId: log._id,
    });
  } catch (err) {
    console.error("❌ PDF upload error:", err);
    return res.status(500).json({ error: "PDF processing failed" });
  }
};

// ===========================
// 5) USER STATS (PROFILE)
// ===========================
export const getStats = async (req, res) => {
  try {
    const username = req.user.username;

    // Parallel counts for efficiency
    const [textScanCount, fileScanCount] = await Promise.all([
      Log.countDocuments({ username, eventType: "text_scan" }),
      Log.countDocuments({ username, eventType: "file_scan" }),
    ]);
    const totalScans = textScanCount + fileScanCount;

    return res.json({
      username,
      textScanCount,
      fileScanCount,
      totalScans,
    });
  } catch (err) {
    console.error("❌ Stats error:", err);
    return res.status(500).json({ error: "Stats fetch failed" });
  }
};
