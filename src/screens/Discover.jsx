import React, { useEffect, useMemo, useState } from 'react';
import SwipeCard from '../components/SwipeCard.jsx';
import { liveProducts, categoryLabel } from '../data/catalog.js';
import FilterSheet from '../components/FilterSheet.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { margin } from '../utils/pricing.js';
import { Heart, Undo, X, Menu, Sliders } from '../components/Icons.jsx';
import { sfx } from '../utils/sfx.js';

const FILTERS = [
  { id: 'lowMoq', label: 'Low MOQ', hint: '12 pieces or fewer per style', test: (p) => p.moq <= 12 },
  { id: 'ready', label: 'Ready stock', hint: '500+ pieces available to ship', test: (p) => p.stock >= 500 },
  { id: 'margin', label: 'High margin', hint: '65%+ margin at MRP', test: (p) => margin(p) >= 0.65 },
  { id: 'budget', label: 'Budget buys', hint: 'Under ₹300 per piece', test: (p) => p.price < 300 },
];

const matches = (cat, filters) => (p) =>
  (cat === 'all' || p.category === cat) && FILTERS.filter((f) => filters.includes(f.id)).every((f) => f.test(p));

export default function Discover({ nav }) {
  const { state, dispatch } = useStore();
  const [cat, setCat] = useState('all');
  const [filters, setFilters] = useState([]);
  const [fling, setFling] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const pool = useMemo(() => liveProducts().filter(matches(cat, filters)), [cat, filters, state.catalog]);
  const activeCount = (cat !== 'all' ? 1 : 0) + filters.length;
  const deck = pool.filter((p) => !state.shortlist.includes(p.id) && !state.skipped.includes(p.id));
  const top = deck[0];

  const decide = (id, dir) => {
    setFling(null);
    dispatch({ type: 'decide', id, dir });
    if (dir === 'right') nav.notify('Shortlisted ♥');
  };
  const swipe = (dir) => top && setFling({ id: top.id, dir });

  useEffect(() => {
    const onKey = (e) => {
      if (showFilters || e.target.closest?.('input, textarea, [role=dialog]')) return;
      if (e.key === 'ArrowRight') swipe('right');
      if (e.key === 'ArrowLeft') swipe('left');
      if (e.key === 'ArrowUp' && top) nav.open(top.id);
      if ((e.key === 'z' || e.key === 'Backspace') && state.history.length) {
        sfx.undo();
        dispatch({ type: 'undo' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });


  return (
    <div className="discover">
      <header className="top-bar">
        <button className="icon-btn" onClick={nav.menu} aria-label="Open menu"><Menu /></button>
        <div className="brand">
          <div className="logo">Kapra<span>.</span></div>
          <div className="tagline">Your entire wholesale market, one swipe away</div>
        </div>
        <button className={`icon-btn ${activeCount ? 'active' : ''}`} onClick={() => setShowFilters(true)} aria-label={`Filters${activeCount ? ` (${activeCount} active)` : ''}`}>
          <Sliders />
          {activeCount > 0 && <span className="badge">{activeCount}</span>}
        </button>
      </header>

      <div className="deck-meta">
        <span>
          {deck.length} left in {cat === 'all' ? 'all categories' : categoryLabel(cat)}
          {filters.length > 0 && ` · ${filters.length} filter${filters.length > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="deck">
        {deck.length === 0 ? (
          <div className="deck-empty">
            <div className="empty-mark">✓</div>
            <h3>You've seen this whole rack</h3>
            <p className="muted">Review your shortlist, or bring back the styles you skipped.</p>
            <div className="row gap">
              <button className="btn" onClick={() => dispatch({ type: 'resetSkipped', ids: pool.map((p) => p.id) })}>Show skipped again</button>
              <button className="btn primary" onClick={() => nav.go('shortlist')}>Open shortlist</button>
            </div>
          </div>
        ) : (
          deck
            .slice(0, 3)
            .map((p, i) => <SwipeCard key={p.id} product={p} depth={i} onSwipe={decide} onOpen={nav.open} fling={fling} />)
            .reverse()
        )}
      </div>

      <div className="actions">
        <button className="round sm" data-sfx="undo" onClick={() => dispatch({ type: 'undo' })} disabled={!state.history.length} aria-label="Undo last swipe"><Undo size={20} /></button>
        <button className="round lg nope" data-sfx="none" onClick={() => swipe('left')} disabled={!top} aria-label="Skip"><X size={30} sw={2.6} /></button>
        <button className="round count-btn" onClick={() => nav.go('shortlist')} aria-label={`Shortlisted: ${state.shortlist.length}. Open order steps`}>
          <Heart size={14} fill="currentColor" sw={0} />
          <b key={state.shortlist.length}>{state.shortlist.length}</b>
        </button>
        <button className="round lg like" data-sfx="none" onClick={() => swipe('right')} disabled={!top} aria-label="Shortlist"><Heart size={28} sw={2.4} /></button>
      </div>
      <p className="hint">Swipe right to shortlist · left to skip · ⓘ for details</p>

      {showFilters && (
        <FilterSheet
          category={cat}
          filters={filters}
          options={FILTERS}
          countFor={(c, f) => liveProducts().filter(matches(c, f)).filter((p) => !state.shortlist.includes(p.id) && !state.skipped.includes(p.id)).length}
          onApply={(c, f) => {
            setCat(c);
            setFilters(f);
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
