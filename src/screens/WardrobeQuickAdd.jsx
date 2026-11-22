import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import WardrobeArt from '../components/WardrobeArt.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { FABRICS, GROUPS, PATTERNS, TYPES, W_COLORS, colorByName, typeById } from '../data/wardrobe.js';
import { compressImage } from '../utils/images.js';
import { recognizeItem, visionAvailable } from '../utils/recognize.js';
import { Camera, Check, Plus, Sparkle, X } from '../components/Icons.jsx';

const MAX_BATCH = 12;
const kindOfType = (type) => GROUPS[typeById(type)?.group]?.kind ?? 'cloth';

/** Fast batch entry: photos in → recognised drafts → quick check → save all. */
export default function WardrobeQuickAdd({ nav }) {
  const { dispatch } = useStore();
  const [drafts, setDrafts] = useState([]);
  const [vision, setVision] = useState(null); // null = checking
  const queue = useRef(Promise.resolve());
  const camRef = useRef(null);
  const pickRef = useRef(null);

  useEffect(() => {
    let alive = true;
    visionAvailable().then((v) => alive && setVision(v));
    return () => {
      alive = false;
    };
  }, []);

  const patch = (key, p) => setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...p } : d)));

  const addFiles = async (files) => {
    const list = Array.from(files || []).slice(0, Math.max(0, MAX_BATCH - drafts.length));
    if (!list.length) return;
    for (const file of list) {
      const key = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      let image;
      try {
        image = await compressImage(file, 700, 0.78);
      } catch {
        nav.notify("Couldn't read one of the photos");
        continue;
      }
      setDrafts((ds) => [...ds, { key, image, status: 'reading', type: 'tshirt', colors: ['Grey Melange'], pattern: 'solid', fabric: '', occasions: [], name: '', price: '' }]);
      // recognise one at a time (keeps the device and the AI quota happy)
      queue.current = queue.current.then(async () => {
        try {
          const r = await recognizeItem(image);
          patch(key, { ...r, name: r.source === 'claude' ? r.name : '', status: 'ready' });
        } catch {
          patch(key, { status: 'ready', source: 'none', confidence: 0 });
        }
      });
    }
    if (camRef.current) camRef.current.value = '';
    if (pickRef.current) pickRef.current.value = '';
  };

  const ready = drafts.filter((d) => d.status === 'ready');
  const reading = drafts.length - ready.length;

  const saveAll = () => {
    const items = ready.map((d, i) => {
      const t = typeById(d.type);
      const kind = kindOfType(d.type);
      return {
        id: `w${Date.now().toString(36)}${i}`,
        type: d.type,
        name: d.name.trim() || `${d.colors[0]} ${t.label.split(' /')[0].toLowerCase()}`,
        colors: d.colors,
        pattern: kind === 'cloth' ? d.pattern : 'solid',
        fabric: FABRICS[kind].includes(d.fabric) ? d.fabric : '',
        price: d.price === '' ? '' : Number(d.price),
        occasions: d.occasions?.length ? d.occasions : t.style.slice(0, 2),
        favourite: false,
        image: d.image,
        addedAt: Date.now() - i,
      };
    });
    dispatch({ type: 'wLoad', items });
    nav.notify(`${items.length} item${items.length > 1 ? 's' : ''} added`);
    nav.go('c-wardrobe');
  };

  return (
    <div className="page with-footer quick-add">
      <PageHeader title="Quick add" onBack={() => nav.go('c-wardrobe')} />

      <section className="card qa-intro">
        <div className="qa-actions">
          <label className="qa-btn primary">
            <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={(e) => addFiles(e.target.files)} />
            <Camera size={22} />
            <span>Take photo</span>
          </label>
          <label className="qa-btn">
            <input ref={pickRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
            <Plus size={22} />
            <span>Choose photos</span>
          </label>
        </div>
        <p className="muted small">
          One item per photo, laid flat or hung on a plain background. We fill in the <b>category, colours, pattern and fabric</b>. You just check and add the price. Up to {MAX_BATCH} at a time.
        </p>
        <button className="text-btn qa-manual" onClick={() => nav.go('c-wadd')}>Or add one item manually</button>
        <p className={`engine ${vision ? 'on' : ''}`}>
          <Sparkle size={13} />
          {vision === null ? 'Checking recognition…' : vision ? 'Claude vision recognition is on' : 'On-device recognition: instant and offline, but double-check the category'}
        </p>
      </section>

      {drafts.map((d) => {
        const kind = kindOfType(d.type);
        return (
          <section key={d.key} className={`card qa-draft ${d.status}`}>
            <div className="qa-thumb">
              <WardrobeArt item={{ ...d, name: d.name || 'New item' }} />
              {d.status === 'reading' && <span className="qa-reading"><span className="spinner" /> Reading…</span>}
            </div>
            <div className="qa-fields">
              <div className="qa-top">
                {d.status === 'ready' ? (
                  <span className={`src-badge ${d.source}`}>
                    {d.source === 'claude' ? <><Check size={11} sw={3} /> Claude</> : d.source === 'device' ? 'Quick guess' : 'Fill in'}
                    {d.confidence ? ` · ${Math.round(d.confidence * 100)}%` : ''}
                  </span>
                ) : (
                  <span className="src-badge">Analysing</span>
                )}
                <button className="icon-btn xs" data-sfx="remove" onClick={() => setDrafts((ds) => ds.filter((x) => x.key !== d.key))} aria-label="Remove this photo"><X size={13} /></button>
              </div>

              <label className="qa-field">
                <span>Category</span>
                <select value={d.type} disabled={d.status !== 'ready'} onChange={(e) => patch(d.key, { type: e.target.value, occasions: [] })}>
                  {Object.entries(GROUPS).map(([gid, g]) => (
                    <optgroup key={gid} label={g.label}>
                      {TYPES.filter((t) => t.group === gid).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>

              <div className="qa-row">
                <label className="qa-field">
                  <span>Colour</span>
                  <div className="qa-colour">
                    <i style={{ background: colorByName(d.colors[0])?.hex }} />
                    <select value={d.colors[0]} disabled={d.status !== 'ready'} onChange={(e) => patch(d.key, { colors: [e.target.value, ...d.colors.slice(1).filter((c) => c !== e.target.value)] })}>
                      {W_COLORS.map((c) => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </label>
                <label className="qa-field">
                  <span>Accent</span>
                  <div className="qa-colour">
                    <i style={{ background: d.colors[1] ? colorByName(d.colors[1])?.hex : 'transparent' }} className={d.colors[1] ? '' : 'none'} />
                    <select value={d.colors[1] || ''} disabled={d.status !== 'ready'} onChange={(e) => patch(d.key, { colors: e.target.value ? [d.colors[0], e.target.value] : [d.colors[0]] })}>
                      <option value="">None</option>
                      {W_COLORS.filter((c) => c.name !== d.colors[0]).map((c) => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </label>
              </div>

              <div className="qa-row">
                {kind === 'cloth' && (
                  <label className="qa-field">
                    <span>Pattern</span>
                    <select value={d.pattern} disabled={d.status !== 'ready'} onChange={(e) => patch(d.key, { pattern: e.target.value })}>
                      {PATTERNS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </label>
                )}
                <label className="qa-field">
                  <span>{kind === 'cloth' ? 'Fabric' : 'Material'}</span>
                  <select value={FABRICS[kind].includes(d.fabric) ? d.fabric : ''} disabled={d.status !== 'ready'} onChange={(e) => patch(d.key, { fabric: e.target.value })}>
                    <option value="">Not sure</option>
                    {FABRICS[kind].map((fb) => <option key={fb}>{fb}</option>)}
                  </select>
                </label>
              </div>

              <div className="qa-row">
                <label className="qa-field">
                  <span>Price paid</span>
                  <div className="input-affix sm"><em>₹</em><input inputMode="numeric" value={d.price} onChange={(e) => patch(d.key, { price: e.target.value.replace(/\D/g, '').slice(0, 7) })} placeholder="0" /></div>
                </label>
                <label className="qa-field">
                  <span>Name</span>
                  <input value={d.name} onChange={(e) => patch(d.key, { name: e.target.value })} placeholder={`${d.colors[0]} ${typeById(d.type)?.label.split(' /')[0].toLowerCase()}`} maxLength={40} />
                </label>
              </div>
            </div>
          </section>
        );
      })}

      {drafts.length === 0 && (
        <div className="qa-empty muted small">Your photos will appear here as ready-to-save cards.</div>
      )}

      <div className="page-footer">
        <div>
          <div className="small muted">{reading ? `${reading} still reading…` : drafts.length ? 'All checked?' : 'No photos yet'}</div>
          <div className="footer-amount">{ready.length} ready</div>
        </div>
        <button className="btn primary" data-sfx="success" disabled={!ready.length || reading > 0} onClick={saveAll}>
          {ready.length ? `Add ${ready.length} to wardrobe` : 'Add to wardrobe'}
        </button>
      </div>
    </div>
  );
}
