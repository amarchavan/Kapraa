import React, { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { StepTimeline } from './CustomerOrders.jsx';
import { useStore, CUSTOMER_STEPS } from '../store/StoreContext.jsx';
import { money } from '../utils/pricing.js';

const NEXT = ['Accept order', 'Send for delivery', 'Mark delivered'];
const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Retailer inbox for single-piece orders from end customers. */
export default function RetailerSales({ nav }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('open');
  const last = CUSTOMER_STEPS.length - 1;
  const open = state.customerOrders.filter((o) => o.step < last);
  const shown = tab === 'open' ? open : state.customerOrders.filter((o) => o.step === last);
  const revenue = state.customerOrders.reduce((n, o) => n + o.total, 0);

  return (
    <div className="page">
      <PageHeader title="Customer orders" count={open.length} onMenu={nav.menu} />
      <p className="muted small page-sub">Single-piece orders from shoppers browsing {state.shop.name} · {money(revenue)} total sales</p>

      <div className="seg" role="tablist">
        <button role="tab" aria-selected={tab === 'open'} className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>To action {open.length}</button>
        <button role="tab" aria-selected={tab === 'done'} className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Delivered {state.customerOrders.length - open.length}</button>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-mark">🛍</div>
          <h3>{tab === 'open' ? 'No customer orders to action' : 'Nothing delivered yet'}</h3>
          <p className="muted">When a shopper buys from your rack, the order lands here to accept and deliver.</p>
        </div>
      ) : (
        shown.map((o) => (
          <section key={o.id} className="card order">
            <header className="order-head">
              <div>
                <b>{o.id}</b>
                <div className="muted small">{fmtDate(o.createdAt)} · {o.customer.name} · {o.customer.phone}</div>
                <div className="muted small">{o.customer.address}</div>
              </div>
              <span className={`status s${o.step}`}>{CUSTOMER_STEPS[o.step]}</span>
            </header>
            {o.items.map((it, i) => (
              <div key={i} className="w-order-line">
                <div className="review-line"><b>{it.name}</b><span>{money(it.amount)}</span></div>
                <div className="muted small">{it.color} · Size {it.size} · Qty {it.qty}</div>
              </div>
            ))}
            <div className="review-line w-total">
              <span className="muted small">{o.pieces} pc{o.pieces > 1 ? 's' : ''} · {o.payment === 'cod' ? 'Collect cash on delivery' : 'Paid online'}</span>
              <b>{money(o.total)}</b>
            </div>
            <StepTimeline steps={CUSTOMER_STEPS} step={o.step} />
            {o.step < last && (
              <button
                className="btn primary wide"
                data-sfx={o.step === last - 1 ? 'success' : 'add'}
                onClick={() => {
                  dispatch({ type: 'setCustomerOrderStep', id: o.id, step: o.step + 1 });
                  nav.notify(`${o.id} · ${CUSTOMER_STEPS[o.step + 1]}`);
                }}
              >
                {NEXT[o.step]}
              </button>
            )}
          </section>
        ))
      )}
    </div>
  );
}
