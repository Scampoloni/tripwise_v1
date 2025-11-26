// src/utils/currency.js

export const STATIC_RATES = {
  CHF: { EUR: 1.03, USD: 1.02, JPY: 166.0, GBP: 0.84, CHF: 1 },
  EUR: { CHF: 0.97, USD: 0.99, JPY: 161.0, GBP: 0.82, EUR: 1 },
  USD: { CHF: 0.98, EUR: 1.01, JPY: 156.0, GBP: 0.8, USD: 1 },
  JPY: { CHF: 0.006, EUR: 0.0062, USD: 0.0064, GBP: 0.0051, JPY: 1 },
  GBP: { CHF: 1.19, EUR: 1.22, USD: 1.25, JPY: 195.0, GBP: 1 }
};

function normalizeCurrency(code) {
  return typeof code === 'string' && code.trim() ? code.trim().toUpperCase() : 'CHF';
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getStaticRate(base, target = 'CHF') {
  const from = normalizeCurrency(base);
  const to = normalizeCurrency(target);
  if (from === to) return 1;

  const table = STATIC_RATES[from];
  const rate = table ? table[to] : undefined;
  return typeof rate === 'number' && Number.isFinite(rate) ? rate : 1;
}

export function convertAmount(amount, base, target = 'CHF') {
  const numeric = toNumber(amount);
  const rate = getStaticRate(base, target);
  return numeric * rate;
}

export function convertToChf(amount, currency = 'CHF') {
  return convertAmount(amount, currency, 'CHF');
}

export async function fetchRateViaProxy(base, target) {
  const from = normalizeCurrency(base);
  const to = normalizeCurrency(target);
  if (from === to) return 1;

  const res = await fetch(`/api/rates/${from}?symbols=${to}`);
  if (!res.ok) {
    throw new Error('Proxy failed');
  }

  const data = await res.json();
  const rate = data && data.rates && data.rates[to];

  if (typeof rate !== 'number') {
    throw new Error('Rate missing');
  }

  return rate;
}
