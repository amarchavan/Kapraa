import React from 'react';
import GarmentArt from './GarmentArt.jsx';
import { PATTERNS, colorByName, typeById } from '../data/wardrobe.js';

const ACCESSORY = {
  sneaker: (c, ink) => (
    <>
      <path d="M30 150 C30 120 60 112 80 110 L104 96 C118 92 124 108 136 118 C150 130 176 134 178 152 L178 166 L30 166 Z" fill={c} />
      <path d="M30 160 L178 160 L178 172 C178 176 176 178 172 178 L36 178 C32 178 30 176 30 172 Z" fill="#fff" stroke={ink} strokeWidth="1.5" />
      <path d="M96 106 L112 128 M106 100 L122 122 M84 112 L100 134" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  shoe: (c, ink) => (
    <>
      <path d="M26 156 C26 132 56 126 82 124 C104 122 118 110 132 112 C160 116 180 136 180 160 L180 170 L26 170 Z" fill={c} />
      <path d="M26 166 L180 166 L180 176 L26 176 Z" fill={ink} opacity=".55" />
      <path d="M118 116 C128 130 150 138 170 142" fill="none" stroke={ink} strokeWidth="2" opacity=".5" />
    </>
  ),
  heel: (c, ink) => (
    <>
      <path d="M40 100 C60 100 90 150 120 150 L170 150 C178 150 182 158 176 164 L120 166 C96 166 66 132 52 132 Z" fill={c} />
      <path d="M40 100 L36 178 L48 178 L52 132 Z" fill={c} stroke={ink} strokeWidth="1.5" />
      <path d="M118 150 C128 136 146 132 162 140" fill="none" stroke={ink} strokeWidth="3" />
    </>
  ),
  sandal: (c, ink) => (
    <>
      <ellipse cx="104" cy="160" rx="78" ry="16" fill={c} />
      <path d="M60 158 C70 120 92 112 104 112 C116 112 138 120 148 158" fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" />
      <path d="M104 112 L104 150" stroke={ink} strokeWidth="3" opacity=".5" />
      <ellipse cx="104" cy="160" rx="78" ry="16" fill="none" stroke={ink} strokeWidth="1.5" opacity=".5" />
    </>
  ),
  watch: (c, ink) => (
    <>
      <rect x="82" y="30" width="36" height="66" rx="8" fill={ink} opacity=".75" />
      <rect x="82" y="144" width="36" height="66" rx="8" fill={ink} opacity=".75" />
      <circle cx="100" cy="120" r="44" fill={c} />
      <circle cx="100" cy="120" r="34" fill="#fbfaf6" stroke={ink} strokeWidth="2" />
      <path d="M100 120 L100 96 M100 120 L118 128" stroke="#222" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="143" y="112" width="8" height="16" rx="2" fill={c} />
    </>
  ),
  earrings: (c, ink) => (
    <>
      {[70, 130].map((x) => (
        <g key={x}>
          <circle cx={x} cy="60" r="8" fill="none" stroke={c} strokeWidth="5" />
          <path d={`M${x} 68 L${x} 92`} stroke={c} strokeWidth="4" />
          <path d={`M${x - 26} 140 C${x - 26} 106 ${x + 26} 106 ${x + 26} 140 Z`} fill={c} stroke={ink} strokeWidth="1.5" />
          {[-18, -6, 6, 18].map((d) => <circle key={d} cx={x + d} cy="150" r="4" fill={c} />)}
        </g>
      ))}
    </>
  ),
  necklace: (c, ink) => (
    <>
      <path d="M40 40 C40 150 160 150 160 40" fill="none" stroke={c} strokeWidth="5" />
      <path d="M100 138 L118 160 L100 196 L82 160 Z" fill={c} stroke={ink} strokeWidth="2" />
      <circle cx="100" cy="164" r="7" fill="#fff" opacity=".7" />
    </>
  ),
  bangles: (c, ink) => (
    <>
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={100} cy={96 + i * 22} rx="64" ry="30" fill="none" stroke={c} strokeWidth="10" />
      ))}
      <ellipse cx="100" cy="140" rx="64" ry="30" fill="none" stroke={ink} strokeWidth="1.5" opacity=".4" />
    </>
  ),
  bag: (c, ink) => (
    <>
      <path d="M70 92 C70 50 130 50 130 92" fill="none" stroke={c} strokeWidth="8" />
      <path d="M38 92 L162 92 L172 196 L28 196 Z" fill={c} />
      <path d="M38 92 L162 92" stroke={ink} strokeWidth="2" opacity=".5" />
      <rect x="92" y="108" width="16" height="12" rx="3" fill={ink} opacity=".5" />
    </>
  ),
  belt: (c, ink) => (
    <>
      <rect x="18" y="104" width="164" height="32" rx="6" fill={c} />
      <rect x="62" y="96" width="44" height="48" rx="6" fill="none" stroke="#9a9a9a" strokeWidth="7" />
      <path d="M84 104 L84 136" stroke="#9a9a9a" strokeWidth="5" />
      {[130, 146, 162].map((x) => <circle key={x} cx={x} cy="120" r="3.5" fill={ink} opacity=".6" />)}
    </>
  ),
  sunglasses: (c, ink) => (
    <>
      <path d="M22 96 L178 96" stroke={c} strokeWidth="7" strokeLinecap="round" />
      <path d="M28 98 L90 98 C90 140 82 150 58 150 C34 150 28 136 28 98 Z" fill={ink} opacity=".85" />
      <path d="M110 98 L172 98 C172 136 166 150 142 150 C118 150 110 140 110 98 Z" fill={ink} opacity=".85" />
      <path d="M90 104 C96 96 104 96 110 104" fill="none" stroke={c} strokeWidth="6" />
    </>
  ),
};

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 170;
}

/** Picture for a wardrobe item: the user's photo, a garment drawing, or an accessory drawing. */
export default function WardrobeArt({ item, className = '' }) {
  const type = typeById(item.type);
  const colors = item.colors.map((n) => colorByName(n) || { name: n, hex: '#bbb' });
  const main = colors[0] || { name: 'Colour', hex: '#bbb' };

  if (item.image) {
    return (
      <div className={`art photo ${className}`} style={{ '--tint': main.hex }}>
        <img src={item.image} alt={item.name} draggable={false} />
      </div>
    );
  }

  const draw = ACCESSORY[type?.art];
  if (!draw) {
    const pattern = PATTERNS.find((p) => p.id === item.pattern)?.art ?? 'solid';
    return <GarmentArt className={className} product={{ name: item.name, category: type?.art ?? 'tshirt', colors, pattern, images: [] }} />;
  }

  const ink = isLight(main.hex) ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.45)';
  return (
    <div className={`art ${className}`} style={{ '--tint': main.hex }}>
      <svg viewBox="0 0 200 240" role="img" aria-label={item.name}>
        <g transform="translate(0 0)">{draw(main.hex, ink)}</g>
      </svg>
    </div>
  );
}
