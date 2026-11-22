// Demo catalogue. In production this comes from the supplier catalogue API.

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'kurti', label: 'Kurtis' },
  { id: 'onepiece', label: 'One Pieces' },
  { id: 'tshirt', label: 'T-shirts' },
  { id: 'shirt', label: 'Shirts' },
  { id: 'dress', label: 'Dresses' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'kids', label: 'Kidswear' },
];

export const SUPPLIERS = {
  s1: { id: 's1', name: 'Surat Silk Route', city: 'Surat', rating: 4.6, dispatchDays: 2, years: 14, verified: true, freeShipAbove: 8000 },
  s2: { id: 's2', name: 'Jaipur Prints Co.', city: 'Jaipur', rating: 4.8, dispatchDays: 3, years: 22, verified: true, freeShipAbove: 6000 },
  s3: { id: 's3', name: 'Tiruppur Knits', city: 'Tiruppur', rating: 4.5, dispatchDays: 2, years: 11, verified: true, freeShipAbove: 10000 },
  s4: { id: 's4', name: 'Gandhi Nagar Denim', city: 'Delhi', rating: 4.4, dispatchDays: 3, years: 18, verified: true, freeShipAbove: 12000 },
  s5: { id: 's5', name: 'Kolkata Kids Hub', city: 'Kolkata', rating: 4.3, dispatchDays: 4, years: 9, verified: false, freeShipAbove: 5000 },
  s6: { id: 's6', name: 'Ludhiana Loom', city: 'Ludhiana', rating: 4.5, dispatchDays: 3, years: 26, verified: true, freeShipAbove: 8000 },
  s7: { id: 's7', name: 'Mumbai Mode House', city: 'Mumbai', rating: 4.7, dispatchDays: 2, years: 7, verified: true, freeShipAbove: 9000 },
  s8: { id: 's8', name: 'Bengaluru Basics', city: 'Bengaluru', rating: 4.2, dispatchDays: 3, years: 6, verified: false, freeShipAbove: 7000 },
  s9: { id: 's9', name: 'Lucknow Chikan Ghar', city: 'Lucknow', rating: 4.9, dispatchDays: 5, years: 31, verified: true, freeShipAbove: 6000 },
};

export const C = {
  rani: { name: 'Rani Pink', hex: '#D6336C' },
  indigo: { name: 'Indigo', hex: '#2E3A8C' },
  mustard: { name: 'Mustard', hex: '#E0A526' },
  bottle: { name: 'Bottle Green', hex: '#1F6B4F' },
  maroon: { name: 'Maroon', hex: '#7A1F2B' },
  offwhite: { name: 'Off White', hex: '#EFE8DC' },
  black: { name: 'Black', hex: '#1E1E1E' },
  sky: { name: 'Sky Blue', hex: '#6FA8DC' },
  peach: { name: 'Peach', hex: '#F4A988' },
  lavender: { name: 'Lavender', hex: '#A991D4' },
  olive: { name: 'Olive', hex: '#6B7A3A' },
  rust: { name: 'Rust', hex: '#B5522E' },
  navy: { name: 'Navy', hex: '#1D2B4F' },
  grey: { name: 'Grey Melange', hex: '#9AA0A6' },
  midwash: { name: 'Mid Wash', hex: '#4A6FA5' },
  darkwash: { name: 'Dark Wash', hex: '#263C5E' },
  lightwash: { name: 'Light Wash', hex: '#8DB0D6' },
  coral: { name: 'Coral', hex: '#F2665A' },
  lemon: { name: 'Lemon', hex: '#F3DC5C' },
  mint: { name: 'Mint', hex: '#8FD3B6' },
};

const ADULT = ['S', 'M', 'L', 'XL', 'XXL'];
const KIDS = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];

