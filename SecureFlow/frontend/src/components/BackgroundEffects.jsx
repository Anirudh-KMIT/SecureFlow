// src/components/BackgroundEffects.jsx
import React, { useEffect, useRef } from "react";

export default function BackgroundEffects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const numParticles = 60;
    const colors = ["#a855f7", "#ec4899", "#8b5cf6", "#06b6d4"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 0.6,
        velocityY: (Math.random() - 0.5) * 0.6,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.fill();

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.x < 0 || particle.x > canvas.width)
          particle.velocityX *= -1;
        if (particle.y < 0 || particle.y > canvas.height)
          particle.velocityY *= -1;
      }

      requestAnimationFrame(drawParticles);
    }

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-[#0a001a] via-[#110028] to-[#050010]"
    />
  );
}
