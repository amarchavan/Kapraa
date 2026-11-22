// Rule-based outfit stylist: colour harmony + pattern balance + occasion fit.
// Every score comes with human-readable reasons so suggestions are explainable.
import { colorByName, groupOf, typeById } from '../data/wardrobe.js';

// ---------- colour maths ----------
function hsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

// Colours that act as neutrals in Indian/western dressing (denim washes, navy, metals included).
const NEUTRAL_NAMES = new Set(['White', 'Off White', 'Beige', 'Tan', 'Brown', 'Black', 'Grey Melange', 'Navy', 'Light Wash', 'Mid Wash', 'Dark Wash', 'Gold', 'Silver']);

export function isNeutral(name) {
  if (NEUTRAL_NAMES.has(name)) return true;
  const c = colorByName(name);
  if (!c) return false;
  const { s, l } = hsl(c.hex);
  return s < 0.15 || l > 0.9 || l < 0.13;
}

/** 0..1 harmony between two colour names, plus the reason. */
export function colourHarmony(a, b) {
  if (a === b) return isNeutral(a) ? { score: 0.7, why: `Tonal ${a.toLowerCase()}` } : { score: 0.62, why: `Monochrome ${a.toLowerCase()}` };
  const na = isNeutral(a), nb = isNeutral(b);
  if (na && nb) return { score: 0.86, why: 'Neutrals always pair' };
  if (na || nb) return { score: 0.92, why: `${na ? a : b} grounds the colour` };
  const ca = colorByName(a), cb = colorByName(b);
  if (!ca || !cb) return { score: 0.5, why: '' };
  const ha = hsl(ca.hex), hb = hsl(cb.hex);
  let d = Math.abs(ha.h - hb.h);
  if (d > 180) d = 360 - d;
  if (d <= 30) return { score: 0.74, why: 'Analogous colours' };
  if (d >= 150) return { score: 0.8, why: 'Complementary colours' };
  if (d >= 105) return { score: 0.6, why: 'Bold triadic contrast' };
  return { score: 0.34, why: 'Colours may clash' };
}

const mainColour = (item) => item.colors[0];
const occasionsOf = (item) => (item.occasions?.length ? item.occasions : typeById(item.type)?.style ?? []);

/** Score how well two wardrobe items go together. */
export function pairScore(a, b) {
  const reasons = [];
  // Colour: best harmony across each item's colours (secondary colours count a little less)
  let best = { score: 0, why: '' };
  a.colors.forEach((ca, i) =>
    b.colors.forEach((cb, j) => {
      const h = colourHarmony(ca, cb);
      const s = h.score - (i + j) * 0.05;
      if (s > best.score) best = { score: s, why: h.why };
    })
  );
  let score = best.score * 0.55;
  if (best.why) reasons.push(best.why);

  // Pattern balance
  const pa = a.pattern !== 'solid' && a.pattern !== 'denim';
  const pb = b.pattern !== 'solid' && b.pattern !== 'denim';
  if (pa && pb) {
    score -= 0.12;
    reasons.push('Two patterns compete');
  } else if (pa || pb) {
    score += 0.1;
    reasons.push('Print balanced by a solid');
  } else score += 0.06;

  // Occasion overlap
  const oa = occasionsOf(a), ob = occasionsOf(b);
  const shared = oa.filter((o) => ob.includes(o));
  if (shared.length) {
    score += 0.25 + Math.min(shared.length - 1, 1) * 0.05;
    reasons.push(`Both ${OCC_WORD[shared[0]]}`);
  } else score -= 0.1;

  return { score: Math.max(0, Math.min(1, score + 0.05)), reasons, shared };
}
const OCC_WORD = { casual: 'casual', formal: 'office-ready', party: 'party wear', ethnic: 'ethnic', sport: 'sporty' };

/** Which slots an outfit built around `item` still needs. */
export function slotsFor(item) {
  const g = groupOf(item);
  switch (g) {
    case 'top': return ['bottom', 'layer'];
    case 'bottom': return ['top', 'layer'];
    case 'full': return ['layer'];
    case 'layer': return ['top', 'bottom', 'full'];
    default: return ['top', 'bottom', 'full']; // accessories → the clothes they suit
  }
}
export const ACCESSORY_SLOTS = ['footwear', 'watch', 'jewellery', 'bag'];