export const PRODUCTS = [ // seed catalogue
  // Kurtis
  { id: 'k1', category: 'kurti', name: 'Anarkali Block-Print Kurti', brand: 'Rangrez', supplierId: 's2', price: 385, mrp: 999, fabric: 'Pure cotton cambric 60×60', fit: 'Flared, calf length', sizes: ['M', 'L', 'XL', 'XXL'], colors: [C.indigo, C.rani, C.mustard], moq: 12, stock: 640, sold30d: 1240, pattern: 'block', tags: ['Bestseller'] },
  { id: 'k2', category: 'kurti', name: 'Straight Chikankari Kurti', brand: 'Nawabi', supplierId: 's9', price: 520, mrp: 1299, fabric: 'Rayon with hand chikan work', fit: 'Straight, knee length', sizes: ADULT, colors: [C.offwhite, C.peach, C.mint], moq: 10, stock: 300, sold30d: 610, pattern: 'dots', tags: ['New'] },
  { id: 'k3', category: 'kurti', name: 'Rayon Printed A-line Kurti', brand: 'Suratee', supplierId: 's1', price: 245, mrp: 699, fabric: 'Rayon 140 GSM', fit: 'A-line', sizes: ['M', 'L', 'XL', 'XXL', '3XL'], colors: [C.maroon, C.bottle, C.navy, C.mustard], moq: 20, stock: 1800, sold30d: 3020, pattern: 'floral', tags: ['Bestseller'] },
  { id: 'k4', category: 'kurti', name: 'Kurti & Palazzo Co-ord Set', brand: 'Suratee', supplierId: 's1', price: 455, mrp: 1199, fabric: 'Crepe, digital print', fit: 'Straight + palazzo', sizes: ['M', 'L', 'XL', 'XXL'], colors: [C.lavender, C.rust], moq: 8, stock: 220, sold30d: 480, pattern: 'floral', tags: ['Co-ord'] },

  // One pieces
  { id: 'o1', category: 'onepiece', name: 'Tiered Maxi One Piece', brand: 'Kaya Street', supplierId: 's7', price: 410, mrp: 1099, fabric: 'Georgette, fully lined', fit: 'Fit & flare, ankle length', sizes: ['S', 'M', 'L', 'XL'], colors: [C.black, C.rust, C.coral], moq: 9, stock: 410, sold30d: 890, pattern: 'floral', tags: ['Trending'] },
  { id: 'o2', category: 'onepiece', name: 'Shirt-Style Midi One Piece', brand: 'Kaya Street', supplierId: 's7', price: 365, mrp: 949, fabric: 'Cotton slub', fit: 'Relaxed, belted', sizes: ['S', 'M', 'L', 'XL'], colors: [C.sky, C.olive, C.offwhite], moq: 12, stock: 520, sold30d: 540, pattern: 'stripes', tags: [] },
  { id: 'o3', category: 'onepiece', name: 'Wrap Front One Piece', brand: 'Suratee', supplierId: 's1', price: 299, mrp: 799, fabric: 'Moss crepe', fit: 'Wrap, midi', sizes: ADULT, colors: [C.maroon, C.navy, C.rani], moq: 15, stock: 950, sold30d: 1710, pattern: 'dots', tags: ['Bestseller'] },

  // T-shirts
  { id: 't1', category: 'tshirt', name: 'Oversized Drop-Shoulder Tee', brand: 'KnitCo', supplierId: 's3', price: 165, mrp: 499, fabric: '100% cotton bio-wash, 220 GSM', fit: 'Oversized', sizes: ADULT, colors: [C.black, C.offwhite, C.olive, C.lavender], moq: 24, stock: 5200, sold30d: 8400, pattern: 'solid', tags: ['Bestseller'] },
  { id: 't2', category: 'tshirt', name: 'Classic Crew Neck Tee', brand: 'KnitCo', supplierId: 's3', price: 112, mrp: 349, fabric: 'Combed cotton 180 GSM', fit: 'Regular', sizes: ADULT, colors: [C.navy, C.grey, C.black, C.sky, C.maroon], moq: 30, stock: 9800, sold30d: 6200, pattern: 'solid', tags: [] },
  { id: 't3', category: 'tshirt', name: 'Striped Polo Tee', brand: 'KnitCo', supplierId: 's3', price: 210, mrp: 599, fabric: 'Cotton piqué 200 GSM', fit: 'Slim', sizes: ['M', 'L', 'XL', 'XXL'], colors: [C.navy, C.bottle], moq: 20, stock: 1300, sold30d: 760, pattern: 'stripes', tags: ['New'] },

  // Shirts
  { id: 'sh1', category: 'shirt', name: 'Linen Blend Casual Shirt', brand: 'Basecamp', supplierId: 's8', price: 340, mrp: 1199, fabric: 'Linen-cotton 60:40', fit: 'Regular', sizes: ['M', 'L', 'XL', 'XXL'], colors: [C.offwhite, C.sky, C.olive], moq: 12, stock: 760, sold30d: 930, pattern: 'solid', tags: ['Trending'] },
  { id: 'sh2', category: 'shirt', name: 'Twill Check Shirt', brand: 'Loomcraft', supplierId: 's6', price: 285, mrp: 899, fabric: 'Yarn-dyed cotton twill', fit: 'Slim', sizes: ['M', 'L', 'XL', 'XXL'], colors: [C.maroon, C.navy, C.bottle], moq: 15, stock: 1100, sold30d: 1480, pattern: 'checks', tags: ['Bestseller'] },
  { id: 'sh3', category: 'shirt', name: 'Satin Party Shirt', brand: 'Basecamp', supplierId: 's8', price: 260, mrp: 799, fabric: 'Poly-satin', fit: 'Slim', sizes: ADULT, colors: [C.black, C.navy, C.offwhite, C.sky], moq: 20, stock: 1400, sold30d: 670, pattern: 'solid', tags: [] },

  // Dresses
  { id: 'd1', category: 'dress', name: 'Smocked Floral Sundress', brand: 'Kaya Street', supplierId: 's7', price: 330, mrp: 899, fabric: 'Rayon challis', fit: 'Smocked bodice, A-line', sizes: ['XS', 'S', 'M', 'L'], colors: [C.lemon, C.sky, C.coral], moq: 12, stock: 480, sold30d: 720, pattern: 'floral', tags: ['New'] },
  { id: 'd2', category: 'dress', name: 'Ribbed Bodycon Midi', brand: 'Kaya Street', supplierId: 's7', price: 275, mrp: 749, fabric: 'Rib knit, 4-way stretch', fit: 'Bodycon, midi', sizes: ['S', 'M', 'L', 'XL'], colors: [C.black, C.rust, C.lavender], moq: 12, stock: 690, sold30d: 1050, pattern: 'stripes', tags: ['Trending'] },
  { id: 'd3', category: 'dress', name: 'Sequin Party Mini Dress', brand: 'Suratee Luxe', supplierId: 's1', price: 640, mrp: 1799, fabric: 'Sequin on net, lined', fit: 'Fitted, mini', sizes: ['S', 'M', 'L', 'XL'], colors: [C.black, C.maroon], moq: 6, stock: 140, sold30d: 210, pattern: 'dots', tags: ['Premium'] },

  // Jeans
  { id: 'j1', category: 'jeans', name: 'High-Rise Mom Jeans', brand: 'Blue Mill', supplierId: 's4', price: 420, mrp: 1299, fabric: 'Rigid denim 12 oz', fit: 'Mom fit', sizes: ['26', '28', '30', '32', '34'], colors: [C.lightwash, C.midwash], moq: 15, stock: 900, sold30d: 1320, pattern: 'denim', tags: ['Bestseller'] },
  { id: 'j2', category: 'jeans', name: "Men's Slim Stretch Jeans", brand: 'Blue Mill', supplierId: 's4', price: 395, mrp: 1399, fabric: 'Cotton-lycra 11 oz', fit: 'Slim', sizes: ['28', '30', '32', '34', '36'], colors: [C.darkwash, C.midwash, C.black], moq: 20, stock: 2400, sold30d: 2100, pattern: 'denim', tags: [] },
  { id: 'j3', category: 'jeans', name: 'Wide-Leg Baggy Jeans', brand: 'Blue Mill', supplierId: 's4', price: 455, mrp: 1499, fabric: 'Washed denim 13 oz', fit: 'Baggy, wide leg', sizes: ['26', '28', '30', '32', '34'], colors: [C.lightwash, C.darkwash], moq: 10, stock: 380, sold30d: 990, pattern: 'denim', tags: ['Trending'] },

  // Kidswear
  { id: 'c1', category: 'kids', name: 'Girls Cotton Frock', brand: 'Little Lane', supplierId: 's5', price: 155, mrp: 449, fabric: 'Cotton poplin', fit: 'Flared', sizes: KIDS, colors: [C.peach, C.lemon, C.mint, C.rani], moq: 16, stock: 1600, sold30d: 2240, pattern: 'floral', tags: ['Bestseller'] },
  { id: 'c2', category: 'kids', name: 'Boys Tee & Shorts Set', brand: 'Little Lane', supplierId: 's5', price: 190, mrp: 549, fabric: 'Cotton jersey', fit: 'Regular', sizes: KIDS, colors: [C.sky, C.mustard, C.navy], moq: 16, stock: 1200, sold30d: 1130, pattern: 'dots', tags: [] },
  { id: 'c3', category: 'kids', name: 'Kids Ethnic Kurta Set', brand: 'Rangrez Junior', supplierId: 's2', price: 285, mrp: 799, fabric: 'Cotton silk', fit: 'Straight', sizes: [...KIDS, '10-11Y'], colors: [C.mustard, C.maroon, C.offwhite], moq: 10, stock: 420, sold30d: 640, pattern: 'block', tags: ['Festive'] },
];

