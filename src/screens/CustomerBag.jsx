import React, { useState } from 'react';
import GarmentArt from '../components/GarmentArt.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { productById } from '../data/catalog.js';
import { useStore, MAX_PER_ITEM } from '../store/StoreContext.jsx';
import { money } from '../utils/pricing.js';
import { Check, Minus, Plus, Trash } from '../components/Icons.jsx';

export const FREE_DELIVERY_ABOVE = 999;
export const DELIVERY_FEE = 49;

const PAYMENTS = [
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Debit / credit card', note: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on delivery', note: 'Pay when it arrives' },
];

export function bagLines(bag) {
  return bag
    .map((b) => {
      const product = productById(b.productId);
      if (!product || product.active === false) return null;
      const colorIndex = Math.max(0, product.colors.findIndex((c) => c.name === b.color));
      return { ...b, product, colorIndex, amount: product.mrp * b.qty };
    })
    .filter(Boolean);
}

/** Customer bag + checkout. Prices are MRP (inclusive of GST). */
export default function CustomerBag({ nav }) {
  const { state, dispatch } = useStore();
  const [payment, setPayment] = useState('upi');
  const [placed, setPlaced] = useState(null);
  const lines = bagLines(state.bag);
  const items = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.amount, 0);
  const delivery = subtotal >= FREE_DELIVERY_ABOVE || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  const c = state.customer;
  const detailsOk = c.name.trim() && c.phone.trim() && c.address.trim().length > 8;

  if (placed)
    return (
      <div className="page success">
        <div className="success-mark"><Check size={44} sw={3} /></div>
        <h1 className="page-title">Order placed</h1>
        <p className="muted">
          <b>{placed.id}</b> is with {state.shop.name}. You'll see updates as the shop accepts and sends it out.
        </p>
        <div className="row gap">
          <button className="btn" onClick={() => nav.go('c-browse')}>Keep shopping</button>
          <button className="btn primary" onClick={() => nav.go('c-orders')}>Track order</button>
        </div>
      </div>
    );

  if (!lines.length)
    return (
      <div className="page">
        <PageHeader title="Bag" onMenu={nav.menu} />
        <div className="empty">
          <div className="empty-mark">👜</div>
          <h3>Your bag is empty</h3>
          <p className="muted">Browse the racks, tap a piece to flip it, pick your size and add it here.</p>
          <button className="btn primary" onClick={() => nav.go('c-browse')}>Browse collection</button>
        </div>
      </div>
    );

  const place = () => {
    const order = {
      id: `KC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      shop: state.shop.name,
      customer: { ...c },
      payment,
      items: lines.map((l) => ({ productId: l.productId, name: l.product.name, color: l.color, size: l.size, qty: l.qty, price: l.product.mrp, amount: l.amount })),
      pieces: items,
      subtotal,
      delivery,
      total,
      step: 0,
    };
    dispatch({ type: 'placeCustomerOrder', order });
    setPlaced(order);
  };

  return (
    <div className="page with-footer">
      <PageHeader title="Bag" count={items} onMenu={nav.menu} />
      <p className="muted small page-sub">Sold &amp; delivered by <b>{state.shop.name}</b>. Prices include all taxes.</p>

      <section className="card bag-list">
        {lines.map((l) => (
          <div key={l.key} className="bag-line">
            <div className="line-art bag-art"><GarmentArt product={l.product} colorIndex={l.colorIndex} /></div>
            <div className="grow">
              <div className="line-name">{l.product.name}</div>
              <div className="muted small">{l.color} · Size {l.size}</div>
              <div className="bag-row">
                <div className="stepper" role="group" aria-label={`${l.product.name} quantity`}>
                  <button data-sfx="remove" onClick={() => dispatch({ type: 'setBagQty', key: l.key, qty: l.qty - 1 })} aria-label="Decrease quantity">
                    {l.qty === 1 ? <Trash size={15} /> : <Minus size={16} sw={2.6} />}
                  </button>
                  <span className="stepper-val">{l.qty}</span>
                  <button data-sfx="add" data-sfx-n={l.qty + 1} onClick={() => dispatch({ type: 'setBagQty', key: l.key, qty: l.qty + 1 })} disabled={l.qty >= MAX_PER_ITEM} aria-label="Increase quantity">
                    <Plus size={16} sw={2.6} />
                  </button>
                </div>
                <b>{money(l.amount)}</b>
              </div>
            </div>
          </div>
        ))}
        {delivery > 0 && <div className="ship-note">Add {money(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery</div>}
      </section>

      <section className="card">
        <h3>Deliver to</h3>
        {[['name', 'Full name'], ['phone', 'Mobile number'], ['address', 'Address']].map(([k, label]) => (
          <label key={k} className="field">
            <span>{label}</span>
            <input value={c[k]} onChange={(e) => dispatch({ type: 'setCustomer', customer: { [k]: e.target.value } })} inputMode={k === 'phone' ? 'tel' : undefined} />
          </label>
        ))}
      </section>

      <section className="card">
        <h3>Payment</h3>
        {PAYMENTS.map((p) => (
          <label key={p.id} className={`radio ${payment === p.id ? 'on' : ''}`}>
            <input type="radio" name="cpay" checked={payment === p.id} onChange={() => setPayment(p.id)} />
            <span className="grow">
              {p.label}
              <span className="muted small block">{p.note}</span>
            </span>
          </label>
        ))}
      </section>

      <section className="card bill">
        <div><span>Items ({items})</span><span>{money(subtotal)}</span></div>
        <div><span>Delivery</span><span>{delivery ? money(delivery) : 'Free'}</span></div>
        <div className="grand"><span>Total</span><span>{money(total)}</span></div>
      </section>

      <div className="page-footer">
        <div>
          <div className="small muted">{items} item{items > 1 ? 's' : ''} · incl. taxes</div>
          <div className="footer-amount">{money(total)}</div>
        </div>
        <button className="btn primary" data-sfx="success" disabled={!detailsOk} onClick={place}>
          {detailsOk ? 'Place order' : 'Add delivery details'}
        </button>
      </div>
    </div>
  );
}
