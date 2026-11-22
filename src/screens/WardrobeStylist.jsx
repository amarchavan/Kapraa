import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import WardrobeArt from '../components/WardrobeArt.jsx';
import GarmentArt from '../components/GarmentArt.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { GROUPS, OCCASIONS, colorByName, groupOf, kindOf, typeById } from '../data/wardrobe.js';
import { liveProducts } from '../data/catalog.js';
import { ACCESSORY_SLOTS, completeLooks, matchesFor, pairScore, slotsFor } from '../utils/stylist.js';
import { money } from '../utils/pricing.js';
import { Edit, Heart, Sparkle } from '../components/Icons.jsx';

const PIECE_LABEL = { top: 'Top', bottom: 'Bottom', full: 'Dress', layer: 'Layer', footwear: 'Shoes', watch: 'Watch', jewellery: 'Jewellery', bag: 'Bag', extra: 'Extra' };
const label = (s) => (s >= 0.75 ? 'Great match' : s >= 0.6 ? 'Good match' : 'Could work');
const tone = (s) => (s >= 0.75 ? 'great' : s >= 0.6 ? 'good' : 'ok');
const occLabel = (id) => OCCASIONS.find((o) => o.id === id)?.label;

// Kapra catalogue → wardrobe-like items, so we can suggest shop pieces for empty slots
const CAT_TO = {
  kurti: { group: 'top', type: 'kurti', occasions: ['ethnic', 'casual'] },
  tshirt: { group: 'top', type: 'tshirt', occasions: ['casual', 'sport'] },
  shirt: { group: 'top', type: 'shirt', occasions: ['casual', 'formal'] },
  jeans: { group: 'bottom', type: 'jeans', occasions: ['casual', 'party'] },
  dress: { group: 'full', type: 'dress', occasions: ['party', 'casual'] },
  onepiece: { group: 'full', type: 'onepiece', occasions: ['casual', 'party'] },
};
const PAT = { solid: 'solid', floral: 'printed', block: 'printed', stripes: 'striped', checks: 'checked', dots: 'printed', denim: 'denim' };

