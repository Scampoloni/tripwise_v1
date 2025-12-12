const STATIC_RATES = {
  CHF: { EUR: 1.03, USD: 1.02, JPY: 166, GBP: 0.84, CHF: 1 },
  EUR: { CHF: 0.97, USD: 0.99, JPY: 161, GBP: 0.82, EUR: 1 },
  USD: { CHF: 0.98, EUR: 1.01, JPY: 156, GBP: 0.8, USD: 1 },
  JPY: { CHF: 6e-3, EUR: 62e-4, USD: 64e-4, GBP: 51e-4, JPY: 1 },
  GBP: { CHF: 1.19, EUR: 1.22, USD: 1.25, JPY: 195, GBP: 1 }
};
const FALLBACK_BASE = "CHF";
function normalizeCurrency(code) {
  return typeof code === "string" && code.trim() ? code.trim().toUpperCase() : FALLBACK_BASE;
}
function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}
function getStaticRate(base, target = FALLBACK_BASE) {
  const from = normalizeCurrency(base);
  const to = normalizeCurrency(target);
  if (from === to) return 1;
  const table = STATIC_RATES[from];
  const rate = table ? table[to] : void 0;
  return typeof rate === "number" && Number.isFinite(rate) ? rate : 1;
}
function resolveActiveRates(base) {
  const normalizedBase = normalizeCurrency(base);
  return STATIC_RATES[normalizedBase] ?? null;
}
function convertViaBase(amount, from, target, base, rates) {
  if (!rates || from === target) return amount;
  if (from === base) {
    const directRate = rates[target];
    return typeof directRate === "number" && directRate !== 0 ? amount * directRate : amount;
  }
  if (target === base) {
    const sourceRate = rates[from];
    return typeof sourceRate === "number" && sourceRate !== 0 ? amount / sourceRate : amount;
  }
  const amountInBase = convertViaBase(amount, from, base, base, rates);
  return convertViaBase(amountInBase, base, target, base, rates);
}
function convertWithCachedRates(amount, fromCurrency, baseCurrency = FALLBACK_BASE) {
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
function convertToChf(amount, currency = FALLBACK_BASE) {
  return convertWithCachedRates(amount, currency, FALLBACK_BASE);
}
export {
  STATIC_RATES as S,
  convertWithCachedRates as a,
  convertToChf as c
};
