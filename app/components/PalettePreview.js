"use client";

import { useCallback, useState } from "react";

function Toast({ message, type = "info" }) {
  if (!message) return null;
  const bg = type === "error" ? "bg-red-600" : "bg-emerald-600";
  return (
    <div className={`fixed right-4 bottom-6 z-50 ${bg} text-white px-4 py-2 rounded-md shadow-sm`}>
      {message}
    </div>
  );
}

export default function PalettePreview({ palette = [], exportRef }) {
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 1800);
  };

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
        pdf.text(`HSL(${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s * 100)}%, ${Math.round(c.hsl.l * 100)}%)`, textX, textY + 24);

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
      showToast("PDF exported", "info");
    } catch (e) {
      console.error(e);
      showToast("Failed to export PDF", "error");
    }
  }, [palette]);

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
      <Toast message={toast.msg} type={toast.type} />
    </>
  );
}
