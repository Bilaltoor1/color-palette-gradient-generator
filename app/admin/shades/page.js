"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, X, Save, MoreVertical, Edit, Trash2, Eye } from "lucide-react";

export default function AdminShadesPage() {
  const [collections, setCollections] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    slug: "",
    colors: [{ name: "", hex: "#FF0000" }],
    thumbIndex: 0
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      setCollections([]);
      const res = await fetch("/api/shades");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch collections");
      }
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch collections:", e);
      // show minimal feedback in UI via toast if available
      if (typeof window !== 'undefined' && window.alert) window.alert(e.message || 'Failed to fetch collections');
    }
  }

  function addColor() {
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, { name: "", hex: "#FF0000" }]
    }));
  }

  function removeColor(index) {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
      thumbIndex: prev.thumbIndex >= prev.colors.length - 1 ? 0 : prev.thumbIndex
    }));
  }

  function updateColor(index, field, value) {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      )
    }));
  }

  function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  async function saveCollection() {
    try {
      if (!form.title || !form.slug || form.colors.length === 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate all colors have name and hex
      for (const color of form.colors) {
        if (!color.name || !color.hex) {
          toast.error("All colors need a name and hex value");
          return;
        }
      }

      const res = await fetch("/api/shades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Save failed");
      }

      toast.success("Collection saved successfully");
      setIsCreating(false);
      setForm({
        title: "",
        description: "",
        slug: "",
        colors: [{ name: "", hex: "#FF0000" }],
        thumbIndex: 0
      });
      fetchCollections();
    } catch (e) {
      toast.error(e.message || "Save failed");
      console.error(e);
    }
  }

  async function deleteCollectionWithConfirm(collection) {
    const userInput = prompt(`To delete "${collection.title}", type the collection name exactly:`);
    if (userInput !== collection.title) {
      toast.error("Collection name doesn't match. Deletion cancelled.");
      return;
    }
    
    try {
      const res = await fetch(`/api/shades/${collection.slug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      toast.success("Collection deleted successfully");
      fetchCollections();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setMenuOpen(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Color Shade Collections</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          New Collection
        </button>
      </div>

      {/* Existing Collections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {collections.length === 0 ? (
          <div className="p-6 rounded border bg-white/60 dark:bg-white/5">No collections yet. Create a new collection above.</div>
        ) : (
          collections.map((collection) => (
            <div key={collection._id} className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl border border-black/5 dark:border-white/10 hover:shadow-md transition-shadow cursor-pointer relative group overflow-hidden">
              <div onClick={() => window.location.href = `/admin/shades/${collection.slug}`}> 
                <div className="flex flex-col">
                  {(collection.colors || []).slice(0, 7).map((color, i) => (
                    <div key={i} className="w-full h-10" style={{ backgroundColor: color.hex }} title={`${color.name}: ${color.hex}`} />
                  ))}
                  {Array.from({ length: Math.max(0, 7 - (collection.colors?.length || 0)) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full h-10 bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-black leading-none">{collection.title}</h3>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create New Collection Form */}
      {isCreating && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-6 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Collection</h2>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm(prev => ({ 
                    ...prev, 
                    title,
                    slug: generateSlug(title)
                  }));
                }}
                className="w-full border rounded px-3 py-2 bg-transparent"
                placeholder="e.g., Red Shades, Blue Collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full border rounded px-3 py-2 bg-transparent font-mono text-sm"
                placeholder="red-shades"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border rounded px-3 py-2 bg-transparent"
                rows={3}
                placeholder="Describe this color collection..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Colors *</label>
                <button
                  onClick={addColor}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Plus size={14} />
                  Add Color
                </button>
              </div>

              <div className="space-y-3">
                {form.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColor(index, "hex", e.target.value)}
                      className="w-12 h-8 rounded border"
                    />
                    <input
                      value={color.name}
                      onChange={(e) => updateColor(index, "name", e.target.value)}
                      className="flex-1 border rounded px-2 py-1 bg-transparent"
                      placeholder="Color name (e.g., Light Red)"
                    />
                    <input
                      value={color.hex}
                      onChange={(e) => updateColor(index, "hex", e.target.value)}
                      className="w-20 border rounded px-2 py-1 bg-transparent font-mono text-sm"
                      placeholder="#FF0000"
                    />
                    <button
                      onClick={() => setForm(prev => ({ ...prev, thumbIndex: index }))}
                      className={`px-2 py-1 rounded text-xs ${
                        form.thumbIndex === index 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                          : 'border border-black/10 dark:border-white/15'
                      }`}
                    >
                      {form.thumbIndex === index ? 'Thumb' : 'Set Thumb'}
                    </button>
                    {form.colors.length > 1 && (
                      <button
                        onClick={() => removeColor(index)}
                        className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={saveCollection}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
              >
                <Save size={16} />
                Save Collection
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
