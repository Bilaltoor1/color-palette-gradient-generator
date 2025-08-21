"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hsvToHex } from "./PaletteUtils";

export default function ColorWheel({ size = 260, hsv, onChange, className = "" }) {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = size / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Draw hue wheel with saturation radial gradient
    ctx.clearRect(0, 0, size, size);

    for (let angle = 0; angle < 360; angle += 1) {
      const start = ((angle - 1) * Math.PI) / 180;
      const end = (angle * Math.PI) / 180;
      const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      grad.addColorStop(0, `hsl(${angle}, 0%, 100%)`);
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

  // Middle hole for better look (optional)
    ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.4, 0, Math.PI * 2);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [size]);

  const handlePointer = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left - radius;
    const y = clientY - rect.top - radius;
    const dist = Math.sqrt(x * x + y * y);

  if (dist < radius * 0.4 || dist > radius) return; // ignore center hole and outside

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    angle = (angle + 360) % 360;
  const sat = Math.min(1, Math.max(0, dist / radius));
  // Ensure numeric values are passed
  const newH = Number.isFinite(angle) ? angle : 0;
  const newS = Number.isFinite(sat) ? sat : 0;
  const newV = (hsv && typeof hsv.v === 'number') ? hsv.v : 1;
  onChange({ h: newH, s: newS, v: newV });
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        handlePointer(t.clientX, t.clientY);
      } else {
        handlePointer(e.clientX, e.clientY);
      }
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, hsv.v]);

  const cursor = useMemo(() => {
    const r = radius * hsv.s;
    const rad = (hsv.h * Math.PI) / 180;
    return {
      x: radius + r * Math.cos(rad),
      y: radius + r * Math.sin(rad),
    };
  }, [hsv.h, hsv.s, radius]);

  return (
    <div className={`${className} relative inline-block`} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseDown={(e) => {
          setIsDragging(true);
          handlePointer(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          const t = e.touches[0];
          handlePointer(t.clientX, t.clientY);
        }}
        className="rounded-full shadow-sm border border-black/10 dark:border-white/15 touch-none select-none block w-full h-full"
      />
      <div
        ref={cursorRef}
        className="pointer-events-none absolute"
        style={{
          left: 0,
          top: 0,
          transform: `translate(${cursor.x - 6}px, ${cursor.y - 6}px)`,
        }}
      >
        <div
          className="w-3 h-3 rounded-full ring-2 ring-white/90 shadow"
          style={{ backgroundColor: hsvToHex(hsv) }}
        />
      </div>
    </div>
  );
}
