import React, { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/catalog.js';
import { Check, X } from './Icons.jsx';

/** Bottom sheet holding category + quick filters. Changes apply on "Show". */
export default function FilterSheet({ category, filters, options, countFor, onApply, onClose }) {
  const [cat, setCat] = useState(category);
  const [sel, setSel] = useState(filters);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (id) => setSel((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const count = countFor(cat, sel);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet filter-sheet" role="dialog" aria-modal="true" aria-label="Filters" onClick={(e) => e.stopPropagation()}>
        <div className="filter-head">
          <h2>Filters</h2>
          <button className="text-btn" onClick={() => { setCat('all'); setSel([]); }}>Reset</button>
          <button className="icon-btn" onClick={onClose} aria-label="Close filters"><X size={18} /></button>
        </div>

        <div className="sheet-scroll filter-body">
          <h3 className="filter-label">Category</h3>
          <div className="option-grid">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`option ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}>
                {c.label}
                <span className="option-count">{countFor(c.id, sel)}</span>
              </button>
            ))}
          </div>

          <h3 className="filter-label">Buying criteria</h3>
          <div className="toggle-list">
            {options.map((f) => (
              <button key={f.id} className={`toggle-row ${sel.includes(f.id) ? 'on' : ''}`} onClick={() => toggle(f.id)} aria-pressed={sel.includes(f.id)}>
                <span className="grow">
                  {f.label}
                  <span className="muted small block">{f.hint}</span>
                </span>
                <span className="checkbox">{sel.includes(f.id) && <Check size={14} sw={3} />}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-footer">
          <button className="btn primary wide" onClick={() => onApply(cat, sel)} disabled={count === 0}>
            {count === 0 ? 'No styles match' : `Show ${count} style${count > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
