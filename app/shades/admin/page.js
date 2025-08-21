"use client";
import { useMemo, useState } from "react";
import { generateShades } from "../../../lib/shades";
import { toast } from "react-hot-toast";

export default function ShadesAdminPage() {
  const [baseHex, setBaseHex] = useState("#FF00AA");
  const [name, setName] = useState("");
  const [thumbIndex, setThumbIndex] = useState(3);

  const shades = useMemo(() => generateShades(baseHex, 7), [baseHex]);

  async function save() {
    try {
      const res = await fetch("/api/shades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseHex, name, shades, thumbIndex })
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Saved shades");
    } catch (e) {
      toast.error("Save failed");
      console.error(e);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Shades Admin</h1>
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Base Color (HEX)</label>
            <input value={baseHex} onChange={(e)=>setBaseHex(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent" placeholder="#FF00AA" />
          </div>
          <div>
            <label className="block text-sm mb-1">Name (optional)</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Pink" />
          </div>
          <div>
            <label className="block text-sm mb-2">Generated Shades</label>
            <div className="grid grid-cols-7 gap-2">
              {shades.map((s, i) => (
                <button key={s} type="button" onClick={()=>setThumbIndex(i)}
                  className={`h-16 rounded border ${thumbIndex===i? 'ring-2 ring-blue-500 border-transparent':'border-black/10 dark:border-white/10'}`}
                  style={{ background: s }}
                  title={s}
                />
              ))}
            </div>
            <p className="text-xs text-foreground/60 mt-2">Click a shade to select the thumbnail color.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
