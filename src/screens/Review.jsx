import PageHeader from '../components/PageHeader.jsx';
import OrderSteps from '../components/OrderSteps.jsx';
import React, { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { cartSummary, money } from '../utils/pricing.js';
import { Chevron, Check } from '../components/Icons.jsx';

const PAYMENTS = [
  { id: 'credit', label: 'Kapra Credit · pay in 30 days', note: 'Pre-approved limit ₹2,00,000' },
  { id: 'upi', label: 'UPI', note: 'Instant, 1% cashback' },
  { id: 'neft', label: 'Bank transfer (NEFT/RTGS)', note: 'Order confirmed on receipt' },
  { id: 'cod', label: 'Partial COD', note: '20% advance, rest on delivery' },
];

export default function Review({ nav }) {
  const { state, dispatch } = useStore();
  const { groups, totals } = cartSummary(state.cart);
  const [payment, setPayment] = useState('credit');
  const [placed, setPlaced] = useState(null);
  const shop = state.shop;

  if (placed)
    return (
      <div className="page success">
        <div className="success-mark"><Check size={44} sw={3} /></div>
        <h1 className="page-title">Order placed</h1>
        <p className="muted">
          <b>{placed.id}</b> sent to {placed.subOrders.length} supplier{placed.subOrders.length > 1 ? 's' : ''}. You'll get updates as each one confirms and dispatches.
        </p>
        <div className="row gap">
          <button className="btn" onClick={() => nav.go('discover')}>Keep browsing</button>
          <button className="btn primary" onClick={() => nav.go('orders')}>Track order</button>
        </div>
      </div>
    );

  if (!groups.length) {
    return (
      <div className="page"><div className="empty"><h3>Nothing to review</h3><button className="btn" onClick={() => nav.go('discover')}>Discover products</button></div></div>
    );
  }

  const place = () => {
    const id = `KPR-${Date.now().toString().slice(-6)}`;
    const order = {
      id,
      createdAt: new Date().toISOString(),
      payment,
      shop,
      totals,
      subOrders: groups.map((g, i) => ({
        id: `${id}-${i + 1}`,
        supplierId: g.supplier.id,
        supplierName: g.supplier.name,
        city: g.supplier.city,
        dispatchDays: g.supplier.dispatchDays,
        items: g.items.map((it) => ({ productId: it.product.id, name: it.product.name, pieces: it.pieces, amount: it.amount, matrix: it.matrix })),
        pieces: g.pieces,
        total: g.total,
        step: 0,
      })),
    };
    dispatch({ type: 'placeOrder', order });
    setPlaced(order);
  };

  const field = (key, label) => (
    <label className="field">
      <span>{label}</span>
      <input value={shop[key]} onChange={(e) => dispatch({ type: 'setShop', shop: { [key]: e.target.value } })} />
    </label>
  );

  return (
    <div className="page with-footer">
      <PageHeader title="Place order" onBack={() => nav.go('cart')} />
      <OrderSteps current="review" go={nav.go} />

      <section className="card">
        <h3>Deliver to</h3>
        {field('name', 'Shop name')}
        {field('gstin', 'GSTIN (for input tax credit)')}
        {field('address', 'Delivery address')}
      </section>

      <section className="card">
        <h3>Supplier orders</h3>
        {groups.map((g) => (
          <div key={g.supplier.id} className="review-group">
            <div className="review-group-head">
              <b>{g.supplier.name}</b>
              <span className="muted small">{g.items.length} styles · {g.pieces} pcs · ships in {g.supplier.dispatchDays}d</span>
            </div>
            {g.items.map((i) => (
              <div key={i.product.id} className="review-line">
                <span>{i.product.name} <span className="muted">× {i.pieces}</span></span>
                <span>{money(i.amount)}</span>
              </div>
            ))}
            <div className="review-line muted small">
              <span>GST {money(g.gst)} · Shipping {g.shipping ? money(g.shipping) : 'free'}</span>
              <b>{money(g.total)}</b>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Payment</h3>
        {PAYMENTS.map((p) => (
          <label key={p.id} className={`radio ${payment === p.id ? 'on' : ''}`}>
            <input type="radio" name="pay" checked={payment === p.id} onChange={() => setPayment(p.id)} />
            <span className="grow">
              {p.label}
              <span className="muted small block">{p.note}</span>
            </span>
          </label>
        ))}
      </section>

      <section className="card bill">
        <div><span>Total pieces</span><span>{totals.pieces}</span></div>
        <div><span>Wholesale amount</span><span>{money(totals.subtotal)}</span></div>
        <div><span>GST</span><span>{money(totals.gst)}</span></div>
        <div><span>Shipping</span><span>{totals.shipping ? money(totals.shipping) : 'Free'}</span></div>
        <div className="grand"><span>Total payable</span><span>{money(totals.total)}</span></div>
      </section>

      <div className="page-footer">
        <div>
          <div className="small muted">{totals.pieces} pcs · incl. GST</div>
          <div className="footer-amount">{money(totals.total)}</div>
        </div>
        <button className="btn primary" data-sfx="success" onClick={place}>Place wholesale order</button>
      </div>
    </div>
  );
}
