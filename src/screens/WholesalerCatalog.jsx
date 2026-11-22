import React, { useState } from 'react';
import GarmentArt from '../components/GarmentArt.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { PRODUCTS, SUPPLIERS, categoryLabel, supplierProducts } from '../data/catalog.js';
import { useStore, ORDER_STEPS } from '../store/StoreContext.jsx';
import { margin, money } from '../utils/pricing.js';
import { Edit, Plus, Shield, Star, Trash } from '../components/Icons.jsx';

export default function WholesalerCatalog({ nav }) {
  const { state, dispatch } = useStore();
  const supplier = SUPPLIERS[state.supplierId];
  const products = supplierProducts(state.supplierId);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tab, setTab] = useState('all');

  const live = products.filter((p) => p.active !== false);
  const shown = tab === 'live' ? live : tab === 'hidden' ? products.filter((p) => p.active === false) : products;
  const subOrders = state.orders.flatMap((o) => o.subOrders.filter((so) => so.supplierId === state.supplierId));
  const pending = subOrders.filter((so) => so.step < ORDER_STEPS.length - 1).length;
  const piecesSold = subOrders.reduce((n, so) => n + so.pieces, 0);
  const isSeed = (id) => PRODUCTS.some((p) => p.id === id);

  return (
    <div className="page">
      <PageHeader
        title="My catalogue"
        onMenu={nav.menu}
        right={
          <button className="btn primary sm" onClick={() => nav.edit(null)}>
            <Plus size={16} /> Upload
          </button>
        }
      />

      <div className="supplier-card">
        <div className="supplier-avatar">{supplier.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
        <div className="grow">
          <div className="supplier-name">
            {supplier.name} {supplier.verified && <span className="verified"><Shield size={12} /> Verified</span>}
          </div>
          <div className="muted small">{supplier.city} · {supplier.years} yrs in trade</div>
        </div>
        <div className="supplier-stats"><span><Star size={12} /> {supplier.rating}</span></div>
      </div>

      <div className="stat-row">
        <div><b>{live.length}</b><span>Live styles</span></div>
        <div><b>{live.reduce((n, p) => n + p.stock, 0).toLocaleString('en-IN')}</b><span>Pcs in stock</span></div>
        <button onClick={() => nav.go('w-orders')}><b>{pending}</b><span>Orders to action</span></button>
        <div><b>{piecesSold.toLocaleString('en-IN')}</b><span>Pcs ordered</span></div>
      </div>

      <div className="seg" role="tablist">
        {[['all', `All ${products.length}`], ['live', `Live ${live.length}`], ['hidden', `Hidden ${products.length - live.length}`]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-mark">📸</div>
          <h3>{products.length ? 'Nothing here' : 'Upload your first style'}</h3>
          <p className="muted">Add photos, price, MOQ, sizes and colours. Retailers can swipe on it as soon as you publish.</p>
          <button className="btn primary" onClick={() => nav.edit(null)}><Plus size={16} /> Upload product</button>
        </div>
      ) : (
        <div className="w-list">
          {shown.map((p) => {
            const hidden = p.active === false;
            return (
              <div key={p.id} className={`w-item ${hidden ? 'hidden' : ''}`}>
                <button className="line-art" onClick={() => nav.edit(p.id)} aria-label={`Edit ${p.name}`}>
                  <GarmentArt product={p} />
                </button>
                <div className="grow">
                  <div className="line-name">{p.name}</div>
                  <div className="muted small">{categoryLabel(p.category)} · {p.sizes.length} sizes · {p.colors.length} colours</div>
                  <div className="w-meta">
                    <span className="price sm">{money(p.price)}</span>
                    <span className="margin sm">{Math.round(margin(p) * 100)}%</span>
                    <span className="small muted">MOQ {p.moq} · {p.stock.toLocaleString('en-IN')} in stock</span>
                  </div>
                  <div className="w-actions">
                    <button className={`status-toggle ${hidden ? '' : 'on'}`} role="switch" aria-checked={!hidden} onClick={() => { dispatch({ type: 'toggleActive', product: p }); nav.notify(hidden ? 'Live for retailers' : 'Hidden from retailers'); }}>
                      <span className={`switch sm ${hidden ? '' : 'on'}`}><span /></span>
                      {hidden ? 'Hidden' : 'Live'}
                    </button>
                    <button className="chip-btn ghost" onClick={() => nav.edit(p.id)}><Edit size={14} /> Edit</button>
                    {confirmDelete === p.id ? (
                      <button
                        className="chip-btn danger"
                        data-sfx="remove"
                        onClick={() => {
                          dispatch({ type: 'deleteProduct', id: p.id, seed: isSeed(p.id) });
                          setConfirmDelete(null);
                          nav.notify('Product deleted');
                        }}
                      >
                        Confirm delete
                      </button>
                    ) : (
                      <button className="icon-btn xs" onClick={() => setConfirmDelete(p.id)} aria-label={`Delete ${p.name}`}><Trash size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
