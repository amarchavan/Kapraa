import { productById, SUPPLIERS } from '../data/catalog.js';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const money = (n) => inr.format(Math.round(n));

// Apparel GST in India: 5% up to ₹2,500 per piece, 18% above (from Sept 2025).
export const gstRate = (unitPrice) => (unitPrice <= 2500 ? 0.05 : 0.18);
export const FLAT_SHIPPING = 249;

export const margin = (p) => (p.mrp - p.price) / p.mrp;
export const sizeRange = (p) => (p.sizes.length > 1 ? `${p.sizes[0]}–${p.sizes[p.sizes.length - 1]}` : p.sizes[0]);

/** matrix: { [colorName]: { [size]: qty } } */
export function matrixPieces(matrix = {}) {
  let n = 0;
  for (const sizes of Object.values(matrix)) for (const q of Object.values(sizes)) n += Number(q) || 0;
  return n;
}

export function matrixSummary(matrix = {}) {
  return Object.entries(matrix)
    .map(([color, sizes]) => {
      const v = Object.values(sizes).map(Number);
      const sets = v.length ? Math.min(...v) : 0;
      return sets > 0 ? `${color} × ${sets} set${sets > 1 ? 's' : ''}` : null;
    })
    .filter(Boolean);
}

/** Groups the cart by supplier — each supplier becomes its own sub-order. */
export function cartSummary(cart) {
  const groups = {};
  for (const [id, matrix] of Object.entries(cart)) {
    const product = productById(id);
    const pieces = matrixPieces(matrix);
    if (!product || pieces === 0) continue;
    const amount = pieces * product.price;
    const gst = amount * gstRate(product.price);
    const g = (groups[product.supplierId] ??= { supplier: SUPPLIERS[product.supplierId], items: [], pieces: 0, subtotal: 0, gst: 0 });
    g.items.push({ product, matrix, pieces, amount, gst, moqOk: pieces >= product.moq });
    g.pieces += pieces;
    g.subtotal += amount;
    g.gst += gst;
  }
  const list = Object.values(groups).map((g) => {
    const shipping = g.subtotal >= g.supplier.freeShipAbove ? 0 : FLAT_SHIPPING;
    return { ...g, shipping, total: g.subtotal + g.gst + shipping, toFreeShip: Math.max(0, g.supplier.freeShipAbove - g.subtotal) };
  });
  const totals = list.reduce(
    (t, g) => ({ pieces: t.pieces + g.pieces, subtotal: t.subtotal + g.subtotal, gst: t.gst + g.gst, shipping: t.shipping + g.shipping, total: t.total + g.total, styles: t.styles + g.items.length }),
    { pieces: 0, subtotal: 0, gst: 0, shipping: 0, total: 0, styles: 0 }
  );
  const issues = list.flatMap((g) => g.items.filter((i) => !i.moqOk));
  return { groups: list, totals, issues };
}
