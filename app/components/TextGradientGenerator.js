"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, Plus } from "lucide-react";
import ColorWheel from "./ColorWheel";
import { hsvToHex, hsvToRgb, hexToHsv } from "./PaletteUtils";

const GRADIENT_PRESETS = [
  {
    id: "left-right",
    name: "Left to Right",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#FF6B6B", position: 0, opacity: 1 },
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

export default function TextGradientGenerator({ onGradientChange, onCssChange }) {
  const [gradientType, setGradientType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState(GRADIENT_PRESETS[0].stops);
  const [activeStopId, setActiveStopId] = useState("1");
  const [showColorPicker, setShowColorPicker] = useState(true);
  const [text, setText] = useState("gradient change me");
  const gradientRef = useRef(null);

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

  const textGradientCSS = useMemo(() => {
    const baseColor = stops.length > 0 ? stops[0].color : "#000000";
    const gradientLine = gradientCSS;
    return `color: ${baseColor};\nbackground-image: ${gradientLine};\n-webkit-background-clip: text;\nbackground-clip: text;\ncolor: transparent;`;
  }, [gradientCSS, stops]);

  // Notify parent component of gradient changes
  useEffect(() => {
    if (onGradientChange) {
      onGradientChange(gradientCSS);
    }
  }, [gradientCSS, onGradientChange]);

  // Notify parent of the CSS code for the text gradient (so the page can render the copy block)
  useEffect(() => {
    if (onCssChange) {
      onCssChange(textGradientCSS);
    }
  }, [textGradientCSS, onCssChange]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(textGradientCSS);
      toast.success("Text gradient CSS copied successfully");
    } catch (e) {
      console.error("Copy failed", e);
      toast.error("Copy failed");
    }
  };

  const addStop = () => {
    if (stops.length >= 3) return;
    const posList = stops.map(s => s.position);
    const newPosition = stops.length === 2 ? 50 : Math.min(100, Math.max(...posList) + 20);

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
    setShowColorPicker(true);
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
    setShowColorPicker(true);
  };

  return (
    <div className="space-y-6">
          {/* Text Preview with editable text */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10 space-y-4">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
            style={{
              backgroundImage: gradientCSS,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {text}
          </h1>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Edit Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/15 bg-transparent"
            placeholder="Enter your text here..."
          />
        </div>
      </div>
      {/* Presets */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
        <h3 className="text-lg font-semibold mb-4">Presets</h3>
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
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-semibold">Text Gradient Settings</h3>
          
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
                    onClick={() => setShowColorPicker(true)}
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
            <div className="space-y-3 p-3 bg-black/5 dark:bg-white/5 rounded">
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
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
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
