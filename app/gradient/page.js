"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import GradientGenerator from "../components/GradientGenerator";
import { Code } from "lucide-react";

export default function GradientPage() {
  const [currentGradient, setCurrentGradient] = useState("linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)");
  const [tailwindBgClasses, setTailwindBgClasses] = useState("");

  const handleGradientChange = useCallback((gradient) => {
    setCurrentGradient(gradient);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero area */}
  <section className={`w-full ${tailwindBgClasses}`} style={{ background: currentGradient }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">Gradient Generator</h1>
          <p className="mt-3 text-white/90 max-w-2xl">Create beautiful gradients with multiple color stops, linear and radial types.</p>
        </div>
      </section>

      {/* Tool Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <GradientGenerator onGradientChange={handleGradientChange} onTailwindBgChange={setTailwindBgClasses} />
        {/* Tailwind background classes copy block */}
        <div 
          className="w-full py-4 rounded-xl border border-black/10 dark:border-white/15 p-4 flex flex-col justify-end mt-4"
          style={{ background: currentGradient }}
        >
          <div className="bg-white/90 dark:bg-black/80 backdrop-blur rounded-lg p-3 space-y-2">
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all">
              {tailwindBgClasses}
            </pre>
            <button
              onClick={async () => { await navigator.clipboard.writeText(tailwindBgClasses); }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/30 hover:bg-white/90 dark:hover:bg-black/50 transition"
            >
              <Code className="w-3 h-3" aria-hidden />
              <span>Copy Tailwind BG Classes</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
