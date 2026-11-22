import React, { useMemo } from 'react';
import GarmentArt from '../components/GarmentArt.jsx';
import QuantityMatrix from '../components/QuantityMatrix.jsx';
import PageHeader from '../components/PageHeader.jsx';
import OrderSteps from '../components/OrderSteps.jsx';
import { productById, SUPPLIERS } from '../data/catalog.js';
import { useStore } from '../store/StoreContext.jsx';
import { cartSummary, matrixPieces, money } from '../utils/pricing.js';
import { Shield, Truck, Trash } from '../components/Icons.jsx';

/** Step 2 — Qty: set size × colour quantities for every shortlisted style. */
export default function Cart({ nav }) {
  const { state, dispatch } = useStore();
  const ids = useMemo(() => [...new Set([...state.shortlist, ...Object.keys(state.cart)])], [state.shortlist, state.cart]);
  const products = ids.map(productById).filter(Boolean);
  const { groups, totals, issues } = cartSummary(state.cart);

  const bySupplier = useMemo(() => {
    const m = {};
    products.forEach((p) => (m[p.supplierId] ??= []).push(p));
    return Object.entries(m);
  }, [products]);
  const groupFor = (sid) => groups.find((g) => g.supplier.id === sid);

  const setMatrix = (id, matrix) => dispatch({ type: 'setLine', id, matrix: matrixPieces(matrix) > 0 ? matrix : null });
  const remove = (id) => {
    dispatch({ type: 'setLine', id, matrix: null });
    if (state.shortlist.includes(id)) dispatch({ type: 'toggleShortlist', id });
  };

  const header = (
    <>
      <PageHeader title="Quantities" onMenu={nav.menu} />
      <OrderSteps current="cart" go={nav.go} reachable={{ review: totals.pieces > 0 && !issues.length }} />
    </>
  );

  if (!products.length)
    return (
      <div className="page">
        {header}
        <div className="empty">
          <div className="empty-mark">♥</div>
          <h3>Nothing to order yet</h3>
          <p className="muted">Shortlist styles in Discover, then set quantities for each one here.</p>
          <button className="btn primary" onClick={() => nav.go('discover')}>Start discovering</button>
        </div>
      </div>
    );

  return (
    <div className="page with-footer">
      {header}
      <p className="muted small page-sub">
        Pick how many size sets you want in each colour. Leave a style at 0 to skip it — {products.length} styles from {bySupplier.length} supplier{bySupplier.length > 1 ? 's' : ''}.
      </p>

      {bySupplier.map(([sid, list]) => {
        const supplier = SUPPLIERS[sid];
        const g = groupFor(sid);
        return (
          <section key={sid} className="supplier-group">
            <header>
              <div>
                <div className="supplier-name">
                  {supplier.name} {supplier.verified && <span className="verified"><Shield size={12} /> Verified</span>}
                </div>
                <div className="muted small"><Truck size={12} /> Dispatch in {supplier.dispatchDays} days · {supplier.city}</div>
              </div>
              <div className="group-total">{g ? money(g.subtotal) : '—'}</div>
            </header>

            {list.map((p) => {
              const matrix = state.cart[p.id] || {};
              const pieces = matrixPieces(matrix);
              const status = pieces === 0 ? { cls: 'idle', text: 'Not added' } : pieces < p.moq ? { cls: 'warn', text: `${p.moq - pieces} short of MOQ` } : { cls: 'ok', text: `${pieces} pcs · ${money(pieces * p.price)}` };
              return (
                <div key={p.id} className="qty-item">
                  <div className="qty-row">
                    <button className="line-art" onClick={() => nav.open(p.id)} aria-label={`View ${p.name}`}>
                      <GarmentArt product={p} />
                    </button>
                    <div className="qty-info grow">
                      <span className="line-name">{p.name}</span>
                      <span className="muted small block">{money(p.price)}/pc · MOQ {p.moq} pcs</span>
                      <span className={`qty-status ${status.cls}`}>{status.text}</span>
                    </div>
                    <button className="icon-btn xs" onClick={() => remove(p.id)} data-sfx="remove" aria-label="Remove style"><Trash size={15} /></button>
                  </div>
                  <QuantityMatrix product={p} value={matrix} onChange={(m) => setMatrix(p.id, m)} />
                </div>
              );
            })}

            {g && (
              <div className={`ship-note ${g.shipping === 0 ? 'free' : ''}`}>
                {g.shipping === 0 ? 'Free shipping unlocked' : `Add ${money(g.toFreeShip)} more for free shipping (else ${money(g.shipping)})`}
              </div>
            )}
          </section>
        );
      })}

      <button className="btn ghost wide add-more" onClick={() => nav.go('discover')}>+ Discover more styles</button>

      <div className="page-footer">
        <div>
          <div className="small muted">{totals.pieces} pcs · {totals.styles} style{totals.styles === 1 ? '' : 's'} · excl. GST</div>
          <div className="footer-amount">{money(totals.subtotal)}</div>
        </div>
        <button className="btn primary" disabled={issues.length > 0 || totals.pieces === 0} onClick={() => nav.go('review')}>
          {issues.length ? `Fix ${issues.length} MOQ issue${issues.length > 1 ? 's' : ''}` : totals.pieces === 0 ? 'Add quantities' : 'Next: Place order'}
        </button>
      </div>
    </div>
  );
}
