import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Settings as SettingsIcon, Home } from "lucide-react";

export default function Navbar({ username, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [scrollY, setScrollY] = useState(0);

  // Track scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic gradient colors based on scroll position
  const gradientShift = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "linear-gradient(90deg, rgba(10,10,30,0.95) 0%, rgba(40,10,60,0.9) 100%)",
      "linear-gradient(90deg, rgba(20,10,50,0.95) 0%, rgba(80,10,100,0.9) 100%)"
    ]
  );

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      style={{
        background: gradientShift,
        backdropFilter: "blur(20px)",
      }}
      className="fixed top-0 left-0 w-full z-50 border-b border-[#1d2033] shadow-[0_0_25px_rgba(255,255,255,0.03)] transition-all duration-500"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div
          className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-purple-400 bg-clip-text text-transparent cursor-pointer select-none tracking-tight"
          onClick={() => navigate("/")}
        >
          SecureFlow
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-10 text-sm font-medium relative">
          {/* Dashboard */}
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-1.5 transition-all ${
              isActive("/") ? "text-fuchsia-400" : "text-gray-300 hover:text-fuchsia-400"
            }`}
          >
            <Home size={16} />
            <span>Dashboard</span>
            {isActive("/") && (
              <motion.div
                layoutId="underline"
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(216,70,239,0.8)]"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </motion.button>

          {/* Settings */}
          <motion.button
            onClick={() => navigate("/settings")}
            whileHover={{ scale: 1.08, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-1.5 transition-all ${
              isActive("/settings")
                ? "text-fuchsia-400"
                : "text-gray-300 hover:text-fuchsia-400"
            }`}
          >
            <SettingsIcon
              size={16}
              className={`transition-transform ${
                isActive("/settings") ? "text-fuchsia-400" : ""
              }`}
            />
            <span>Settings</span>
            {isActive("/settings") && (
              <motion.div
                layoutId="underline"
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(216,70,239,0.8)]"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </motion.button>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">
            👋 Welcome,{" "}
            <span className="text-fuchsia-400 font-semibold">{username}</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-1.5 rounded-lg font-semibold transition-all shadow-md"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
