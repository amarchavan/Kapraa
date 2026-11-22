// Photo → wardrobe item fields (type, colours, pattern, fabric, occasions, name).
//
// Provider order:
//   1. Claude vision — available when the app runs as a published Claude artifact
//      (window.claude → "sample" capability with images). Accurate.
//   2. On-device fallback — silhouette + colour analysis on a 64×64 canvas. Instant,
//      offline, but only a best guess; the UI asks the user to check it.
// To use a backend in production (e.g. your own Anthropic API proxy), add a
// provider that POSTs the image and returns the same shape as `fromClaude`.
import { ALL_FABRICS, FABRICS, OCCASIONS, PATTERNS, TYPES, W_COLORS, nearestColor, typeById } from '../data/wardrobe.js';

// ---------- helpers ----------
function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(head)?.[1] || 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const autoName = (type, colors) => `${colors[0]} ${typeById(type).label.split(' /')[0].toLowerCase()}`;

// ---------- 1) Claude vision ----------
let samplePromise = null;
function getSample() {
  if (!samplePromise) {
    samplePromise = (async () => {
      try {
        if (typeof window === 'undefined' || !window.claude?.use) return null;
        const sample = await window.claude.use('sample');
        if (!sample) return null;
        const limits = await sample.limits?.().catch(() => null);
        if (limits && !limits.images) return null;
        return sample;
      } catch {
        return null;
      }
    })();
  }
  return samplePromise;
}

/** True when Claude vision can be used in this view. */
export async function visionAvailable() {
  return Boolean(await getSample());
}

const PROMPT = `You are tagging ONE photo for a personal wardrobe app (Indian + western fashion).
Identify the single main clothing item or accessory in the photo and answer with JSON only, no prose:
{"type": string, "colors": string[], "pattern": string, "fabric": string, "occasions": string[], "name": string, "confidence": number}
Rules — use ONLY these exact values:
- type: one of ${TYPES.map((t) => `"${t.id}" (${t.label})`).join(', ')}
- colors: 1 or 2 names, main colour first, from ${W_COLORS.map((c) => `"${c.name}"`).join(', ')}
- pattern: one of ${PATTERNS.map((p) => `"${p.id}"`).join(', ')} (use "solid" for accessories)
- fabric: one of ${ALL_FABRICS.map((f) => `"${f}"`).join(', ')}, or "" if you can't tell
- occasions: 1-3 of ${OCCASIONS.map((o) => `"${o.id}"`).join(', ')}
- name: short, 2-5 words, e.g. "Navy linen shirt", "Gold jhumka earrings"
- confidence: 0 to 1
If there is no clothing or accessory, return {"type": "", "confidence": 0}.`;

async function fromClaude(dataUrl) {
  const sample = await getSample();
  if (!sample) return null;
  const opts = { images: [dataUrlToBlob(dataUrl)], modelTier: 'quick', cache: false };
  let out;
  if (typeof sample.json === 'function') out = await sample.json(PROMPT, opts);
  else {
    const r = await sample(PROMPT, opts);
    out = JSON.parse(/\{[\s\S]*\}/.exec(r.text)?.[0] ?? '{}');
  }
  if (!out || !typeById(out.type)) return { error: 'not_clothing' };
  const colors = (out.colors || []).filter((c) => W_COLORS.some((w) => w.name === c)).slice(0, 2);
  const type = out.type;
  const isAcc = ['footwear', 'watch', 'jewellery', 'bag', 'extra'].includes(typeById(type).group);
  return {
    type,
    colors: colors.length ? colors : ['Grey Melange'],
    pattern: isAcc ? 'solid' : PATTERNS.some((p) => p.id === out.pattern) ? out.pattern : 'solid',
    fabric: (isAcc ? FABRICS.accessory : FABRICS.cloth).includes(out.fabric) ? out.fabric : ALL_FABRICS.includes(out.fabric) ? out.fabric : '',
    occasions: (out.occasions || []).filter((o) => OCCASIONS.some((x) => x.id === o)).slice(0, 3),
    name: typeof out.name === 'string' && out.name.trim() ? titleCase(out.name.trim().slice(0, 40)) : autoName(type, colors.length ? colors : ['Grey Melange']),
    confidence: Math.max(0, Math.min(1, Number(out.confidence) || 0.7)),
    source: 'claude',
  };
}

// ---------- 2) On-device fallback ----------
/** Foreground mask + colours from a downscaled image. */
async function analyse(dataUrl) {
  const img = await loadImage(dataUrl);
  const N = 64;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const g = c.getContext('2d', { willReadFrequently: true });
  // letterbox to keep aspect ratio
  const s = Math.min(N / img.naturalWidth, N / img.naturalHeight);
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
  const ox = Math.floor((N - w) / 2), oy = Math.floor((N - h) / 2);
  g.drawImage(img, ox, oy, w, h);
  const px = g.getImageData(0, 0, N, N).data;
  const at = (x, y) => {
    const i = (y * N + x) * 4;
    return [px[i], px[i + 1], px[i + 2]];
  };
  // background colour = average of the image's own border
  const border = [];
  for (let k = 0; k < w; k++) border.push(at(ox + k, oy), at(ox + k, oy + h - 1));
  for (let k = 0; k < h; k++) border.push(at(ox, oy + k), at(ox + w - 1, oy + k));
  const bg = [0, 1, 2].map((ch) => border.reduce((t, p) => t + p[ch], 0) / border.length);

  const mask = [];
  const colourCounts = {};
  for (let y = 0; y < N; y++) {
    const row = [];
    for (let x = 0; x < N; x++) {
      const inside = x >= ox && x < ox + w && y >= oy && y < oy + h;
      const p = at(x, y);
      const fg = inside && Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]) > 38;
      row.push(fg);
      if (fg) {
        const n = nearestColor(p).name;
        colourCounts[n] = (colourCounts[n] || 0) + 1;
      }
    }
    mask.push(row);
  }
  const ranked = Object.entries(colourCounts).sort((a, b) => b[1] - a[1]);
  const total = ranked.reduce((t, [, n]) => t + n, 0);
  const colors = ranked.filter(([, n], i) => i === 0 || n / total > 0.18).slice(0, 2).map(([n]) => n);
  return { mask, N, colors, total };
}

