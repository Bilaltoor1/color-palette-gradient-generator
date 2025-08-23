import { dbConnect } from "../../../lib/mongoose";
import Gradient from "../../../models/Gradient";
import { sanitizeGradient } from "../../../lib/gradients";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 50);
    const sort = (searchParams.get("sort") || "newest") === "oldest" ? 1 : -1;
    const category = searchParams.get("category") || "";

    const query = {};
    if (category && category !== "all") query.categories = { $in: [category] };

    const total = await Gradient.countDocuments(query);
    const items = await Gradient.find(query)
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return new Response(JSON.stringify({ items, total, page, limit, hasMore: page * limit < total }), { status: 200 });
  } catch (e) {
    console.error("GET /api/gradients error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const data = sanitizeGradient(body);
    if (!data.title || !data.slug || data.stops.length < 2) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), { status: 400 });
    }
    const exists = await Gradient.findOne({ slug: data.slug }).lean();
    if (exists) return new Response(JSON.stringify({ error: "slug_exists" }), { status: 409 });
    const doc = await Gradient.create(data);
    return new Response(JSON.stringify(doc), { status: 201 });
  } catch (e) {
    console.error("POST /api/gradients error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), { status: 500 });
  }
}
