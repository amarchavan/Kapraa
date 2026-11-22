import React, { useEffect, useRef, useState } from 'react';
import GarmentArt from './GarmentArt.jsx';
import { SUPPLIERS } from '../data/catalog.js';
import { margin, money, sizeRange } from '../utils/pricing.js';
import { Star, Info, Shield } from './Icons.jsx';
import { sfx } from '../utils/sfx.js';

const THRESHOLD_X = 110;
const THRESHOLD_UP = 120;

export default function SwipeCard({ product, depth, onSwipe, onOpen, fling }) {
  const isTop = depth === 0;
  const [pos, setPos] = useState({ x: 0, y: 0, dragging: false });
  const [out, setOut] = useState(null);
  const [colorIndex, setColorIndex] = useState(0);
  const start = useRef(null);
  const armed = useRef(false); // past the swipe threshold during a drag
  const supplier = SUPPLIERS[product.supplierId];

  const leave = (dir) => {
    if (out) return;
    dir === 'right' ? sfx.like() : sfx.skip();
    setOut(dir);
    setTimeout(() => onSwipe(product.id, dir), 260);
  };

  // Button-triggered swipe from the action bar
  useEffect(() => {
    if (isTop && fling && fling.id === product.id) leave(fling.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fling]);

  const onPointerDown = (e) => {
    if (!isTop || out) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    setPos({ x: 0, y: 0, dragging: true });
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const past = Math.abs(x) > THRESHOLD_X;
    if (past !== armed.current) {
      armed.current = past;
      if (past) sfx.tick();
    }
    setPos({ x, y: e.clientY - start.current.y, dragging: true });
  };
  const onPointerUp = () => {
    if (!start.current) return;
    const { x, y } = pos;
    const quickTap = Math.abs(x) < 6 && Math.abs(y) < 6 && Date.now() - start.current.t < 350;
    start.current = null;
    armed.current = false;
    if (x > THRESHOLD_X) return leave('right');
    if (x < -THRESHOLD_X) return leave('left');
    setPos({ x: 0, y: 0, dragging: false });
    if (y < -THRESHOLD_UP || quickTap) onOpen(product.id);
  };

  let transform;
  if (out) transform = `translate(${out === 'right' ? 640 : -640}px, ${pos.y - 40}px) rotate(${out === 'right' ? 28 : -28}deg)`;
  else if (isTop) transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x / 18}deg)`;
  else transform = `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`;

  const likeOpacity = Math.max(0, Math.min(1, pos.x / THRESHOLD_X));
  const nopeOpacity = Math.max(0, Math.min(1, -pos.x / THRESHOLD_X));
  const m = Math.round(margin(product) * 100);
  const lowStock = product.stock < 400;

  return (
    <article
      className={`swipe-card ${isTop ? 'is-top' : ''}`}
      style={{ transform, zIndex: 10 - depth, transition: pos.dragging ? 'none' : 'transform .28s cubic-bezier(.2,.8,.2,1), opacity .28s', opacity: depth > 2 ? 0 : 1 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={product.name}
    >
      <div className="swipe-art">
        <GarmentArt product={product} colorIndex={colorIndex} />
        {supplier.verified && (
          <div className="swipe-tags">
            <span className="tag tag-verified"><Shield size={14} sw={2.4} /> Verified</span>
          </div>
        )}
        <span className={`stock-pill ${lowStock ? 'low' : ''}`}>{lowStock ? `Only ${product.stock} left` : `${product.stock.toLocaleString('en-IN')} in stock`}</span>
        <div className="stamp stamp-like" style={{ opacity: likeOpacity }}>Shortlist</div>
        <div className="stamp stamp-nope" style={{ opacity: nopeOpacity }}>Skip</div>
        <button
          className="card-info-btn"
          onPointerDown={(e) => e.stopPropagation()}
          data-sfx="none"
          onClick={() => onOpen(product.id)}
          aria-label={`More info about ${product.name}`}
          tabIndex={isTop ? 0 : -1}
        >
          <Info size={20} />
        </button>
        <div className="swatches" onPointerDown={(e) => e.stopPropagation()}>
          {product.colors.map((c, i) => (
            <button key={c.name} className={`swatch ${i === colorIndex ? 'on' : ''}`} style={{ background: c.hex }} onClick={() => setColorIndex(i)} aria-label={c.name} title={c.name} />
          ))}
        </div>
      </div>
      <div className="swipe-info">
        <div className="eyebrow">
          {product.brand} · {supplier.city}
          <span className="rating"><Star size={12} /> {supplier.rating}</span>
        </div>
        <h2 className="swipe-title">{product.name}</h2>
        <div className="price-row">
          <span className="price">{money(product.price)}<small>/pc</small></span>
          <span className="mrp">MRP {money(product.mrp)}</span>
          <span className="margin">{m}% margin</span>
        </div>
        <dl className="facts">
          <div><dt>MOQ</dt><dd>{product.moq} pcs</dd></div>
          <div><dt>Sizes</dt><dd>{sizeRange(product)}</dd></div>
          <div className="wide"><dt>Fabric</dt><dd>{product.fabric.split(',')[0]}</dd></div>
        </dl>
      </div>
    </article>
  );
}
