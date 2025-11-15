import crypto from "crypto";

const keyBase64 = process.env.ENCRYPTION_KEY_BASE64;
if (!keyBase64) {
  console.warn("WARNING: ENCRYPTION_KEY_BASE64 not set. Use only for local dev!");
}

// Decode key or use fallback 256-bit key
const key = keyBase64 ? Buffer.from(keyBase64, "base64") : crypto.randomBytes(32);

/**
 * Encrypts plaintext using AES-256-GCM
 */
export function encryptData(plaintext) {
  const iv = crypto.randomBytes(12); // GCM standard IV length
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/**
 * Decrypts AES-256-GCM ciphertext
 */
export function decryptData({ ciphertext, iv, tag }) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
