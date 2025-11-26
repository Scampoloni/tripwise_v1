import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'tripwise_theme';
const STORAGE_KEY_AUTO = 'tripwise_theme_auto';

function readAuto() {
  if (!browser) return false;
  try {
    return localStorage.getItem(STORAGE_KEY_AUTO) === 'true';
  } catch { return false; }
}

function computePreferred() {
  if (!browser) return 'light';
  try {
    // wenn auto aktiv, system oder uhrzeit bevorzugen
    const auto = readAuto();
    if (auto) {
      const isNight = new Date().getHours() >= 20 || new Date().getHours() < 7;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return (isNight || prefersDark) ? 'dark' : 'light';
    }

    // sonst: data-theme > localStorage > system
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    return prefersDark ? 'dark' : 'light';
  } catch { return 'light'; }
}

export const themeAuto = writable(readAuto());
export const theme = writable(computePreferred());

// anwenden und persistieren
if (browser) {
  themeAuto.subscribe((v) => {
    try { localStorage.setItem(STORAGE_KEY_AUTO, String(v)); } catch {}
    // bei wechsel von auto sofort theme neu berechnen
    theme.set(computePreferred());
  });

  theme.subscribe((value) => {
    try {
      if (document.documentElement.getAttribute('data-theme') !== value) {
        document.documentElement.setAttribute('data-theme', value);
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== value) {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {}
  });

  // periodisch nachregeln, wenn auto aktiv ist
  setInterval(() => {
    if (get(themeAuto)) theme.set(computePreferred());
  }, 30 * 60 * 1000); // alle 30 minuten
}

export function toggleTheme() {
  theme.update((t) => (t === 'light' ? 'dark' : 'light'));
}
