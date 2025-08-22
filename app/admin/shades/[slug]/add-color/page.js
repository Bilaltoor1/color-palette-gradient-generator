"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ColorWheel from "../../../../components/ColorWheel";
import { hsvToHex, hsvToRgb, hsvToHsl, rgbToHsv } from "../../../../components/PaletteUtils";
import { ArrowLeft, Save, Plus } from "lucide-react";

export default function AddColorPage({ params }) {
  const [slug, setSlug] = useState(null);
  const router = useRouter();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hsv, setHsv] = useState({ h: 210, s: 0.9, v: 0.9, a: 1 });
  const [colorName, setColorName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function getParams() {
      const { slug } = params;
      setSlug(slug);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  async function fetchCollection() {
    try {
      setLoading(true);
      const res = await fetch(`/api/shades/${slug}`);
      if (!res.ok) throw new Error("Failed to load collection");
      const data = await res.json();
      setCollection(data);
    } catch (e) {
      toast.error(e.message || "Failed to load collection");
      router.push('/admin/shades');
    } finally {
      setLoading(false);
    }
  }

  const currentColor = useMemo(() => {
    const hex = hsvToHex(hsv);
    const rgb = hsvToRgb(hsv);
    const hsl = hsvToHsl(hsv);
    return { hex, rgb, hsl, hsv };
  }, [hsv]);

  async function saveColor() {
    if (!colorName.trim()) {
      toast.error("Please enter a color name");
      return;
    }

    setIsSaving(true);
    try {
      const color = {
        name: colorName.trim(),
        hex: currentColor.hex
      };

      const res = await fetch(`/api/shades/colors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, color }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add color");
      }

      toast.success("Color added successfully!");
      router.push(`/admin/shades/${slug}`);
    } catch (e) {
      toast.error(e.message || "Failed to add color");
    } finally {
      setIsSaving(false);
    }
  }

  function generateColorName() {
    const { h, s, v } = hsv;
    
    // Generate name based on hue
    let baseName = "";
    if (h >= 0 && h < 15) baseName = "Red";
    else if (h >= 15 && h < 45) baseName = "Orange";
    else if (h >= 45 && h < 75) baseName = "Yellow";
    else if (h >= 75 && h < 150) baseName = "Green";
    else if (h >= 150 && h < 210) baseName = "Cyan";
    else if (h >= 210 && h < 270) baseName = "Blue";
    else if (h >= 270 && h < 330) baseName = "Purple";
    else baseName = "Red";

    // Add lightness/darkness
    if (v < 0.3) baseName = "Dark " + baseName;
    else if (v > 0.8 && s < 0.3) baseName = "Light " + baseName;
    else if (s < 0.2) baseName = "Gray";

    setColorName(baseName);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!collection) return <div className="p-6">Collection not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 12px;
          border-radius: 6px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #333;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 12px;
          border-radius: 6px;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #333;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
  <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/admin/shades/${slug}`)}
            className="p-2 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Add Color to {collection.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose a color and give it a name</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Color Picker */}
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Color Picker</h2>
            <div className="flex flex-col items-center space-y-6">
              <ColorWheel
                hsv={hsv}
                onChange={setHsv}
                size={280}
              />
              
              {/* Brightness Slider */}
              <div className="w-full max-w-sm">
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Brightness</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={hsv.v}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setHsv(prev => ({ ...prev, v: Number.isFinite(v) ? v : 0 }));
                    }}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #000000, ${hsvToHex({h: hsv.h, s: hsv.s, v: 1})}, #ffffff)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Black</span>
                    <span>Pure Color</span>
                    <span>White</span>
                  </div>
                </div>
              </div>

              {/* Saturation Slider */}
              <div className="w-full max-w-sm">
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Saturation</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={hsv.s}
                    onChange={(e) => {
                      const s = parseFloat(e.target.value);
                      setHsv(prev => ({ ...prev, s: Number.isFinite(s) ? s : 0 }));
                    }}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${hsvToHex({h: hsv.h, s: 0, v: hsv.v})}, ${hsvToHex({h: hsv.h, s: 1, v: hsv.v})})`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Gray</span>
                    <span>Vivid</span>
                  </div>
                </div>
              </div>
              
              {/* Color Preview */}
              <div className="w-full max-w-sm">
                <div 
                  className="w-full h-24 rounded-xl border-4 border-card shadow-lg"
                  style={{ backgroundColor: currentColor.hex }}
                />
                <div className="mt-4 text-center">
                  <div className="text-2xl font-mono font-bold text-card-foreground">{currentColor.hex}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    RGB({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})
                  </div>
                  <div className="text-sm text-muted-foreground">
                    HSL({Math.round(currentColor.hsl.h)}°, {Math.round(currentColor.hsl.s * 100)}%, {Math.round(currentColor.hsl.l * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Details */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Color Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      className="flex-1 border border-border rounded-lg px-3 py-2 bg-card/70 text-card-foreground"
                      placeholder="e.g., Ocean Blue, Sunset Orange"
                    />
                    <button
                      onClick={generateColorName}
                      className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quick Colors</label>
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      '#FF0000', '#FF8000', '#FFFF00', '#80FF00',
                      '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
                      '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
                      '#800000', '#808000', '#008000', '#008080',
                      '#000080', '#800080', '#000000', '#808080'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          const r = parseInt(color.slice(1, 3), 16);
                          const g = parseInt(color.slice(3, 5), 16);
                          const b = parseInt(color.slice(5, 7), 16);
                          const newHsv = rgbToHsv({ r, g, b });
                          setHsv({ h: Number.isFinite(newHsv.h) ? newHsv.h : 0, s: Number.isFinite(newHsv.s) ? newHsv.s : 0, v: Number.isFinite(newHsv.v) ? newHsv.v : 0, a: 1 });
                        }}
                        className="w-8 h-8 rounded-lg border-2 border-border hover:border-accent transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hex Code</label>
                  <input
                    type="text"
                    value={currentColor.hex}
                    onChange={(e) => {
                      let hex = e.target.value.toUpperCase();
                      
                      // Auto-add # if missing
                      if (!hex.startsWith('#') && hex.length > 0) {
                        hex = '#' + hex;
                      }
                      
                      // Validate and update color
                      if (hex === '#' || hex.match(/^#[0-9A-F]{0,6}$/)) {
                        // Allow typing in progress
                        if (hex.length === 7 && hex.match(/^#[0-9A-F]{6}$/)) {
                          try {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            if ([r, g, b].some(v => Number.isNaN(v))) throw new Error('invalid');
                            const newHsv = rgbToHsv({ r, g, b });
                            setHsv(prev => ({
                              h: Number.isFinite(newHsv.h) ? newHsv.h : prev.h,
                              s: Number.isFinite(newHsv.s) ? newHsv.s : prev.s,
                              v: Number.isFinite(newHsv.v) ? newHsv.v : prev.v,
                              a: 1
                            }));
                          } catch (e) {
                            // Invalid conversion, ignore
                          }
                        }
                      }
                    }}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-card/70 text-card-foreground font-mono text-lg"
                    placeholder="#000000"
                    maxLength={7}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Enter a 6-digit hex color code (e.g., #FF5733)
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={saveColor}
                    disabled={isSaving || !colorName.trim()}
                    className="w-full bg-primary hover:bg-primary/80 disabled:bg-muted text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save size={18} />
                        Add Color to Collection
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Collection Preview */}
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Current Collection</h2>
              <div className="grid grid-cols-4 gap-2">
                {collection.colors?.map((color, i) => (
                  <div key={i} className="aspect-square rounded-lg border border-border" style={{ backgroundColor: color.hex }} title={color.name} />
                ))}
                <div 
                  className="aspect-square rounded-lg border-2 border-dashed border-primary flex items-center justify-center"
                  style={{ backgroundColor: currentColor.hex + '40' }}
                >
                  <Plus size={16} className="text-blue-600" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {collection.colors?.length || 0} colors + 1 new
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
