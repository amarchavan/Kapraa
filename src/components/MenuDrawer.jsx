import React, { useEffect } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { Flame, Heart, Bag, Truck, X, Expand, Volume, Stack, Plus, Hanger } from './Icons.jsx';
import { SUPPLIERS } from '../data/catalog.js';
import { sfx } from '../utils/sfx.js';

export default function MenuDrawer({ view, go, counts, onClose, fullscreen, sound, switchRole }) {
  const { state, dispatch } = useStore();
  const wholesaler = state.role === 'wholesaler';
  const supplier = SUPPLIERS[state.supplierId];
  const retailerItems = [
    { id: 'discover', label: 'Discover', sub: 'Swipe through new stock', Icon: Flame },
    { id: 'shortlist', label: 'Shortlist', sub: 'Step 1 · saved styles & compare', Icon: Heart, badge: counts.shortlist },
    { id: 'cart', label: 'Quantities', sub: 'Sizes, colours & MOQ', Icon: Bag, badge: counts.cart },
    { id: 'orders', label: 'Orders', sub: 'Confirmation, dispatch, delivery', Icon: Truck, badge: counts.orders },
    { id: 'r-sales', label: 'Customer orders', sub: 'Single-piece sales to shoppers', Icon: Stack, badge: counts.sales },
  ];
  const wholesalerItems = [
    { id: 'w-catalog', label: 'My catalogue', sub: 'Live & hidden styles', Icon: Stack, badge: counts.myProducts },
    { id: 'w-upload', label: 'Upload product', sub: 'Photos, price, MOQ, sizes', Icon: Plus },
    { id: 'w-orders', label: 'Orders received', sub: 'Confirm & dispatch', Icon: Truck, badge: counts.incoming },
  ];
  const customerItems = [
    { id: 'c-browse', label: 'Browse', sub: 'New season racks', Icon: Flame },
    { id: 'c-bag', label: 'Bag', sub: 'Checkout', Icon: Bag, badge: counts.bag },
    { id: 'c-orders', label: 'My orders', sub: 'Delivery status', Icon: Truck, badge: counts.myOrders },
    { id: 'c-wardrobe', label: 'My Wardrobe', sub: 'Your clothes, accessories & outfit ideas', Icon: Hanger, badge: counts.wardrobe },
  ];
  const items = state.role === 'customer' ? customerItems : wholesaler ? wholesalerItems : retailerItems;

  useEffect(() => {
    sfx.open();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const active = view === 'compare' ? 'shortlist' : view === 'review' ? 'cart' : view.startsWith('c-w') ? 'c-wardrobe' : view;


  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="logo">Kapra<span>.</span></div>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="role-switch" role="radiogroup" aria-label="Use Kapra as">
          {[['customer', 'Customer'], ['retailer', 'Retailer'], ['wholesaler', 'Wholesaler']].map(([id, label]) => (
            <button key={id} role="radio" aria-checked={state.role === id} className={state.role === id ? 'on' : ''} onClick={() => state.role !== id && switchRole(id)}>
              {label}
            </button>
          ))}
        </div>
        {wholesaler ? (
          <label className="drawer-shop account">
            <div className="supplier-avatar">{supplier.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div className="grow">
              <span className="muted small block">Signed in as</span>
              <select value={state.supplierId} onChange={(e) => dispatch({ type: 'setSupplier', id: e.target.value })} aria-label="Wholesaler account">
                {Object.values(SUPPLIERS).map((s) => <option key={s.id} value={s.id}>{s.name} · {s.city}</option>)}
              </select>
            </div>
          </label>
        ) : state.role === 'customer' ? (
          <div className="drawer-shop">
            <div className="supplier-avatar">{state.customer.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div className="grow">
              <b>{state.customer.name}</b>
              <div className="muted small">Shopping at {state.shop.name}</div>
            </div>
          </div>
        ) : (
          <div className="drawer-shop">
            <div className="supplier-avatar">{state.shop.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div className="grow">
              <b>{state.shop.name}</b>
              <div className="muted small">GSTIN {state.shop.gstin}</div>
            </div>
          </div>
        )}
        <nav className="drawer-nav" aria-label="Main">
          {items.map(({ id, label, sub, Icon, badge }) => (
            <button
              key={id}
              className={active === id ? 'on' : ''}
              aria-current={active === id ? 'page' : undefined}
              onClick={() => {
                go(id);
                onClose();
              }}
            >
              <span className="drawer-icon"><Icon size={20} /></span>
              <span className="grow">
                {label}
                <span className="muted small block">{sub}</span>
              </span>
              {badge > 0 && <span className="drawer-badge">{badge}</span>}
            </button>
          ))}
        </nav>
        {sound && (
          <button className="drawer-setting" data-sfx="none" onClick={sound.toggle} role="switch" aria-checked={sound.on}>
            <span className="drawer-icon"><Volume size={18} muted={!sound.on} /></span>
            <span className="grow">Sounds &amp; haptics</span>
            <span className={`switch ${sound.on ? 'on' : ''}`}><span /></span>
          </button>
        )}
        {fullscreen && (
          <button className="drawer-setting" onClick={fullscreen.toggle} role="switch" aria-checked={fullscreen.on}>
            <span className="drawer-icon"><Expand size={18} /></span>
            <span className="grow">Full screen</span>
            <span className={`switch ${fullscreen.on ? 'on' : ''}`}><span /></span>
          </button>
        )}
        <p className="drawer-foot muted small">Your entire wholesale market, one swipe away.</p>
      </aside>
    </div>
  );
}
