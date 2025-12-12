import { json } from "@sveltejs/kit";
import { S as STATIC_RATES } from "../../../../chunks/currency.js";
const CACHE_TTL_MS = 12 * 60 * 60 * 1e3;
const CACHE_CONTROL_HEADER = `public, max-age=${Math.floor(CACHE_TTL_MS / 1e3)}`;
let cachedPayload = null;
let cachedBase = "CHF";
let cachedAt = 0;
function normalizeCurrency(code = "CHF") {
  return typeof code === "string" && code.trim() ? code.trim().toUpperCase() : "CHF";
}
function fallbackRates(base) {
  const normalizedBase = normalizeCurrency(base);
  const table = STATIC_RATES[normalizedBase] ?? null;
  if (table) {
    return {
      base: normalizedBase,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      rates: table
    };
  }
  const fallbackBase = "CHF";
  return {
    base: normalizedBase,
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    rates: STATIC_RATES[fallbackBase] ?? {}
  };
}
async function GET({ url, fetch }) {
  const requestedBase = normalizeCurrency(url.searchParams.get("base") || "CHF");
  const now = Date.now();
  const cacheIsFresh = cachedPayload && cachedBase === requestedBase && now - cachedAt < CACHE_TTL_MS;
  if (cacheIsFresh) {
    return json(cachedPayload, {
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER
      }
    });
  }
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?base=${requestedBase}`);
    if (!res.ok) {
      throw new Error(`Frankfurter API responded with ${res.status}`);
    }
    const remote = await res.json();
    const payload = {
      base: normalizeCurrency(remote?.base || requestedBase),
      date: remote?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      rates: typeof remote?.rates === "object" && remote?.rates !== null ? remote.rates : {}
    };
    cachedPayload = payload;
    cachedBase = payload.base;
    cachedAt = now;
    return json(payload, {
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER
      }
    });
  } catch (err) {
    console.error("FX proxy failed, serving fallback rates", err);
    const fallback = fallbackRates(requestedBase);
    cachedPayload = fallback;
    cachedBase = requestedBase;
    cachedAt = now;
    return json(fallback, {
      headers: {
        "Cache-Control": "public, max-age=300"
      }
    });
  }
}
export {
  GET
};
