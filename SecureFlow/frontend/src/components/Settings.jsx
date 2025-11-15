import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Settings() {
  const [sensitivity, setSensitivity] = useState(0.8);
  const [modelMode, setModelMode] = useState("Standard");

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
        <label className="block text-sm mb-2">Detection Sensitivity</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={sensitivity}
          onChange={(e) => setSensitivity(e.target.value)}
          className="w-full accent-purple-500"
        />
        <p className="text-sm mt-1 text-gray-400">
          Current: <span className="text-purple-300">{sensitivity}</span>
        </p>
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

      <button className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition">
        Save Settings
      </button>
    </motion.div>
  );
}