// Realistic flat-lay product photos (AI-generated in Figma, background removed), one per seed product: src/assets/products/<id>.webp
const PHOTOS = import.meta.glob('../assets/products/*.webp', { eager: true, query: '?url', import: 'default' });
PRODUCTS.forEach((p) => {
  const url = PHOTOS[`../assets/products/${p.id}.webp`];
  if (url) {
    p.images = [url];
    p.studio = true; // transparent cut-out → sits on the card's own backdrop
  }
});

// ---- Live catalogue: seed products + wholesaler uploads/edits (kept in the store) ----
let custom = { products: {}, removed: [] };
let cache = null;

/** Called by the store whenever wholesaler catalogue edits change. */
export function syncCatalog(next) {
  if (next !== custom) {
    custom = next || { products: {}, removed: [] };
    cache = null;
  }
}

/** Every product, including hidden ones (wholesaler view). Newest uploads first. */
export function allProducts() {
  if (cache) return cache;
  const seedIds = new Set(PRODUCTS.map((p) => p.id));
  const uploads = Object.values(custom.products)
    .filter((p) => !seedIds.has(p.id))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const seed = PRODUCTS.filter((p) => !custom.removed.includes(p.id)).map((p) => custom.products[p.id] ?? p);
  cache = [...uploads, ...seed];
  return cache;
}

/** Products retailers can see in Discover. */
export const liveProducts = () => allProducts().filter((p) => p.active !== false);
export const productById = (id) => allProducts().find((p) => p.id === id);
export const supplierProducts = (supplierId) => allProducts().filter((p) => p.supplierId === supplierId);

export const COLOR_PALETTE = Object.values(C);
export const SIZE_PRESETS = {
  adult: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  jeans: ['26', '28', '30', '32', '34', '36', '38'],
  kids: ['0-1Y', '1-2Y', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'],
};
export const sizePresetFor = (category) => (category === 'jeans' ? SIZE_PRESETS.jeans : category === 'kids' ? SIZE_PRESETS.kids : SIZE_PRESETS.adult);
export const PATTERNS = ['solid', 'floral', 'block', 'stripes', 'checks', 'dots', 'denim'];
export const TAGS = ['Bestseller', 'New', 'Trending', 'Festive', 'Premium', 'Co-ord'];
export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
