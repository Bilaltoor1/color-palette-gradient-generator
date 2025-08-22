import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongoose";
import Shade from "@/models/Shade";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { slug, colors } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json({ error: "Colors array is required" }, { status: 400 });
    }

    // Validate each color
    for (const color of colors) {
      if (!color.name || !color.hex) {
        return NextResponse.json(
          { error: "Each color must have 'name' and 'hex' properties" },
          { status: 400 }
        );
      }

      // Validate hex format
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexRegex.test(color.hex)) {
        return NextResponse.json(
          { error: `Invalid hex color: ${color.hex}. Must be in format #RRGGBB` },
          { status: 400 }
        );
      }
    }

    // Find the collection
    const collection = await Shade.findOne({ slug });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Add colors to the collection
    const sanitizedColors = colors.map(color => ({
      name: color.name.trim(),
      hex: color.hex.toUpperCase()
    }));

    collection.colors.push(...sanitizedColors);
    await collection.save();

    return NextResponse.json({
      message: `Successfully added ${sanitizedColors.length} colors`,
      collection: collection,
      addedColors: sanitizedColors
    });

  } catch (error) {
    console.error("Bulk add colors error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve predefined color palettes
export async function GET() {
  try {
    const predefinedPalettes = {
      red: [
        { name: "Pure Red", hex: "#FF0000" },
        { name: "Crimson", hex: "#DC143C" },
        { name: "Cherry Red", hex: "#DE3163" },
        { name: "Fire Engine Red", hex: "#CE2029" },
        { name: "Cardinal Red", hex: "#C41E3A" },
        { name: "Scarlet", hex: "#FF2400" },
        { name: "Ruby Red", hex: "#E0115F" },
        { name: "Blood Red", hex: "#8B0000" },
        { name: "Burgundy", hex: "#800020" },
        { name: "Maroon", hex: "#800000" },
        { name: "Light Coral", hex: "#F08080" },
        { name: "Salmon", hex: "#FA8072" },
        { name: "Indian Red", hex: "#CD5C5C" },
        { name: "Tomato", hex: "#FF6347" },
        { name: "Coral", hex: "#FF7F50" },
        { name: "Hot Pink", hex: "#FF69B4" },
        { name: "Deep Pink", hex: "#FF1493" },
        { name: "Watermelon", hex: "#FF7F7F" },
        { name: "Rose", hex: "#FF007F" },
        { name: "Pink Red", hex: "#FF0040" }
      ],
      blue: [
        { name: "Pure Blue", hex: "#0000FF" },
        { name: "Navy Blue", hex: "#000080" },
        { name: "Royal Blue", hex: "#4169E1" },
        { name: "Sky Blue", hex: "#87CEEB" },
        { name: "Light Blue", hex: "#ADD8E6" },
        { name: "Powder Blue", hex: "#B0E0E6" },
        { name: "Steel Blue", hex: "#4682B4" },
        { name: "Midnight Blue", hex: "#191970" },
        { name: "Cornflower Blue", hex: "#6495ED" },
        { name: "Deep Sky Blue", hex: "#00BFFF" }
      ],
      green: [
        { name: "Pure Green", hex: "#00FF00" },
        { name: "Forest Green", hex: "#228B22" },
        { name: "Dark Green", hex: "#006400" },
        { name: "Lime Green", hex: "#32CD32" },
        { name: "Spring Green", hex: "#00FF7F" },
        { name: "Sea Green", hex: "#2E8B57" },
        { name: "Medium Sea Green", hex: "#3CB371" },
        { name: "Light Green", hex: "#90EE90" },
        { name: "Pale Green", hex: "#98FB98" },
        { name: "Olive Green", hex: "#808000" }
      ],
      yellow: [
        { name: "Pure Yellow", hex: "#FFFF00" },
        { name: "Gold", hex: "#FFD700" },
        { name: "Light Yellow", hex: "#FFFFE0" },
        { name: "Lemon Yellow", hex: "#FFF44F" },
        { name: "Banana Yellow", hex: "#FFE135" },
        { name: "Canary Yellow", hex: "#FFEF00" },
        { name: "Amber", hex: "#FFBF00" },
        { name: "Dark Golden Rod", hex: "#B8860B" },
        { name: "Khaki", hex: "#F0E68C" },
        { name: "Pale Golden Rod", hex: "#EEE8AA" }
      ],
      purple: [
        { name: "Purple", hex: "#800080" },
        { name: "Violet", hex: "#8A2BE2" },
        { name: "Indigo", hex: "#4B0082" },
        { name: "Dark Violet", hex: "#9400D3" },
        { name: "Medium Purple", hex: "#9370DB" },
        { name: "Lavender", hex: "#E6E6FA" },
        { name: "Plum", hex: "#DDA0DD" },
        { name: "Orchid", hex: "#DA70D6" },
        { name: "Magenta", hex: "#FF00FF" },
        { name: "Dark Magenta", hex: "#8B008B" }
      ],
      orange: [
        { name: "Orange", hex: "#FFA500" },
        { name: "Dark Orange", hex: "#FF8C00" },
        { name: "Orange Red", hex: "#FF4500" },
        { name: "Light Orange", hex: "#FFE4B5" },
        { name: "Peach", hex: "#FFCBA4" },
        { name: "Papaya Whip", hex: "#FFEFD5" },
        { name: "Moccasin", hex: "#FFE4B5" },
        { name: "Coral", hex: "#FF7F50" },
        { name: "Burnt Orange", hex: "#CC5500" },
        { name: "Tangerine", hex: "#F28500" }
      ]
    };

    return NextResponse.json(predefinedPalettes);
  } catch (error) {
    console.error("Get predefined palettes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
