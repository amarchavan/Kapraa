import React, { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useStore, ORDER_STEPS } from '../store/StoreContext.jsx';
import { matrixSummary, money } from '../utils/pricing.js';

const NEXT_ACTION = ['Confirm order', 'Mark dispatched', 'Mark delivered'];
const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Wholesaler inbox: sub-orders routed to this supplier, with status actions. */
export default function WholesalerOrders({ nav }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('open');
  const rows = state.orders.flatMap((o) =>
    o.subOrders.filter((so) => so.supplierId === state.supplierId).map((so) => ({ order: o, so }))
  );
  const open = rows.filter((r) => r.so.step < ORDER_STEPS.length - 1);
  const shown = tab === 'open' ? open : rows.filter((r) => r.so.step === ORDER_STEPS.length - 1);

  return (
    <div className="page">
      <PageHeader title="Orders received" count={open.length} onMenu={nav.menu} />

      <div className="seg" role="tablist">
        <button role="tab" aria-selected={tab === 'open'} className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>To action {open.length}</button>
        <button role="tab" aria-selected={tab === 'done'} className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Delivered {rows.length - open.length}</button>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-mark">📦</div>
          <h3>{tab === 'open' ? 'No orders to action' : 'No delivered orders yet'}</h3>
          <p className="muted">When a retailer orders your styles, the order lands here for you to confirm and dispatch.</p>
          <button className="btn" onClick={() => nav.go('w-catalog')}>View my catalogue</button>
        </div>
      ) : (
        shown.map(({ order, so }) => (
          <section key={so.id} className="card order">
            <header className="order-head">
              <div>
                <b>{so.id}</b>
                <div className="muted small">{fmtDate(order.createdAt)} · {order.shop?.name}</div>
                <div className="muted small">{order.shop?.address}</div>
              </div>
              <span className={`status s${so.step}`}>{ORDER_STEPS[so.step]}</span>
            </header>

            {so.items.map((it) => (
              <div key={it.productId} className="w-order-line">
                <div className="review-line">
                  <b>{it.name}</b>
                  <span>{money(it.amount)}</span>
                </div>
                <div className="muted small">{it.pieces} pcs · {matrixSummary(it.matrix).join(' · ')}</div>
              </div>
            ))}

            <div className="review-line w-total">
              <span className="muted small">{so.pieces} pcs · incl. GST &amp; shipping · GSTIN {order.shop?.gstin}</span>
              <b>{money(so.total)}</b>
            </div>

            <ol className="timeline">
              {ORDER_STEPS.map((step, i) => (
                <li key={step} className={i <= so.step ? 'done' : ''}>
                  <span className="node" />
                  <span className="label">{step}</span>
                </li>
              ))}
            </ol>

            {so.step < ORDER_STEPS.length - 1 && (
              <button
                className="btn primary wide"
                data-sfx={so.step === ORDER_STEPS.length - 2 ? 'success' : 'add'}
                onClick={() => {
                  dispatch({ type: 'setSubStep', orderId: order.id, subId: so.id, step: so.step + 1 });
                  nav.notify(`${so.id} · ${ORDER_STEPS[so.step + 1]}`);
                }}
              >
                {NEXT_ACTION[so.step]}
              </button>
            )}
          </section>
        ))
      )}
    </div>
  );
}
