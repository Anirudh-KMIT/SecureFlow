// backend/utils/encryption.js
import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM

function getKey() {
  const b64 = process.env.ENCRYPTION_KEY_BASE64;
  if (!b64) throw new Error("ENCRYPTION_KEY_BASE64 missing in .env");

  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY_BASE64 must decode to 32 bytes");
  }

  return key;
}

// Encrypt a raw string -> ciphertext, iv, tag
export function encryptString(text) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

// Decrypt payload into raw string
export function decryptToString({ ciphertext, iv, tag }) {
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

// Encrypt JS object (array / object / any)
export function encryptJSON(obj) {
  return encryptString(JSON.stringify(obj));
}

// Decrypt payload and parse JSON
export function decryptJSON(payload) {
  const text = decryptToString(payload);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
