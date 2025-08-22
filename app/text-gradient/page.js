"use client";

import { useState } from "react";
import TextGradientGenerator from "../components/TextGradientGenerator";
import { toast } from "react-hot-toast";
import { Copy, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiCss3Fill, RiTailwindCssFill } from "react-icons/ri";

export default function TextGradientPage() {
  const [currentGradient, setCurrentGradient] = useState("linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)");
  const [textCss, setTextCss] = useState("");
  const [tailwindClasses, setTailwindClasses] = useState("");
  const [tailwindBgClasses, setTailwindBgClasses] = useState("");

  const copyCssToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textCss);
      toast.success("CSS copied");
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  const copyTailwindToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tailwindClasses);
      toast.success("Tailwind classes copied");
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  const copyTailwindBgToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tailwindBgClasses);
      toast.success("Tailwind background classes copied");
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <section 
        className="w-full bg-card/80 backdrop-blur border-b border-border"
        style={{ background: currentGradient }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white/90 drop-shadow">Text Gradient Generator</h1>
          <p className="mt-3 text-white/80 max-w-2xl">Design gradient-filled headings and copy CSS for your site.</p>
        </div>
      </section>

      {/* Tool */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <TextGradientGenerator onGradientChange={setCurrentGradient} onCssChange={setTextCss} onTailwindChange={setTailwindClasses} onTailwindBgChange={setTailwindBgClasses} />

        {/* Copy CSS block (same layout as gradient page) */}
        <div 
          className="w-full min-h-32 rounded-xl border border-border p-4 flex flex-col justify-end mt-6"
          style={{ background: currentGradient }}
        >
          <div className="bg-card/80 backdrop-blur rounded-lg p-3 space-y-2 border border-border">
            <pre className="text-xs font-mono text-card-foreground whitespace-pre-wrap break-all">
              {textCss}
            </pre>
            <Button
              onClick={copyCssToClipboard}
              className="inline-flex bg-card/80 backdrop-blur text-card-foreground items-center gap-2 px-3 py-1.5 text-xs rounded border border-border transition"
            >
              <RiCss3Fill className="w-3 h-3" aria-hidden />
              <span>Copy CSS</span>
            </Button>
          </div>
        </div>

        {/* Tailwind classes copy block */}
        <div 
          className="w-full py-4 rounded-xl border border-border p-4 flex flex-col justify-end mt-4"
          style={{ background: currentGradient }}
        >
          <div className="bg-card/80 backdrop-blur rounded-lg p-3 space-y-2 border border-border">
            <pre className="text-xs font-mono text-card-foreground whitespace-pre-wrap break-all">
              {tailwindClasses}
            </pre>
            <Button
              onClick={copyTailwindToClipboard}
              className="inline-flex bg-card/80 backdrop-blur text-card-foreground items-center gap-2 px-3 py-1.5 text-xs rounded border border-border transition"
            >
              <RiTailwindCssFill className="w-3 h-3" aria-hidden />
              <span>Copy Tailwind Classes</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
