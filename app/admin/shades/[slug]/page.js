"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Save, Trash, Plus, Edit2 } from "lucide-react";
import ColorWheel from "@/app/components/ColorWheel";
import { hsvToHex, hsvToRgb, hsvToHsl, rgbToHsv, hexToHsv } from "@/app/components/PaletteUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-normal text-foreground/90">{collection.title}</h1>
        <div className="flex gap-2">
          {!isEditingCollection ? (
            <button onClick={() => setIsEditingCollection(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded">
              <Save size={16} /> Edit Collection
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveCollection} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Save size={16} /> Save
              </button>
              <button onClick={() => { setIsEditingCollection(false); fetchCollection(); }} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-black rounded">
                Cancel
              </button>
              <button onClick={deleteCollection} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                <Trash size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 max-w-6xl">
        {/* Collection Details */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-6 border border-black/5 dark:border-white/10">
          <h2 className="font-semibold mb-4">Collection Details</h2>
          <div className="grid gap-4">
            {!isEditingCollection ? (
              <div>
                <p className="text-sm text-foreground/70 mb-1">{form.description || <span className="text-gray-400">No description</span>}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    value={form.title} 
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 bg-white/50 dark:bg-black/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 bg-white/50 dark:bg-black/20" 
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Colors Grid */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-6 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Colors ({form.colors.length})</h2>
            <button 
              onClick={addColor} 
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} /> Add Color
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {form.colors.map((c, i) => (
              <div key={i} className="bg-white/80 dark:bg-black/20 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden relative">
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
                            <button onClick={() => { setEditingColorIndex(-1); setEditHsv(null); setEditingColor(null); }} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={async () => {
                              const next = { name: (editingColor?.name || c.name), hex: hsvToHex(editHsv || hexToHsv(c.hex)) };
                              await updateColor(i, next);
                              setEditingColorIndex(-1);
                              setEditHsv(null);
                              setEditingColor(null);
                            }} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
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
