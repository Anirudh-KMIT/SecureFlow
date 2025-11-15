// src/components/Login.jsx
import React, { useState } from "react";
import { registerOrLogin } from "../services/api";
import BackgroundEffects from "./BackgroundEffects";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await registerOrLogin(username, password, isRegister);
    setLoading(false);

    if (success) {
      // ✅ Store user token handled in API, now reload App
      window.location.href = "/";
    } else {
      alert("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050010] text-white relative overflow-hidden">
      <BackgroundEffects />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0018]/70 via-[#050010]/70 to-[#000006]/70 z-0"></div>

      <div className="bg-[#1E1E2E]/80 p-8 rounded-2xl border border-gray-700 shadow-2xl w-96 text-center backdrop-blur-xl z-10">
        <h2 className="text-2xl mb-4 font-semibold text-fuchsia-400">
          {isRegister ? "Register" : "Login"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded bg-[#2A2A3C] text-gray-100 border border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded bg-[#2A2A3C] text-gray-100 border border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 hover:opacity-90 transition-all font-semibold"
          >
            {loading
              ? "Processing..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className="text-gray-400 mt-3 text-sm">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            className="text-fuchsia-400 cursor-pointer hover:underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}