/** Guess the item type from the silhouette's shape. */
function classify({ mask, N, total }) {
  let x0 = N, x1 = -1, y0 = N, y1 = -1;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (mask[y][x]) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  if (x1 < 0 || total < 40) return { type: null, confidence: 0 };
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  const aspect = bh / bw; // >1 tall
  const fill = total / (bw * bh);
  const rowAt = (f) => {
    const y = Math.min(y1, Math.max(y0, Math.round(y0 + f * (bh - 1))));
    let first = -1, last = -1, runs = 0, prev = false;
    for (let x = x0; x <= x1; x++) {
      const on = mask[y][x];
      if (on && first < 0) first = x;
      if (on) last = x;
      if (on && !prev) runs++;
      prev = on;
    }
    return { width: first < 0 ? 0 : last - first + 1, runs };
  };
  const top = rowAt(0.18), upper = rowAt(0.3), mid = rowAt(0.55), low = rowAt(0.8), bottom = rowAt(0.95);
  const legRows = [0.65, 0.75, 0.85, 0.92].map(rowAt).filter((r) => r.runs >= 2).length;
  const relW = bw / N;

  // Accessories first (distinct shapes)
  if (aspect < 0.3) return { type: 'belt', confidence: 0.45 };
  if (aspect < 0.55 && [0.45, 0.5, 0.55].map(rowAt).filter((r) => r.runs >= 2).length >= 2) return { type: 'sunglasses', confidence: 0.45 };
  if (aspect < 0.75) return { type: 'sneakers', confidence: 0.5 };
  if (fill < 0.28) return { type: relW < 0.5 ? 'earrings' : 'necklace', confidence: 0.35 };
  if (aspect > 1.8 && relW < 0.35) return { type: 'watch', confidence: 0.4 };
  // bag: solid boxy body with a narrower handle on top
  if (aspect >= 0.7 && aspect <= 1.5 && fill > 0.55 && rowAt(0.06).width < bw * 0.7 && mid.width > bw * 0.9 && low.width > bw * 0.9) return { type: 'bag', confidence: 0.45 };

  // Two legs → bottoms
  if (legRows >= 2) {
    if (aspect < 1.25) return { type: 'shorts', confidence: 0.55 };
    return { type: low.width > mid.width * 1.15 ? 'palazzo' : 'jeans', confidence: 0.6 };
  }
  const sleeves = upper.width > mid.width * 1.25 || top.width > mid.width * 1.25;
  const flares = bottom.width > mid.width * 1.15;
  // A neckline/straps show as two separate runs across the very top; a skirt's waistband is one solid run
  const neckline = [0.01, 0.03, 0.05].map(rowAt).some((r) => r.runs >= 2);
  // No shoulders/sleeves, no neckline, widening, fairly short → skirt
  if (!sleeves && !neckline && top.width < bottom.width * 0.75 && aspect < 1.4) return { type: 'skirt', confidence: 0.5 };
  if (aspect >= 1.9 && flares) return { type: sleeves ? 'onepiece' : 'saree', confidence: 0.45 };
  if (aspect >= 1.45 && flares && !sleeves) return { type: 'dress', confidence: 0.5 };
  if (aspect >= 1.45 && sleeves) return { type: 'kurti', confidence: 0.45 };
  if (aspect >= 1.35 && flares) return { type: 'dress', confidence: 0.45 };
  if (sleeves) return { type: 'tshirt', confidence: 0.5 };
  return { type: 'top', confidence: 0.3 };
}

async function fromDevice(dataUrl) {
  const a = await analyse(dataUrl);
  const { type, confidence } = classify(a);
  const t = typeById(type) ? type : 'top';
  const colors = a.colors.length ? a.colors : ['Grey Melange'];
  const isAcc = ['footwear', 'watch', 'jewellery', 'bag', 'extra'].includes(typeById(t).group);
  return {
    type: t,
    colors,
    pattern: isAcc ? 'solid' : t === 'jeans' && colors[0].includes('Wash') ? 'denim' : colors.length > 1 ? 'printed' : 'solid',
    fabric: t === 'jeans' && colors[0].includes('Wash') ? 'Denim' : '',
    occasions: typeById(t).style.slice(0, 2),
    name: autoName(t, colors),
    confidence: type ? confidence : 0.2,
    source: 'device',
  };
}

/**
 * Recognise a photo. Tries Claude vision, falls back on-device.
 * Resolves to { type, colors, pattern, fabric, occasions, name, confidence, source }.
 */
export async function recognizeItem(dataUrl, { preferDevice = false } = {}) {
  if (!preferDevice) {
    try {
      const r = await fromClaude(dataUrl);
      if (r && !r.error) return r;
    } catch {
      /* not granted / rate limited / offline → fall back */
    }
  }
  return fromDevice(dataUrl);
}
