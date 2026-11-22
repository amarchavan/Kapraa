import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from './store/StoreContext.jsx';
import MenuDrawer from './components/MenuDrawer.jsx';
import FullscreenPrompt from './components/FullscreenPrompt.jsx';
import { installTapSounds, onSoundChange, setSoundEnabled, soundEnabled } from './utils/sfx.js';
import { enterFullscreen, exitFullscreen, fullscreenSupported, isFullscreen, onFullscreenChange, rememberDismissed, wasDismissed } from './utils/fullscreen.js';
import ProductSheet from './components/ProductSheet.jsx';
import Discover from './screens/Discover.jsx';
import Shortlist from './screens/Shortlist.jsx';
import Compare from './screens/Compare.jsx';
import Cart from './screens/Cart.jsx';
import Review from './screens/Review.jsx';
import Orders from './screens/Orders.jsx';
import WholesalerCatalog from './screens/WholesalerCatalog.jsx';
import ProductForm from './screens/ProductForm.jsx';
import WholesalerOrders from './screens/WholesalerOrders.jsx';
import CustomerBrowse from './screens/CustomerBrowse.jsx';
import CustomerBag from './screens/CustomerBag.jsx';
import CustomerOrders from './screens/CustomerOrders.jsx';
import RetailerSales from './screens/RetailerSales.jsx';
import Wardrobe from './screens/Wardrobe.jsx';
import WardrobeItemForm from './screens/WardrobeItemForm.jsx';
import WardrobeStylist from './screens/WardrobeStylist.jsx';
import WardrobeQuickAdd from './screens/WardrobeQuickAdd.jsx';
import { supplierProducts } from './data/catalog.js';
import { cartSummary } from './utils/pricing.js';
import { ORDER_STEPS } from './store/StoreContext.jsx';

const SCREENS = {
  discover: Discover, shortlist: Shortlist, compare: Compare, cart: Cart, review: Review, orders: Orders,
  'w-catalog': WholesalerCatalog, 'w-upload': ProductForm, 'w-orders': WholesalerOrders,
  'c-browse': CustomerBrowse, 'c-bag': CustomerBag, 'c-orders': CustomerOrders, 'r-sales': RetailerSales,
  'c-wardrobe': Wardrobe, 'c-wadd': WardrobeItemForm, 'c-wstyle': WardrobeStylist, 'c-wquick': WardrobeQuickAdd,
};
const HOME = { customer: 'c-browse', retailer: 'discover', wholesaler: 'w-catalog' };
const ROLE_LABEL = { customer: 'Customer', retailer: 'Retailer', wholesaler: 'Wholesaler' };

export default function App() {
  const { state, dispatch } = useStore();
  const [view, setView] = useState(() => HOME[state.role] || 'discover');
  const [editId, setEditId] = useState(null);
  const [param, setParam] = useState(null); // e.g. wardrobe item id for c-wadd / c-wstyle
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fsPrompt, setFsPrompt] = useState(() => fullscreenSupported() && !isFullscreen() && !wasDismissed());
  const [fullscreen, setFullscreen] = useState(isFullscreen);

  useEffect(() => onFullscreenChange(() => setFullscreen(isFullscreen())), []);
  const [sound, setSound] = useState(soundEnabled);
  useEffect(() => installTapSounds(), []);
  useEffect(() => onSoundChange(setSound), []);

  const acceptFullscreen = async () => {
    setFsPrompt(false);
    const ok = await enterFullscreen();
    if (!ok) notify("Full screen isn't available here");
  };
  const declineFullscreen = useCallback(() => {
    setFsPrompt(false);
    rememberDismissed();
  }, []);
  const toggleFullscreen = async () => {
    if (isFullscreen()) return exitFullscreen();
    if (!(await enterFullscreen())) notify("Full screen isn't available here");
  };

  const notify = useCallback((msg) => setToast({ msg, k: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1700);
    return () => clearTimeout(t);
  }, [toast]);

  const go = useCallback((v, p = null) => {
    if (v === 'w-upload') setEditId(null);
    setParam(p);
    setView(v);
    window.scrollTo?.(0, 0);
  }, []);
  const edit = useCallback((id) => {
    setEditId(id);
    setView('w-upload');
    window.scrollTo?.(0, 0);
  }, []);
  const nav = useMemo(() => ({ go, edit, open: setDetail, notify, menu: () => setMenuOpen(true) }), [go, edit, notify]);
  const switchRole = (role) => {
    dispatch({ type: 'setRole', role });
    setDetail(null);
    setMenuOpen(false);
    go(HOME[role]);
    notify(`Switched to ${ROLE_LABEL[role]}`);
  };

  const { totals } = cartSummary(state.cart);
  const activeOrders = state.orders.filter((o) => o.subOrders.some((s) => s.step < ORDER_STEPS.length - 1)).length;
  const incoming = state.orders.reduce((n, o) => n + o.subOrders.filter((s) => s.supplierId === state.supplierId && s.step < ORDER_STEPS.length - 1).length, 0);
  const myProducts = supplierProducts(state.supplierId).length;
  const bagCount = state.bag.reduce((n, b) => n + b.qty, 0);
  const salesOpen = state.customerOrders.filter((o) => o.step < 3).length;
  const myOrdersOpen = salesOpen;
  const Screen = SCREENS[view];

  return (
    <div className="stage">
      <div className="app">
        <main className={`screen screen-${view}`} key={`${view}-${editId}-${param}-${state.supplierId}`}>
          <Screen nav={nav} editId={editId} param={param} />
        </main>
        {menuOpen && (
          <MenuDrawer
            view={view}
            go={go}
            counts={{ wardrobe: state.wardrobe.length, shortlist: state.shortlist.length, cart: totals.styles, orders: activeOrders, incoming, myProducts, bag: bagCount, sales: salesOpen, myOrders: myOrdersOpen }}
            switchRole={switchRole}
            onClose={() => setMenuOpen(false)}
            fullscreen={fullscreenSupported() ? { on: fullscreen, toggle: toggleFullscreen } : null}
            sound={{ on: sound, toggle: () => setSoundEnabled(!sound) }}
          />
        )}
        {detail && <ProductSheet key={detail} id={detail} onClose={() => setDetail(null)} nav={nav} />}
        {fsPrompt && <FullscreenPrompt onAccept={acceptFullscreen} onDecline={declineFullscreen} />}
        {toast && <div className="toast" key={toast.k} role="status">{toast.msg}</div>}
      </div>
    </div>
  );
}
