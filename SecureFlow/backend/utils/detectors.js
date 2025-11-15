// backend/utils/detectors.js
// Helper detectors & sanitizers for the Privacy Analyzer

const EMAIL = {
  name: "EMAIL",
  // case-insensitive, captures usual email forms
  regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
};

const PHONE = {
  name: "PHONE",
  // common phone number patterns (international + local). We'll keep permissive.
  // examples: +91 98765 43210, 9876543210, 98765-43210, (123) 456-7890
  regex: /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{6,12}/g,
};

const PAN = {
  name: "PAN",
  // India PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
  regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi,
};

const AADHAAR = {
  name: "AADHAAR",
  // 12 digits, allow spaces
  regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
};

const PASSPORT = {
  name: "PASSPORT",
  // India passport: 8 characters (one letter + 7 digits usually). Make permissive.
  regex: /\b[A-PR-WYa-pr-wy][0-9]{7}\b/g,
};

const CREDIT_CARD = {
  name: "CREDIT_CARD",
  // broad CC patterns: groups of 13-19 digits with optional separators
  regex: /\b(?:\d[ -]*?){13,19}\b/g,
};

const IFSC = {
  name: "IFSC",
  // IFSC: 4 letters + 0 + 6 digits
  regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi,
};

const IP = {
  name: "IP_ADDRESS",
  // IPv4
  regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?:\.|$)){4}\b/g,
};

const URL_DET = {
  name: "URL",
  regex:
    /https?:\/\/[^\s/$.?#].[^\s]*/gi,
};

const DOB = {
  name: "DATE",
  // dates like dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, etc.
  regex:
    /\b(?:[0-3]?\d[\/\-\.](?:0?[1-9]|1[0-2])[\/\-\.](?:19|20)\d{2}|\b(?:19|20)\d{2}[\/\-\.](?:0?[1-9]|1[0-2])[\/\-\.][0-3]?\d)\b/g,
};

// Very small heuristic for names: capitalized word sequences (not perfect).
// We'll treat names with caution (mark low confidence) unless ML confirms.
const NAME_HEURISTIC = {
  name: "PERSON_NAME",
  regex: /\b([A-Z][a-z]{1,}\s(?:[A-Z][a-z]{1,}\s?){0,2})\b/g,
};

// Utility: Luhn check for credit card numbers
function luhnCheck(number) {
  const digits = number.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      d = d * 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// Masking helper: replace detected entity with [REDACTED_TYPE]
// keep first/last chars optionally for readability
function maskValue(value, type) {
  if (!value) return `[REDACTED_${type}]`;
  // For long values, keep structure and mask interior
  const cleaned = value.trim();
  if (type === "EMAIL") {
    const atIdx = cleaned.indexOf("@");
    if (atIdx > 1) {
      const local = cleaned.slice(0, Math.min(2, atIdx));
      return `${local}...[REDACTED_EMAIL]`;
    }
    return "[REDACTED_EMAIL]";
  }
  if (type === "PHONE") return "[REDACTED_PHONE]";
  if (type === "CREDIT_CARD") {
    // keep last 4 digits if present
    const digits = cleaned.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `xxxx-xxxx-xxxx-${last4}`;
  }
  return `[REDACTED_${type}]`;
}

// Run detectors over text and return list of findings
function runDetectors(text) {
  const detectors = [
    EMAIL,
    CREDIT_CARD,
    AADHAAR,
    PAN,
    PASSPORT,
    IFSC,
    IP,
    URL_DET,
    DOB,
    PHONE,
    NAME_HEURISTIC,
  ];

  const found = [];

  detectors.forEach((det) => {
    const { regex, name } = det;
    if (!regex) return;
    // reset lastIndex in case global regex reused
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = match[0];
      let confidence = "Low";

      // type-specific heuristics
      if (name === "EMAIL") confidence = "High";
      if (name === "CREDIT_CARD") {
        // validate with Luhn; boost confidence if valid
        if (luhnCheck(value)) confidence = "High";
        else confidence = "Low";
      }
      if (name === "AADHAAR") {
        // Simple check: 12 digits -> medium/high
        if (value.replace(/\s/g, "").length === 12) confidence = "High";
      }
      if (name === "PAN") confidence = "High";
      if (name === "IP_ADDRESS") confidence = "High";
      if (name === "URL") confidence = "High";
      if (name === "DATE") confidence = "Medium";
      if (name === "PERSON_NAME") confidence = "Low";

      found.push({
        type: name,
        value,
        index: match.index,
        length: value.length,
        confidence,
      });

      // defend against infinite loops for zero-length matches
      if (regex.lastIndex === match.index) regex.lastIndex++;
    }
  });

  // merge overlapping / duplicates (simple approach)
  const merged = [];
  found.forEach((f) => {
    const key = `${f.type}:${f.index}:${f.length}`;
    if (!merged.some((m) => m.type === f.type && m.index === f.index && m.length === f.length)) {
      merged.push(f);
    }
  });

  // sort by index
  merged.sort((a, b) => a.index - b.index);

  return merged;
}

export {
  runDetectors,
  maskValue,
  luhnCheck,
};
