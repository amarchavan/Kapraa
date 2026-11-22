import React, { useMemo, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SwipeCard from '../components/SwipeCard.jsx';
import { CATEGORIES, COLOR_PALETTE, PATTERNS, TAGS, productById, sizePresetFor } from '../data/catalog.js';
import { useStore } from '../store/StoreContext.jsx';
import { compressImage } from '../utils/images.js';
import { money } from '../utils/pricing.js';
import { Check, Plus, X } from '../components/Icons.jsx';

const MAX_PHOTOS = 4;
const EMPTY = {
  name: '', brand: '', category: '', price: '', mrp: '', moq: '', stock: '',
  fabric: '', fit: '', sizes: [], colors: [], pattern: 'solid', tags: ['New'], images: [],
};

const toForm = (p) => ({ ...EMPTY, ...p, price: String(p.price), mrp: String(p.mrp), moq: String(p.moq), stock: String(p.stock), images: p.images || [] });

function validate(f) {
  const e = {};
  if (f.name.trim().length < 3) e.name = 'Enter a product name';
  if (!f.category) e.category = 'Pick a category';
  const price = Number(f.price), mrp = Number(f.mrp);
  if (!(price > 0)) e.price = 'Enter wholesale price';
  if (!(mrp > 0)) e.mrp = 'Enter MRP';
  else if (price > 0 && mrp <= price) e.mrp = 'MRP must be higher than wholesale price';
  if (!(Number(f.moq) >= 1)) e.moq = 'Minimum 1 piece';
  if (f.stock === '' || Number(f.stock) < 0) e.stock = 'Enter stock (0 if made to order)';
  if (!f.sizes.length) e.sizes = 'Select at least one size';
  if (!f.colors.length) e.colors = 'Select at least one colour';
  if (!f.fabric.trim()) e.fabric = 'Enter the fabric';
  return e;
}

export default function ProductForm({ nav, editId }) {
  const { state, dispatch } = useStore();
  const existing = editId ? productById(editId) : null;
  const [f, setF] = useState(() => (existing ? toForm(existing) : EMPTY));
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState({ name: '', hex: '#c0392b' });
  const fileRef = useRef(null);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggleIn = (k, v, eq = (a, b) => a === b) => setF((x) => ({ ...x, [k]: x[k].some((y) => eq(y, v)) ? x[k].filter((y) => !eq(y, v)) : [...x[k], v] }));
  const errors = validate(f);
  const err = (k) => touched && errors[k] && <span className="field-error">{errors[k]}</span>;

  const presets = sizePresetFor(f.category);
  const sizeOptions = [...presets, ...f.sizes.filter((s) => !presets.includes(s))];
  const orderedSizes = (sizes) => [...sizes].sort((a, b) => {
    const ia = sizeOptions.indexOf(a), ib = sizeOptions.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  const margin = Number(f.mrp) > Number(f.price) && Number(f.price) > 0 ? Math.round(((f.mrp - f.price) / f.mrp) * 100) : null;

  const preview = useMemo(
    () => ({
      id: 'preview',
      supplierId: state.supplierId,
      name: f.name || 'Your product name',
      brand: f.brand || 'Brand',
      category: f.category || 'kurti',
      price: Number(f.price) || 0,
      mrp: Number(f.mrp) || Number(f.price) || 1,
      moq: Number(f.moq) || 1,
      stock: Number(f.stock) || 0,
      fabric: f.fabric || 'Fabric',
      fit: f.fit,
      sizes: f.sizes.length ? orderedSizes(f.sizes) : ['—'],
      colors: f.colors.length ? f.colors : [{ name: 'Colour', hex: '#cfc6b6' }],
      pattern: f.pattern,
      tags: f.tags,
      images: f.images,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f, state.supplierId]
  );

  const addPhotos = async (files) => {
    const list = Array.from(files || []).slice(0, MAX_PHOTOS - f.images.length);
    if (!list.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const file of list) urls.push(await compressImage(file));
      setF((x) => ({ ...x, images: [...x.images, ...urls].slice(0, MAX_PHOTOS) }));
    } catch {
      nav.notify("Couldn't read that image");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = (active) => {
    setTouched(true);
    if (Object.keys(errors).length) {
      nav.notify('Fix the highlighted fields');
      requestAnimationFrame(() => document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    const product = {
      ...(existing || {}),
      id: existing?.id || `u${Date.now().toString(36)}`,
      supplierId: existing?.supplierId || state.supplierId,
      createdAt: existing?.createdAt || Date.now(),
      sold30d: existing?.sold30d || 0,
      name: f.name.trim(),
      brand: f.brand.trim() || 'Unbranded',
      category: f.category,
      price: Math.round(Number(f.price)),
      mrp: Math.round(Number(f.mrp)),
      moq: Math.round(Number(f.moq)),
      stock: Math.round(Number(f.stock)),
      fabric: f.fabric.trim(),
      fit: f.fit.trim() || 'Regular',
      sizes: orderedSizes(f.sizes),
      colors: f.colors,
      pattern: f.pattern,
      tags: f.tags,
      images: f.images,
      active,
    };
    dispatch({ type: 'saveProduct', product });
    nav.notify(active ? (existing ? 'Changes are live' : 'Published to retailers') : 'Saved as hidden');
    nav.go('w-catalog');
  };

  return (
    <div className="page with-footer product-form">
      <PageHeader title={existing ? 'Edit product' : 'Upload product'} onBack={() => nav.go('w-catalog')} />

      {/* Photos */}
      <section className="card">
        <h3>Photos <span className="opt">{f.images.length}/{MAX_PHOTOS}</span></h3>
        <div className="photo-grid">
          {f.images.map((src, i) => (
            <div key={i} className="photo-tile">
              <img src={src} alt={`Photo ${i + 1}`} />
              {i === 0 && <span className="cover-tag">Cover</span>}
              <button className="photo-remove" data-sfx="remove" onClick={() => set('images', f.images.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}><X size={14} sw={3} /></button>
            </div>
          ))}
          {f.images.length < MAX_PHOTOS && (
            <label className={`photo-tile add ${busy ? 'busy' : ''}`}>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => addPhotos(e.target.files)} />
              <Plus size={22} />
              <span>{busy ? 'Adding…' : 'Add photo'}</span>
            </label>
          )}
        </div>
        <p className="muted small">Plain background, full garment visible. Without photos, retailers see a drawn preview in your colours.</p>
      </section>

      {/* Basics */}
      <section className="card">
        <h3>Basics</h3>
        <label className="field">
          <span>Product name *</span>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rayon Printed A-line Kurti" maxLength={60} />
          {err('name')}
        </label>
        <label className="field">
          <span>Brand</span>
          <input value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Your label or 'Unbranded'" maxLength={30} />
        </label>
        <div className="field">
          <span>Category *</span>
          <div className="pick-chips">
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <button
                key={c.id}
                className={`pick ${f.category === c.id ? 'on' : ''}`}
                aria-pressed={f.category === c.id}
                onClick={() => setF((x) => ({ ...x, category: c.id, sizes: x.category && sizePresetFor(x.category) !== sizePresetFor(c.id) ? [] : x.sizes }))}
              >
                {c.label}
              </button>
            ))}
          </div>
          {err('category')}
        </div>
      </section>

      {/* Pricing & stock */}
      <section className="card">
        <h3>Price &amp; stock</h3>
        <div className="field-grid">
          <label className="field">
            <span>Wholesale price / pc *</span>
            <div className="input-affix"><em>₹</em><input inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))} placeholder="0" /></div>
            {err('price')}
          </label>
          <label className="field">
            <span>MRP / pc *</span>
            <div className="input-affix"><em>₹</em><input inputMode="numeric" value={f.mrp} onChange={(e) => set('mrp', e.target.value.replace(/\D/g, ''))} placeholder="0" /></div>
            {err('mrp')}
          </label>
          <label className="field">
            <span>MOQ (pieces) *</span>
            <input inputMode="numeric" value={f.moq} onChange={(e) => set('moq', e.target.value.replace(/\D/g, ''))} placeholder="e.g. 12" />
            {err('moq')}
          </label>
          <label className="field">
            <span>Stock (pieces) *</span>
            <input inputMode="numeric" value={f.stock} onChange={(e) => set('stock', e.target.value.replace(/\D/g, ''))} placeholder="e.g. 500" />
            {err('stock')}
          </label>
        </div>
        {margin !== null && (
          <p className="margin-hint">
            Retailer margin <b>{margin}%</b>
            {f.sizes.length > 0 && <> · 1 set ({f.sizes.length} pcs) = <b>{money(f.price * f.sizes.length)}</b></>}
          </p>
        )}
      </section>

      {/* Sizes */}
      <section className="card">
        <h3>Sizes *</h3>
        <p className="muted small field-help">Retailers buy in sets: 1 set = 1 piece of each size you select.</p>
        <div className="pick-chips">
          {sizeOptions.map((s) => (
            <button key={s} className={`pick size ${f.sizes.includes(s) ? 'on' : ''}`} aria-pressed={f.sizes.includes(s)} onClick={() => toggleIn('sizes', s)}>{s}</button>
          ))}
        </div>
        <div className="inline-add">
          <input value={customSize} onChange={(e) => setCustomSize(e.target.value.toUpperCase().slice(0, 8))} placeholder="Other size, e.g. 4XL or Free" />
          <button
            className="chip-btn"
            disabled={!customSize.trim() || f.sizes.includes(customSize.trim())}
            onClick={() => {
              set('sizes', [...f.sizes, customSize.trim()]);
              setCustomSize('');
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {err('sizes')}
      </section>

      {/* Colours */}
      <section className="card">
        <h3>Colours * <span className="opt">{f.colors.length} selected</span></h3>
        <div className="palette">
          {[...COLOR_PALETTE, ...f.colors.filter((c) => !COLOR_PALETTE.some((p) => p.name === c.name))].map((c) => {
            const on = f.colors.some((x) => x.name === c.name);
            return (
              <button key={c.name} className={`palette-item ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleIn('colors', c, (a, b) => a.name === b.name)}>
                <span className="palette-dot" style={{ background: c.hex }}>{on && <Check size={13} sw={3.2} />}</span>
                {c.name}
              </button>
            );
          })}
        </div>
        <div className="inline-add">
          <input type="color" value={customColor.hex} onChange={(e) => setCustomColor((c) => ({ ...c, hex: e.target.value }))} aria-label="Pick custom colour" />
          <input value={customColor.name} onChange={(e) => setCustomColor((c) => ({ ...c, name: e.target.value.slice(0, 20) }))} placeholder="Custom colour name" />
          <button
            className="chip-btn"
            disabled={!customColor.name.trim() || f.colors.some((c) => c.name.toLowerCase() === customColor.name.trim().toLowerCase())}
            onClick={() => {
              set('colors', [...f.colors, { name: customColor.name.trim(), hex: customColor.hex }]);
              setCustomColor({ name: '', hex: customColor.hex });
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {err('colors')}
      </section>

      {/* Material */}
      <section className="card">
        <h3>Fabric &amp; fit</h3>
        <label className="field">
          <span>Fabric *</span>
          <input value={f.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. Pure cotton cambric 60×60" maxLength={50} />
          {err('fabric')}
        </label>
        <label className="field">
          <span>Fit / length</span>
          <input value={f.fit} onChange={(e) => set('fit', e.target.value)} placeholder="e.g. Straight, knee length" maxLength={40} />
        </label>
        <div className="field">
          <span>Print / pattern</span>
          <div className="pick-chips">
            {PATTERNS.map((p) => (
              <button key={p} className={`pick ${f.pattern === p ? 'on' : ''}`} aria-pressed={f.pattern === p} onClick={() => set('pattern', p)}>{p[0].toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Labels</span>
          <div className="pick-chips">
            {TAGS.map((t) => (
              <button key={t} className={`pick ${f.tags.includes(t) ? 'on' : ''}`} aria-pressed={f.tags.includes(t)} onClick={() => toggleIn('tags', t)}>{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section className="card">
        <h3>Preview · what retailers see</h3>
        <div className="preview-deck">
          <SwipeCard product={preview} depth={0} onSwipe={() => {}} onOpen={() => {}} fling={null} />
        </div>
      </section>

      <div className="page-footer">
        <button className="btn ghost" onClick={() => save(false)}>Save hidden</button>
        <button className="btn primary" data-sfx="success" onClick={() => save(true)}>{existing ? 'Save & publish' : 'Publish'}</button>
      </div>
    </div>
  );
}
