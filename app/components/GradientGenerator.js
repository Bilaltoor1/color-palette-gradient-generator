"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, Plus, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ColorWheel from "./ColorWheel";
import { hsvToHex, hsvToRgb, hexToHsv } from "./PaletteUtils";
import { Button } from "@/components/ui/button";
import { RiCss3Fill } from "react-icons/ri";

const GRADIENT_PRESETS = [
  {
    id: "left-right",
    name: "Left to Right",
    type: "linear",
    angle: 90,
    stops: [
  { id: "1", color: "#8253FF", position: 0, opacity: 1 },
  { id: "2", color: "#4ECDC4", position: 100, opacity: 1 }
    ]
  },
  {
    id: "top-bottom",
    name: "Top to Bottom", 
    type: "linear",
    angle: 180,
    stops: [
      { id: "1", color: "#667eea", position: 0, opacity: 1 },
      { id: "2", color: "#764ba2", position: 100, opacity: 1 }
    ]
  },
  {
    id: "diagonal",
    name: "Diagonal",
    type: "linear", 
    angle: 45,
    stops: [
      { id: "1", color: "#f093fb", position: 0, opacity: 1 },
      { id: "2", color: "#f5576c", position: 100, opacity: 1 }
    ]
  },
  {
    id: "radial-center",
    name: "Radial Center",
    type: "radial",
    angle: 0,
    stops: [
      { id: "1", color: "#FA8BFF", position: 0, opacity: 1 },
      { id: "2", color: "#2BD2FF", position: 50, opacity: 1 },
      { id: "3", color: "#2BFF88", position: 100, opacity: 1 }
    ]
  },
  {
    id: "sunset",
    name: "Sunset",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#ff9a9e", position: 0, opacity: 1 },
      { id: "2", color: "#fecfef", position: 50, opacity: 1 },
      { id: "3", color: "#fecfef", position: 100, opacity: 1 }
    ]
  }
];

