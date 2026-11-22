// Wardrobe taxonomy, colours and the sample wardrobe for the Customer "My Wardrobe" feature.
import { C } from './catalog.js';

/** Slots an item can fill in an outfit. */
export const GROUPS = {
  top: { label: 'Tops', kind: 'cloth' },
  bottom: { label: 'Bottoms', kind: 'cloth' },
  full: { label: 'Dresses & sets', kind: 'cloth' },
  layer: { label: 'Layers', kind: 'cloth' },
  footwear: { label: 'Footwear', kind: 'accessory' },
  watch: { label: 'Watches', kind: 'accessory' },
  jewellery: { label: 'Jewellery', kind: 'accessory' },
  bag: { label: 'Bags', kind: 'accessory' },
  extra: { label: 'Belts & eyewear', kind: 'accessory' },
};

/**
 * Item types. `art` picks the drawing; `style` is the type's default dress code
 * used by the stylist (ethnic / casual / formal / party / sport).
 */
export const TYPES = [
  // Clothes
  { id: 'tshirt', label: 'T-shirt', group: 'top', art: 'tshirt', style: ['casual', 'sport'] },
  { id: 'shirt', label: 'Shirt', group: 'top', art: 'shirt', style: ['casual', 'formal'] },
  { id: 'top', label: 'Top / blouse', group: 'top', art: 'tshirt', style: ['casual', 'party', 'formal'] },
  { id: 'kurti', label: 'Kurti / kurta', group: 'top', art: 'kurti', style: ['ethnic', 'casual'] },
  { id: 'sweater', label: 'Sweater / hoodie', group: 'top', art: 'tshirt', style: ['casual'] },
  { id: 'jeans', label: 'Jeans', group: 'bottom', art: 'jeans', style: ['casual', 'party'] },
  { id: 'trousers', label: 'Trousers', group: 'bottom', art: 'jeans', style: ['formal', 'casual'] },
  { id: 'palazzo', label: 'Palazzo / leggings', group: 'bottom', art: 'jeans', style: ['ethnic', 'casual'] },
  { id: 'skirt', label: 'Skirt', group: 'bottom', art: 'skirt', style: ['casual', 'party'] },
  { id: 'shorts', label: 'Shorts', group: 'bottom', art: 'shorts', style: ['casual', 'sport'] },
  { id: 'dress', label: 'Dress', group: 'full', art: 'dress', style: ['party', 'casual'] },
  { id: 'onepiece', label: 'One piece / maxi', group: 'full', art: 'onepiece', style: ['casual', 'party'] },
  { id: 'saree', label: 'Saree / lehenga', group: 'full', art: 'onepiece', style: ['ethnic', 'party'] },
  { id: 'jacket', label: 'Jacket / blazer', group: 'layer', art: 'jacket', style: ['casual', 'formal', 'party'] },
  { id: 'shrug', label: 'Shrug / dupatta', group: 'layer', art: 'jacket', style: ['ethnic', 'casual'] },
  // Accessories
  { id: 'sneakers', label: 'Sneakers', group: 'footwear', art: 'sneaker', style: ['casual', 'sport'] },
  { id: 'formalshoes', label: 'Formal shoes', group: 'footwear', art: 'shoe', style: ['formal', 'party'] },
  { id: 'heels', label: 'Heels', group: 'footwear', art: 'heel', style: ['party', 'formal'] },
  { id: 'flats', label: 'Flats / juttis', group: 'footwear', art: 'shoe', style: ['ethnic', 'casual'] },
  { id: 'sandals', label: 'Sandals / kolhapuris', group: 'footwear', art: 'sandal', style: ['ethnic', 'casual'] },
  { id: 'watch', label: 'Watch', group: 'watch', art: 'watch', style: ['casual', 'formal', 'party', 'ethnic', 'sport'] },
  { id: 'earrings', label: 'Earrings', group: 'jewellery', art: 'earrings', style: ['ethnic', 'party', 'casual'] },
  { id: 'necklace', label: 'Necklace / chain', group: 'jewellery', art: 'necklace', style: ['ethnic', 'party', 'formal'] },
  { id: 'bangles', label: 'Bangles / bracelet', group: 'jewellery', art: 'bangles', style: ['ethnic', 'party', 'casual'] },
  { id: 'bag', label: 'Bag / clutch', group: 'bag', art: 'bag', style: ['casual', 'formal', 'party', 'ethnic'] },
  { id: 'belt', label: 'Belt', group: 'extra', art: 'belt', style: ['casual', 'formal'] },
  { id: 'sunglasses', label: 'Sunglasses', group: 'extra', art: 'sunglasses', style: ['casual', 'sport'] },
];
export const typeById = (id) => TYPES.find((t) => t.id === id);
export const groupOf = (item) => typeById(item.type)?.group ?? 'top';
export const kindOf = (item) => GROUPS[groupOf(item)].kind;

