import { dbConnect } from "../../../../lib/mongoose";
import Shade from "../../../../models/Shade";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const { hex: slug } = await params; // await params before accessing
    const doc = await Shade.findOne({ slug }).lean();
    if (!doc) return json({ error: "not_found" }, 404);
    return json(doc, 200);
  } catch (error) {
    console.error("GET /api/shades/[slug] error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}

// Replace entire collection (title/description/colors/thumbIndex)
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { hex: slug } = await params;
    const body = await req.json();
    const { title, description, colors, thumbIndex = 0 } = body || {};

    if (!title || !Array.isArray(colors)) {
      return json({ error: "invalid_payload" }, 400);
    }

    const doc = await Shade.findOne({ slug });
    if (!doc) return json({ error: "not_found" }, 404);

    doc.title = title;
    doc.description = description;
    doc.colors = colors;
    doc.thumbIndex = thumbIndex;
    await doc.save();
    return json(doc, 200);
  } catch (error) {
    console.error("PUT /api/shades/[slug] error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}

// Patch for color-level changes: add/update/remove a color
export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { hex: slug } = await params;
    const body = await req.json();
    const { action, color, index } = body || {};

    const doc = await Shade.findOne({ slug });
    if (!doc) return json({ error: "not_found" }, 404);

    if (action === "add") {
      if (!color || !color.name || !color.hex) return json({ error: "invalid_color" }, 400);
      doc.colors.push(color);
    } else if (action === "update") {
      if (typeof index !== "number") return json({ error: "invalid_index" }, 400);
      if (!doc.colors[index]) return json({ error: "index_out_of_range" }, 400);
      doc.colors[index] = { ...doc.colors[index].toObject ? doc.colors[index].toObject() : doc.colors[index], ...color };
    } else if (action === "remove") {
      if (typeof index !== "number") return json({ error: "invalid_index" }, 400);
      if (!doc.colors[index]) return json({ error: "index_out_of_range" }, 400);
      doc.colors.splice(index, 1);
      if (doc.thumbIndex >= doc.colors.length) doc.thumbIndex = 0;
    } else {
      return json({ error: "invalid_action" }, 400);
    }

    await doc.save();
    return json(doc, 200);
  } catch (error) {
    console.error("PATCH /api/shades/[slug] error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}

export async function DELETE(_req, { params }) {
  try {
    await dbConnect();
    const { hex: slug } = await params;
    const result = await Shade.deleteOne({ slug });
    if (result.deletedCount === 0) return json({ error: "not_found" }, 404);
    return json({ deleted: true }, 200);
  } catch (error) {
    console.error("DELETE /api/shades/[slug] error:", error);
    return json({ error: error?.message || "server_error" }, 500);
  }
}
