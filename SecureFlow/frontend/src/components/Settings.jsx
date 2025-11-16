import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Settings() {
  const [maskLevel, setMaskLevel] = useState(() => {
    const saved = parseInt(localStorage.getItem("maskLevel"), 10);
    return Number.isFinite(saved) ? saved : 100;
  });
  const [modelMode, setModelMode] = useState("Standard");

  useEffect(() => {
    const savedMode = localStorage.getItem("modelMode");
    if (savedMode) setModelMode(savedMode);
  }, []);

  return (
    <motion.div
      className="bg-[#0d001f]/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-purple-900/40 text-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-purple-400 mb-6">
        ⚙️ Analyzer Settings
      </h2>

      <div className="mb-6">
        <label className="block text-sm mb-2">Masking Sensitivity (in 10s)</label>
        <input
          type="range"
          min="10"
          max="100"
          step="10"
          value={maskLevel}
          onChange={(e) => setMaskLevel(parseInt(e.target.value, 10))}
          className="w-full accent-purple-500"
        />
        <p className="text-sm mt-1 text-gray-400">
          Current: <span className="text-purple-300">{maskLevel}</span>
        </p>
        <ul className="text-xs text-gray-500 mt-2 space-y-1">
          <li>10: Email</li>
          <li>20: + Password</li>
          <li>30: + Phone</li>
          <li>40: + URL</li>
          <li>50: + IP Address</li>
          <li>60: + Date (DOB)</li>
          <li>70: + Organization Names</li>
          <li>80: + IDs (Aadhaar, PAN, Passport, IFSC, Credit Card)</li>
          <li>90: + Person Names</li>
          <li>100: + Layoff Keywords and All</li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-2">Model Mode</label>
        <select
          value={modelMode}
          onChange={(e) => setModelMode(e.target.value)}
          className="w-full bg-[#15002a] border border-purple-900/40 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option>Standard</option>
          <option>ML Enhanced</option>
          <option>Fast Mode</option>
        </select>
      </div>

      <button
        className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
        onClick={() => {
          localStorage.setItem("maskLevel", String(maskLevel));
          localStorage.setItem("modelMode", modelMode);
        }}
      >
        Save Settings
      </button>
    </motion.div>
  );
}
