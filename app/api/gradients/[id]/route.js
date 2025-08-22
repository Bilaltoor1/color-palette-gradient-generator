import { dbConnect } from "../../../../lib/mongoose";
import Gradient from "../../../../models/Gradient";
import mongoose from "mongoose";
import { sanitizeGradient } from "../../../../lib/gradients";

function idQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  return { slug: id };
}

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const doc = await Gradient.findOne(idQuery(params.id)).lean();
    if (!doc) return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    return new Response(JSON.stringify(doc), { status: 200 });
  } catch (e) {
    console.error("GET /api/gradients/[id] error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    const updates = sanitizeGradient(body);

    if (updates.slug) {
      const exists = await Gradient.findOne({ slug: updates.slug, _id: { $ne: params.id } }).lean();
      if (exists) return new Response(JSON.stringify({ error: "slug_exists" }), { status: 409 });
    }

    const doc = await Gradient.findOneAndUpdate(idQuery(params.id), updates, { new: true });
    if (!doc) return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    return new Response(JSON.stringify(doc), { status: 200 });
  } catch (e) {
    console.error("PATCH /api/gradients/[id] error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await dbConnect();
    const res = await Gradient.findOneAndDelete(idQuery(params.id));
    if (!res) return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error("DELETE /api/gradients/[id] error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), { status: 500 });
  }
}
