import { useEffect, useRef } from "react";

export default function NeonParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let mouse = { x: 0, y: 0 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const random = (min, max) => Math.random() * (max - min) + min;

    const createParticles = (count) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: random(0, canvas.width),
          y: random(0, canvas.height),
          size: random(1, 3),
          speedX: random(-0.5, 0.5),
          speedY: random(-0.5, 0.5),
          color: `hsl(${random(250, 290)}, 80%, 70%)`,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;

        // bounce at edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // mouse interaction
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x += dx / dist;
          p.y += dy / dist;
        }
      });
      requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    resize();
    createParticles(60);
    drawParticles();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    ></canvas>
  );
}
