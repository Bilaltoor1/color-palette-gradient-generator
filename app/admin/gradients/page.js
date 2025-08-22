"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Plus, Upload, Trash2, Edit } from "lucide-react";

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading gradients...</p>
      </div>
    </div>
  );
}

// Time ago formatter
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}min ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < week) return `${Math.floor(diffMs / day)}d ago`;
  if (diffMs < month) return `${Math.floor(diffMs / week)}w ago`;
  if (diffMs < year) return `${Math.floor(diffMs / month)}mo ago`;
  return `${Math.floor(diffMs / year)}y ago`;
}

function StopEditor({ stops, setStops }) {
  const update = (i, patch) => setStops(stops.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  const add = () => setStops([...stops, { color: "#000000", position: 100 }]);
  const remove = (i) => setStops(stops.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      <div className="font-medium text-sm">Color Stops</div>
      {stops.map((s, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input 
            type="color" 
            value={s.color} 
            onChange={e => update(i, { color: e.target.value.toUpperCase() })} 
            className="w-12 h-8 rounded border cursor-pointer"
          />
          <div className="flex-1">
            <Slider 
              min={0} 
              max={100} 
              step={1} 
              value={[s.position]} 
              onValueChange={v => update(i, { position: v[0] })} 
            />
          </div>
          <span className="w-12 text-sm font-mono">{s.position}%</span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => remove(i)}
            className="cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={add}
        className="cursor-pointer w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Color Stop
      </Button>
    </div>
  );
}

export default function AdminGradientsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("[]");
  const [deleteAlert, setDeleteAlert] = useState({ open: false, gradient: null });
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

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
    tags: []
  });

  useEffect(() => { fetchList(); }, []);
  
  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/gradients?limit=100");
      const json = await res.json();
      setItems(json.items || []);
    } catch (error) {
      console.error("Failed to fetch gradients:", error);
    } finally {
      setLoading(false);
    }
  }

  function genSlug(v) {
    const s = v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm(f => ({ ...f, title: v, slug: s }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/gradients", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(form) 
      });
      if (res.ok) { 
        setOpen(false); 
        await fetchList(); 
        setForm({
          title: "",
          slug: "",
          description: "",
          type: "linear",
          angle: 90,
          stops: [
            { color: "#FF0000", position: 0 },
            { color: "#0000FF", position: 100 }
          ],
          tags: []
        });
      }
    } catch (error) {
      console.error("Failed to save gradient:", error);
    } finally {
      setSaving(false);
    }
  }

  async function del(gradient) {
    try {
      const res = await fetch(`/api/gradients/${gradient._id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchList();
        setDeleteAlert({ open: false, gradient: null });
      }
    } catch (error) {
      console.error("Failed to delete gradient:", error);
    }
  }

  async function bulkSave() {
    setBulkSaving(true);
    try {
      console.log("Starting bulk save...");
      const arr = JSON.parse(bulkText);
      console.log("Parsed JSON:", arr.length, "items");
      
      const res = await fetch("/api/gradients/bulk", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(arr) 
      });
      
      console.log("API response status:", res.status);
      const result = await res.json();
      console.log("API result:", result);
      
      if (res.ok) { 
        setBulkOpen(false); 
        setBulkText('[]');
        await fetchList(); 
      } else {
        alert(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Bulk save error:", err);
      alert(`Parse error: ${err.message}`);
    } finally {
      setBulkSaving(false);
    }
  }

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gradient Management</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create, edit, and manage your gradient collection. Import multiple gradients at once with bulk upload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 justify-center">
          <Button 
            onClick={() => setOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Gradient
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setBulkOpen(true)}
            className="cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(g => (
            <div key={g._id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="h-40 w-full" style={{ background: buildPreview(g) }} />
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    /{g.slug}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {timeAgo(g.createdAt)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(`/admin/gradients/${g._id}`, '_blank')}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => setDeleteAlert({ open: true, gradient: g })}
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                
                {g.tags && g.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {g.tags.map(t => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Dialog */}
        <div className={`${open ? '' : 'hidden'} fixed inset-0 z-50 grid place-items-center bg-black/40 p-4`}>
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl max-h-screen overflow-y-auto">
            <div className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New Gradient</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Title" 
                  value={form.title} 
                  onChange={e => genSlug(e.target.value)} 
                />
                <Input 
                  placeholder="Slug" 
                  value={form.slug} 
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} 
                />
              </div>
              <Textarea 
                placeholder="Description" 
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gradient Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12">Angle</span>
                  <Slider 
                    min={0} 
                    max={360} 
                    step={1} 
                    value={[form.angle]} 
                    onValueChange={v => setForm(f => ({ ...f, angle: v[0] }))} 
                    className="flex-1" 
                  />
                  <span className="text-sm w-12 font-mono">{form.angle}°</span>
                </div>
              </div>
              <StopEditor stops={form.stops} setStops={(stops) => setForm(f => ({ ...f, stops }))} />
              <Input 
                placeholder="Tags (comma separated)" 
                onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} 
              />
              <div className="h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600" style={{ background: buildPreview(form) }} />
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={save} 
                  disabled={saving}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Gradient'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Import Dialog */}
        <div className={`${bulkOpen ? '' : 'hidden'} fixed inset-0 z-50 grid place-items-center bg-black/40 p-4`}>
          <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl max-h-screen flex flex-col">
            <div className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bulk Import Gradients</div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Textarea 
                rows={16} 
                value={bulkText} 
                onChange={e => setBulkText(e.target.value)} 
                className="w-full font-mono text-sm" 
                placeholder="Paste your JSON array here..."
              />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <strong>Expected format:</strong> Array of gradient objects<br />
                <code className="text-xs">
                  {`[{ "title":"Sunset", "slug":"sunset", "type":"linear", "angle":90, "stops":[{"color":"#FF0000","position":0},{"color":"#0000FF","position":100}], "tags":["warm"] }]`}
                </code>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setBulkOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={bulkSave}
                disabled={bulkSaving}
                className="cursor-pointer bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0"
              >
                {bulkSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Gradients
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteAlert.open} onOpenChange={(open) => setDeleteAlert({ open, gradient: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Gradient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteAlert.gradient?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteAlert.gradient && del(deleteAlert.gradient)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function buildPreview(g) {
  const stops = (g.stops || []).map(s => `${s.color} ${s.position}%`).join(", ");
  if (g.type === "conic") return `conic-gradient(from ${g.angle || 0}deg, ${stops})`;
  if (g.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(${g.angle || 90}deg, ${stops})`;
}
