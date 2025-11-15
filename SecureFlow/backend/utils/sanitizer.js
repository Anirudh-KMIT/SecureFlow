// backend/utils/sanitizer.js

/**
 * sanitizeInput
 * Simple text sanitizer that removes unwanted characters and
 * trims whitespace before analysis.
 * Also masks any directly visible sensitive patterns like emails and phone numbers.
 */

export function sanitizeInput(text) {
  if (!text || typeof text !== "string") return "";

  // Remove extra spaces, control chars, etc.
  let clean = text.trim().replace(/\s+/g, " ");

  // Mask emails
  clean = clean.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    "[EMAIL]"
  );

  // Mask phone numbers (simple pattern)
  clean = clean.replace(/\b\d{10}\b/g, "[PHONE]");

  return clean;
}