export const OCCASIONS = [
  { id: 'casual', label: 'Casual' },
  { id: 'formal', label: 'Office' },
  { id: 'party', label: 'Party' },
  { id: 'ethnic', label: 'Ethnic / festive' },
  { id: 'sport', label: 'Gym / sport' },
];

export const PATTERNS = [
  { id: 'solid', label: 'Solid', art: 'solid' },
  { id: 'printed', label: 'Printed', art: 'floral' },
  { id: 'striped', label: 'Striped', art: 'stripes' },
  { id: 'checked', label: 'Checked', art: 'checks' },
  { id: 'embroidered', label: 'Embroidered', art: 'dots' },
  { id: 'denim', label: 'Denim', art: 'denim' },
];

export const FABRICS = {
  cloth: ['Cotton', 'Linen', 'Rayon / viscose', 'Silk', 'Denim', 'Polyester', 'Wool', 'Georgette', 'Chiffon', 'Crepe', 'Khadi', 'Velvet', 'Knit / jersey', 'Blend'],
  accessory: ['Leather', 'Faux leather', 'Canvas', 'Metal', 'Gold', 'Silver', 'Plastic / resin', 'Fabric', 'Rubber', 'Beads'],
};
export const ALL_FABRICS = [...FABRICS.cloth, ...FABRICS.accessory];

/** Wardrobe colour palette — catalogue colours + everyday neutrals & metals. */
export const W_COLORS = [
  { name: 'White', hex: '#F7F6F1' },
  { name: 'Off White', hex: '#EFE8DC' },
  { name: 'Beige', hex: '#D9C7A7' },
  { name: 'Tan', hex: '#B58A5A' },
  { name: 'Brown', hex: '#6B4A2E' },
  C.black,
  C.grey,
  C.navy,
  C.indigo,
  C.sky,
  C.lightwash,
  C.midwash,
  C.darkwash,
  { name: 'Teal', hex: '#1F7A7A' },
  C.bottle,
  C.olive,
  C.mint,
  C.lemon,
  C.mustard,
  { name: 'Orange', hex: '#E8792B' },
  C.rust,
  { name: 'Red', hex: '#C0392B' },
  C.maroon,
  C.coral,
  C.peach,
  C.rani,
  C.lavender,
  { name: 'Purple', hex: '#6C3FA0' },
  { name: 'Gold', hex: '#C9A34A' },
  { name: 'Silver', hex: '#B8BCC2' },
];
export const colorByName = (name) => W_COLORS.find((c) => c.name === name);

