// src/services/api.js

// Force backend URL to 5001 for local dev reliability
const BASE_URL = "http://127.0.0.1:5001/api";
const PRIVACY_URL = `${BASE_URL}/privacy`;

function authHeaders(json = true) {
  const token = localStorage.getItem("token");
  return json
    ? {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { Authorization: `Bearer ${token}` };
}

// === AUTH ===
export async function registerOrLogin(username, password, isRegister = false) {
  const mode = isRegister ? "register" : "login";
  const res = await fetch(`${BASE_URL}/auth/${mode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    return true;
  }
  return false;
}

// === TEXT ANALYSIS ===
export async function analyzeText(text) {
  const maskLevel = parseInt(localStorage.getItem("maskLevel"), 10) || 100;
  const response = await fetch(`${PRIVACY_URL}/analyze`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ text, maskLevel }),
  });

  return await response.json();
}

// === LOGS ===
export async function fetchLogs() {
  const response = await fetch(`${PRIVACY_URL}/logs`, {
    headers: authHeaders(false),
  });
  return await response.json();
}

// === FILE UPLOAD ===
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const maskLevel = parseInt(localStorage.getItem("maskLevel"), 10) || 100;
  formData.append("maskLevel", String(maskLevel));

  const response = await fetch(`${PRIVACY_URL}/upload`, {
    method: "POST",
    headers: authHeaders(false),
    body: formData,
  });

  return await response.json();
}

// === USER STATS ===
export async function fetchStats() {
  const response = await fetch(`${PRIVACY_URL}/stats`, {
    headers: authHeaders(false),
  });
  return await response.json();
}
