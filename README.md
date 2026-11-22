# Kapra — B2B Fashion Wholesale Ordering

> Your entire wholesale market, one swipe away.

A swipe-based wholesale marketplace where clothing retailers discover, shortlist, compare and order stock straight from wholesalers. It produces one consolidated purchase order that is split into supplier orders automatically.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

Requires Node 18+. The only runtime dependencies are React and React DOM.

## Retailer journey → where it lives

| Step | Screen | File |
|---|---|---|
| 1. Discover | Filter icon (top right) opens a sheet with categories (Kurtis, One Pieces, T-shirts, Shirts, Dresses, Jeans, Kidswear) and buying criteria (low MOQ, ready stock, high margin, budget). The hamburger (top left) opens navigation | `src/screens/Discover.jsx`, `src/components/FilterSheet.jsx`, `src/components/MenuDrawer.jsx` |
| 2. Swipe to decide | Drag right to shortlist and left to skip. The ⓘ on the card opens details. The action bar has undo, skip, a shortlist counter and shortlist | `src/components/SwipeCard.jsx` |
| 3. Product details | Fabric, fit, sizes, colours, MOQ, stock, 30-day sell-through, supplier rating/dispatch/verification, margin at MRP | `src/components/ProductSheet.jsx` |
| 4. Set Qty | Shows the available sizes, then a (−) n (+) stepper per colour. Retailers order whole size sets (1 set = 1 pc of every size), with live MOQ progress | `src/components/QuantityMatrix.jsx` |
| 5. Order steps | Tapping the shortlist counter opens a 3-step flow: **1 Discover or Shortlist → 2 Qty → 3 Place Order**. Qty shows every shortlisted style open, each with its set stepper,, grouped by supplier, with MOQ blockers and free-shipping nudges. Place Order covers shop/GSTIN, GST, shipping and payment terms | `src/components/OrderSteps.jsx`, `src/screens/Shortlist.jsx`, `src/screens/Cart.jsx`, `src/screens/Review.jsx` |
| 6. Place & track | One order splits into supplier sub-orders: Placed → Confirmed → Dispatched → Delivered | `src/screens/Orders.jsx` |

There is also a **Compare** screen (`src/screens/Compare.jsx`). It shows up to 3 shortlisted styles side by side and highlights the best value in each row.

## Customer role (end shopper)

Switch to **Customer** at the top of the menu. Shoppers buy single pieces from the retailer's shop (Sharma Fashion Point in the demo) at **MRP, inclusive of taxes**.

- **Rack browsing** (`src/screens/CustomerBrowse.jsx`):
  - A white **category band** with a notch tab (built from `src/assets/ui/notch-left.svg` + `notch-right.svg`). The **dropdown arrow** opens all collections with thumbnails and style counts.
  - A sagging **gold rope**. The focused garment hangs at its lowest point; neighbours hang higher and smaller at the sides. Each hanger hook sits exactly on the curve, and the focused piece sways when it arrives.
  - **Vertical scroll / swipe / mouse wheel / ↑↓** move through every product in the collection. Crossing into the next category updates the title, and the rack slides in from that direction.
  - **Horizontal swipe** slides along the current rope.
  - **Right-side dial**: an animated fish-eye scroller (biggest tick = current product). Drag it to scrub, with a live label of product + position, or tap a tick to jump. It is keyboard-accessible as a slider.
  - **Tap the garment to flip it**: brand, fabric/fit, colour, size, Add to bag.
  - **Colour dots, name, price** below; bottom bar with **menu · Add to Cart · bag**. Add to Cart uses the chosen size, or opens a quick size picker, then a thumbnail flies into the bag.
- **Bag & checkout** (`src/screens/CustomerBag.jsx`): change quantity (max 5 per item) or remove; delivery details; UPI / card / cash on delivery. Delivery is free above ₹999, otherwise ₹49.
- **My orders** (`src/screens/CustomerOrders.jsx`): Placed → Accepted → Out for delivery → Delivered.
- **Retailer side**: a new **Customer orders** menu item (`src/screens/RetailerSales.jsx`) where the shop accepts, sends for delivery and marks delivered. The shopper sees each update.

Only live, in-stock products appear on the racks. Wholesaler uploads (with photos) show up there too.

