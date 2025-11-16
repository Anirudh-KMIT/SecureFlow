import React from "react";
import NeonParticles from "./NeonParticles";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050010] text-white relative overflow-hidden">
      <NeonParticles />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0018]/70 via-[#050010]/70 to-[#000006]/70 z-0"></div>

      <div className="z-10 text-center px-6">
        <h1 className="text-5xl font-bold text-purple-400 mb-4 tracking-wide">
          SecureFlow
        </h1>
        <p className="text-gray-300 text-lg">
          SecureFlow: Detects and masks sensitive data in text and files.
        </p>
        <button
          className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-md shadow-purple-900/40"
          onClick={() => navigate("/login")}
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}
