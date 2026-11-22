import PageHeader from '../components/PageHeader.jsx';
import React from 'react';
import GarmentArt from '../components/GarmentArt.jsx';
import { productById, SUPPLIERS } from '../data/catalog.js';
import { useStore } from '../store/StoreContext.jsx';
import { margin, money, sizeRange } from '../utils/pricing.js';
import { Chevron, X } from '../components/Icons.jsx';

// best: 'min' | 'max' highlights the winning column for that row
const ROWS = [
  { label: 'Wholesale', get: (p) => p.price, fmt: money, best: 'min' },
  { label: 'MRP', get: (p) => p.mrp, fmt: money },
  { label: 'Margin', get: (p) => margin(p), fmt: (v) => `${Math.round(v * 100)}%`, best: 'max' },
  { label: 'MOQ', get: (p) => p.moq, fmt: (v) => `${v} pcs`, best: 'min' },
  { label: 'Fabric', get: (p) => p.fabric },
  { label: 'Fit', get: (p) => p.fit },
  { label: 'Sizes', get: (p) => sizeRange(p) },
  { label: 'Colours', get: (p) => p.colors.length, best: 'max' },
  { label: 'Stock', get: (p) => p.stock, fmt: (v) => v.toLocaleString('en-IN'), best: 'max' },
  { label: 'Sold · 30d', get: (p) => p.sold30d, fmt: (v) => v.toLocaleString('en-IN'), best: 'max' },
  { label: 'Supplier', get: (p) => SUPPLIERS[p.supplierId].name },
  { label: 'Rating', get: (p) => SUPPLIERS[p.supplierId].rating, fmt: (v) => `★ ${v}`, best: 'max' },
  { label: 'Dispatch', get: (p) => SUPPLIERS[p.supplierId].dispatchDays, fmt: (v) => `${v} days`, best: 'min' },
];

export default function Compare({ nav }) {
  const { state, dispatch } = useStore();
  const items = state.compare.map(productById).filter(Boolean);

  return (
    <div className="page compare">
      <PageHeader title="Compare" onBack={() => nav.go('shortlist')} />

      {items.length < 2 ? (
        <div className="empty">
          <h3>Pick at least 2 styles</h3>
          <button className="btn" onClick={() => nav.go('shortlist')}>Back to shortlist</button>
        </div>
      ) : (
        <div className="compare-scroll">
          <table className="compare-table" style={{ '--cols': items.length }}>
            <thead>
              <tr>
                <th />
                {items.map((p) => (
                  <th key={p.id}>
                    <div className="cmp-head">
                      <button className="icon-btn xs cmp-remove" onClick={() => dispatch({ type: 'toggleCompare', id: p.id })} aria-label="Remove"><X size={14} /></button>
                      <GarmentArt product={p} />
                      <div className="cmp-name">{p.name}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const vals = items.map(r.get);
                const target = r.best === 'min' ? Math.min(...vals) : r.best === 'max' ? Math.max(...vals) : null;
                return (
                  <tr key={r.label}>
                    <th>{r.label}</th>
                    {items.map((p, i) => (
                      <td key={p.id} className={target !== null && vals[i] === target ? 'best' : ''}>{r.fmt ? r.fmt(vals[i]) : vals[i]}</td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <th />
                {items.map((p) => (
                  <td key={p.id}>
                    <button className="btn primary sm" onClick={() => nav.open(p.id)}>{state.cart[p.id] ? 'Edit qty' : 'Add'}</button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="muted small legend"><span className="best-swatch" /> best in row</p>
        </div>
      )}
    </div>
  );
}