function shopPicks(item, slot, limit = 4) {
  return liveProducts()
    .filter((p) => CAT_TO[p.category]?.group === slot && p.stock > 0)
    .map((p) => {
      // try each colour the product comes in, keep the best-matching one
      let best = null;
      p.colors.forEach((c, ci) => {
        const pseudo = { id: p.id, type: CAT_TO[p.category].type, colors: [c.name], pattern: PAT[p.pattern] || 'solid', occasions: CAT_TO[p.category].occasions };
        const s = pairScore(item, pseudo);
        if (!best || s.score > best.score) best = { ...s, colorIndex: ci, colour: c.name };
      });
      return { product: p, ...best };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function MatchTile({ m, onClick }) {
  return (
    <button className="match-tile" onClick={onClick}>
      <span className="match-art"><WardrobeArt item={m.item} /></span>
      <span className={`match-score ${tone(m.score)}`}>{Math.round(m.score * 100)}%</span>
      <span className="match-name">{m.item.name}</span>
      <span className="match-why">{m.reasons[0]}</span>
    </button>
  );
}

export default function WardrobeStylist({ nav, param }) {
  const { state, dispatch } = useStore();
  const item = state.wardrobe.find((w) => w.id === param);

  const data = useMemo(() => {
    if (!item) return null;
    const w = state.wardrobe;
    const slots = slotsFor(item);
    const isCloth = kindOf(item) === 'cloth';
    const clothRows = slots.map((s) => ({ slot: s, matches: matchesFor(item, w, s) }));
    const accRows = isCloth ? ACCESSORY_SLOTS.map((s) => ({ slot: s, matches: matchesFor(item, w, s, 5) })).filter((r) => r.matches.length) : [];
    // slots that would complete an outfit but are empty in the wardrobe
    const needed = groupOf(item) === 'top' ? ['bottom'] : groupOf(item) === 'bottom' ? ['top'] : groupOf(item) === 'layer' ? ['top', 'bottom'] : [];
    const gaps = needed.filter((s) => !w.some((x) => groupOf(x) === s));
    const weak = clothRows.filter((r) => needed.includes(r.slot) && r.matches.length && r.matches[0].score < 0.6).map((r) => r.slot);
    const shop = [...new Set([...gaps, ...weak])].map((s) => ({ slot: s, picks: shopPicks(item, s) })).filter((x) => x.picks.length);
    return { looks: completeLooks(item, w), clothRows: clothRows.filter((r) => r.matches.length), accRows, shop, gaps };
  }, [item, state.wardrobe, state.catalog]);

  if (!item)
    return (
      <div className="page">
        <PageHeader title="Style it" onBack={() => nav.go('c-wardrobe')} />
        <div className="empty"><h3>This item is no longer in your wardrobe</h3><button className="btn" onClick={() => nav.go('c-wardrobe')}>Back to wardrobe</button></div>
      </div>
    );

  const type = typeById(item.type);
  const isCloth = kindOf(item) === 'cloth';

  return (
    <div className="page stylist">
      <PageHeader title="Style it" onBack={() => nav.go('c-wardrobe')} right={<button className="icon-btn" onClick={() => nav.go('c-wadd', item.id)} aria-label="Edit item"><Edit size={18} /></button>} />

      {/* The selected item */}
      <section className="style-hero">
        <div className="style-hero-art"><WardrobeArt item={item} /></div>
        <div className="grow">
          <div className="eyebrow">{GROUPS[groupOf(item)].label} · {type?.label}</div>
          <h2 className="style-name">{item.name}</h2>
          <div className="style-colours">
            {item.colors.map((c) => (
              <span key={c}><i style={{ background: colorByName(c)?.hex }} />{c}</span>
            ))}
          </div>
          {(item.fabric || item.price) && (
            <div className="style-meta">
              {item.fabric && <span>{item.fabric}</span>}
              {Number(item.price) > 0 && <span>Paid {money(item.price)}</span>}
            </div>
          )}
          <div className="occ-chips small-chips">
            {(item.occasions || []).map((o) => <span key={o} className="occ">{occLabel(o)}</span>)}
          </div>
          <button className={`pill-toggle sm ${item.favourite ? 'on' : ''}`} onClick={() => dispatch({ type: 'wFav', id: item.id })} data-sfx={item.favourite ? 'remove' : 'like'}>
            <Heart size={14} fill={item.favourite ? 'currentColor' : 'none'} /> {item.favourite ? 'Favourite' : 'Favourite'}
          </button>
        </div>
      </section>

      {/* Complete looks */}
      {data.looks.length > 0 && (
        <section className="looks">
          <h3 className="section-h"><Sparkle size={15} /> Complete looks</h3>
          {data.looks.map((look, i) => (
            <div key={i} className="look-card">
              <div className="look-head">
                <b>Look {i + 1}{look.occasion ? ` · ${occLabel(look.occasion)}` : ''}</b>
                <span className={`match-score inline ${tone(look.score)}`}>{Math.round(look.score * 100)}% · {label(look.score)}</span>
              </div>
              <div className="look-pieces">
                {look.pieces.map((p) => (
                  <button key={p.id} className={`look-piece ${p.id === item.id ? 'self' : ''} ${kindOf(p)}`} onClick={() => p.id !== item.id && nav.go('c-wstyle', p.id)} title={p.name}>
                    <span className="look-art"><WardrobeArt item={p} /></span>
                    <span className="look-label">{p.id === item.id ? 'This' : PIECE_LABEL[groupOf(p)]}</span>
                  </button>
                ))}
              </div>
              <p className="look-why">
                {look.pieces
                  .filter((p) => p.id !== item.id && kindOf(p) === 'cloth')
                  .slice(0, 2)
                  .map((p) => `${p.name}: ${pairScore(item, p).reasons.slice(0, 2).join(', ').toLowerCase()}`)
                  .join(' · ') || 'Balanced colours and the same occasion.'}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Per-slot matches */}
      {data.clothRows.map((r) => (
        <section key={r.slot} className="match-row">
          <h3 className="section-h">{isCloth ? 'Pairs with' : 'Wear it with'} · {GROUPS[r.slot].label.toLowerCase()}</h3>
          <div className="match-scroll">
            {r.matches.map((m) => <MatchTile key={m.item.id} m={m} onClick={() => nav.go('c-wstyle', m.item.id)} />)}
          </div>
        </section>
      ))}

      {data.accRows.length > 0 && (
        <section className="match-row">
          <h3 className="section-h">Accessorise</h3>
          {data.accRows.map((r) => (
            <div key={r.slot} className="acc-row">
              <span className="acc-label">{GROUPS[r.slot].label}</span>
              <div className="match-scroll">
                {r.matches.map((m) => <MatchTile key={m.item.id} m={m} onClick={() => nav.go('c-wstyle', m.item.id)} />)}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Shop the gap */}
      {data.shop.map(({ slot, picks }) => (
        <section key={slot} className="match-row shop-gap">
          <h3 className="section-h">
            {data.gaps.includes(slot) ? `No ${GROUPS[slot].label.toLowerCase()} yet` : `Better ${GROUPS[slot].label.toLowerCase()} for this`} · from {state.shop.name}
          </h3>
          <div className="match-scroll">
            {picks.map((p) => (
              <button key={p.product.id} className="match-tile" onClick={() => nav.go('c-browse')}>
                <span className="match-art"><GarmentArt product={p.product} colorIndex={p.colorIndex} /></span>
                <span className={`match-score ${tone(p.score)}`}>{Math.round(p.score * 100)}%</span>
                <span className="match-name">{p.product.name}</span>
                <span className="match-why">{p.colour} · {money(p.product.mrp)}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {!data.looks.length && !data.clothRows.length && !data.shop.length && (
        <div className="empty">
          <h3>Add a few more pieces</h3>
          <p className="muted">Suggestions appear once your wardrobe has clothes this can be worn with.</p>
          <button className="btn primary" onClick={() => nav.go('c-wadd')}>Add item</button>
        </div>
      )}
    </div>
  );
}
