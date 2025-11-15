// src/services/api.js

const BASE_URL = "http://127.0.0.1:5000/api";
const PRIVACY_URL = `${BASE_URL}/privacy`;

// =============================
// 🔐 Helper: Get Auth Headers
// =============================
function authHeaders(json = true) {
  const token = localStorage.getItem("token");
  return json
    ? {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        Authorization: `Bearer ${token}`,
      };
}

// =============================
// ✅ AUTHENTICATION
// =============================
export async function registerOrLogin(username, password, isRegister = false) {
  const mode = isRegister ? "register" : "login";

  try {
    const res = await fetch(`${BASE_URL}/auth/${mode}`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ username }));
      return true;
    } else {
      console.error("❌ Auth failed:", data);
      return false;
    }
  } catch (err) {
    console.error("🚨 Auth request failed:", err);
    return false;
  }
}

// =============================
// ✅ DECRYPTED LOG FETCHER
// =============================
export async function fetchDecryptedLog(logId) {
  try {
    const response = await fetch(`${PRIVACY_URL}/log/${logId}`, {
      headers: authHeaders(false),
    });

    if (!response.ok) throw new Error("Failed to fetch decrypted log");
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching decrypted log:", error);
    return { error: "Failed to fetch decrypted log" };
  }
}

// =============================
// ✅ PRIVACY ANALYZER (Text Mode)
// =============================
export async function analyzeText(text) {
  try {
    const response = await fetch(`${PRIVACY_URL}/analyze`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Analyze request failed");
    return await response.json();
  } catch (error) {
    console.error("❌ Error analyzing text:", error);
    return { ok: false, error: "Server error" };
  }
}

// =============================
// ✅ FETCH LOGS (Audit History)
// =============================
export async function fetchLogs() {
  try {
    const response = await fetch(`${PRIVACY_URL}/logs`, {
      headers: authHeaders(false),
    });

    if (!response.ok) throw new Error("Failed to fetch logs");
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    return [];
  }
}

// =============================
// ✅ FILE UPLOAD (PDF / IMAGE)
// =============================
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${PRIVACY_URL}/upload`, {
      method: "POST",
      headers: authHeaders(false), // ❗ No JSON header here
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    return await response.json();
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    return { error: "Upload failed" };
  }
}
