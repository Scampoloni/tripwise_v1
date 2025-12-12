import { W as store_get, _ as head, Y as ensure_array_like, X as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { e as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { t as trips } from "../../../chunks/trips.js";
import { I as Icon } from "../../../chunks/Icon.js";
function computeTripStatus(trip) {
  const rawStatus = trip?.status?.toLowerCase?.() ?? "";
  if (rawStatus === "cancelled" || rawStatus === "canceled") {
    return "completed";
  }
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const startDate = trip?.startDate ? new Date(trip.startDate) : null;
  const endDate = trip?.endDate ? new Date(trip.endDate) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(0, 0, 0, 0);
  if (endDate && endDate < now) {
    return "completed";
  }
  if (startDate && startDate <= now) {
    return "active";
  }
  return "planned";
}
function getTripsWithCoordinates(allTrips) {
  if (!Array.isArray(allTrips)) return [];
  return allTrips.map((trip) => {
    const rawLat = trip?.destinationLat ?? trip?.lat;
    const rawLon = trip?.destinationLon ?? trip?.lon;
    const latNum = typeof rawLat === "string" ? parseFloat(rawLat) : rawLat;
    const lonNum = typeof rawLon === "string" ? parseFloat(rawLon) : rawLon;
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;
    return {
      id: trip.id,
      title: trip.name ?? trip.title ?? "",
      status: computeTripStatus(trip),
      destinationName: trip.destinationName ?? trip.destination ?? "",
      lat: latNum,
      lon: lonNum
    };
  }).filter(Boolean);
}
const TOTAL_COUNTRIES = 195;
const COMPLETED_STATUSES = /* @__PURE__ */ new Set(["completed", "complete", "finished", "done", "active"]);
const CANCELLED_STATUSES = /* @__PURE__ */ new Set(["cancelled", "canceled"]);
function normalizeCountryCode(trip) {
  const code = trip?.countryCode ?? trip?.country ?? trip?.destinationCountry;
  if (typeof code !== "string") return null;
  const trimmed = code.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase();
}
function parseDate(value) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}
function hasTripStarted(trip) {
  const start = parseDate(trip?.startDate);
  if (!start) return false;
  return start.valueOf() <= Date.now();
}
function shouldCountTrip(trip) {
  if (!trip) return false;
  const status = typeof trip.status === "string" ? trip.status.trim().toLowerCase() : "";
  if (COMPLETED_STATUSES.has(status)) return true;
  if (CANCELLED_STATUSES.has(status)) return false;
  return hasTripStarted(trip);
}
function getWorldTravelStats(allTrips) {
  if (!Array.isArray(allTrips) || allTrips.length === 0) {
    return {
      totalCountries: TOTAL_COUNTRIES,
      visitedCount: 0,
      visitedPercent: 0,
      countries: []
    };
  }
  const visited = /* @__PURE__ */ new Set();
  for (const trip of allTrips) {
    if (!shouldCountTrip(trip)) continue;
    const code = normalizeCountryCode(trip);
    if (code) {
      visited.add(code);
    }
  }
  const visitedCount = visited.size;
  const visitedPercent = visitedCount > 0 ? Math.round(visitedCount / TOTAL_COUNTRIES * 100) : 0;
  return {
    totalCountries: TOTAL_COUNTRIES,
    visitedCount,
    visitedPercent,
    countries: Array.from(visited).sort()
  };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const allTrips = store_get($$store_subs ??= {}, "$trips", trips) ?? [];
    getTripsWithCoordinates(allTrips);
    const worldStats = getWorldTravelStats(allTrips);
    const MAX_COUNTRIES = 5;
    const visibleCountries = worldStats.countries.slice(0, MAX_COUNTRIES);
    const hasMoreCountries = worldStats.countries.length > MAX_COUNTRIES;
    head("12b307e", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>World Globe, TripWise</title>`);
      });
    });
    $$renderer2.push(`<section class="page-shell svelte-12b307e" data-animate="fadeUp"><header class="page-header card-surface page-header--centered svelte-12b307e"><div class="page-headings page-headings--center svelte-12b307e"><h1 class="svelte-12b307e">World Globe</h1> <p class="page-subtitle svelte-12b307e">Alle Trips mit Koordinaten auf einen Blick</p></div> <div class="actions actions--center svelte-12b307e"><button class="pill pill-secondary svelte-12b307e" type="button">`);
    Icon($$renderer2, { name: "home", size: 16 });
    $$renderer2.push(`<!----> Zurück zum Dashboard</button></div></header> <article class="stats-card card-surface svelte-12b307e"><div><span class="card-label-with-icon svelte-12b307e">`);
    Icon($$renderer2, { name: "map-pin", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label">Visited countries</span></span> <h2 class="stats-value svelte-12b307e">${escape_html(worldStats.visitedCount)} / ${escape_html(worldStats.totalCountries)}</h2> <p class="stats-subtitle svelte-12b307e">Du hast ${escape_html(worldStats.visitedPercent)}% aller Länder gesehen.</p></div> `);
    if (worldStats.countries.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="country-list svelte-12b307e"><!--[-->`);
      const each_array = ensure_array_like(visibleCountries);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let code = each_array[$$index];
        $$renderer2.push(`<span class="country-chip svelte-12b307e">${escape_html(code)}</span>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (hasMoreCountries) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="country-toggle svelte-12b307e" type="button">${escape_html(`+${worldStats.countries.length - MAX_COUNTRIES} mehr`)}</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="stats-hint svelte-12b307e">Noch keine abgeschlossenen Reisen mit Länder-Code.</p>`);
    }
    $$renderer2.push(`<!--]--></article> <section class="globe-panel card-surface svelte-12b307e"><div class="globe-header svelte-12b307e"><span class="card-label-with-icon svelte-12b307e">`);
    Icon($$renderer2, { name: "globe", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label">World map</span></span> <h2 class="svelte-12b307e">Trips mit Koordinaten</h2> <p class="svelte-12b307e">Visualisiert geplante, aktive und abgeschlossene Ziele</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="globe-loading svelte-12b307e"><p>Lade Trips...</p></div>`);
    }
    $$renderer2.push(`<!--]--></section></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
