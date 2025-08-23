"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildGradientCss } from "@/lib/gradients";
import { toast } from "react-hot-toast";

// If you have shadcn/ui, these imports work; otherwise replace with plain elements
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { GRADIENT_CATEGORIES } from '@/data/categories';

export default function EditGradientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    type: "linear",
    angle: 90,
    stops: [
      { color: "#FF0000", position: 0 },
      { color: "#0000FF", position: 100 }
    ],
    categories: [],
    createdAt: null,
    updatedAt: null,
    _id: null,
  });

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/gradients/${id}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!ignore) setForm({ ...data, categories: data.categories || [] });
      } catch (e) {
        if (!ignore) setError(e?.message || "load_failed");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (id) load();
    return () => { ignore = true; };
  }, [id]);

  const css = useMemo(() => buildGradientCss({ type: form.type, angle: form.angle, stops: form.stops || [] }), [form.type, form.angle, form.stops]);

  function updateStop(i, patch) {
    setForm(f => ({ ...f, stops: f.stops.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
  }
  function addStop() {
    setForm(f => ({ ...f, stops: [...(f.stops || []), { color: "#000000", position: 100 }] }));
  }
  function removeStop(i) {
    setForm(f => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }));
  }
  function moveStop(i, dir) {
    setForm(f => {
      const arr = [...f.stops];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      return { ...f, stops: arr };
    });
  }
  function sortByPosition() {
    setForm(f => ({ ...f, stops: [...f.stops].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      // Ensure at least 2 stops
      if (!form.title || !form.slug || !Array.isArray(form.stops) || form.stops.length < 2) {
        throw new Error("Please provide title, slug, and at least 2 stops");
      }
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        type: form.type,
        angle: form.angle,
        stops: form.stops,
        categories: form.categories,
      };
      const res = await fetch(`/api/gradients/${form._id || id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "save_failed");
      }
      toast.success("Gradient saved successfully!");
    } catch (e) {
      setError(e?.message || "save_failed");
      toast.error(`Failed to save: ${e?.message || "save_failed"}`);
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm("Delete this gradient?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/gradients/${form._id || id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete_failed");
      toast.success("Gradient deleted successfully!");
      router.push("/admin/gradients");
    } catch (e) {
      setError(e?.message || "delete_failed");
      toast.error(`Failed to delete: ${e?.message || "delete_failed"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return (
    <div className="p-6 space-y-2">
      <div className="text-red-500 text-sm">{error}</div>
      <Button variant="outline" onClick={() => location.reload()}>Retry</Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit Gradient</h1>
          <div className="text-xs text-muted-foreground">/{form.slug}</div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={del} 
            disabled={saving}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
          >
            Delete
          </Button>
          <Button 
            onClick={save} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Editor */}
        <div className="space-y-3 lg:col-span-2">
          <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          <Textarea placeholder="Description" value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Type</span>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="w-40 bg-white dark:bg-gray-800"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="conic">Conic</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm w-12">Angle</span>
              <Slider 
                min={0} 
                max={360} 
                step={1} 
                value={[form.angle]} 
                onValueChange={v => setForm(f => ({ ...f, angle: v[0] }))} 
                className="w-56 bg-gray-300 dark:bg-gray-700 rounded-full" 
              />
              <span className="text-sm">{form.angle}°</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Stops</div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={addStop}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add Stop
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={sortByPosition}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Sort by position
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {(form.stops || []).map((s, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded border p-2">
                  <input type="color" value={s.color} onChange={e => updateStop(i, { color: e.target.value.toUpperCase() })} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-16">{s.position}%</span>
                    <div className="w-56">
                      <Slider min={0} max={100} step={1} value={[s.position]} onValueChange={v => updateStop(i, { position: v[0] })} />
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => moveStop(i, -1)}>Up</Button>
                    <Button size="sm" variant="outline" onClick={() => moveStop(i, 1)}>Down</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeStop(i)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {GRADIENT_CATEGORIES.map(category => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm(f => ({ ...f, categories: [...f.categories, category.id] }));
                      } else {
                        setForm(f => ({ ...f, categories: f.categories.filter(c => c !== category.id) }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm" style={{ color: category.color }}>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="space-y-2">
          <div className="rounded border p-3">
            <div className="mb-2 text-sm text-muted-foreground">Live Preview</div>
            <div className="h-48 w-full rounded" style={{ backgroundImage: css }} />
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Created: {form.createdAt ? new Date(form.createdAt).toLocaleString() : "-"}</div>
            <div>Updated: {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "-"}</div>
            <div>ID: {form._id || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