/** Finds the nearest wardrobe colour to an RGB triplet (used for photo auto-detect). */
export function nearestColor([r, g, b]) {
  let best = W_COLORS[0];
  let bestD = Infinity;
  for (const c of W_COLORS) {
    const n = parseInt(c.hex.slice(1), 16);
    const dr = ((n >> 16) & 255) - r, dg = ((n >> 8) & 255) - g, db = (n & 255) - b;
    // weighted Euclidean ≈ perceptual
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

let seq = 0;
const it = (type, colors, pattern = 'solid', occasions, extra = {}) => ({
  id: `w${(++seq).toString(36)}`,
  type,
  name: extra.name || `${colors[0]} ${typeById(type).label.split(' /')[0]}`,
  colors,
  pattern,
  occasions: occasions || typeById(type).style.slice(0, 2),
  favourite: false,
  addedAt: Date.now() - seq * 3600e3,
  ...extra,
});

/** Starter wardrobe so the dashboard and stylist can be explored straight away. */
export function sampleWardrobe() {
  seq = 0;
  return [
    it('kurti', ['Mustard'], 'printed', ['ethnic', 'casual'], { name: 'Mustard block-print kurti', favourite: true, fabric: 'Cotton', price: 899 }),
    it('kurti', ['Off White'], 'embroidered', ['ethnic', 'party'], { name: 'Chikankari kurti', fabric: 'Rayon / viscose', price: 1499 }),
    it('top', ['Black'], 'solid', ['party', 'casual'], { name: 'Black satin top', fabric: 'Polyester', price: 699 }),
    it('shirt', ['White'], 'solid', ['formal', 'casual'], { name: 'White cotton shirt', favourite: true, fabric: 'Cotton', price: 1199 }),
    it('tshirt', ['Grey Melange'], 'solid', ['casual', 'sport'], { name: 'Grey crew tee', fabric: 'Knit / jersey', price: 399 }),
    it('shirt', ['Sky Blue'], 'striped', ['formal'], { name: 'Blue striped shirt', fabric: 'Cotton', price: 999 }),
    it('top', ['Rani Pink'], 'solid', ['party', 'casual'], { name: 'Pink wrap top', fabric: 'Crepe', price: 799 }),
    it('jeans', ['Mid Wash'], 'denim', ['casual', 'party'], { name: 'Mid-wash mom jeans', favourite: true, fabric: 'Denim', price: 1599 }),
    it('trousers', ['Beige'], 'solid', ['formal', 'casual'], { name: 'Beige trousers', fabric: 'Linen', price: 1299 }),
    it('palazzo', ['White'], 'solid', ['ethnic', 'casual'], { name: 'White palazzo', fabric: 'Rayon / viscose', price: 599 }),
    it('skirt', ['Black'], 'solid', ['party', 'casual'], { name: 'Black midi skirt', fabric: 'Crepe', price: 899 }),
    it('dress', ['Bottle Green'], 'printed', ['party', 'casual'], { name: 'Green floral dress', fabric: 'Georgette', price: 1899 }),
    it('saree', ['Maroon'], 'embroidered', ['ethnic', 'party'], { name: 'Maroon silk saree', fabric: 'Silk', price: 6499 }),
    it('jacket', ['Indigo'], 'denim', ['casual'], { name: 'Denim jacket', fabric: 'Denim', price: 2199 }),
    it('sneakers', ['White'], 'solid', ['casual', 'sport'], { name: 'White sneakers', favourite: true, fabric: 'Faux leather', price: 2499 }),
    it('heels', ['Gold'], 'solid', ['party', 'ethnic'], { name: 'Gold block heels', fabric: 'Faux leather', price: 1799 }),
    it('flats', ['Tan'], 'embroidered', ['ethnic', 'casual'], { name: 'Tan juttis', fabric: 'Leather', price: 999 }),
    it('formalshoes', ['Black'], 'solid', ['formal'], { name: 'Black loafers', fabric: 'Leather', price: 2999 }),
    it('watch', ['Silver'], 'solid', ['formal', 'casual'], { name: 'Silver watch', fabric: 'Metal', price: 3499 }),
    it('earrings', ['Gold'], 'solid', ['ethnic', 'party'], { name: 'Gold jhumkas', fabric: 'Metal', price: 499 }),
    it('necklace', ['Silver'], 'solid', ['party', 'formal'], { name: 'Silver pendant', fabric: 'Silver', price: 1299 }),
    it('bag', ['Tan'], 'solid', ['casual', 'formal'], { name: 'Tan tote', fabric: 'Faux leather', price: 1499 }),
  ];
}
