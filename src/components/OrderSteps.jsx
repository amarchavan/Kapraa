import React from 'react';
import { Check } from './Icons.jsx';

export const STEPS = [
  { id: 'shortlist', label: 'Discover or Shortlist' },
  { id: 'cart', label: 'Qty' },
  { id: 'review', label: 'Place Order' },
];

/** 3-step ordering progress: Discover or Shortlist → Qty → Place Order. */
export default function OrderSteps({ current, go, reachable = {} }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="steps" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const state = i < idx ? 'done' : i === idx ? 'current' : 'todo';
        const canGo = i !== idx && (i < idx || reachable[s.id]);
        return (
          <li key={s.id} className={`step ${state}`}>
            <button onClick={() => canGo && go(s.id)} disabled={!canGo && i !== idx} aria-current={i === idx ? 'step' : undefined}>
              <span className="step-num">{state === 'done' ? <Check size={13} sw={3} /> : i + 1}</span>
              <span className="step-label">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
