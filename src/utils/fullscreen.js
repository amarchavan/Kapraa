// Fullscreen helpers with WebKit fallbacks. Browsers only allow entering
// fullscreen from a user gesture (a tap/click), so call enter() from a handler.

const doc = typeof document !== 'undefined' ? document : null;

export const fullscreenSupported = () =>
  Boolean(doc && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled));

export const isFullscreen = () => Boolean(doc && (doc.fullscreenElement || doc.webkitFullscreenElement));

export async function enterFullscreen() {
  const el = doc.documentElement;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else return false;
    return true;
  } catch {
    return false;
  }
}

export async function exitFullscreen() {
  try {
    if (doc.exitFullscreen) await doc.exitFullscreen();
    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
  } catch {
    /* already exited */
  }
}

export function onFullscreenChange(cb) {
  doc.addEventListener('fullscreenchange', cb);
  doc.addEventListener('webkitfullscreenchange', cb);
  return () => {
    doc.removeEventListener('fullscreenchange', cb);
    doc.removeEventListener('webkitfullscreenchange', cb);
  };
}

// Remember "Not now" for the current browser session only.
const KEY = 'kapra-fs-dismissed';
export const wasDismissed = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
export const rememberDismissed = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage unavailable */
  }
};