export default function GradientGenerator({ onGradientChange, onTailwindBgChange }) {
  const [gradientType, setGradientType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState(GRADIENT_PRESETS[0].stops);
  const [activeStopId, setActiveStopId] = useState("1");
  const [showColorPicker, setShowColorPicker] = useState(true); // Auto-show by default
  // local toast removed; using react-hot-toast
  const gradientRef = useRef(null);
  // Export states for image/pdf
  const [exportOrientation, setExportOrientation] = useState('landscape');
  const [exportOption, setExportOption] = useState({ label: 'FHD (1920x1080)', w: 1920, h: 1080 });

  const activeStop = stops.find(s => s.id === activeStopId);
  const activeHsv = useMemo(() => {
    if (!activeStop) return { h: 0, s: 1, v: 1 };
    return hexToHsv(activeStop.color);
  }, [activeStop]);

  const gradientCSS = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops
      .map(stop => {
        const rgba = hexToRgba(stop.color, stop.opacity);
        return `${rgba} ${stop.position}%`;
      })
      .join(", ");

    if (gradientType === "radial") {
      return `radial-gradient(circle, ${colorStops})`;
    } else {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    }
  }, [stops, gradientType, angle]);

  const cssCode = useMemo(() => {
    const baseColor = stops.length > 0 ? stops[0].color : "#000000";
    const gradientLine = gradientCSS;
    return `background: ${baseColor};\nbackground: ${gradientLine};`;
  }, [gradientCSS, stops]);

  // Tailwind utility classes for background gradient (bg-*). Similar format as TextGradientGenerator.
  const bgTailwindClasses = useMemo(() => {
    const fmt = (hex) => `[#${hex.replace(/^#/, "")}]`;
    const fmtWithOpacity = (hex, op) => {
      const alphaPct = Math.round((op ?? 1) * 100);
      return `${fmt(hex)}/${alphaPct}`;
    };

    if (gradientType === "radial") {
      const sorted = [...stops].sort((a, b) => a.position - b.position);
      if (sorted.length === 1) return `bg-radial from-${fmtWithOpacity(sorted[0].color, sorted[0].opacity)}`;
      if (sorted.length === 2) return `bg-radial from-${fmtWithOpacity(sorted[0].color, sorted[0].opacity)} to-${fmtWithOpacity(sorted[1].color, sorted[1].opacity)}`;
      return `bg-radial from-${fmtWithOpacity(sorted[0].color, sorted[0].opacity)} via-${fmtWithOpacity(sorted[1].color, sorted[1].opacity)} to-${fmtWithOpacity(sorted[2].color, sorted[2].opacity)}`;
    }

    const dirs = ["t","tr","r","br","b","bl","l","tl"];
    const idx = Math.round((angle % 360) / 45) % 8;
    const dirToken = dirs[idx];
    const s = [...stops].sort((a, b) => a.position - b.position);
    if (s.length === 1) return `bg-linear-to-${dirToken} from-${fmtWithOpacity(s[0].color, s[0].opacity)}`;
    if (s.length === 2) return `bg-linear-to-${dirToken} from-${fmtWithOpacity(s[0].color, s[0].opacity)} to-${fmtWithOpacity(s[1].color, s[1].opacity)}`;
    return `bg-linear-to-${dirToken} from-${fmtWithOpacity(s[0].color, s[0].opacity)} via-${fmtWithOpacity(s[1].color, s[1].opacity)} to-${fmtWithOpacity(s[2].color, s[2].opacity)}`;
  }, [stops, gradientType, angle]);

  const exportOptions = [
    { label: 'HD (1280x720)', w: 1280, h: 720 },
    { label: 'FHD (1920x1080)', w: 1920, h: 1080 },
    { label: '2K (2560x1440)', w: 2560, h: 1440 },
    { label: '4K (3840x2160)', w: 3840, h: 2160 },
    { label: 'Square (1080x1080)', w: 1080, h: 1080 },
    { label: 'Mobile (1080x1920)', w: 1080, h: 1920 }
  ];

  async function exportImage(elem, w, h, name = 'gradient') {
    const el = elem || gradientRef.current;
    if (!el) return;
    const toastId = toast.loading('Preparing download...');
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(el, { width: w, height: h, pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${name}-gradient-${w}x${h}.png`;
      a.click();
      toast.dismiss(toastId);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to download image');
      console.error(error);
    }
  }

  async function exportPdf(elem, w, h, name = 'gradient') {
    const el = elem || gradientRef.current;
    if (!el) return;
    const toastId = toast.loading('Preparing PDF...');
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(el, { width: w, height: h, pixelRatio: 2 });
      const { jsPDF } = await import('jspdf');
      const orientation = w >= h ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      pdf.save(`${name}-gradient-${w}x${h}.pdf`);
      toast.dismiss(toastId);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  }

  useEffect(() => {
    if (onTailwindBgChange) onTailwindBgChange(bgTailwindClasses);
  }, [bgTailwindClasses, onTailwindBgChange]);

  // Notify parent component of gradient changes
  useEffect(() => {
    if (onGradientChange) {
      onGradientChange(gradientCSS);
    }
  }, [gradientCSS, onGradientChange]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      toast.success("CSS copied successfully");
    } catch (e) {
      console.error("Copy failed", e);
      toast.error("Copy failed");
    }
  };

  const addStop = () => {
    if (stops.length >= 3) return;
    // Choose a sensible position for the new (third) stop: place in the middle if adding third
    const posList = stops.map(s => s.position);
    const newPosition = stops.length === 2 ? 50 : Math.min(100, Math.max(...posList) + 20);

    // Derive a vibrant color from the last stop: shift hue and keep high saturation/value
    const lastColor = stops.length ? stops[stops.length - 1].color : "#888888";
    const lastHsv = hexToHsv(lastColor);
    const newHue = (lastHsv.h + 30) % 360;
    const vibrantColor = hsvToHex({ h: newHue, s: Math.max(0.75, lastHsv.s), v: Math.max(0.85, lastHsv.v) });

    const newStop = {
      id: Date.now().toString(),
      color: vibrantColor,
      position: newPosition,
      opacity: 1
    };
    setStops([...stops, newStop]);
    setActiveStopId(newStop.id);
    setShowColorPicker(true); // Auto-show color picker
  };

  const removeStop = (stopId) => {
    if (stops.length <= 2) return;
    setStops(stops.filter(s => s.id !== stopId));
    if (activeStopId === stopId) {
      setActiveStopId(stops.find(s => s.id !== stopId)?.id || "1");
    }
  };

  const updateStop = (stopId, updates) => {
    setStops(stops.map(s => 
      s.id === stopId ? { ...s, ...updates } : s
    ));
  };

  const updateActiveColor = (newHsv) => {
    if (!activeStop) return;
    const newColor = hsvToHex(newHsv);
    updateStop(activeStopId, { color: newColor });
  };

  const applyPreset = (preset) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setStops(preset.stops);
    setActiveStopId(preset.stops[0].id);
    setShowColorPicker(true); // Auto-show color picker
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
       <div className="flex justify-end">
        <div className="flex items-center gap-2">
            {/* PDF export button (single click uses selected option/orientation) */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportPdf(null, exportOrientation === 'portrait' ? exportOption.h : exportOption.w, exportOrientation === 'portrait' ? exportOption.w : exportOption.h, 'preset-gradient')}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>

            {/* Image export with dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="inline-flex items-center gap-2 cursor-pointer">
                  <Download className="w-4 h-4" />
                  Image
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56 bg-card text-card-foreground border border-border rounded-lg shadow-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Orientation</span>
                  <select
                    className="text-sm border rounded px-2 py-1 cursor-pointer bg-card text-card-foreground border-border"
                    value={exportOrientation}
                    onChange={e => setExportOrientation(e.target.value)}
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>

                <div className="space-y-1">
                  {exportOptions.map(o => (
                    <DropdownMenuItem key={o.label} onSelect={async () => {
                      setExportOption(o);
                      const dims = exportOrientation === 'portrait' ? { w: o.h, h: o.w } : { w: o.w, h: o.h };
                      await exportImage(null, dims.w, dims.h, 'preset-gradient');
                    }} className="text-sm px-3 py-2 rounded">
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
       </div>
         {/* Presets */}
      <div className="bg-card/80 backdrop-blur  rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Presets</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {GRADIENT_PRESETS.map((preset) => {
            const presetCSS = preset.type === "radial"
              ? `radial-gradient(circle, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(", ")})`
              : `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(", ")})`;
            
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center gap-2 p-2 rounded border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded border border-black/10 dark:border-white/15"
                  style={{ background: presetCSS }}
                />
                <span className="text-xs text-center">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gradient Settings */}
        <div className="bg-card/80 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-semibold">Gradient Settings</h3>
          
          {/* Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  gradientType === "linear"
                    ? "bg-foreground text-background border-transparent"
                    : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                onClick={() => setGradientType("linear")}
              >
                Linear
              </button>
              <button
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  gradientType === "radial"
                    ? "bg-foreground text-background border-transparent"
                    : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                onClick={() => setGradientType("radial")}
              >
                Radial
              </button>
            </div>
          </div>

          {/* Angle Control for Linear */}
          {gradientType === "linear" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Angle: {angle}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Color Stops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Color Stops</label>
              {stops.length < 3 && (
                <button
                  onClick={addStop}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {stops.map((stop) => (
                <div
                  key={stop.id}
                  className={`flex items-center gap-2 p-2 rounded border ${
                    activeStopId === stop.id
                      ? "border-blue-300 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-black/10 dark:border-white/15"
                  }`}
                  onClick={() => setActiveStopId(stop.id)}
                >
                  <div
                    className="w-6 h-6 rounded border border-black/10 dark:border-white/15 cursor-pointer"
                    style={{ backgroundColor: stop.color }}
                    onClick={() => setShowColorPicker(true)} // Auto-show color picker when clicking color
                  />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{stop.color}</span>
                      <span className="text-xs text-foreground/70">{stop.position}%</span>
                    </div>
                  </div>
                  {stops.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStop(stop.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Stop Controls */}
          {activeStop && (
            <div className="space-y-3 p-3 bg-card/80 backdrop-blur rounded">
              <h4 className="text-sm font-medium">Edit Selected Stop</h4>
              
              <div>
                <label className="text-xs text-foreground/70 mb-1 block">Position: {activeStop.position}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeStop.position}
                  onChange={(e) => updateStop(activeStopId, { position: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-foreground/70 mb-1 block">Opacity: {Math.round(activeStop.opacity * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={activeStop.opacity}
                  onChange={(e) => updateStop(activeStopId, { opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-3 py-1.5 text-xs rounded border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                {showColorPicker ? "Hide" : "Show"} Color Picker
              </button>
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="bg-card/80 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4">Color Picker</h3>
          {showColorPicker && (
            <div className="flex justify-center">
              <ColorWheel
                size={220}
                hsv={activeHsv}
                onChange={updateActiveColor}
              />
            </div>
          )}
        </div>
      </div>

      {/* Gradient Display with CSS */}
      <div 
        ref={gradientRef}
        className="w-full min-h-32 rounded-xl border border-black/10 dark:border-white/15 p-4 flex flex-col justify-end"
        style={{ background: gradientCSS }}
      >
        <div className="bg-card/80 backdrop-blur rounded-lg p-3 space-y-2">
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all">
            {cssCode}
          </pre>
          <Button
            onClick={copyCSS}
            className="px-3 py-1.5 cursor-pointer text-xs rounded bg-card/80 backdrop-blur text-card-foreground transition"
          >
            <RiCss3Fill className="w-3 h-3" aria-hidden />
            Copy CSS
          </Button>
        </div>
      </div>
      
   

  {/* Toasts handled by react-hot-toast Toaster in layout */}
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
