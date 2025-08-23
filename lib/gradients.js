export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
export function rgbToHex({ r, g, b }) {
  const h = (v) => clamp(v, 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

// Apply simple RGB offset tweak to all stops for preview adjustments
export function applyRgbOffset(hex, offset) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({ r: r + (offset?.r || 0), g: g + (offset?.g || 0), b: b + (offset?.b || 0) });
}

export function buildGradientCss({ type = "linear", angle = 90, stops = [] }) {
  const stopsStr = stops
    .map(s => `${s.color} ${clamp(s.position, 0, 100)}%`)
    .join(", ");
  if (type === "conic") return `conic-gradient(from ${angle}deg, ${stopsStr})`;
  if (type === "radial") return `radial-gradient(circle, ${stopsStr})`;
  return `linear-gradient(${angle}deg, ${stopsStr})`;
}

// Tailwind-friendly arbitrary value class
export function buildTailwindClass(gradientCss) {
  const safe = gradientCss
    .replaceAll(" ", "_")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll(",", "\\,");
  return `bg-[${safe}]`;
}

export function sanitizeGradient(input = {}) {
  const title = String(input.title || "").trim();
  const slug = String(input.slug || "").trim().toLowerCase();
  const description = String(input.description || "").trim();
  const type = ["linear", "conic", "radial"].includes(input.type) ? input.type : "linear";
  const angle = Number.isFinite(input.angle) ? input.angle : 90;
  const stops = Array.isArray(input.stops) ? input.stops
    .map(s => ({ color: String(s?.color || "").trim().toUpperCase(), position: Number(s?.position) }))
    .filter(s => /^#([0-9A-F]{6})$/i.test(s.color) && Number.isFinite(s.position)) : [];
  const categories = Array.isArray(input.categories) ? input.categories.map(c => String(c).trim()).filter(Boolean) : [];
  return { title, slug, description, type, angle, stops, categories };
}
