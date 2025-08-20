// Color utilities and palette generators (no external deps)

// Math helpers
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mod = (n, m) => ((n % m) + m) % m;

// HSV <-> RGB/HEX/HSL
export function hsvToRgb({ h, s, v }) {
  h = mod(h, 360);
  s = clamp01(s);
  v = clamp01(v);
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return { r, g, b };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hsvToHex(hsv) {
  return rgbToHex(hsvToRgb(hsv));
}

export function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d === 0) h = 0;
  else if (max === r) h = 60 * (((g - b) / d) % 6);
  else if (max === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h: mod(h, 360), s, v };
}

export function hsvToHsl({ h, s, v }) {
  // Convert HSV to HSL
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h: mod(h, 360), s: clamp01(sl), l: clamp01(l) };
}

export function hexToHsv(hex) {
  return rgbToHsv(hexToRgb(hex));
}

// Scheme generation helpers
function rotateHue(h, deg) {
  return mod(h + deg, 360);
}

function buildColor(h, s, v) {
  const hsv = { h, s: clamp01(s), v: clamp01(v) };
  const rgb = hsvToRgb(hsv);
  const hex = rgbToHex(rgb);
  const hsl = hsvToHsl(hsv);
  return { hsv, rgb, hex, hsl };
}

export function generatePalette(baseHsv, scheme, size = 5) {
  const h = baseHsv.h;
  const s = clamp01(baseHsv.s);
  const v = clamp01(baseHsv.v);

  // Determine hue set based on scheme
  let hues = [];
  switch (scheme) {
    case "complementary":
      hues = [h, rotateHue(h, 180)];
      break;
    case "monochromatic":
      hues = [h];
      break;
    case "analogous":
      hues = [rotateHue(h, -30), h, rotateHue(h, 30)];
      break;
    case "triadic":
      hues = [h, rotateHue(h, 120), rotateHue(h, 240)];
      break;
    case "tetradic":
      hues = [h, rotateHue(h, 90), rotateHue(h, 180), rotateHue(h, 270)];
      break;
    default:
      hues = [h];
  }

  // Spread values to reach desired size
  const result = [];
  for (let i = 0; i < size; i++) {
    const hue = hues[i % hues.length];
    // Slightly vary saturation/value for variety
    const t = hues.length > 1 ? i / (size - 1 || 1) : i / (size || 1);
    const sVar = clamp01(s * (0.9 + 0.2 * Math.sin((i * Math.PI) / 4)));
    const vVar = clamp01(v * (0.9 + 0.1 * Math.cos((i * Math.PI) / 3)));
    result.push(buildColor(hue, sVar, vVar));
  }
  return result;
}
