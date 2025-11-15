import { motion } from "framer-motion";

export default function AnimatedBackground() {
  const particles = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#1E1E2E] via-[#2A1E46] to-[#0F172A]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 opacity-10 blur-2xl"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.6 + 0.2,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.6 + 0.2,
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          style={{
            width: 250,
            height: 250,
          }}
        />
      ))}
    </div>
  );
}
