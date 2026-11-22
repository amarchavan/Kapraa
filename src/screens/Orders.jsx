import React from 'react';
import { useStore, ORDER_STEPS } from '../store/StoreContext.jsx';
import { money } from '../utils/pricing.js';
import PageHeader from '../components/PageHeader.jsx';

const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function Orders({ nav }) {
  const { state, dispatch } = useStore();

  if (!state.orders.length)
    return (
      <div className="page">
        <PageHeader title="Orders" onMenu={nav.menu} />
        <div className="empty">
          <div className="empty-mark">📦</div>
          <h3>No orders yet</h3>
          <p className="muted">Once you place an order, each supplier's confirmation, dispatch and delivery shows up here.</p>
          <button className="btn primary" onClick={() => nav.go('discover')}>Start discovering</button>
        </div>
      </div>
    );

  return (
    <div className="page">
      <PageHeader title="Orders" onMenu={nav.menu} />
      {state.orders.map((o) => {
        const done = o.subOrders.every((s) => s.step === ORDER_STEPS.length - 1);
        return (
          <section key={o.id} className="card order">
            <header className="order-head">
              <div>
                <b>{o.id}</b>
                <div className="muted small">{fmtDate(o.createdAt)} · {o.totals.pieces} pcs</div>
              </div>
              <div className="group-total">{money(o.totals.total)}</div>
            </header>

            {o.subOrders.map((so) => (
              <div key={so.id} className="sub-order">
                <div className="sub-head">
                  <span><b>{so.supplierName}</b> <span className="muted small">· {so.city}</span></span>
                  <span className={`status s${so.step}`}>{ORDER_STEPS[so.step]}</span>
                </div>
                <ol className="timeline">
                  {ORDER_STEPS.map((step, i) => (
                    <li key={step} className={i <= so.step ? 'done' : ''}>
                      <span className="node" />
                      <span className="label">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="muted small">{so.items.map((i) => `${i.name} ×${i.pieces}`).join(' · ')}</div>
              </div>
            ))}

            {!done && (
              <button className="btn sm ghost" onClick={() => dispatch({ type: 'advanceOrder', id: o.id })}>
                Simulate supplier update
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
