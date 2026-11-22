import React from 'react';
import { matrixPieces } from '../utils/pricing.js';
import { Minus, Plus } from './Icons.jsx';

/**
 * Set-based quantity picker. Retailers order whole size sets per colour:
 * 1 set = 1 pc of every available size. Stored as { [colorName]: { [size]: qty } }
 * so pricing/order code stays unchanged.
 */
export const setsOf = (row = {}) => {
  const v = Object.values(row).map(Number);
  return v.length ? Math.min(...v) : 0;
};

export default function QuantityMatrix({ product, value, onChange }) {
  const perSet = product.sizes.length;
  const sets = (color) => {
    const row = value[color];
    return row ? setsOf(row) : 0;
  };
  const setSets = (color, n) => {
    const next = { ...value };
    const count = Math.max(0, Math.min(999, n));
    if (count === 0) delete next[color];
    else next[color] = Object.fromEntries(product.sizes.map((s) => [s, count]));
    onChange(next);
  };

  const pieces = matrixPieces(value);
  const pct = Math.min(100, (pieces / product.moq) * 100);
  const minSets = Math.ceil(product.moq / perSet);

  return (
    <div className="matrix">
      <div className="sizes-row">
        <span className="sizes-label">Available sizes</span>
        <div className="size-chips">
          {product.sizes.map((s) => <span key={s} className="size-chip">{s}</span>)}
        </div>
      </div>
      <p className="muted small set-note">
        1 set = 1 pc of each size · <b>{perSet} pcs</b>. MOQ {product.moq} pcs ≈ {minSets} set{minSets > 1 ? 's' : ''}.
      </p>

      <div className="set-rows">
        {product.colors.map((c) => {
          const n = sets(c.name);
          return (
            <div key={c.name} className={`set-row ${n > 0 ? 'has' : ''}`}>
              <span className="dot" style={{ background: c.hex }} />
              <span className="grow set-color">
                {c.name}
                <span className="muted small block">{n > 0 ? `${n * perSet} pcs` : 'Not added'}</span>
              </span>
              <div className="stepper" role="group" aria-label={`${c.name} sets`}>
                <button data-sfx="remove" onClick={() => setSets(c.name, n - 1)} disabled={n === 0} aria-label={`Remove a set of ${c.name}`}><Minus size={16} sw={2.6} /></button>
                <span className="stepper-val" aria-live="polite">{n}</span>
                <button data-sfx="add" data-sfx-n={n + 1} onClick={() => setSets(c.name, n + 1)} aria-label={`Add a set of ${c.name}`}><Plus size={16} sw={2.6} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="moq">
        <div className="moq-bar"><span style={{ width: `${pct}%` }} className={pieces >= product.moq ? 'ok' : ''} /></div>
        <span className="small">
          {pieces >= product.moq ? <>MOQ met · <b>{pieces} pcs</b></> : <><b>{pieces}</b> / {product.moq} pcs minimum</>}
        </span>
      </div>
    </div>
  );
}