/** Ranked matches for `item` in a given slot. */
export function matchesFor(item, wardrobe, slot, limit = 6) {
  return wardrobe
    .filter((w) => w.id !== item.id && groupOf(w) === slot)
    .map((w) => ({ item: w, ...pairScore(item, w) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);
}

/** Average pairwise score of a set of items (outfit cohesion). */
function cohesion(items) {
  let sum = 0, n = 0;
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    sum += pairScore(items[i], items[j]).score;
    n++;
  }
  return n ? sum / n : 0;
}

/**
 * Complete looks that include `item`: base clothes (top+bottom or full), optional
 * layer, then the best footwear + up to two accessories. Returns top `limit`.
 */
export function completeLooks(item, wardrobe, limit = 3) {
  const g = groupOf(item);
  const by = (slot) => wardrobe.filter((w) => groupOf(w) === slot && w.id !== item.id);
  const top = (slot, base, k) => by(slot).map((w) => ({ w, s: cohesion([...base, w]) })).sort((a, b) => b.s - a.s).slice(0, k);

  // 1) candidate clothing bases containing the item
  let bases = [];
  if (g === 'top') bases = top('bottom', [item], 4).map((x) => [item, x.w]);
  else if (g === 'bottom') bases = top('top', [item], 4).map((x) => [x.w, item]);
  else if (g === 'full') bases = [[item]];
  else if (g === 'layer') {
    bases = [
      ...by('full').map((f) => [f]),
      ...by('top').flatMap((t) => by('bottom').map((b) => [t, b])),
    ].map((b) => ({ b, s: cohesion([item, ...b]) })).sort((a, b) => b.s - a.s).slice(0, 4).map((x) => x.b);
  } else {
    // accessory: find the clothing bases it suits best
    bases = [
      ...by('full').map((f) => [f]),
      ...by('top').flatMap((t) => by('bottom').map((b) => [t, b])),
    ].map((b) => ({ b, s: cohesion([...b]) * 0.5 + b.reduce((n, w) => n + pairScore(item, w).score, 0) / b.length * 0.5 })).sort((a, b) => b.s - a.s).slice(0, 4).map((x) => x.b);
  }

  const looks = bases.map((base) => {
    let pieces = [...base];
    if (g !== 'top' && g !== 'bottom' && g !== 'full' && g !== 'layer') pieces = [...base, item];
    if (g === 'layer') pieces = [...base, item];
    // optional layer if it improves cohesion
    if (!pieces.some((p) => groupOf(p) === 'layer')) {
      const layer = top('layer', pieces, 1)[0];
      if (layer && layer.s >= cohesion(pieces) - 0.02) pieces.push(layer.w);
    }
    // accessories: one per slot, if they fit
    for (const slot of ACCESSORY_SLOTS) {
      if (pieces.some((p) => groupOf(p) === slot)) continue;
      // keep metals consistent: no gold jewellery with a silver watch, etc.
      const metal = pieces.map(metalOf).find(Boolean);
      const pick = top(slot, pieces.filter((p) => GROUP_IS_CLOTH(p)), 4).find((x) => !metal || !metalOf(x.w) || metalOf(x.w) === metal);
      if (pick && pick.s >= 0.5) pieces.push(pick.w);
    }
    const clothes = pieces.filter(GROUP_IS_CLOTH);
    const score = cohesion(clothes) * 0.7 + cohesion(pieces) * 0.3;
    const occ = commonOccasion(pieces);
    return { pieces, score, occasion: occ };
  });
  // de-duplicate identical piece sets, keep best
  const seen = new Set();
  return looks
    .sort((a, b) => b.score - a.score)
    .filter((l) => {
      const k = l.pieces.map((p) => p.id).sort().join();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}
const metalOf = (w) => (['watch', 'jewellery'].includes(groupOf(w)) && ['Gold', 'Silver'].includes(w.colors[0]) ? w.colors[0] : null);
const GROUP_IS_CLOTH = (w) => ['top', 'bottom', 'full', 'layer'].includes(groupOf(w));

function commonOccasion(pieces) {
  const counts = {};
  pieces.filter(GROUP_IS_CLOTH).forEach((p) => occasionsOf(p).forEach((o) => (counts[o] = (counts[o] || 0) + 1)));
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

/** Dashboard: outfits that work (score ≥ threshold), and the colour pairs behind them. */
export function wardrobeInsights(wardrobe, threshold = 0.62) {
  const tops = wardrobe.filter((w) => groupOf(w) === 'top');
  const bottoms = wardrobe.filter((w) => groupOf(w) === 'bottom');
  const fulls = wardrobe.filter((w) => groupOf(w) === 'full');
  const pairs = [];
  tops.forEach((t) => bottoms.forEach((b) => {
    const p = pairScore(t, b);
    if (p.score >= threshold) pairs.push({ top: t, bottom: b, score: p.score });
  }));
  const combos = {};
  pairs.forEach(({ top, bottom, score }) => {
    const k = `${mainColour(top)}|${mainColour(bottom)}`;
    const c = (combos[k] ??= { n: 0, sum: 0 });
    c.n++;
    c.sum += score;
  });
  // rank by outfits unlocked, then match strength; max two rows per top colour for variety
  const perTop = {};
  const colourPairs = Object.entries(combos)
    .map(([k, c]) => ({ a: k.split('|')[0], b: k.split('|')[1], n: c.n, avg: c.sum / c.n }))
    .sort((x, y) => y.n - x.n || y.avg - x.avg)
    .filter((p) => (perTop[p.a] = (perTop[p.a] || 0) + 1) <= 2);

  // Outfits each piece unlocks — used for "most versatile"
  const versatility = {};
  pairs.forEach(({ top, bottom }) => {
    versatility[top.id] = (versatility[top.id] || 0) + 1;
    versatility[bottom.id] = (versatility[bottom.id] || 0) + 1;
  });

  return { outfitCount: pairs.length + fulls.length, pairs, colourPairs, versatility };
}
