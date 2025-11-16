import React, { useState } from "react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import PrivacyAnalyzer from "./components/PrivacyAnalyzer";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import NeonParticles from "./components/NeonParticles"; // 🌌 neon particles
import { useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const [user, setUser] = useState(
    localStorage.getItem("token")
      ? jwtDecode(localStorage.getItem("token"))
      : null
  );

  // Not logged in → send to /login (Welcome sits at /)
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);
  if (!user) return null;

  const toDisplayName = (s) => {
    if (!s) return "";
    return String(s)
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Logged in
  return (
    <div className="min-h-screen text-gray-100 bg-[#050010] relative overflow-hidden">
      {/* 🌌 Neon particles */}
      <NeonParticles />

      {/* Soft overlay gradient (on top of particles but behind content) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0018]/80 via-[#050010]/80 to-[#000006]/80 z-0"></div>

      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-4 bg-black/30 backdrop-blur-md border-b border-purple-800/20 relative z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-purple-400 tracking-wide">
            SecureFlow
          </h1>
          <p className="text-gray-400 text-sm mt-1">Contextual Privacy</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "dashboard"
                ? "bg-purple-700 shadow-md shadow-purple-900/40"
                : "bg-purple-900/40 hover:bg-purple-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "settings"
                ? "bg-purple-700 shadow-md shadow-purple-900/40"
                : "bg-purple-900/40 hover:bg-purple-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "profile"
                ? "bg-purple-700 shadow-md shadow-purple-900/40"
                : "bg-purple-900/40 hover:bg-purple-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <span className="text-sm text-gray-300">
            👋 Welcome,{" "}
            <span className="text-purple-400 font-semibold">
              {toDisplayName(user.username)}
            </span>
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setUser(null);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <motion.main
        className="w-11/12 max-w-6xl mx-auto py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <PrivacyAnalyzer />
            <Dashboard />
          </div>
        )}
        {activeTab === "settings" && <Settings />}
        {activeTab === "profile" && <Profile />}
      </motion.main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm pb-5 relative z-10">
        © 2025 SecureFlow | Built for CodeNovate ⚡
      </footer>
    </div>
  );
}
