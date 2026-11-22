import React, { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import WardrobeArt from '../components/WardrobeArt.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { GROUPS, OCCASIONS, colorByName, groupOf, kindOf, sampleWardrobe, typeById } from '../data/wardrobe.js';
import { isNeutral, wardrobeInsights } from '../utils/stylist.js';
import { Heart, Plus, Sparkle, GroupIcon, Bolt } from '../components/Icons.jsx';
import { money } from '../utils/pricing.js';

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function buildInsights(items, ins) {
  const out = [];
  const count = (g) => items.filter((w) => groupOf(w) === g).length;
  const tops = count('top'), bottoms = count('bottom');
  if (tops && bottoms === 0) out.push({ tone: 'gap', text: `You have ${tops} top${tops > 1 ? 's' : ''} but no bottoms. One pair of neutral trousers or jeans would turn them into outfits.` });
  else if (tops >= bottoms * 2 + 1) out.push({ tone: 'gap', text: `${tops} tops share ${bottoms} bottom${bottoms > 1 ? 's' : ''}. A neutral bottom (beige, black or denim) would unlock the most new outfits.` });
  else if (bottoms >= tops * 2 + 1) out.push({ tone: 'gap', text: `More bottoms (${bottoms}) than tops (${tops}). A couple of solid tops would mix with all of them.` });

  const clothOcc = {};
  items.filter((w) => kindOf(w) === 'cloth').forEach((w) => (w.occasions || []).forEach((o) => (clothOcc[o] = (clothOcc[o] || 0) + 1)));
  const shoes = items.filter((w) => groupOf(w) === 'footwear');
  OCCASIONS.forEach((o) => {
    if ((clothOcc[o.id] || 0) >= 2 && !shoes.some((s) => (s.occasions || []).includes(o.id)))
      out.push({ tone: 'gap', text: `${clothOcc[o.id]} ${o.label.toLowerCase()} pieces, but no ${o.label.toLowerCase()} footwear yet.` });
  });

  const best = Object.entries(ins.versatility).sort((a, b) => b[1] - a[1])[0];
  if (best) {
    const w = items.find((x) => x.id === best[0]);
    if (w) out.push({ tone: 'good', text: `Most versatile: ${w.name}. It works in ${best[1]} outfit${best[1] > 1 ? 's' : ''}.`, id: w.id });
  }
  const lonely = items.filter((w) => ['top', 'bottom'].includes(groupOf(w)) && !ins.versatility[w.id]);
  if (lonely.length) out.push({ tone: 'gap', text: `${lonely.map((w) => w.name).slice(0, 2).join(' and ')}${lonely.length > 2 ? ` +${lonely.length - 2}` : ''} ${lonely.length > 1 ? "don't" : "doesn't"} pair well with anything yet.`, id: lonely[0].id });
  return out.slice(0, 5);
}

function PaletteCard({ items, filter, setFilter }) {
  const groupsPresent = Object.keys(GROUPS).filter((g) => items.some((w) => groupOf(w) === g));
  const options = [['cloth', 'All clothes'], ['accessory', 'All accessories'], ...groupsPresent.map((g) => [g, GROUPS[g].label])];
  const scope = items.filter((w) => (filter === 'cloth' || filter === 'accessory' ? kindOf(w) === filter : groupOf(w) === filter));
  const counts = {};
  scope.forEach((w) => (counts[w.colors[0]] = (counts[w.colors[0]] || 0) + 1));
  const palette = Object.entries(counts).map(([name, n]) => ({ name, n, hex: colorByName(name)?.hex ?? '#bbb' })).sort((a, b) => b.n - a.n);
  const neutralShare = pct(palette.filter((c) => isNeutral(c.name)).reduce((t, c) => t + c.n, 0), scope.length);
  const label = options.find(([id]) => id === filter)?.[1].toLowerCase() ?? '';

  return (
    <section className="card">
      <h3>Your colour palette <span className="opt">{scope.length} item{scope.length === 1 ? '' : 's'}</span></h3>
      <div className="chips pal-filter" role="tablist" aria-label="Palette category">
        {options.map(([id, l]) => (
          <button key={id} role="tab" aria-selected={filter === id} className={`chip sm ${filter === id ? 'on' : ''}`} onClick={() => setFilter(id)}>
            {id !== 'cloth' && id !== 'accessory' && <GroupIcon group={id} size={14} sw={1.8} />}
            {l}
          </button>
        ))}
      </div>
      {palette.length === 0 ? (
        <p className="muted small">Nothing in this category yet.</p>
      ) : (
        <>
          <div className="palette-strip" role="img" aria-label={palette.map((c) => `${c.name} ${c.n}`).join(', ')}>
            {palette.map((c) => (
              <span key={c.name} style={{ flex: c.n, background: c.hex }} title={`${c.name}: ${c.n} (${pct(c.n, scope.length)}%)`} />
            ))}
          </div>
          <ul className="palette-list">
            {palette.slice(0, 8).map((c) => (
              <li key={c.name}>
                <span className="sw" style={{ background: c.hex }} />
                <span className="grow">{c.name}</span>
                <span className="muted small">{pct(c.n, scope.length)}%</span>
                <b>{c.n}</b>
              </li>
            ))}
          </ul>
          <p className="insight-line">
            {neutralShare >= 50
              ? `${neutralShare}% of your ${label} are neutrals, so they're easy to mix and match.`
              : `Only ${neutralShare}% of your ${label} are neutrals. White, beige or black basics would make them easier to pair.`}
          </p>
        </>
      )}
    </section>
  );
}

export default function Wardrobe({ nav }) {
  const { state, dispatch } = useStore();
  const items = state.wardrobe;
  const [filter, setFilter] = useState('all');
  const [palFilter, setPalFilter] = useState('cloth'); // colour palette scope

  const data = useMemo(() => {
    const clothes = items.filter((w) => kindOf(w) === 'cloth');
    const accessories = items.filter((w) => kindOf(w) === 'accessory');
    const byGroup = Object.keys(GROUPS).map((g) => {
      const list = items.filter((w) => groupOf(w) === g);
      return { id: g, ...GROUPS[g], n: list.length, value: list.reduce((t, w) => t + (Number(w.price) || 0), 0) };
    });
    const totalValue = items.reduce((t, w) => t + (Number(w.price) || 0), 0);
    const priced = items.filter((w) => Number(w.price) > 0).length;
    const fabricCounts = {};
    items.forEach((w) => w.fabric && (fabricCounts[w.fabric] = (fabricCounts[w.fabric] || 0) + 1));
    const fabrics = Object.entries(fabricCounts).sort((a, b) => b[1] - a[1]);
    const occ = OCCASIONS.map((o) => ({ ...o, n: items.filter((w) => (w.occasions || []).includes(o.id)).length }));
    const ins = wardrobeInsights(items);
    return { clothes, accessories, byGroup, totalValue, priced, fabrics, occ, ins, insights: buildInsights(items, ins) };
  }, [items]);

  if (!items.length)
    return (
      <div className="page">
        <PageHeader title="My Wardrobe" onMenu={nav.menu} />
        <div className="empty">
          <div className="empty-mark">👗</div>
          <h3>Build your digital wardrobe</h3>
          <p className="muted">
            Add the clothes and accessories you own (shoes, watches, jewellery, bags). You'll see what you have by category and colour, and get outfit ideas for any piece.
          </p>
          <button className="btn primary" onClick={() => nav.go('c-wquick')}><Bolt size={16} /> Quick add from photos</button>
          <button className="btn" onClick={() => nav.go('c-wadd')}><Plus size={16} /> Add an item manually</button>
          <button className="btn ghost" onClick={() => { dispatch({ type: 'wLoad', items: sampleWardrobe() }); nav.notify('Sample wardrobe added'); }}>
            Try a sample wardrobe
          </button>
        </div>
      </div>
    );

  const maxGroup = Math.max(...data.byGroup.map((g) => g.n), 1);
  const shown = items.filter((w) => (filter === 'all' ? true : filter === 'cloth' || filter === 'accessory' ? kindOf(w) === filter : filter === 'fav' ? w.favourite : groupOf(w) === filter));

  return (
    <div className="page wardrobe">
      <PageHeader
        title="My Wardrobe"
        onMenu={nav.menu}
        right={
          <button className="btn primary sm" onClick={() => nav.go('c-wquick')}><Bolt size={15} /> Quick add</button>
        }
      />

      {/* Headline stats */}
      <div className="stat-row">
        <button onClick={() => setFilter('cloth')}><b>{data.clothes.length}</b><span>Clothes</span></button>
        <button onClick={() => setFilter('accessory')}><b>{data.accessories.length}</b><span>Accessories</span></button>
        <div className="stat-accent"><b>{data.ins.outfitCount}</b><span>Outfits that work</span></div>
        <div title={`${data.priced} of ${items.length} items have a price`}><b className="value">{data.totalValue ? money(data.totalValue).replace('₹', '₹') : '—'}</b><span>Wardrobe value</span></div>
      </div>

      {/* Category breakdown */}
      <section className="card">
        <h3>By category</h3>
        <div className="hbars" role="table" aria-label="Items by category">
          {data.byGroup.map((g) => (
            <button
              key={g.id}
              role="row"
              className={`hbar ${g.n === 0 ? 'zero' : ''} ${filter === g.id ? 'on' : ''}`}
              onClick={() => setFilter(filter === g.id ? 'all' : g.id)}
              disabled={g.n === 0}
              title={`${g.label}: ${g.n} item${g.n === 1 ? '' : 's'}${g.value ? ` · ${money(g.value)}` : ''}`}
            >
              <span role="cell" className="hbar-label">
                <span className={`hbar-icon ${g.kind}`}><GroupIcon group={g.id} size={16} sw={1.8} /></span>
                {g.label}
              </span>
              <span role="cell" className="hbar-track">
                <span className={`hbar-fill ${g.kind}`} style={{ width: `${(g.n / maxGroup) * 100}%` }} />
              </span>
              <span role="cell" className="hbar-val">{g.n}</span>
            </button>
          ))}
        </div>
        <p className="muted small legend-row"><span className="key cloth" /> Clothes <span className="key accessory" /> Accessories · tap a row to filter</p>
      </section>

      {/* Colour palette — filterable by category */}
      <PaletteCard items={items} filter={palFilter} setFilter={setPalFilter} />

      {/* Fabrics */}
      {data.fabrics.length > 0 && (
        <section className="card">
          <h3>Fabrics &amp; materials <span className="opt">{data.fabrics.reduce((t, [, n]) => t + n, 0)} tagged</span></h3>
          <div className="occ-chips">
            {data.fabrics.map(([f, n]) => <span key={f} className="occ">{f} <b>{n}</b></span>)}
          </div>
        </section>
      )}

      {/* Colour combinations */}
      <section className="card">
        <h3>Colour combinations that work</h3>
        {data.ins.colourPairs.length === 0 ? (
          <p className="muted small">Add at least one top and one bottom to see which colours you can pair.</p>
        ) : (
          <ul className="combo-list">
            {data.ins.colourPairs.slice(0, 5).map((p) => (
              <li key={`${p.a}|${p.b}`}>
                <span className="combo-sw">
                  <span style={{ background: colorByName(p.a)?.hex }} />
                  <span style={{ background: colorByName(p.b)?.hex }} />
                </span>
                <span className="grow">{p.a} top + {p.b} bottom</span>
                <span className="muted small">{p.n} outfit{p.n > 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Occasions */}
      <section className="card">
        <h3>Occasions covered</h3>
        <div className="occ-chips">
          {data.occ.map((o) => (
            <span key={o.id} className={`occ ${o.n ? '' : 'zero'}`}>{o.label} <b>{o.n}</b></span>
          ))}
        </div>
      </section>

      {/* Insights */}
      {data.insights.length > 0 && (
        <section className="card insights">
          <h3><Sparkle size={14} /> Stylist notes</h3>
          {data.insights.map((n, i) => (
            <button key={i} className={`note ${n.tone}`} onClick={() => n.id && nav.go('c-wstyle', n.id)} disabled={!n.id}>
              {n.text}
            </button>
          ))}
        </section>
      )}

      {/* Items */}
      <div className="w-items-head">
        <h2>Items <span className="muted">{shown.length}</span></h2>
        {filter !== 'all' && <button className="text-btn" onClick={() => setFilter('all')}>Show all</button>}
      </div>
      <div className="chips w-filter">
        {[['all', 'All'], ['cloth', 'Clothes'], ['accessory', 'Accessories'], ['fav', '♥ Favourites']].map(([id, label]) => (
          <button key={id} className={`chip ${filter === id ? 'on' : ''}`} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>
      <p className="muted small page-sub">Tap any item to see what it goes with.</p>
      <div className="grid wardrobe-grid">
        {shown.map((w) => (
          <button key={w.id} className="tile w-tile" onClick={() => nav.go('c-wstyle', w.id)}>
            <span className="tile-art"><WardrobeArt item={w} /></span>
            {w.favourite && <span className="fav-dot"><Heart size={12} fill="currentColor" sw={0} /></span>}
            <span className="tile-body">
              <span className="tile-name">{w.name}</span>
              <span className="tile-sub muted">{typeById(w.type)?.label} · {w.colors.join(' / ')}</span>
            </span>
          </button>
        ))}
        <button className="tile w-tile add" onClick={() => nav.go('c-wadd')}>
          <Plus size={26} />
          <span>Add item</span>
        </button>
      </div>
    </div>
  );
}
