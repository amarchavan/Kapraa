// Tiny synthesized sound effects (Web Audio API) — no audio files to load.
// Browsers only allow audio after a user gesture, so the context is created
// lazily on the first tap.

const KEY = 'kapra-sound';
let ctx = null;
let master = null;
let enabled = (() => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
})();

const listeners = new Set();

function audio() {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One enveloped oscillator note. */
function tone({ freq = 440, to, type = 'sine', at = 0, dur = 0.12, vol = 0.3, attack = 0.005 }) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Filtered noise burst — used for the swipe "whoosh". */
function noise({ at = 0, dur = 0.25, vol = 0.25, from = 2400, to = 400 }) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + at;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const buzz = (ms) => {
  try {
    if (enabled && navigator.vibrate) navigator.vibrate(ms);
  } catch {
    /* no haptics */
  }
};

export const sfx = {
  /** Soft UI click for any button. */
  tap() {
    tone({ freq: 1800, to: 1200, type: 'triangle', dur: 0.045, vol: 0.12 });
    buzz(5);
  },
  /** Card crossed the swipe threshold while dragging. */
  tick() {
    tone({ freq: 900, type: 'sine', dur: 0.04, vol: 0.1 });
    buzz(8);
  },
  /** Swipe right / shortlist: bright rising two-note chime. */
  like() {
    noise({ dur: 0.18, vol: 0.08, from: 1200, to: 3000 });
    tone({ freq: 660, type: 'sine', at: 0.02, dur: 0.14, vol: 0.22 });
    tone({ freq: 990, type: 'sine', at: 0.1, dur: 0.22, vol: 0.2 });
    buzz(15);
  },
  /** Swipe left / skip: low falling whoosh. */
  skip() {
    noise({ dur: 0.22, vol: 0.14, from: 1800, to: 300 });
    tone({ freq: 260, to: 150, type: 'sine', dur: 0.16, vol: 0.12 });
    buzz(10);
  },
  /** Undo: quick rewind blip. */
  undo() {
    tone({ freq: 500, to: 900, type: 'triangle', dur: 0.12, vol: 0.15 });
  },
  /** +1 set — pitch climbs with the count so quantity is audible. */
  add(n = 1) {
    const f = 520 * Math.pow(2, Math.min(n, 12) / 12);
    tone({ freq: f, to: f * 1.25, type: 'triangle', dur: 0.09, vol: 0.22 });
    buzz(8);
  },
  /** −1 set — falling pop. */
  remove() {
    tone({ freq: 520, to: 330, type: 'triangle', dur: 0.1, vol: 0.18 });
    buzz(6);
  },
  /** Order placed: ascending arpeggio. */
  success() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'sine', at: i * 0.09, dur: 0.35, vol: 0.18 }));
    buzz([20, 40, 20]);
  },
  /** Product card flip (customer rail). */
  flip() {
    noise({ dur: 0.2, vol: 0.09, from: 900, to: 2600 });
    tone({ freq: 380, to: 620, type: 'sine', at: 0.04, dur: 0.14, vol: 0.1 });
    buzz(10);
  },
  /** Sheets & drawers opening. */
  open() {
    noise({ dur: 0.14, vol: 0.06, from: 600, to: 2200 });
  },
};

export const soundEnabled = () => enabled;
export function setSoundEnabled(on) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((fn) => fn(on));
  if (on) sfx.tap();
}
export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Global tap sounds: every <button> clicks softly, unless it carries
 * data-sfx="<name>" (plays that sound) or data-sfx="none" (handled elsewhere).
 */
export function installTapSounds() {
  const handler = (e) => {
    const btn = e.target.closest?.('button, [role=switch], label.radio');
    if (!btn || btn.disabled) return;
    const name = btn.dataset?.sfx;
    if (name === 'none') return;
    if (name && sfx[name]) sfx[name](Number(btn.dataset.sfxN) || undefined);
    else sfx.tap();
  };
  document.addEventListener('click', handler, true);
  return () => document.removeEventListener('click', handler, true);
}
