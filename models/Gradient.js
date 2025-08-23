import mongoose, { Schema } from "mongoose";

const StopSchema = new Schema(
  {
    color: { type: String, required: true }, // hex like #FF00AA
    position: { type: Number, min: 0, max: 100, required: true }, // percent
  },
  { _id: false }
);

const GradientSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    type: { type: String, enum: ["linear", "conic", "radial"], default: "linear" },
    angle: { type: Number, default: 90 },
    stops: {
      type: [StopSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: "At least two stops are required",
      },
    },
    categories: { type: [String], default: [] },
  },
  { timestamps: true }
);

GradientSchema.index({ createdAt: -1 });

export default mongoose.models.Gradient || mongoose.model("Gradient", GradientSchema);
