import { dbConnect } from "../../../lib/mongoose";
import Shade from "../../../models/Shade";

export async function GET() {
  try {
    await dbConnect();
    const docs = await Shade.find({}).sort({ updatedAt: -1 }).limit(200).lean();
    return new Response(JSON.stringify(docs), { status: 200 });
  } catch (error) {
    console.error("GET /api/shades error:", error);
    return new Response(JSON.stringify({ error: error?.message || "server_error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, description, slug, colors, thumbIndex = 0 } = body || {};
    if (!title || !slug || !Array.isArray(colors) || colors.length < 1) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), { status: 400 });
    }

    // Validate colors array
    for (const color of colors) {
      if (!color.name || !color.hex) {
        return new Response(JSON.stringify({ error: "Each color needs name and hex" }), { status: 400 });
      }
    }

    // Avoid findOneAndUpdate with upsert (can trigger strict mode issues).
    let doc = await Shade.findOne({ slug });
    if (doc) {
      doc.title = title;
      doc.description = description;
      doc.colors = colors;
      doc.thumbIndex = thumbIndex;
      await doc.save();
    } else {
      doc = await Shade.create({ title, description, slug, colors, thumbIndex });
    }
    return new Response(JSON.stringify(doc), { status: 200 });
  } catch (error) {
    console.error("POST /api/shades error:", error);
    // Return a JSON body even on unexpected server errors so the client can always parse JSON
    return new Response(JSON.stringify({ error: error?.message || "server_error" }), { status: 500 });
  }
}
