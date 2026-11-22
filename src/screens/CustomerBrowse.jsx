import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import GarmentArt from '../components/GarmentArt.jsx';
import { CATEGORIES, liveProducts } from '../data/catalog.js';
import { useStore } from '../store/StoreContext.jsx';
import { money } from '../utils/pricing.js';
import { sfx } from '../utils/sfx.js';
import { Bag, Chevron, Menu, Undo, X } from '../components/Icons.jsx';
import notchLeft from '../assets/ui/notch-left.svg';
import notchRight from '../assets/ui/notch-right.svg';

const ROPE_TOP = 10; // px from the stage top where the rope starts at the edges
const DIAL_SPACING = 17; // px between ticks on the right-side scroller

function Hanger() {
  return (
    <svg className="cx-hanger" viewBox="0 0 120 40" aria-hidden="true">
      <path d="M60 19V14.5c0-2.6 4.6-3.2 4.6-7.3C64.6 3.9 62.6 2 60 2s-4.6 1.9-4.6 4.3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M60 19 9 35.5c-2.4.8-1.8 3.5.6 3.5h100.8c2.4 0 3-2.7.6-3.5L60 19z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

/** Rope geometry: a parabola that sags in the middle of the stage. */
function ropeY(x, w, sag) {
  const t = (x - w / 2) / (w / 2);
  return ROPE_TOP + sag * (1 - Math.min(1.3, t * t));
}

/**
 * Customer browsing — "the rack".
 * • Vertical scroll / swipe / wheel: next or previous product across the whole collection
 *   (the category title follows as you cross into the next collection).
 * • Horizontal swipe: slide along the current collection's rope.
 * • Right-side dial: animated fish-eye scroller — drag or tap a tick to jump.
 * • Dropdown under the category title: jump to any collection.
 * • Tap the focused garment to flip it; "Add to Cart" picks a size if needed.
 */
export default function CustomerBrowse({ nav }) {
  const { state, dispatch } = useStore();
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const bagRef = useRef(null);
  const [size, setSize] = useState({ w: 360, h: 460 });

  // ---------- data ----------
  const sections = useMemo(() => {
    const live = liveProducts().filter((p) => p.stock > 0);
    let start = 0;
    return CATEGORIES.filter((c) => c.id !== 'all')
      .map((c) => ({ ...c, products: live.filter((p) => p.category === c.id) }))
      .filter((c) => c.products.length)
      .map((c) => {
        const s = { ...c, start };
        start += c.products.length;
        return s;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.catalog]);
  const all = useMemo(() => sections.flatMap((s) => s.products), [sections]);

  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1); // +1 forward, -1 back (for enter animations)
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState(null);
  const [sel, setSel] = useState({}); // productId -> { color, size }
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState(null); // productId for the size picker
  const [nudge, setNudge] = useState(null);
  const [fly, setFly] = useState(null);
  const [scrub, setScrub] = useState(false);

  const safeCur = Math.min(cur, Math.max(0, all.length - 1));
  const p = all[safeCur];
  const secIdx = Math.max(0, sections.findIndex((s) => safeCur >= s.start && safeCur < s.start + s.products.length));
  const sec = sections[secIdx];
  const li = sec ? safeCur - sec.start : 0;
  const bagCount = state.bag.reduce((n, b) => n + b.qty, 0);
  const s = (p && sel[p.id]) || { color: 0, size: null };

  // ---------- geometry ----------
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = size;
  const sag = Math.max(36, Math.min(72, h * 0.13));
  const spacing = w * 0.47;
  const cw = Math.max(170, Math.min(w * 0.72, (h - ROPE_TOP - sag - 16) / 1.28));
  const ch = cw * 1.25;

  // ---------- navigation ----------
  const go = useCallback(
    (i, { quiet = false } = {}) => {
      const n = Math.max(0, Math.min(all.length - 1, i));
      setCur((c) => {
        if (n !== c) {
          setDir(n > c ? 1 : -1);
          setFlipped(null);
          if (!quiet) sfx.tick();
        }
        return n;
      });
    },
    [all.length]
  );
  const step = useCallback((d) => go(safeCur + d), [go, safeCur]);

  // Wheel / trackpad: vertical or horizontal steps (throttled)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let acc = 0;
    let lock = 0;
    const onWheel = (e) => {
      if (e.target.closest?.('.cx2-menu, .cx2-sheet, .cx-back')) return;
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      acc += d;
      const now = Date.now();
      if (Math.abs(acc) > 40 && now > lock) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        lock = now + 320;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [step]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (menuOpen || sheet) {
        if (e.key === 'Escape') {
          setMenuOpen(false);
          setSheet(null);
        }
        return;
      }
      if (e.target.closest?.('input, textarea, select, [role=dialog]')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button')) {
        e.preventDefault();
        p && flip(p.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Stage gestures: horizontal drag slides the rope, vertical swipe steps products
  const gesture = useRef(null);
  const moved = useRef(false);
  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest?.('.cx-back')) return;
    gesture.current = { x: e.clientX, y: e.clientY, axis: null };
    moved.current = false;
    const move = (ev) => {
      const g = gesture.current;
      if (!g) return;
      const dx = ev.clientX - g.x;
      const dy = ev.clientY - g.y;
      if (!g.axis && Math.hypot(dx, dy) > 8) {
        g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        moved.current = true;
        setDragging(true);
      }
      if (g.axis === 'x') setDragX(dx);
      if (g.axis === 'y') setDragY(dy * 0.35);
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const g = gesture.current;
      gesture.current = null;
      setDragging(false);
      setDragX(0);
      setDragY(0);
      if (!g?.axis) return;
      const dx = ev.clientX - g.x;
      const dy = ev.clientY - g.y;
      if (g.axis === 'x') {
        const raw = -dx / spacing; // a normal swipe moves one product; long drags move more
        const steps = Math.abs(dx) > 50 ? Math.sign(raw) * Math.max(1, Math.round(Math.abs(raw))) : 0;
        if (steps && sec) go(Math.max(sec.start, Math.min(sec.start + sec.products.length - 1, safeCur + steps)));
      } else if (Math.abs(dy) > 40) step(dy < 0 ? 1 : -1);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  // ---------- actions ----------
  const flip = (id) => {
    sfx.flip();
    setFlipped((f) => (f === id ? null : id));
  };
  const pick = (id, patch) => setSel((m) => ({ ...m, [id]: { color: 0, size: null, ...m[id], ...patch } }));

  const addToBag = (prod, colorIdx, sizeVal) => {
    dispatch({ type: 'addToBag', productId: prod.id, color: prod.colors[colorIdx]?.name ?? prod.colors[0].name, size: sizeVal });
    sfx.like();
    nav.notify(`Added · ${prod.colors[colorIdx]?.name ?? ''}, ${sizeVal}`);
    // fly a thumbnail into the bag
    const from = stageRef.current?.querySelector('.cx2-item.focus .cx-front')?.getBoundingClientRect();
    const to = bagRef.current?.getBoundingClientRect();
    const root = rootRef.current?.getBoundingClientRect();
    if (from && to && root) {
      setFly({ prod, colorIdx, x: from.left - root.left, y: from.top - root.top, w: from.width, h: from.height, tx: to.left - root.left + to.width / 2, ty: to.top - root.top + to.height / 2, go: false });
      requestAnimationFrame(() => requestAnimationFrame(() => setFly((f) => f && { ...f, go: true })));
      setTimeout(() => setFly(null), 750);
    }
  };

  const addFromBar = () => {
    if (!p) return;
    const size = s.size ?? (p.sizes.length === 1 ? p.sizes[0] : null);
    if (size) return addToBag(p, s.color, size);
    sfx.open();
    setSheet(p.id);
  };

  const addFromBack = (prod) => {
    const v = sel[prod.id] || { color: 0, size: null };
    const size = v.size ?? (prod.sizes.length === 1 ? prod.sizes[0] : null);
    if (!size) {
      setNudge(prod.id);
      sfx.remove();
      setTimeout(() => setNudge(null), 600);
      return;
    }
    addToBag(prod, v.color, size);
  };

  // ---------- right-side dial ----------
  const dialRef = useRef(null);
  const onDialDown = (e) => {
    e.stopPropagation();
    const start = { y: e.clientY, cur: safeCur, moved: false };
    setScrub(true);
    const move = (ev) => {
      const dy = ev.clientY - start.y;
      if (Math.abs(dy) > 4) start.moved = true;
      // drag the dial up → later products come to the centre
      go(start.cur - Math.round(dy / DIAL_SPACING));
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setScrub(false);
      if (!start.moved) {
        // a tap: jump to the tick under the finger
        const r = dialRef.current.getBoundingClientRect();
        go(safeCur + Math.round((ev.clientY - (r.top + r.height / 2)) / DIAL_SPACING));
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  if (!p)
    return (
      <div className="cx2">
        <div className="empty"><h3>No products on the rack right now</h3></div>
      </div>
    );

  // ---------- render ----------
  const pos = li - dragX / spacing; // fractional position along the rope
  const items = sec.products
    .map((prod, i) => ({ prod, i, o: i - pos }))
    .filter(({ o }) => Math.abs(o) < 2.2);

  return (
    <div className="cx2" ref={rootRef} style={{ '--cx-w': `${cw}px`, '--cx-h': `${ch}px` }}>
      {/* Brand */}
      <header className="cx2-head">
        <div className="cx-logo">KAPRA</div>
        <div className="cx-shop">{state.shop.name.toUpperCase()}</div>
      </header>

      {/* Category band + notch dropdown */}
      <div className="cx2-band-wrap">
        <div className="cx2-band">
          <h2 className="cx2-title" key={sec.id}>{sec.label.toUpperCase()}</h2>
        </div>
        <div className="cx2-notch">
          <img src={notchLeft} alt="" aria-hidden="true" />
          <span className="cx2-notch-body" />
          <img src={notchRight} alt="" aria-hidden="true" />
          <button
            className={`cx2-notch-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => { setMenuOpen((o) => !o); sfx.open(); }}
            aria-expanded={menuOpen}
            aria-controls="cx2-collections"
            aria-label={menuOpen ? 'Close collections' : 'Show all collections'}
            data-sfx="none"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true"><path d="M2 2l8 8 8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {/* Collections dropdown */}
      {menuOpen && (
        <div className="cx2-menu-scrim" onClick={() => setMenuOpen(false)}>
          <nav id="cx2-collections" className="cx2-menu" aria-label="Collections" onClick={(e) => e.stopPropagation()}>
            <div className="cx2-menu-head">All collections <span>{all.length} styles</span></div>
            <div className="cx2-menu-grid">
              {sections.map((c, i) => (
                <button
                  key={c.id}
                  className={`cx2-coll ${i === secIdx ? 'on' : ''}`}
                  onClick={() => { go(c.start, { quiet: true }); setMenuOpen(false); }}
                  aria-current={i === secIdx ? 'true' : undefined}
                >
                  <span className="cx2-coll-art"><GarmentArt product={c.products[0]} bare /></span>
                  <span className="cx2-coll-name">{c.label}</span>
                  <span className="cx2-coll-count">{c.products.length} styles</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Stage: rope + garments */}
      <div className={`cx2-stage ${dragging ? 'dragging' : ''}`} ref={stageRef} onPointerDown={onPointerDown}>
        <svg className="cx2-rope" width={w} height={ROPE_TOP + sag + 12} aria-hidden="true">
          <defs>
            <linearGradient id="cx2-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d9c68e" />
              <stop offset="0.5" stopColor="#a9871f" />
              <stop offset="1" stopColor="#d9c68e" />
            </linearGradient>
          </defs>
          <path d={`M -20 ${ropeY(-20, w, sag)} Q ${w / 2} ${ROPE_TOP + 2 * sag} ${w + 20} ${ropeY(w + 20, w, sag)}`} fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="3" transform="translate(0 2)" />
          <path d={`M -20 ${ropeY(-20, w, sag)} Q ${w / 2} ${ROPE_TOP + 2 * sag} ${w + 20} ${ropeY(w + 20, w, sag)}`} fill="none" stroke="url(#cx2-gold)" strokeWidth="2.4" />
        </svg>

        <div className={`cx2-rack enter-${dir > 0 ? 'down' : 'up'}`} key={sec.id} style={{ transform: `translateY(${dragY}px)` }}>
          {items.map(({ prod, i, o }) => {
            const x = w / 2 + o * spacing;
            const sc = 1 - Math.min(Math.abs(o), 1) * 0.6;
            const y = ropeY(x, w, sag) - cw * 0.035 * sc;
            const isFocus = i === li;
            const isFlipped = flipped === prod.id;
            const v = sel[prod.id] || { color: 0, size: null };
            return (
              <div
                key={prod.id}
                className={`cx2-item ${isFocus ? 'focus' : ''}`}
                style={{
                  width: cw,
                  transform: `translate(${x - cw / 2}px, ${y}px) scale(${sc})`,
                  zIndex: 10 - Math.round(Math.abs(o) * 3),
                  opacity: Math.abs(o) > 1.6 ? 0 : 1,
                }}
              >
                <div className="cx2-swing" key={isFocus ? `f${safeCur}` : 'n'}>
                  <Hanger />
                  <div className={`cx-card ${isFlipped ? 'flipped' : ''}`}>
                    <button
                      className="cx-face cx-front"
                      data-sfx="none"
                      onClick={() => {
                        if (moved.current) return;
                        isFocus ? flip(prod.id) : go(sec.start + i);
                      }}
                      aria-label={isFocus ? `${prod.name}. Tap to see details` : `Show ${prod.name}`}
                      tabIndex={isFocus && !isFlipped ? 0 : -1}
                    >
                      <GarmentArt product={prod} colorIndex={v.color} bare />
                    </button>
                    <div className="cx-face cx-back" aria-hidden={!isFlipped}>
                      <button className="cx-flip-back" data-sfx="none" onClick={() => flip(prod.id)} aria-label="Flip back" tabIndex={isFlipped ? 0 : -1}><Undo size={15} /></button>
                      <div className="cx-back-brand">{prod.brand}</div>
                      <div className="cx-back-name">{prod.name}</div>
                      <div className="cx-back-price">{money(prod.mrp)} <span>incl. all taxes</span></div>
                      <div className="cx-back-fabric">{prod.fabric}{prod.fit ? ` · ${prod.fit}` : ''}</div>
                      <div className="cx-back-label">Colour · {prod.colors[v.color]?.name}</div>
                      <div className="cx-colors">
                        {prod.colors.map((c, ci) => (
                          <button key={c.name} className={`cx-color ${ci === v.color ? 'on' : ''}`} style={{ background: c.hex }} onClick={() => pick(prod.id, { color: ci })} aria-label={c.name} aria-pressed={ci === v.color} tabIndex={isFlipped ? 0 : -1} />
                        ))}
                      </div>
                      <div className={`cx-back-label ${nudge === prod.id ? 'nudge' : ''}`}>{v.size ? `Size · ${v.size}` : 'Select size'}</div>
                      <div className={`cx-sizes ${nudge === prod.id ? 'nudge' : ''}`}>
                        {prod.sizes.map((sz) => (
                          <button key={sz} className={`cx-size ${v.size === sz ? 'on' : ''}`} onClick={() => pick(prod.id, { size: sz })} aria-pressed={v.size === sz} tabIndex={isFlipped ? 0 : -1}>{sz}</button>
                        ))}
                      </div>
                      <button className="cx-add" data-sfx="none" onClick={() => addFromBack(prod)} tabIndex={isFlipped ? 0 : -1}>Add to bag</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right-side animated, interactive dial */}
        <div
          className={`cx2-dial ${scrub ? 'scrub' : ''}`}
          ref={dialRef}
          onPointerDown={onDialDown}
          role="slider"
          aria-label="Browse products"
          aria-valuemin={1}
          aria-valuemax={all.length}
          aria-valuenow={safeCur + 1}
          aria-valuetext={`${p.name}, ${safeCur + 1} of ${all.length}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); step(1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); step(-1); }
          }}
        >
          {all.map((prod, i) => {
            const d = i - safeCur;
            if (Math.abs(d) > 9) return null;
            const bell = Math.max(0, 1 - Math.abs(d) / 7);
            const width = 14 + 22 * bell * bell + (d === 0 ? 10 : 0);
            const height = 3 + 9 * bell * bell + (d === 0 ? 3 : 0);
            const isStart = sections.some((c) => c.start === i);
            return (
              <span
                key={prod.id}
                className={`cx2-tick ${d === 0 ? 'on' : ''} ${isStart ? 'cat' : ''}`}
                style={{ width, height, transform: `translate(-50%, calc(-50% + ${d * DIAL_SPACING}px))`, opacity: 0.18 + 0.82 * bell }}
              />
            );
          })}
        </div>
        {scrub && (
          <div className="cx2-scrub-label" aria-hidden="true">
            <b>{p.name}</b>
            <span>{sec.label} · {safeCur + 1}/{all.length}</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="cx2-info" key={`info-${p.id}`}>
        <div className="cx2-swatches" role="radiogroup" aria-label="Colour">
          {p.colors.map((c, ci) => (
            <button
              key={c.name}
              role="radio"
              aria-checked={ci === s.color}
              aria-label={c.name}
              title={c.name}
              className={`cx2-sw ${ci === s.color ? 'on' : ''}`}
              style={{ background: c.hex }}
              onClick={() => pick(p.id, { color: ci })}
            />
          ))}
        </div>
        <div className="cx2-name-row">
          <button className="cx-nav" onClick={() => step(-1)} disabled={safeCur === 0} aria-label="Previous product"><Chevron size={18} /></button>
          <div className="cx2-name-block">
            <div className="cx2-name">{p.name}</div>
            <div className="cx2-hint">{flipped === p.id ? 'Pick colour & size on the back' : 'Tap to flip for details'}</div>
          </div>
          <button className="cx-nav next" onClick={() => step(1)} disabled={safeCur === all.length - 1} aria-label="Next product"><Chevron size={18} /></button>
        </div>
        <div className="cx2-price">{money(p.mrp)}</div>
      </div>

      {/* Bottom bar */}
      <footer className="cx2-bar">
        <button className="cx2-round" onClick={nav.menu} aria-label="Open menu"><Menu /></button>
        <button className="cx2-add" data-sfx="none" onClick={addFromBar}>
          Add to Cart{s.size ? ` · ${s.size}` : ''}
        </button>
        <button className="cx2-round" ref={bagRef} onClick={() => nav.go('c-bag')} aria-label={`Bag, ${bagCount} items`}>
          <Bag />
          {bagCount > 0 && <span className="badge" key={bagCount}>{bagCount}</span>}
        </button>
      </footer>

      {/* Size picker sheet */}
      {sheet && (() => {
        const sp = all.find((x) => x.id === sheet);
        const v = sel[sheet] || { color: 0, size: null };
        return (
          <div className="cx2-sheet-scrim" onClick={() => setSheet(null)}>
            <div className="cx2-sheet" role="dialog" aria-modal="true" aria-label={`Choose size for ${sp.name}`} onClick={(e) => e.stopPropagation()}>
              <div className="cx2-sheet-head">
                <span className="cx2-sheet-art"><GarmentArt product={sp} colorIndex={v.color} /></span>
                <div className="grow">
                  <b>{sp.name}</b>
                  <div className="muted small">{money(sp.mrp)} · {sp.colors[v.color]?.name}</div>
                </div>
                <button className="icon-btn xs" onClick={() => setSheet(null)} aria-label="Close"><X size={14} /></button>
              </div>
              <div className="cx-back-label">Colour</div>
              <div className="cx-colors">
                {sp.colors.map((c, ci) => (
                  <button key={c.name} className={`cx-color ${ci === v.color ? 'on' : ''}`} style={{ background: c.hex }} onClick={() => pick(sp.id, { color: ci })} aria-label={c.name} aria-pressed={ci === v.color} />
                ))}
              </div>
              <div className="cx-back-label">Size</div>
              <div className="cx-sizes">
                {sp.sizes.map((sz) => (
                  <button key={sz} className={`cx-size ${v.size === sz ? 'on' : ''}`} onClick={() => pick(sp.id, { size: sz })} aria-pressed={v.size === sz}>{sz}</button>
                ))}
              </div>
              <button
                className="btn primary wide"
                data-sfx="none"
                disabled={!v.size}
                onClick={() => { setSheet(null); addToBag(sp, v.color, v.size); }}
              >
                {v.size ? `Add size ${v.size} to cart` : 'Select a size'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Add-to-bag fly animation */}
      {fly && (
        <div
          className={`cx2-fly ${fly.go ? 'go' : ''}`}
          aria-hidden="true"
          style={{
            left: fly.x, top: fly.y, width: fly.w, height: fly.h,
            '--tx': `${fly.tx - fly.x - fly.w / 2}px`, '--ty': `${fly.ty - fly.y - fly.h / 2}px`,
          }}
        >
          <GarmentArt product={fly.prod} colorIndex={fly.colorIdx} bare />
        </div>
      )}
    </div>
  );
}
