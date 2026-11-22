import React, { useEffect, useState } from 'react';
import GarmentArt from './GarmentArt.jsx';
import QuantityMatrix from './QuantityMatrix.jsx';
import { productById, SUPPLIERS, categoryLabel } from '../data/catalog.js';
import { useStore } from '../store/StoreContext.jsx';
import { margin, matrixPieces, money, gstRate } from '../utils/pricing.js';
import { Chevron, Heart, Shield, Star, Truck, Columns } from './Icons.jsx';
import { sfx } from '../utils/sfx.js';

export default function ProductSheet({ id, onClose, nav }) {
  const { state, dispatch } = useStore();
  const product = productById(id);
  const supplier = SUPPLIERS[product.supplierId];
  const [colorIndex, setColorIndex] = useState(0);
  const [draft, setDraft] = useState(() => state.cart[id] || {});
  const inCart = Boolean(state.cart[id]);
  const shortlisted = state.shortlist.includes(id);
  const comparing = state.compare.includes(id);

  useEffect(() => {
    sfx.open();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pieces = matrixPieces(draft);
  const amount = pieces * product.price;
  const setPrice = product.price * product.sizes.length;

  const save = () => {
    dispatch({ type: 'setLine', id, matrix: pieces > 0 ? draft : null });
    if (pieces > 0 && !shortlisted) dispatch({ type: 'toggleShortlist', id });
    nav.notify(pieces > 0 ? `${pieces} pcs ${inCart ? 'updated in' : 'added to'} order` : 'Removed from order');
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={product.name} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-scroll">
          <div className="sheet-hero">
            <button className="icon-btn floating" onClick={onClose} aria-label="Close"><Chevron /></button>
            <GarmentArt product={product} colorIndex={colorIndex} className="big" />
            <div className="hero-swatches">
              {product.colors.map((c, i) => (
                <button key={c.name} className={`swatch-lg ${i === colorIndex ? 'on' : ''}`} onClick={() => setColorIndex(i)}>
                  <span style={{ background: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sheet-body">
            <div className="eyebrow">{categoryLabel(product.category)} · {product.brand}</div>
            <h1 className="sheet-title">{product.name}</h1>

            <div className="price-block">
              <div>
                <div className="price xl">{money(product.price)}<small>/pc</small></div>
                <div className="muted small">{money(setPrice)} per set · +{gstRate(product.price) * 100}% GST</div>
              </div>
              <div className="margin-badge">
                <b>{Math.round(margin(product) * 100)}%</b>
                <span>margin at MRP {money(product.mrp)}</span>
              </div>
            </div>

            <div className="supplier-card">
              <div className="supplier-avatar">{supplier.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
              <div className="grow">
                <div className="supplier-name">
                  {supplier.name} {supplier.verified && <span className="verified"><Shield size={13} /> Verified</span>}
                </div>
                <div className="muted small">{supplier.city} · {supplier.years} yrs in trade</div>
              </div>
              <div className="supplier-stats">
                <span><Star size={12} /> {supplier.rating}</span>
                <span><Truck size={13} /> {supplier.dispatchDays}d</span>
              </div>
            </div>

            <dl className="specs">
              <div><dt>Fabric</dt><dd>{product.fabric}</dd></div>
              <div><dt>Fit</dt><dd>{product.fit}</dd></div>
              <div><dt>Sizes</dt><dd>{product.sizes.join(' · ')}</dd></div>
              <div><dt>Colours</dt><dd>{product.colors.length} options</dd></div>
              <div><dt>MOQ</dt><dd>{product.moq} pcs (mix sizes &amp; colours)</dd></div>
              <div><dt>Stock</dt><dd>{product.stock.toLocaleString('en-IN')} pcs</dd></div>
              <div><dt>Sold · 30 days</dt><dd>{product.sold30d.toLocaleString('en-IN')} pcs across Kapra</dd></div>
              <div><dt>Free shipping</dt><dd>On {supplier.name.split(' ')[0]} orders over {money(supplier.freeShipAbove)}</dd></div>
            </dl>

            <QuantityMatrix product={product} value={draft} onChange={setDraft} />

            <div className="sheet-secondary">
              <button className={`pill-toggle ${shortlisted ? 'on' : ''}`} data-sfx={shortlisted ? 'remove' : 'like'} onClick={() => dispatch({ type: 'toggleShortlist', id })}>
                <Heart size={16} fill={shortlisted ? 'currentColor' : 'none'} /> {shortlisted ? 'Shortlisted' : 'Shortlist'}
              </button>
              <button
                className={`pill-toggle ${comparing ? 'on' : ''}`}
                onClick={() => {
                  if (!comparing && state.compare.length >= 3) return nav.notify('Compare up to 3 products');
                  if (!shortlisted) dispatch({ type: 'toggleShortlist', id });
                  dispatch({ type: 'toggleCompare', id });
                }}
              >
                <Columns size={16} /> {comparing ? 'In compare' : 'Compare'}
              </button>
            </div>
          </div>
        </div>

        <div className="sheet-footer">
          <div>
            <div className="small muted">{pieces} pcs</div>
            <div className="footer-amount">{money(amount)}</div>
          </div>
          <button className="btn primary" data-sfx={pieces > 0 ? 'add' : 'remove'} onClick={save} disabled={!inCart && pieces === 0}>
            {inCart ? (pieces > 0 ? 'Update quantities' : 'Remove from order') : 'Add to order'}
          </button>
        </div>
      </div>
    </div>
  );
}
