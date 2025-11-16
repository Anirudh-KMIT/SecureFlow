import React, { useEffect, useState } from "react";
import { fetchStats } from "../services/api";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const toDisplayName = (s) => {
    if (!s) return "";
    return String(s)
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchStats();
        if (mounted) setStats(data);
      } catch (e) {
        if (mounted) setError("Failed to load stats");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
        <span className="bg-purple-700/30 px-3 py-1 rounded-md">Profile</span>
      </h2>

      <div className="bg-[#120020] border border-purple-800/40 rounded-lg p-6 shadow-lg shadow-purple-900/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Logged in as:</p>
            <p className="text-lg font-bold text-purple-400">{toDisplayName(user.username)}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Text Analyses</p>
              <p className="text-2xl font-bold text-fuchsia-400">
                {stats?.textScanCount ?? 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">File Analyses</p>
              <p className="text-2xl font-bold text-fuchsia-400">
                {stats?.fileScanCount ?? 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-2xl font-bold text-fuchsia-400">
                {stats?.totalScans ?? 0}
              </p>
            </div>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading stats...</p>}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-[#1d0033] rounded-md p-4 border border-purple-700/30">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">PII Sensitivity</p>
              <p className="text-sm text-gray-300">Mask Level: <span className="text-fuchsia-400 font-semibold">{localStorage.getItem("maskLevel") || 100}</span></p>
            </div>
            <div className="bg-[#1d0033] rounded-md p-4 border border-purple-700/30">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Last Update</p>
              <p className="text-sm text-gray-300">{new Date().toLocaleString()}</p>
            </div>
            <div className="bg-[#1d0033] rounded-md p-4 border border-purple-700/30">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Session</p>
              <p className="text-sm text-gray-300">Active</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
