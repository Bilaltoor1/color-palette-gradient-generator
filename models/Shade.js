import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Light Red", "Dark Red"
  hex: { type: String, required: true, uppercase: true }, // e.g., "#FF6B6B"
});

const ShadeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "Red Shades", "Blue Collection"
    description: { type: String }, // Optional description
    slug: { type: String, required: true, unique: true }, // URL-friendly identifier
    colors: [ColorSchema], // Array of named colors with hex values
    thumbIndex: { type: Number, default: 0 }, // which color to use as thumbnail
  },
  { timestamps: true }
);

export default mongoose.models.Shade || mongoose.model("Shade", ShadeSchema);
