import { dbConnect } from "../../../../lib/mongoose";
import Gradient from "../../../../models/Gradient";
import { sanitizeGradient } from "../../../../lib/gradients";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "expected_array" }), { status: 400 });
    }
    const docs = body.map(sanitizeGradient).filter(g => g.title && g.slug && g.stops?.length >= 2);

    const slugs = docs.map(d => d.slug);
    const existing = await Gradient.find({ slug: { $in: slugs } }).select("slug").lean();
    const existingSlugs = new Set(existing.map(e => e.slug));
    const filtered = docs.filter(d => !existingSlugs.has(d.slug));

    if (!filtered.length) return new Response(JSON.stringify({ inserted: 0, skipped: slugs.length }), { status: 200 });

    const inserted = await Gradient.insertMany(filtered, { ordered: false });
    return new Response(JSON.stringify({ inserted: inserted.length, skipped: slugs.length - inserted.length }), { status: 201 });
  } catch (e) {
    console.error("POST /api/gradients/bulk error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), { status: 500 });
  }
}
