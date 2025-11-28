// src/utils/currency.js

export const STATIC_RATES = {
  CHF: { EUR: 1.03, USD: 1.02, JPY: 166.0, GBP: 0.84, CHF: 1 },
  EUR: { CHF: 0.97, USD: 0.99, JPY: 161.0, GBP: 0.82, EUR: 1 },
  USD: { CHF: 0.98, EUR: 1.01, JPY: 156.0, GBP: 0.8, USD: 1 },
  JPY: { CHF: 0.006, EUR: 0.0062, USD: 0.0064, GBP: 0.0051, JPY: 1 },
  GBP: { CHF: 1.19, EUR: 1.22, USD: 1.25, JPY: 195.0, GBP: 1 }
};

const FALLBACK_BASE = 'CHF';
const CLIENT_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

let cachedRates = null;
let cachedBaseCurrency = FALLBACK_BASE;
let cachedAt = 0;
let pendingRatesPromise = null;

function normalizeCurrency(code) {
  return typeof code === 'string' && code.trim() ? code.trim().toUpperCase() : FALLBACK_BASE;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getStaticRate(base, target = FALLBACK_BASE) {
  const from = normalizeCurrency(base);
  const to = normalizeCurrency(target);
  if (from === to) return 1;

  const table = STATIC_RATES[from];
  const rate = table ? table[to] : undefined;
  return typeof rate === 'number' && Number.isFinite(rate) ? rate : 1;
}

function applyFallbackRates(base) {
  const normalizedBase = normalizeCurrency(base);
  const fallback = STATIC_RATES[normalizedBase] ?? null;
  cachedRates = fallback;
  cachedBaseCurrency = normalizedBase;
  cachedAt = fallback ? Date.now() : 0;
}

function resolveActiveRates(base) {
  const normalizedBase = normalizeCurrency(base);
  if (cachedRates && cachedBaseCurrency === normalizedBase) {
    return cachedRates;
  }
  return STATIC_RATES[normalizedBase] ?? null;
}

function convertViaBase(amount, from, target, base, rates) {
  if (!rates || from === target) return amount;

  if (from === base) {
    const directRate = rates[target];
    return typeof directRate === 'number' && directRate !== 0 ? amount * directRate : amount;
  }

  if (target === base) {
    const sourceRate = rates[from];
    return typeof sourceRate === 'number' && sourceRate !== 0 ? amount / sourceRate : amount;
  }

  const amountInBase = convertViaBase(amount, from, base, base, rates);
  return convertViaBase(amountInBase, base, target, base, rates);
}

export async function loadRatesIfNeeded(baseCurrency = FALLBACK_BASE) {
  const base = normalizeCurrency(baseCurrency);
  const now = Date.now();
  const cacheIsFresh =
    cachedRates && cachedBaseCurrency === base && now - cachedAt < CLIENT_CACHE_TTL_MS;
  if (cacheIsFresh) {
    return;
  }

  if (pendingRatesPromise) {
    return pendingRatesPromise;
  }

  pendingRatesPromise = (async () => {
    try {
      const res = await fetch(`/api/rates?base=${base}`);
      if (!res.ok) {
        throw new Error(`Rates proxy responded with ${res.status}`);
      }

      const data = await res.json();
      if (data && typeof data.rates === 'object' && data.rates !== null) {
        cachedRates = data.rates;
        cachedBaseCurrency = normalizeCurrency(data.base || base);
        cachedAt = Date.now();
      } else {
        applyFallbackRates(base);
      }
    } catch (err) {
      console.error('loadRatesIfNeeded failed, using fallback rates', err);
      applyFallbackRates(base);
    } finally {
      pendingRatesPromise = null;
    }
  })();

  return pendingRatesPromise;
}

export async function convertToBaseCurrency(amount, fromCurrency, baseCurrency = FALLBACK_BASE) {
  await loadRatesIfNeeded(baseCurrency);
  return convertWithCachedRates(amount, fromCurrency, baseCurrency);
}

export function convertWithCachedRates(amount, fromCurrency, baseCurrency = FALLBACK_BASE) {
  const numeric = toNumber(amount);
  const from = normalizeCurrency(fromCurrency);
  const target = normalizeCurrency(baseCurrency);

  if (!Number.isFinite(numeric) || from === target) {
    return numeric;
  }

  const ratesForBase = resolveActiveRates(target);
  if (ratesForBase) {
    const converted = convertViaBase(numeric, from, target, target, ratesForBase);
    return Number.isFinite(converted) ? converted : numeric;
  }

  const fallbackConversion = numeric * getStaticRate(from, target);
  return Number.isFinite(fallbackConversion) ? fallbackConversion : numeric;
}

export function convertAmount(amount, base, target = FALLBACK_BASE) {
  const numeric = toNumber(amount);
  const rate = getStaticRate(base, target);
  return numeric * rate;
}

export function convertToChf(amount, currency = FALLBACK_BASE) {
  return convertWithCachedRates(amount, currency, FALLBACK_BASE);
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
