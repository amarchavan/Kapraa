import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { syncCatalog } from '../data/catalog.js';

const KEY = 'kapra-state-v1';
const initial = { wardrobe: [], bag: [], customerOrders: [], customer: { name: 'Priya Kulkarni', phone: '98XXXXXX45', address: 'Flat 302, Gangapur Road, Nashik 422013' }, role: 'retailer', supplierId: 's1', catalog: { products: {}, removed: [] }, shortlist: [], skipped: [], history: [], cart: {}, compare: [], orders: [], shop: { name: 'Sharma Fashion Point', gstin: '27ABCDE1234F1Z5', address: 'Shop 14, Station Road, Nashik 422001', phone: '98XXXXXX21' } };

export const ORDER_STEPS = ['Placed', 'Confirmed', 'Dispatched', 'Delivered'];
export const CUSTOMER_STEPS = ['Placed', 'Accepted', 'Out for delivery', 'Delivered'];
export const MAX_PER_ITEM = 5;
export const bagKey = (productId, color, size) => `${productId}|${color}|${size}`;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

const without = (arr, id) => arr.filter((x) => x !== id);

function reducer(s, a) {
  switch (a.type) {
    case 'decide': {
      const { id, dir } = a;
      return {
        ...s,
        shortlist: dir === 'right' && !s.shortlist.includes(id) ? [...s.shortlist, id] : s.shortlist,
        skipped: dir === 'left' && !s.skipped.includes(id) ? [...s.skipped, id] : s.skipped,
        history: [...s.history, { id, dir }].slice(-40),
      };
    }
    case 'undo': {
      const last = s.history[s.history.length - 1];
      if (!last) return s;
      return {
        ...s,
        history: s.history.slice(0, -1),
        shortlist: last.dir === 'right' ? without(s.shortlist, last.id) : s.shortlist,
        skipped: last.dir === 'left' ? without(s.skipped, last.id) : s.skipped,
      };
    }
    case 'toggleShortlist':
      return s.shortlist.includes(a.id)
        ? { ...s, shortlist: without(s.shortlist, a.id), compare: without(s.compare, a.id) }
        : { ...s, shortlist: [...s.shortlist, a.id], skipped: without(s.skipped, a.id) };
    case 'resetSkipped':
      return { ...s, skipped: a.ids ? s.skipped.filter((x) => !a.ids.includes(x)) : [] };
    case 'setLine': {
      const cart = { ...s.cart };
      if (a.matrix) cart[a.id] = a.matrix;
      else delete cart[a.id];
      return { ...s, cart };
    }
    case 'toggleCompare': {
      if (s.compare.includes(a.id)) return { ...s, compare: without(s.compare, a.id) };
      if (s.compare.length >= 3) return s;
      return { ...s, compare: [...s.compare, a.id] };
    }
    case 'setShop':
      return { ...s, shop: { ...s.shop, ...a.shop } };
    case 'placeOrder': {
      const ordered = Object.keys(s.cart);
      return { ...s, orders: [a.order, ...s.orders], cart: {}, shortlist: s.shortlist.filter((id) => !ordered.includes(id)), compare: s.compare.filter((id) => !ordered.includes(id)) };
    }
    case 'advanceOrder':
      return {
        ...s,
        orders: s.orders.map((o) =>
          o.id !== a.id ? o : { ...o, subOrders: o.subOrders.map((so) => ({ ...so, step: Math.min(ORDER_STEPS.length - 1, so.step + (Math.random() > 0.25 ? 1 : 0)) })) }
        ),
      };
    // ---------- My Wardrobe ----------
    case 'wSave': {
      const exists = s.wardrobe.some((w) => w.id === a.item.id);
      return { ...s, wardrobe: exists ? s.wardrobe.map((w) => (w.id === a.item.id ? a.item : w)) : [a.item, ...s.wardrobe] };
    }
    case 'wDelete':
      return { ...s, wardrobe: s.wardrobe.filter((w) => w.id !== a.id) };
    case 'wFav':
      return { ...s, wardrobe: s.wardrobe.map((w) => (w.id === a.id ? { ...w, favourite: !w.favourite } : w)) };
    case 'wLoad':
      return { ...s, wardrobe: [...a.items, ...s.wardrobe] };
    case 'wClear':
      return { ...s, wardrobe: [] };
    // ---------- Customer ----------
    case 'addToBag': {
      const key = bagKey(a.productId, a.color, a.size);
      const hit = s.bag.find((b) => b.key === key);
      return {
        ...s,
        bag: hit
          ? s.bag.map((b) => (b.key === key ? { ...b, qty: Math.min(MAX_PER_ITEM, b.qty + 1) } : b))
          : [...s.bag, { key, productId: a.productId, color: a.color, size: a.size, qty: 1 }],
      };
    }
    case 'setBagQty':
      return { ...s, bag: a.qty <= 0 ? s.bag.filter((b) => b.key !== a.key) : s.bag.map((b) => (b.key === a.key ? { ...b, qty: Math.min(MAX_PER_ITEM, a.qty) } : b)) };
    case 'setCustomer':
      return { ...s, customer: { ...s.customer, ...a.customer } };
    case 'placeCustomerOrder':
      return { ...s, customerOrders: [a.order, ...s.customerOrders], bag: [] };
    case 'setCustomerOrderStep':
      return { ...s, customerOrders: s.customerOrders.map((o) => (o.id === a.id ? { ...o, step: a.step } : o)) };
    // ---------- Wholesaler ----------
    case 'setRole':
      return { ...s, role: a.role };
    case 'setSupplier':
      return { ...s, supplierId: a.id };
    case 'saveProduct':
      return { ...s, catalog: { ...s.catalog, products: { ...s.catalog.products, [a.product.id]: a.product } } };
    case 'toggleActive': {
      const p = a.product;
      return { ...s, catalog: { ...s.catalog, products: { ...s.catalog.products, [p.id]: { ...p, active: p.active === false } } } };
    }
    case 'deleteProduct': {
      const products = { ...s.catalog.products };
      delete products[a.id];
      const cart = { ...s.cart };
      delete cart[a.id];
      return {
        ...s,
        catalog: { products, removed: a.seed ? [...s.catalog.removed, a.id] : s.catalog.removed },
        cart,
        shortlist: without(s.shortlist, a.id),
        compare: without(s.compare, a.id),
        skipped: without(s.skipped, a.id),
        bag: s.bag.filter((b) => b.productId !== a.id),
      };
    }
    case 'setSubStep':
      return {
        ...s,
        orders: s.orders.map((o) => (o.id !== a.orderId ? o : { ...o, subOrders: o.subOrders.map((so) => (so.id === a.subId ? { ...so, step: a.step } : so)) })),
      };
    case 'reset':
      return initial;
    default:
      return s;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  syncCatalog(state.catalog); // keep the catalogue registry in step before children render
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — keep in memory for this session */
    }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
