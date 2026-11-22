import React, { useId } from 'react';

// Stylised garment silhouettes (viewBox 200×240). Swap for real product photos once
// suppliers upload catalogues — the card layout doesn't depend on this.
const SHAPES = {
  tshirt: 'M60 40 L85 30 Q100 44 115 30 L140 40 L172 72 L150 94 L140 84 L140 205 L60 205 L60 84 L50 94 L28 72 Z',
  shirt: 'M62 38 L86 28 L100 46 L114 28 L138 38 L168 110 L150 116 L140 84 L142 212 L58 212 L60 84 L50 116 L32 110 Z',
  kurti: 'M70 34 L88 27 Q100 40 112 27 L130 34 L150 60 L160 122 L146 124 L138 82 L140 122 L158 218 L42 218 L60 122 L62 82 L54 124 L40 122 L50 60 Z',
  dress: 'M78 30 L90 30 Q100 46 110 30 L122 30 L127 70 L120 100 L162 212 L38 212 L80 100 L73 70 Z',
  onepiece: 'M75 32 L90 28 Q100 41 110 28 L125 32 L146 54 L132 66 L124 59 L122 96 L152 226 L48 226 L78 96 L76 59 L68 66 L54 54 Z',
  jeans: 'M62 30 L138 30 L143 62 L152 226 L110 226 L100 92 L90 226 L48 226 L57 62 Z',
  kids: 'M78 62 L92 56 Q100 66 108 56 L122 62 L138 80 L126 92 L119 85 L119 112 L144 192 L56 192 L81 112 L81 85 L74 92 L62 80 Z',
  skirt: 'M64 40 L136 40 L140 58 L166 214 L34 214 L60 58 Z',
  shorts: 'M58 50 L142 50 L147 76 L156 168 L110 172 L100 108 L90 172 L44 168 L53 76 Z',
  jacket: 'M66 34 L88 26 L100 64 L112 26 L134 34 L170 76 L158 206 L144 206 L142 96 L140 214 L60 214 L58 96 L56 206 L42 206 L30 76 Z',
};

const DETAILS = {
  shirt: <path d="M100 46 L100 212 M86 28 L100 54 L114 28" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="2" />,
  jeans: <path d="M60 44 L140 44 M100 30 L100 92" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeDasharray="4 3" />,
  kurti: <path d="M100 40 L100 72" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" />,
  skirt: <path d="M62 54 L138 54" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="3" />,
  shorts: <path d="M56 64 L144 64 M100 50 L100 108" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeDasharray="4 3" />,
  jacket: <path d="M100 64 L100 214 M88 26 L100 64 L112 26" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="2.5" />,
};

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}

function Pattern({ id, kind, ink }) {
  switch (kind) {
    case 'floral':
      return (
        <pattern id={id} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <g fill={ink}>
            {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="12" cy="7" rx="3" ry="5" transform={`rotate(${r} 12 12)`} />)}
            <circle cx="28" cy="27" r="2.5" />
          </g>
        </pattern>
      );
    case 'block':
      return (
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M13 3 L23 13 L13 23 L3 13 Z" fill="none" stroke={ink} strokeWidth="2" />
          <circle cx="13" cy="13" r="2.5" fill={ink} />
        </pattern>
      );
    case 'stripes':
      return (
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="4" fill={ink} />
        </pattern>
      );
    case 'checks':
      return (
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="7" fill={ink} />
          <rect width="7" height="22" fill={ink} />
        </pattern>
      );
    case 'dots':
      return (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2" fill={ink} />
        </pattern>
      );
    case 'denim':
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="6" fill={ink} />
        </pattern>
      );
    default:
      return null;
  }
}

export default function GarmentArt({ product, colorIndex = 0, className = '', bare = false }) {
  const uid = useId().replace(/:/g, '');
  const color = product.colors[colorIndex] ?? product.colors[0] ?? { name: 'Colour', hex: '#cfc6b6' };
  if (product.images?.length) {
    const src = product.images[Math.min(colorIndex, product.images.length - 1)];
    return (
      <div className={`art photo ${product.studio ? 'studio' : ''} ${bare ? 'bare' : ''} ${className}`} style={{ '--tint': color.hex }}>
        <img src={src} alt={product.name} draggable={false} />
      </div>
    );
  }
  const light = isLight(color.hex);
  const ink = light ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.22)';
  const shape = SHAPES[product.category] ?? SHAPES.tshirt;
  const hasPattern = product.pattern !== 'solid';

  return (
    <div className={`art ${bare ? 'bare' : ''} ${className}`} style={{ '--tint': color.hex }}>
      <svg viewBox="0 0 200 240" role="img" aria-label={`${product.name} in ${color.name}`}>
        <defs>
          {hasPattern && <Pattern id={`p${uid}`} kind={product.pattern} ink={ink} />}
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".25" />
            <stop offset=".6" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".18" />
          </linearGradient>
        </defs>
        {!bare && <ellipse cx="100" cy="232" rx="62" ry="5" fill="rgba(0,0,0,.12)" />}
        <path d={shape} fill={color.hex} stroke={light ? 'rgba(0,0,0,.18)' : 'none'} strokeWidth="1.5" />
        {hasPattern && <path d={shape} fill={`url(#p${uid})`} />}
        <path d={shape} fill={`url(#g${uid})`} />
        {DETAILS[product.category]}
      </svg>
    </div>
  );
}
