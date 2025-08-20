"use client";

import { useCallback, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PalettePreview({ palette = [], exportRef }) {
  const [openMenu, setOpenMenu] = useState(null);

  const downloadAsPdf = useCallback(async () => {
    if (!palette || palette.length === 0) {
      showToast("No colors to export", "error");
      return;
    }
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 36;
      const gap = 12;

      // Layout: up to 5 columns per row based on available width
      const maxCols = Math.min(5, palette.length);
      const cols = maxCols;
      const itemWidth = (pageWidth - margin * 2 - gap * (cols - 1)) / cols;
      const rectHeight = Math.max(36, itemWidth * 0.45);

      let x = margin;
      let y = 60;

      pdf.setFontSize(14);
      pdf.text("Color Palette", margin, 28);

      for (let i = 0; i < palette.length; i++) {
        const c = palette[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        x = margin + col * (itemWidth + gap);
        y = 60 + row * (rectHeight + 60);

        // Draw color rect
        const { r, g, b } = c.rgb;
        pdf.setFillColor(r, g, b);
        pdf.rect(x, y, itemWidth, rectHeight, "F");

        // Text below
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        const textX = x + 4;
        const textY = y + rectHeight + 14;
        pdf.text(c.hex, textX, textY);
        pdf.text(`RGB(${r}, ${g}, ${b})`, textX, textY + 12);
        pdf.text(`HSL(${Math.round(c.hsl.h)}\u00b0, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%)`, textX, textY + 24);

        // Page break if needed
        const nextRowBottom = y + rectHeight + 40;
        if (nextRowBottom + rectHeight + 80 > pdf.internal.pageSize.getHeight()) {
          if (i < palette.length - 1) {
            pdf.addPage();
            y = 60;
          }
        }
      }

  pdf.save("palette.pdf");
  toast.success("PDF exported");
    } catch (e) {
      console.error(e);
  toast.error("Failed to export PDF");
    }
  }, [palette]);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
      setOpenMenu(null);
    } catch (e) {
      console.error(e);
  toast.error("Copy failed");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
          onClick={downloadAsPdf}
        >
          Export PDF
        </button>
      </div>

      <div ref={exportRef} className="flex flex-col w-full gap-3 mt-4">
        {palette.map((c, i) => (
          <div key={i} className="rounded-lg overflow-visible border border-black/10 dark:border-white/15 flex flex-row group min-h-[80px]">
            <div className="w-24 h-20 flex-shrink-0" style={{ backgroundColor: c.hex }} />
            <div className="p-4 pt-2 pb-0 text-sm flex-1 relative overflow-visible">
              <button
                className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 backdrop-blur hover:bg-white/95 dark:hover:bg-black/50 transition z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === i ? null : i);
                }}
                title="Copy options"
                aria-haspopup="true"
                aria-expanded={openMenu === i}
              >
                <Copy className="w-4 h-4" />
              </button>

              {openMenu === i && (
                <div className="absolute right-0 top-10 z-50 w-56 bg-white/95 dark:bg-black/90 border border-black/10 dark:border-white/10 rounded-md shadow-xl p-2 text-sm backdrop-blur overflow-visible">
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded" onClick={() => copyToClipboard(c.hex, `hex-${i}`)}>Copy HEX</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded" onClick={() => copyToClipboard(`${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}`, `rgb-${i}`)}>Copy RGB</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded" onClick={() => copyToClipboard(`${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%`, `hsl-${i}`)}>Copy HSL</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded" onClick={() => copyToClipboard(`${c.hex}\nRGB(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})\nHSL(${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%)`, `card-${i}`)}>Copy All</button>
                </div>
              )}

              <div className="flex flex-col gap-2 pr-10">
                <div className="flex items-center gap-3">
                  <span className="text-foreground/70 text-xs w-10 flex-shrink-0">HEX</span>
                    <button className="font-mono text-xs flex items-center gap-2 hover:text-blue-600 flex-1" onClick={() => copyToClipboard(c.hex, `hex-${i}`)} title="Copy HEX">
                      <span className="flex-1">{c.hex}</span>
                    </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-foreground/70 text-xs w-10 flex-shrink-0">RGB</span>
                  <button className="font-mono text-xs flex items-center gap-2 hover:text-blue-600 flex-1" onClick={() => copyToClipboard(`${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}`, `rgb-${i}`)} title="Copy RGB">
                    <span className="flex-1">{c.rgb.r}, {c.rgb.g}, {c.rgb.b}</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-foreground/70 text-xs w-10 flex-shrink-0">HSL</span>
                  <button className="font-mono text-xs flex items-center gap-2 hover:text-blue-600 flex-1" onClick={() => copyToClipboard(`${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%`, `hsl-${i}`)} title="Copy HSL">
                    <span className="flex-1">{Math.round(c.hsl.h)}°, {Math.round(c.hsl.s * 100)}%, {Math.round(c.hsl.l * 100)}%</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}
