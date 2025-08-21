import { dbConnect } from "../../../../lib/mongoose";
import Shade from "../../../../models/Shade";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(req) {
  // body: { slug, color }
  try {
    await dbConnect();
    const body = await req.json();
    const { slug, color } = body || {};
    if (!slug || !color || !color.name || !color.hex) return json({ error: "invalid_payload" }, 400);

    const doc = await Shade.findOne({ slug });
    if (!doc) return json({ error: "not_found" }, 404);

    doc.colors.push(color);
    await doc.save();
    return json(doc, 200);
  } catch (error) {
    console.error("POST /api/shades/colors error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}

export async function PATCH(req) {
  // body: { slug, index, color }
  try {
    await dbConnect();
    const body = await req.json();
    const { slug, index, color } = body || {};
    if (!slug || typeof index !== "number" || !color) return json({ error: "invalid_payload" }, 400);

    const doc = await Shade.findOne({ slug });
    if (!doc) return json({ error: "not_found" }, 404);

    if (!doc.colors[index]) return json({ error: "index_out_of_range" }, 400);
    doc.colors[index] = { ...doc.colors[index].toObject ? doc.colors[index].toObject() : doc.colors[index], ...color };
    await doc.save();
    return json(doc, 200);
  } catch (error) {
    console.error("PATCH /api/shades/colors error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}

export async function DELETE(req) {
  // body: { slug, index }
  try {
    await dbConnect();
    const body = await req.json();
    const { slug, index } = body || {};
    if (!slug || typeof index !== "number") return json({ error: "invalid_payload" }, 400);

    const doc = await Shade.findOne({ slug });
    if (!doc) return json({ error: "not_found" }, 404);
    if (!doc.colors[index]) return json({ error: "index_out_of_range" }, 400);

    doc.colors.splice(index, 1);
    if (doc.thumbIndex >= doc.colors.length) doc.thumbIndex = 0;
    await doc.save();
    return json(doc, 200);
  } catch (error) {
    console.error("DELETE /api/shades/colors error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}
