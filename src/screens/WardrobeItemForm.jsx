import React, { useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import WardrobeArt from '../components/WardrobeArt.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { FABRICS, GROUPS, OCCASIONS, PATTERNS, TYPES, W_COLORS, typeById } from '../data/wardrobe.js';
import { recognizeItem } from '../utils/recognize.js';
import { compressImage } from '../utils/images.js';
import { Camera, Check, Heart, Trash, X } from '../components/Icons.jsx';

const EMPTY = { type: '', name: '', colors: [], pattern: 'solid', occasions: [], favourite: false, image: null, fabric: '', price: '' };

export default function WardrobeItemForm({ nav, param }) {
  const { state, dispatch } = useStore();
  const existing = param ? state.wardrobe.find((w) => w.id === param) : null;
  const [f, setF] = useState(() => (existing ? { ...EMPTY, ...existing, price: existing.price ?? '' } : EMPTY));
  const [kind, setKind] = useState(() => (existing ? GROUPS[typeById(existing.type)?.group]?.kind : 'cloth'));
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState(null);
  const [touched, setTouched] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const type = typeById(f.type);
  const autoName = type && f.colors.length ? `${f.colors[0]} ${type.label.split(' /')[0].toLowerCase()}` : '';
  const errors = { type: !f.type && 'Pick what kind of item this is', colors: !f.colors.length && 'Pick at least one colour' };
  const valid = !errors.type && !errors.colors;

  const pickType = (t) =>
    setF((x) => ({
      ...x,
      type: t.id,
      // seed occasions from the type the first time
      occasions: x.occasions.length ? x.occasions : t.style.slice(0, 2),
      pattern: t.id === 'jeans' && x.pattern === 'solid' ? 'denim' : x.pattern,
    }));

  const toggleColor = (name) =>
    setF((x) => ({ ...x, colors: x.colors.includes(name) ? x.colors.filter((c) => c !== name) : [...x.colors, name].slice(-2) }));

  const onPhoto = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await compressImage(file, 700, 0.78);
      setF((x) => ({ ...x, image: url }));
      const r = await recognizeItem(url).catch(() => null);
      if (r) {
        // fill what the user hasn't set yet; colours always follow the new photo
        setF((x) => ({
          ...x,
          type: x.type || r.type,
          colors: r.colors,
          pattern: x.type ? x.pattern : r.pattern,
          fabric: x.fabric || r.fabric,
          occasions: x.occasions.length ? x.occasions : r.occasions,
          name: x.name || (r.source === 'claude' ? r.name : ''),
        }));
        if (!f.type) setKind(GROUPS[typeById(r.type).group].kind);
        setDetected(r);
      }
    } catch {
      nav.notify("Couldn't read that photo");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = () => {
    setTouched(true);
    if (!valid) return nav.notify('Pick a type and a colour');
    const item = {
      ...f,
      id: existing?.id || `w${Date.now().toString(36)}`,
      addedAt: existing?.addedAt || Date.now(),
      name: f.name.trim() || autoName,
      pattern: kind === 'cloth' ? f.pattern : 'solid',
      fabric: FABRICS[kind].includes(f.fabric) ? f.fabric : '',
      price: f.price === '' ? '' : Number(f.price),
    };
    dispatch({ type: 'wSave', item });
    nav.notify(existing ? 'Item updated' : 'Added to wardrobe');
    nav.go('c-wstyle', item.id);
  };

  const preview = { ...f, type: f.type || (kind === 'cloth' ? 'tshirt' : 'watch'), colors: f.colors.length ? f.colors : ['Grey Melange'], name: f.name || autoName || 'New item' };

  return (
    <div className="page with-footer">
      <PageHeader title={existing ? 'Edit item' : 'Add to wardrobe'} onBack={() => nav.go(existing ? 'c-wstyle' : 'c-wardrobe', existing?.id)} />

      {/* Photo + preview */}
      <section className="card w-photo-card">
        <div className="w-photo">
          <WardrobeArt item={preview} />
          {f.image && (
            <button className="photo-remove" data-sfx="remove" onClick={() => { set('image', null); setDetected(null); }} aria-label="Remove photo"><X size={14} sw={3} /></button>
          )}
        </div>
        <div className="grow">
          <label className={`btn ${f.image ? 'ghost' : 'primary'} sm upload-btn ${busy ? 'busy' : ''}`}>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <Camera size={16} /> {busy ? 'Reading photo…' : f.image ? 'Change photo' : 'Add photo'}
          </label>
          <p className="muted small" style={{ marginTop: 8 }}>
            {detected ? (
              <>
                <span className={`src-badge ${detected.source}`}>{detected.source === 'claude' ? 'Recognised by Claude' : 'Quick guess'}</span>{' '}
                <b>{typeById(detected.type)?.label}</b> in <b>{detected.colors.join(' & ')}</b>
                {detected.fabric ? <>, {detected.fabric.toLowerCase()}</> : null}. Check it below.
              </>
            ) : (
              "Optional. We'll recognise the type, colour and fabric from the photo."
            )}
          </p>
        </div>
      </section>

      {/* Type */}
      <section className="card">
        <div className="seg">
          {[['cloth', 'Clothing'], ['accessory', 'Accessory']].map(([k, label]) => (
            <button key={k} className={kind === k ? 'on' : ''} onClick={() => { setKind(k); if (type && GROUPS[type.group].kind !== k) set('type', ''); }}>{label}</button>
          ))}
        </div>
        {Object.entries(GROUPS).filter(([, g]) => g.kind === kind).map(([gid, g]) => (
          <div key={gid} className="type-group">
            <span className="type-group-label">{g.label}</span>
            <div className="pick-chips">
              {TYPES.filter((t) => t.group === gid).map((t) => (
                <button key={t.id} className={`pick ${f.type === t.id ? 'on' : ''}`} aria-pressed={f.type === t.id} onClick={() => pickType(t)}>{t.label}</button>
              ))}
            </div>
          </div>
        ))}
        {touched && errors.type && <span className="field-error">{errors.type}</span>}
      </section>

      {/* Colours */}
      <section className="card">
        <h3>Colour <span className="opt">main{f.colors.length > 1 ? ' + accent' : ''} · up to 2</span></h3>
        <div className="w-colors">
          {W_COLORS.map((c) => {
            const i = f.colors.indexOf(c.name);
            return (
              <button key={c.name} className={`w-color ${i >= 0 ? 'on' : ''}`} onClick={() => toggleColor(c.name)} aria-pressed={i >= 0} title={c.name}>
                <span className="palette-dot" style={{ background: c.hex }}>{i >= 0 && (i === 0 ? <Check size={13} sw={3.2} /> : <b>2</b>)}</span>
                <span className="w-color-name">{c.name}</span>
              </button>
            );
          })}
        </div>
        {touched && errors.colors && <span className="field-error">{errors.colors}</span>}
      </section>

      {kind === 'cloth' && (
        <section className="card">
          <h3>Pattern</h3>
          <div className="pick-chips">
            {PATTERNS.map((p) => (
              <button key={p.id} className={`pick ${f.pattern === p.id ? 'on' : ''}`} aria-pressed={f.pattern === p.id} onClick={() => set('pattern', p.id)}>{p.label}</button>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h3>{kind === 'cloth' ? 'Fabric' : 'Material'} &amp; price</h3>
        <div className="pick-chips">
          {FABRICS[kind].map((fb) => (
            <button key={fb} className={`pick ${f.fabric === fb ? 'on' : ''}`} aria-pressed={f.fabric === fb} onClick={() => set('fabric', f.fabric === fb ? '' : fb)}>{fb}</button>
          ))}
        </div>
        <label className="field" style={{ marginTop: 14 }}>
          <span>Purchase price</span>
          <div className="input-affix"><em>₹</em><input inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="What you paid (optional)" /></div>
        </label>
      </section>

      <section className="card">
        <h3>Wear it for</h3>
        <div className="pick-chips">
          {OCCASIONS.map((o) => {
            const on = f.occasions.includes(o.id);
            return (
              <button key={o.id} className={`pick ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => set('occasions', on ? f.occasions.filter((x) => x !== o.id) : [...f.occasions, o.id])}>{o.label}</button>
            );
          })}
        </div>
        <label className="field" style={{ marginTop: 14 }}>
          <span>Name (optional)</span>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder={autoName || 'e.g. Blue linen shirt'} maxLength={40} />
        </label>
        <button className={`pill-toggle ${f.favourite ? 'on' : ''}`} onClick={() => set('favourite', !f.favourite)}>
          <Heart size={16} fill={f.favourite ? 'currentColor' : 'none'} /> {f.favourite ? 'Favourite' : 'Mark as favourite'}
        </button>
      </section>

      {existing && (
        <button
          className={`btn ghost wide danger-text ${confirmDel ? 'confirm' : ''}`}
          data-sfx={confirmDel ? 'remove' : undefined}
          onClick={() => {
            if (!confirmDel) return setConfirmDel(true);
            dispatch({ type: 'wDelete', id: existing.id });
            nav.notify('Removed from wardrobe');
            nav.go('c-wardrobe');
          }}
        >
          <Trash size={15} /> {confirmDel ? 'Tap again to remove' : 'Remove from wardrobe'}
        </button>
      )}

      <div className="page-footer">
        <button className="btn ghost" onClick={() => nav.go(existing ? 'c-wstyle' : 'c-wardrobe', existing?.id)}>Cancel</button>
        <button className="btn primary" data-sfx="success" onClick={save}>{existing ? 'Save changes' : 'Add to wardrobe'}</button>
      </div>
    </div>
  );
}
