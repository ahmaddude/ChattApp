import React, { useRef, useEffect } from "react";

const RippleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let ripples = [];

    const handleMouseMove = (e) => {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 1 });
    };

    const animate = () => {
      const styles = getComputedStyle(document.documentElement);
      // Use DaisyUI v5 variables:
      const bg = styles.getPropertyValue("--color-base-100").trim();
      const primary = styles.getPropertyValue("--color-primary").trim();

      // Clear and paint background per theme
      ctx.fillStyle = bg || "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw wave ripples using theme's primary color
      ripples = ripples.filter((r) => r.alpha > 0.01);
      ripples.forEach((r) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${primary ? primary : "rgba(0, 0, 0)"}${r.alpha < 1 ? ` ${r.alpha}` : ""}`;
        ctx.lineWidth = 2;
        ctx.stroke();
        r.radius += 2;
        r.alpha *= 0.96;
      });

      requestAnimationFrame(animate);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1]" />;
};

export default RippleBackground;
