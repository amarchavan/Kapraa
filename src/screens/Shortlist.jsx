import React, { useMemo, useState } from 'react';
import GarmentArt from '../components/GarmentArt.jsx';
import { CATEGORIES, productById, SUPPLIERS } from '../data/catalog.js';
import { useStore } from '../store/StoreContext.jsx';
import { margin, matrixPieces, money } from '../utils/pricing.js';
import { Columns, Trash, Check } from '../components/Icons.jsx';
import PageHeader from '../components/PageHeader.jsx';
import OrderSteps from '../components/OrderSteps.jsx';

export default function Shortlist({ nav }) {
  const { state, dispatch } = useStore();
  const [cat, setCat] = useState('all');
  const items = useMemo(() => state.shortlist.map(productById).filter(Boolean), [state.shortlist]);
  const shown = items.filter((p) => cat === 'all' || p.category === cat);
  const cats = CATEGORIES.filter((c) => c.id === 'all' || items.some((p) => p.category === c.id));

  if (!items.length)
    return (
      <div className="page">
        <PageHeader title="Shortlist" onMenu={nav.menu} />
        <OrderSteps current="shortlist" go={nav.go} />
        <div className="empty">
          <div className="empty-mark">♥</div>
          <h3>Nothing shortlisted yet</h3>
          <p className="muted">Swipe right on styles you like. They'll wait here while you compare and pick quantities.</p>
          <button className="btn primary" onClick={() => nav.go('discover')}>Start discovering</button>
        </div>
      </div>
    );

  return (
    <div className="page with-footer">
      <PageHeader
        title="Shortlist"
        count={items.length}
        onMenu={nav.menu}
        right={
          state.compare.length > 0 && (
            <button className="btn sm" disabled={state.compare.length < 2} onClick={() => nav.go('compare')}>
              <Columns size={15} /> Compare {state.compare.length}
            </button>
          )
        }
      />
      <OrderSteps current="shortlist" go={nav.go} reachable={{ cart: true }} />
      <p className="muted small page-sub">Your picks from Discover. Tick up to 3 to compare, or go to Qty to set quantities.</p>

      {cats.length > 2 && (
        <div className="chips">
          {cats.map((c) => (
            <button key={c.id} className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>{c.label}</button>
          ))}
        </div>
      )}

      <div className="grid">
        {shown.map((p) => {
          const inCart = matrixPieces(state.cart[p.id]);
          const cmp = state.compare.includes(p.id);
          return (
            <div key={p.id} className="tile">
              <button className="tile-art" onClick={() => nav.open(p.id)} aria-label={`Open ${p.name}`}>
                <GarmentArt product={p} />
                {inCart > 0 && <span className="in-cart">{inCart} in cart</span>}
              </button>
              <button
                className={`cmp-check ${cmp ? 'on' : ''}`}
                onClick={() => (cmp || state.compare.length < 3 ? dispatch({ type: 'toggleCompare', id: p.id }) : nav.notify('Compare up to 3 products'))}
                aria-label={cmp ? 'Remove from compare' : 'Add to compare'}
                aria-pressed={cmp}
              >
                {cmp && <Check size={14} sw={3} />}
              </button>
              <div className="tile-body">
                <div className="tile-name">{p.name}</div>
                <div className="tile-sub muted">{SUPPLIERS[p.supplierId].city} · MOQ {p.moq}</div>
                <div className="tile-row">
                  <span className="price sm">{money(p.price)}</span>
                  <span className="margin sm">{Math.round(margin(p) * 100)}%</span>
                  <button className="icon-btn xs" onClick={() => dispatch({ type: 'toggleShortlist', id: p.id })} data-sfx="remove" aria-label="Remove from shortlist"><Trash size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn ghost wide add-more" onClick={() => nav.go('discover')}>+ Discover more styles</button>

      <div className="page-footer">
        <div>
          <div className="small muted">Step 1 of 3</div>
          <div className="footer-amount">{items.length} style{items.length > 1 ? 's' : ''}</div>
        </div>
        <button className="btn primary" onClick={() => nav.go('cart')}>Next: Set Qty</button>
      </div>
    </div>
  );
}
