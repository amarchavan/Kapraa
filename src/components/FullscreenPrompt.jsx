import React, { useEffect, useRef } from 'react';

/** Consent popup shown on load: asks before switching the app to full screen. */
export default function FullscreenPrompt({ onAccept, onDecline }) {
  const acceptRef = useRef(null);

  useEffect(() => {
    acceptRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onDecline();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDecline]);

  return (
    <div className="consent-backdrop">
      <div className="consent" role="dialog" aria-modal="true" aria-labelledby="fs-title" aria-describedby="fs-desc">
        <div className="consent-art" aria-hidden="true">
          <svg viewBox="0 0 120 90" width="120" height="90">
            <rect x="34" y="6" width="52" height="78" rx="10" fill="#17140f" />
            <rect x="38" y="12" width="44" height="66" rx="6" fill="#f4efe6" />
            <rect x="42" y="16" width="36" height="44" rx="5" fill="#ff5a36" opacity=".85" />
            <rect x="42" y="64" width="22" height="4" rx="2" fill="#17140f" opacity=".7" />
            <rect x="42" y="71" width="14" height="3" rx="1.5" fill="#17140f" opacity=".35" />
            <g fill="none" stroke="#17140f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 22V10h12M112 22V10h-12M8 68v12h12M112 68v12h-12" />
            </g>
          </svg>
        </div>
        <h2 id="fs-title">Go full screen?</h2>
        <p id="fs-desc" className="muted">
          Kapra works best edge to edge. You get bigger product cards and fewer distractions while you swipe. You can exit anytime from the menu or with your device's back/Esc.
        </p>
        <div className="consent-actions">
          <button ref={acceptRef} className="btn primary wide" onClick={onAccept}>Go full screen</button>
          <button className="btn ghost wide" onClick={onDecline}>Not now</button>
        </div>
      </div>
    </div>
  );
}
