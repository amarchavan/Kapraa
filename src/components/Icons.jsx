import React from 'react';

const I = ({ d, size = 20, fill = 'none', sw = 2, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const Heart = (p) => <I {...p} d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />;
export const X = (p) => <I {...p} d="M18 6 6 18M6 6l12 12" />;
export const Undo = (p) => <I {...p} d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />;
export const Info = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-5M12 8h.01" />
  </I>
);
export const Bag = (p) => (
  <I {...p}>
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </I>
);
export const Flame = (p) => <I {...p} d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z" />;
export const Stack = (p) => (
  <I {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M9 12l2 2 4-4" />
  </I>
);
export const Truck = (p) => (
  <I {...p}>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </I>
);
export const Check = (p) => <I {...p} d="M5 12.5 10 17 19 7" />;
export const Chevron = (p) => <I {...p} d="M15 18l-6-6 6-6" />;
export const Star = (p) => <I fill="currentColor" sw={0} {...p} d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" />;
export const Shield = (p) => <I {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M9 12l2 2 4-4" />;
export const Columns = (p) => (
  <I {...p}>
    <rect x="3" y="4" width="7" height="16" rx="2" />
    <rect x="14" y="4" width="7" height="16" rx="2" />
  </I>
);
export const Trash = (p) => <I {...p} d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />;
export const Plus = (p) => <I {...p} d="M12 5v14M5 12h14" />;
export const Minus = (p) => <I {...p} d="M5 12h14" />;
export const Edit = (p) => <I {...p} d="M4 20h4L19 9l-4-4L4 16v4z" />;
export const Pin = (p) => (
  <I {...p}>
    <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </I>
);
export const Sliders = (p) => (
  <I {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </I>
);
export const Menu = (p) => <I {...p} d="M4 7h16M4 12h16M4 17h10" />;
export const Volume = ({ muted, ...p }) => (
  <I {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
  </I>
);
export const Expand = (p) => <I {...p} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />;
export const Hanger = (p) => <I {...p} d="M12 7a2 2 0 1 1 2-2c0 1-1 1.5-2 2.2V9l8.6 6.2c.8.6.4 1.8-.6 1.8H4c-1 0-1.4-1.2-.6-1.8L12 9" />;
export const Sparkle = (p) => <I {...p} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />;
export const Camera = (p) => (
  <I {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </I>
);

/** Category icons for the wardrobe groups. */
const GROUP_PATHS = {
  top: <path d="M8.5 4 4 6.2l1.6 4.1L8 9.4V20h8V9.4l2.4.9L20 6.2 15.5 4c-.6 1.4-1.9 2.3-3.5 2.3S9.1 5.4 8.5 4z" />,
  bottom: <path d="M7 3h10l1 18h-4.2L12 10l-1.8 11H6L7 3zM7 6.5h10" />,
  full: <path d="M9.5 3h5l-.8 5L19 21H5l5.3-13-.8-5zM10.2 8h3.6" />,
  layer: <path d="M8.5 3 4 6v15h5V11l3 5 3-5v10h5V6l-4.5-3L12 9 8.5 3z" />,
  footwear: <path d="M3 17c0-3 1.8-4.5 4-4.6l2.6-3.2c1.8.8 3.1 2.8 6 3.7 2.6.8 5.4 1.6 5.4 4.1v2H3v-2zM3 17h18" />,
  watch: (
    <>
      <path d="M9 2.5h6l.7 4.5H8.3zM8.3 17h7.4L15 21.5H9z" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 9.6V12l1.6 1" />
    </>
  ),
  jewellery: <path d="M5 3c0 6.5 3.1 9.5 7 9.5S19 9.5 19 3M12 12.5l2.2 3.2L12 20l-2.2-4.3z" />,
  bag: <path d="M5.5 8h13l1.2 13H4.3zM9 8a3 3 0 0 1 6 0" />,
  extra: <path d="M2.5 9h19M3.5 9c0 4 1.3 6 3.8 6s3.7-2 3.7-6M13 9c0 4 1.2 6 3.7 6s3.8-2 3.8-6" />,
};
export const GroupIcon = ({ group, ...p }) => <I {...p}>{GROUP_PATHS[group] ?? GROUP_PATHS.top}</I>;
export const Bolt = (p) => <I {...p} d="M13 2 4 14h7l-1 8 9-12h-7z" />;
