import React from 'react';
import { Menu, Chevron } from './Icons.jsx';

/** Shared page header: hamburger (or back) on the left, title, optional right slot. */
export default function PageHeader({ title, count, onMenu, onBack, right }) {
  return (
    <header className="page-head">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Back"><Chevron /></button>
      ) : (
        <button className="icon-btn" onClick={onMenu} aria-label="Open menu"><Menu /></button>
      )}
      <h1 className="page-title">
        {title} {count > 0 && <span className="count">{count}</span>}
      </h1>
      {right && <div className="page-head-right">{right}</div>}
    </header>
  );
}
