"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Save, Trash, Plus, Edit2, X } from "lucide-react";
import ColorWheel from "@/app/components/ColorWheel";
import { hsvToHex, rgbToHsv, hexToHsv } from "@/app/components/PaletteUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function EditCollectionPage({ params }) {
  // Unwrap Next.js params (now a promise) at the top-level
  const { slug } = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", colors: [], thumbIndex: 0 });
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState(-1);
  const [editingColor, setEditingColor] = useState(null);
  const [editHsv, setEditHsv] = useState(null);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkColors, setBulkColors] = useState('');

  useEffect(() => {
    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  async function fetchCollection() {
    try {
      setLoading(true);
      const res = await fetch(`/api/shades/${slug}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setCollection(data);
      setForm({ title: data.title || "", description: data.description || "", colors: data.colors || [], thumbIndex: data.thumbIndex || 0 });
    } catch (e) {
      toast.error(e.message || "Failed to load collection");
    } finally {
      setLoading(false);
    }
  }

  async function saveCollection() {
    try {
      const res = await fetch(`/api/shades/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      toast.success("Collection updated");
      fetchCollection();
    } catch (e) {
      toast.error(e.message || "Save failed");
    }
  }

  async function deleteCollection() {
    const userInput = prompt(`To delete "${collection.title}", type the collection name exactly:`);
    if (userInput !== collection.title) {
      toast.error("Collection name doesn't match. Deletion cancelled.");
      return;
    }
    
    try {
      const res = await fetch(`/api/shades/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      toast.success("Collection deleted");
      router.push('/admin/shades');
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  }

  async function addColor() {
    router.push(`/admin/shades/${slug}/add-color`);
  }

  async function addBulkColors() {
    try {
      const parsedColors = JSON.parse(bulkColors);
      
      if (!Array.isArray(parsedColors)) {
        toast.error("Colors must be an array");
        return;
      }

      const res = await fetch(`/api/shades/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, colors: parsedColors }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Bulk add failed");
      }

      const result = await res.json();
      toast.success(result.message);
      setBulkColors('');
      setIsBulkAdding(false);
      fetchCollection(); // Refresh the collection data
    } catch (error) {
      if (error.message.includes("JSON")) {
        toast.error("Invalid JSON format. Please check your input.");
      } else {
        toast.error(error.message || "Bulk add failed");
      }
    }
  }

  async function updateColor(index, patch) {
    try {
      const res = await fetch(`/api/shades/colors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, index, color: patch }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update color failed");
      }
      const updated = await res.json();
      setForm(prev => ({ ...prev, colors: updated.colors }));
    } catch (e) {
      toast.error(e.message || "Update color failed");
    }
  }

  async function removeColor(index) {
    if (!confirm('Remove this color?')) return;
    try {
      const res = await fetch(`/api/shades/colors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, index }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Remove color failed");
      }
      const updated = await res.json();
      setForm(prev => ({ ...prev, colors: updated.colors, thumbIndex: updated.thumbIndex }));
    } catch (e) {
      toast.error(e.message || "Remove color failed");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!collection) return <div className="p-6">Collection not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-normal text-card-foreground">{collection.title}</h1>
        <div className="flex gap-2">
          {!isEditingCollection ? (
            <Button onClick={() => setIsEditingCollection(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded">
              <Save size={16} /> Edit Collection
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={saveCollection} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Save size={16} /> Save
              </Button>
              <Button onClick={() => { setIsEditingCollection(false); fetchCollection(); }} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-black rounded">
                Cancel
              </Button>
              <Button onClick={deleteCollection} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                <Trash size={16} /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 max-w-6xl">
        {/* Collection Details */}
        <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border">
          <h2 className="font-semibold mb-4 text-card-foreground">Collection Details</h2>
          <div className="grid gap-4">
            {!isEditingCollection ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{form.description || <span className="text-muted-foreground">No description</span>}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Title</label>
                  <input 
                    value={form.title} 
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} 
                    className="w-full border border-border rounded px-3 py-2 bg-card/70 text-card-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} 
                    className="w-full border border-border rounded px-3 py-2 bg-card/70 text-card-foreground" 
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Colors Grid */}
        <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-card-foreground">Colors ({form.colors.length})</h2>
            <div className="flex gap-2">
              <Button 
                onClick={addColor} 
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80"
              >
                <Plus size={16} /> Add Color
              </Button>
              <Button 
                onClick={() => setIsBulkAdding(true)} 
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Plus size={16} /> Bulk Add
              </Button>
            </div>
          </div>

          {/* Bulk Add Modal */}
          {isBulkAdding && (
            <div className="mb-6 p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Bulk Add Colors</h3>
                <Button
                  onClick={() => setIsBulkAdding(false)}
                  className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900"
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Paste JSON Array of Colors</label>
                <textarea
                  value={bulkColors}
                  onChange={(e) => setBulkColors(e.target.value)}
                  className="w-full h-32 border rounded px-3 py-2 bg-white dark:bg-gray-800 font-mono text-sm"
                  placeholder='[
  { "name": "Pure Red", "hex": "#FF0000" },
  { "name": "Crimson", "hex": "#DC143C" },
  { "name": "Cherry Red", "hex": "#DE3163" }
]'
                />
              </div>
              
              <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                <p>Format: Array of objects with "name" and "hex" properties.</p>
                <p>Example: <code>{'[{"name": "Red", "hex": "#FF0000"}]'}</code></p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={addBulkColors}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Colors
                </Button>
                <Button
                  onClick={() => setBulkColors(`[
  { "name": "Pure Red", "hex": "#FF0000" },
  { "name": "Crimson", "hex": "#DC143C" },
  { "name": "Cherry Red", "hex": "#DE3163" },
  { "name": "Fire Engine Red", "hex": "#CE2029" },
  { "name": "Cardinal Red", "hex": "#C41E3A" },
  { "name": "Scarlet", "hex": "#FF2400" },
  { "name": "Ruby Red", "hex": "#E0115F" },
  { "name": "Blood Red", "hex": "#8B0000" },
  { "name": "Burgundy", "hex": "#800020" },
  { "name": "Maroon", "hex": "#800000" }
]`)}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Load Red Example
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {form.colors.map((c, i) => (
              <div key={i} className="bg-card/80 rounded-xl border border-border overflow-hidden relative">
                {/* three-dot menu */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Edit2 className="px-2 py-1 rounded bg-white/80 dark:bg-black/60"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-white">
                      <DropdownMenuItem onSelect={() => { navigator.clipboard?.writeText(form.colors[i]?.hex || ''); toast.success('Hex copied'); }}>
                        Copy hex
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setEditingColorIndex(i); const cur = { ...form.colors[i] }; setEditingColor(cur); try { setEditHsv(hexToHsv ? hexToHsv(cur.hex) : rgbToHsv(hexToRgb(cur.hex))); } catch { setEditHsv(null); } }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setForm(prev => ({ ...prev, thumbIndex: i })); saveCollection(); }}>
                        Set as Thumb
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => { if (confirm('Delete this color?')) removeColor(i); }} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Color Preview */}
                <div className="w-full" style={{ background: c.hex }}>
                  <div className="h-28 w-full" />
                </div>

                {/* Color Details / Editor */}
                <div className="p-3">
                  {editingColorIndex === i ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-6">
                        <ColorWheel hsv={editHsv || hexToHsv(c.hex)} onChange={setEditHsv} size={220} />
                        <div className="w-full max-w-sm space-y-4">
                          {/* Brightness */}
                          <div>
                            <label className="block text-xs font-medium mb-2">Brightness</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={(editHsv?.v ?? 1)}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                setEditHsv(prev => ({ ...(prev || hexToHsv(c.hex)), v: Number.isFinite(v) ? v : 0 }));
                              }}
                              className="w-full h-2 rounded-lg"
                              style={{ background: `linear-gradient(to right, #000, ${hsvToHex({h: (editHsv?.h ?? 0), s: (editHsv?.s ?? 1), v: 1})}, #fff)` }}
                            />
                          </div>
                          {/* Saturation */}
                          <div>
                            <label className="block text-xs font-medium mb-2">Saturation</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={(editHsv?.s ?? 1)}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                setEditHsv(prev => ({ ...(prev || hexToHsv(c.hex)), s: Number.isFinite(s) ? s : 0 }));
                              }}
                              className="w-full h-2 rounded-lg"
                              style={{ background: `linear-gradient(to right, ${hsvToHex({h: (editHsv?.h ?? 0), s: 0, v: (editHsv?.v ?? 1)})}, ${hsvToHex({h: (editHsv?.h ?? 0), s: 1, v: (editHsv?.v ?? 1)})})` }}
                            />
                          </div>
                          {/* Name + Hex */}
                          <div className="flex items-center gap-2">
                            <input
                              value={editingColor?.name || ''}
                              onChange={(e) => setEditingColor(prev => ({ ...(prev || c), name: e.target.value }))}
                              className="flex-1 text-sm border rounded px-2 py-2"
                              placeholder="Color name"
                            />
                            <input
                              value={hsvToHex(editHsv || hexToHsv(c.hex))}
                              onChange={(e) => {
                                // accept hex, convert to hsv
                                let hex = e.target.value.toUpperCase();
                                if (!hex.startsWith('#')) hex = `#${hex}`;
                                if (/^#[0-9A-F]{6}$/.test(hex)) {
                                  try {
                                    const rgb = {
                                      r: parseInt(hex.slice(1,3),16),
                                      g: parseInt(hex.slice(3,5),16),
                                      b: parseInt(hex.slice(5,7),16)
                                    };
                                    const nh = rgbToHsv(rgb);
                                    setEditHsv({ h: nh.h, s: nh.s, v: nh.v, a: 1 });
                                  } catch {}
                                }
                              }}
                              className="w-40 text-xs font-mono border rounded px-2 py-2"
                              placeholder="#000000"
                              maxLength={7}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => { setEditingColorIndex(-1); setEditHsv(null); setEditingColor(null); }} className="px-3 py-2 bg-gray-200 rounded">Cancel</Button>
                            <Button onClick={async () => {
                              const next = { name: (editingColor?.name || c.name), hex: hsvToHex(editHsv || hexToHsv(c.hex)) };
                              await updateColor(i, next);
                              setEditingColorIndex(-1);
                              setEditHsv(null);
                              setEditingColor(null);
                            }} className="px-3 py-2 bg-blue-600 text-white rounded">Save</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-normal">{c.name}</div>
                      <div className="text-xs font-mono text-gray-600">{c.hex}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
