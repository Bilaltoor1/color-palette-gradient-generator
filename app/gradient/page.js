"use client";
import { useState, useCallback } from "react";
import GradientGenerator from "../components/GradientGenerator";
import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiTailwindCssFill } from "react-icons/ri";
import toast from "react-hot-toast";

export default function GradientPage() {
  const [currentGradient, setCurrentGradient] = useState("linear-gradient(90deg, rgba(130, 83, 255, 1) 0%, rgba(78, 205, 196, 1) 100%)");
  const [tailwindBgClasses, setTailwindBgClasses] = useState("");

  const handleGradientChange = useCallback((gradient) => {
    setCurrentGradient(gradient);
  }, []);
 const copyTailwind = async () => {
    try {
      await navigator.clipboard.writeText(tailwindBgClasses);
      toast.success("Tailwind copied successfully");
    } catch (e) {
      console.error("Copy failed", e);
      toast.error("Copy failed");
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero area */}
      <section className="w-full bg-card/80 backdrop-blur border-b border-border" style={{ background: currentGradient }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 drop-shadow">Gradient Generator</h1>
          <p className="mt-3 text-white/80 max-w-2xl">Create beautiful gradients with multiple color stops, linear and radial types.</p>
        </div>
      </section>

      {/* Tool Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <GradientGenerator onGradientChange={handleGradientChange} onTailwindBgChange={setTailwindBgClasses} />
        {/* Tailwind background classes copy block */}
        <div 
          className="w-full py-4 rounded-xl border border-border p-4 flex flex-col justify-end mt-4"
          style={{ background: currentGradient }}
        >
          <div className="bg-card/80 backdrop-blur rounded-lg p-3 space-y-2 border border-border">
            <pre className="text-xs font-mono text-card-foreground whitespace-pre-wrap break-all">
              {tailwindBgClasses}
            </pre>
            <Button
              onClick={()=>copyTailwind()}
              className="inline-flex bg-card/80 backdrop-blur cursor-pointer text-card-foreground items-center gap-2 px-3 py-1.5 text-xs rounded border border-border transition "
            >
              <RiTailwindCssFill className="w-3 h-3" aria-hidden />
              <span>Copy Tailwind</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
