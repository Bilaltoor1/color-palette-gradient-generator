"use client";

import { useMemo, useRef, useState } from "react";
import ColorWheel from "./components/ColorWheel";
import PalettePreview from "./components/PalettePreview";
import { generatePalette, hsvToHex, hsvToRgb, hsvToHsl } from "./components/PaletteUtils";
import { Copy, Check } from "lucide-react";

const SCHEMES = [
  { id: "complementary", label: "Complementary" },
  { id: "monochromatic", label: "Monochromatic" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "tetradic", label: "Tetradic" },
];

export default function Home() {
  const [scheme, setScheme] = useState("complementary");
  const [hsv, setHsv] = useState({ h: 210, s: 0.9, v: 0.9 });
  const [paletteSize, setPaletteSize] = useState(5);
  const exportRef = useRef(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const palette = useMemo(
    () => generatePalette(hsv, scheme, paletteSize),
    [hsv, scheme, paletteSize]
  );

  const heroHex = useMemo(() => hsvToHex(hsv), [hsv]);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1200);
      setToast({ msg: "Copied to clipboard", type: "info" });
      setTimeout(() => setToast({ msg: "", type: "info" }), 1400);
    } catch (e) {
      console.error("Copy failed", e);
      setToast({ msg: "Copy failed", type: "error" });
      setTimeout(() => setToast({ msg: "", type: "info" }), 1600);
    }
  };

  function Toast({ message, type = "info" }) {
    if (!message) return null;
    const bg = type === "error" ? "bg-red-600" : "bg-emerald-600";
    return (
      <div className={`fixed right-4 bottom-6 z-50 ${bg} text-white px-4 py-2 rounded-md shadow-sm`}>
        {message}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero area changes with base color */}
      <section
        className="w-full"
        style={{
          background: `linear-gradient(135deg, ${heroHex} 0%, ${hsvToHex({ ...hsv, v: Math.min(1, hsv.v * 0.6) })} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">
            Color Palette Studio
          </h1>
          <p className="mt-3 text-white/90 max-w-2xl">
            Build palettes like Canva: complementary, monochromatic, analogous, triadic, and tetradic.
          </p>
        </div>
      </section>

      {/* Tool */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-xs uppercase tracking-wide text-foreground/70 mb-1">Scheme</label>
              <div className="flex gap-2 flex-wrap">
                {SCHEMES.map((s) => (
                  <button
                    key={s.id}
                    className={`xs:text-sm text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      scheme === s.id
                        ? "bg-foreground text-background border-transparent"
                        : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    onClick={() => setScheme(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-start">
              <ColorWheel
                size={260}
                hsv={hsv}
                onChange={setHsv}
                className="mx-auto"
              />
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/70 mb-1">
                    Base color
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md border border-black/10 dark:border-white/15"
                      style={{ backgroundColor: heroHex }}
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-foreground/70">HEX</span>
                      <span className="font-mono">{heroHex}</span>
                      <span className="text-foreground/70">RGB</span>
                      <span className="font-mono">
                        {(() => {
                          const { r, g, b } = hsvToRgb(hsv);
                          return `${r}, ${g}, ${b}`;
                        })()}
                      </span>
                      <span className="text-foreground/70">HSL</span>
                      <span className="font-mono">
                        {(() => {
                          const { h, s, l } = hsvToHsl(hsv);
                          return `${Math.round(h)}°, ${Math.round(
                            s * 100
                          )}%, ${Math.round(l * 100)}%`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                <label className="text-xs uppercase tracking-wide text-foreground/70 mb-1">Palette size</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={paletteSize}
                    onChange={(e) => setPaletteSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm tabular-nums w-6 text-right">
                    {paletteSize}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                    onClick={() => setHsv((prev) => ({ ...prev, s: 0.9, v: 0.9 }))}
                    title="Reset value"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <h2 className="text-lg font-semibold">Palette preview</h2>
              <PalettePreview exportRef={exportRef} palette={palette} />
            </div>

            <div ref={exportRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2">
              {palette.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-visible border border-black/10 dark:border-white/15 group relative md:flex md:flex-row items-stretch"
                >
                  <div
                    className="h-16 md:h-auto md:w-16 flex-shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="p-1 text-xs space-y-1 flex-1">
                    <button
                      className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 backdrop-blur hover:bg-white/95 dark:hover:bg-black/50 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === i ? null : i);
                      }}
                      title="Copy options"
                      aria-haspopup="true"
                      aria-expanded={openMenu === i}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {openMenu === i && (
                      <div
                        className="absolute right-1 top-8 z-20 w-32 bg-white/95 dark:bg-black/80 border border-black/10 dark:border-white/10 rounded-md shadow-md p-1 text-xs overflow-visible"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                          onClick={() => {
                            copyToClipboard(c.hex, `hex-${i}`);
                            setOpenMenu(null);
                          }}
                        >
                          Copy HEX
                        </button>
                        <button
                          className="w-full text-left px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                          onClick={() => {
                            copyToClipboard(`${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}`, `rgb-${i}`);
                            setOpenMenu(null);
                          }}
                        >
                          Copy RGB
                        </button>
                        <button
                          className="w-full text-left px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                          onClick={() => {
                            copyToClipboard(
                              `${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%`,
                              `hsl-${i}`
                            );
                            setOpenMenu(null);
                          }}
                        >
                          Copy HSL
                        </button>
                        <button
                          className="w-full text-left px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                          onClick={() => {
                            const all = `${c.hex}\nRGB(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})\nHSL(${Math.round(
                              c.hsl.h
                            )}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%)`;
                            copyToClipboard(all, `card-${i}`);
                            setOpenMenu(null);
                          }}
                        >
                          Copy All
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 items-center gap-x-1 gap-y-1">
                      <div className="text-foreground/70 text-xs">HEX</div>
                      <button
                        className="font-mono text-xs text-left truncate"
                        onClick={() => copyToClipboard(c.hex, `hex-${i}`)}
                        title="Copy HEX"
                      >
                        {c.hex}
                      </button>
                      <div className="text-foreground/70 text-xs">RGB</div>
                      <button
                        className="font-mono text-xs text-left truncate"
                        onClick={() =>
                          copyToClipboard(`${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}`, `rgb-${i}`)
                        }
                        title="Copy RGB"
                      >
                        {c.rgb.r}, {c.rgb.g}, {c.rgb.b}
                      </button>
                      <div className="text-foreground/70 text-xs">HSL</div>
                      <button
                        className="font-mono text-xs text-left truncate"
                        onClick={() =>
                          copyToClipboard(
                            `${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%`,
                            `hsl-${i}`
                          )
                        }
                        title="Copy HSL"
                      >
                        {Math.round(c.hsl.h)}°, {Math.round(c.hsl.s * 100)}%, {Math.round(c.hsl.l * 100)}%
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-foreground/60">
          Tip: drag on the wheel to pick hue/saturation. Value (brightness) is
          fixed to keep colors vivid.
        </div>
      </main>
  <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