### My Wardrobe (customer)

Under **My Wardrobe** in the Customer menu, shoppers catalogue what they already own: clothes, plus accessories such as shoes, watches, jewellery, bags, belts and sunglasses. "Try a sample wardrobe" loads 22 items for a quick look.

- **Quick add from photos** (`src/screens/WardrobeQuickAdd.jsx`, `src/utils/recognize.js`): take or choose up to 12 photos. Each becomes a pre-filled card with **category, colours, pattern and fabric** detected. Check the dropdowns, add the price, then **Add all**.
  - **In the published Claude preview**, recognition uses **Claude vision** (the artifact's `sample` capability with images). The first use asks the viewer's consent.
  - **Everywhere else** (e.g. `npm run dev`), an **on-device fallback** reads the garment's silhouette (legs → bottoms, sleeves → tops, flare → dress/skirt, neckline vs waistband, wide → shoes, handle → bag) and its colours. It is instant and offline, and marked "Quick guess" so the user checks it.
  - To use AI in your own deployment, add a provider in `recognize.js` that sends the photo to your backend (e.g. an Anthropic API proxy) and returns the same fields.
- **Add item** (`src/screens/WardrobeItemForm.jsx`): adding a photo auto-fills the same fields; optional photo (resized on the phone; the **main colours are detected automatically**, ignoring the background), item type grouped by Tops / Bottoms / Dresses & sets / Layers / Footwear / Watches / Jewellery / Bags / Belts & eyewear, up to 2 colours, pattern, **fabric/material**, **purchase price**, occasions (casual, office, party, ethnic/festive, gym), name and favourite.
- **Dashboard** (`src/screens/Wardrobe.jsx`): counts of clothes, accessories, **outfits that work** and **wardrobe value** (sum of purchase prices); bars by category with **category icons** (tap a bar to filter; hover shows the value spent); a colour palette you can **filter by category**; a fabrics & materials breakdown; a **colour palette** strip with shares and the neutral percentage; the **colour combinations that work** (top colour + bottom colour, ranked by outfits unlocked); occasions covered; and **stylist notes** that flag gaps (e.g. many tops but few bottoms, party clothes with no party footwear), the most versatile piece and items that don't pair with anything.
- **Style it** (`src/screens/WardrobeStylist.jsx`): pick any item to see **complete looks** (clothes + layer + shoes + watch + jewellery + bag, each with a match % and the reasons), ranked **pairs** per slot, **accessorise** suggestions, and, when a piece is missing or the matches are weak, **picks from the retailer's Kapra rack** to fill the gap.
- **The stylist logic** (`src/utils/stylist.js`) is rule-based and explainable:
  - **Colour harmony:** neutrals ground any colour; denim, navy, gold and silver count as neutrals. Analogous and complementary colours score well, and clashing hues are penalised.
  - **Pattern balance:** print + solid scores well; two prints are penalised.
  - **Occasion overlap.**
  - **Consistent metals:** no silver watch with gold jewellery.

  Swap in an ML model later without changing the screens.

## Wholesaler role

Switch between **Retailer** and **Wholesaler** at the top of the menu. In the demo a wholesaler signs in as one of the 9 suppliers (pick from the dropdown); production would use real accounts with GSTIN/KYC verification.

| Screen | What the wholesaler can do | File |
|---|---|---|
| My catalogue | See their styles with stats (live styles, stock, orders to action, pieces ordered); filter All / Live / Hidden; toggle a style Live or Hidden; edit; delete (two-tap confirm) | `src/screens/WholesalerCatalog.jsx` |
| Upload / edit product | Up to 4 photos (resized in the browser, first is the cover), name, brand, category, wholesale price, MRP (live retailer-margin and set-price hint), MOQ, stock, sizes (presets by category + custom), colours (palette + custom colour picker), fabric, fit, print, labels, and a **live preview of the retailer's swipe card**. Publish, or save hidden | `src/screens/ProductForm.jsx` |
| Orders received | Sub-orders routed to this supplier, with shop, GSTIN, set breakdown and total. **Confirm → Mark dispatched → Mark delivered**, which updates the retailer's order tracking | `src/screens/WholesalerOrders.jsx` |

Published products appear first in the retailer's Discover deck straight away; hidden or deleted ones disappear from it (and are removed from shortlists/carts). Uploads and edits are kept in the store (`catalog`) and merged with the seed data by `allProducts()` in `src/data/catalog.js`.

> Demo storage note: photos are stored as compressed data URLs in localStorage (~5 MB browser limit). A real backend should upload photos to object storage/CDN and keep only URLs.

## Full screen

On load, a consent popup asks "Go full screen?". Browsers only allow full screen after the user taps, so the popup's button triggers it. "Not now" hides the popup for the rest of the browser session. Buyers can switch it on or off anytime from the toggle in the menu. The popup is skipped on browsers that don't support full screen (e.g. iPhone Safari). See `src/components/FullscreenPrompt.jsx` and `src/utils/fullscreen.js`.

## Sound effects & haptics

All sounds are generated with the Web Audio API, so there are no audio files and they work offline. On Android, short vibrations play alongside them. Buyers can switch both off with **Sounds & haptics** in the menu (remembered per device).

| Interaction | Sound |
|---|---|
| Any button tap | soft click |
| Dragging a card past the swipe point | tick |
| Swipe right / shortlist | rising two-note chime |
| Swipe left / skip | falling whoosh |
| Undo | rewind blip |
| (+) set | pop that rises in pitch as the count grows |
| (−) set / remove | falling pop |
| Opening details or menu | light swish |
| Place order | ascending success arpeggio |

Buttons opt into a specific sound with `data-sfx="<name>"` (or `"none"`); everything else gets the default click. See `src/utils/sfx.js`.

## Product photos

The 22 sample products use realistic flat-lay photos generated with Figma AI (file "Kapra — Product photos", LMS team; each image is named after its product id, e.g. `k1`, `sh2`). Their white backgrounds are removed so garments float on the card and studio-rack backdrops:

```bash
# after exporting the Figma images (JPG/PNG named k1, k2, …) into a folder:
pip install pillow numpy
python3 scripts/cutout.py ~/Downloads/kapra-photos src/assets/products 900
```

`src/data/catalog.js` picks up `src/assets/products/<product id>.webp` automatically. Products without a photo fall back to the drawn garment.

## Structure

```
src/
  data/catalog.js          demo suppliers + 22 seed products, live catalogue merge (replace with API)
  store/StoreContext.jsx   useReducer store, persisted to localStorage
  utils/pricing.js         margin, GST, per-supplier totals, MOQ checks
  components/              SwipeCard, ProductSheet, QuantityMatrix, GarmentArt, FilterSheet, MenuDrawer, PageHeader, Icons
  screens/                 Retailer: Discover, Shortlist, Compare, Cart (Qty), Review, Orders
                           Wholesaler: WholesalerCatalog, ProductForm, WholesalerOrders
                           Customer: CustomerBrowse (+ components/CategoryRail), CustomerBag, CustomerOrders,
                                     Wardrobe, WardrobeItemForm, WardrobeStylist (+ data/wardrobe.js, utils/stylist.js)
                           Retailer ↔ customer: RetailerSales
  styles.css               design tokens + all styles (mobile-first)
```

## Business rules (demo assumptions — adjust to your model)

- **MOQ** is counted in pieces per style. Sizes and colours can be mixed. A cart line below MOQ blocks checkout.
- **Set** = 1 piece of every available size for one colour. Retailers can only order whole sets (no per-size quantities).
- **GST**: 5% on apparel up to ₹2,500 per piece, 18% above that. The rule lives in `gstRate()` in `utils/pricing.js`.
- **Shipping**: each supplier has a free-shipping threshold. Below it a flat ₹249 is charged.
- **Margin** = (MRP − wholesale) / MRP.
- Payment options (Kapra Credit 30 days, UPI, NEFT, partial COD) are UI only.

## Next steps toward production

- Swap `GarmentArt` (SVG silhouettes) for real supplier photos and multi-image galleries.
- Backend: auth + roles, product/photo APIs, inventory sync and order routing (the wholesaler screens already define the flows).
- Auth with GSTIN verification, credit-line underwriting, and payments (UPI/escrow).
- Personalise the deck ranking by the retailer's past swipes, region and price band.
