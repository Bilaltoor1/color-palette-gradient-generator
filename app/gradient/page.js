"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import GradientGenerator from "../components/GradientGenerator";

export default function GradientPage() {
  const [currentGradient, setCurrentGradient] = useState("linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)");

  const handleGradientChange = useCallback((gradient) => {
    setCurrentGradient(gradient);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero area */}
      <section className="w-full" style={{ background: currentGradient }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">Gradient Generator</h1>
          <p className="mt-3 text-white/90 max-w-2xl">Create beautiful gradients with multiple color stops, linear and radial types.</p>
        </div>
      </section>

      {/* Tool Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <GradientGenerator onGradientChange={handleGradientChange} />
      </main>
    </div>
  );
}
