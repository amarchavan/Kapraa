import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useStore, CUSTOMER_STEPS } from '../store/StoreContext.jsx';
import { money } from '../utils/pricing.js';

const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export function StepTimeline({ steps, step }) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => (
        <li key={s} className={i <= step ? 'done' : ''}>
          <span className="node" />
          <span className="label">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/** Customer's own orders with live status from the retailer. */
export default function CustomerOrders({ nav }) {
  const { state } = useStore();

  if (!state.customerOrders.length)
    return (
      <div className="page">
        <PageHeader title="My orders" onMenu={nav.menu} />
        <div className="empty">
          <div className="empty-mark">📦</div>
          <h3>No orders yet</h3>
          <p className="muted">Your orders from {state.shop.name} will show up here with live delivery status.</p>
          <button className="btn primary" onClick={() => nav.go('c-browse')}>Browse collection</button>
        </div>
      </div>
    );

  return (
    <div className="page">
      <PageHeader title="My orders" onMenu={nav.menu} />
      {state.customerOrders.map((o) => (
        <section key={o.id} className="card order">
          <header className="order-head">
            <div>
              <b>{o.id}</b>
              <div className="muted small">{fmtDate(o.createdAt)} · {o.shop}</div>
            </div>
            <span className={`status s${o.step}`}>{CUSTOMER_STEPS[o.step]}</span>
          </header>
          {o.items.map((it, i) => (
            <div key={i} className="review-line">
              <span>{it.name} <span className="muted small">· {it.color}, {it.size} × {it.qty}</span></span>
              <span>{money(it.amount)}</span>
            </div>
          ))}
          <div className="review-line w-total">
            <span className="muted small">{o.payment === 'cod' ? 'Cash on delivery' : 'Paid online'}{o.delivery ? ` · delivery ${money(o.delivery)}` : ' · free delivery'}</span>
            <b>{money(o.total)}</b>
          </div>
          <StepTimeline steps={CUSTOMER_STEPS} step={o.step} />
        </section>
      ))}
    </div>
  );
}
