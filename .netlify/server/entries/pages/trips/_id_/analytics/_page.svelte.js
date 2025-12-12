import { W as store_get, _ as head, X as unsubscribe_stores } from "../../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import { e as escape_html } from "../../../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { t as trips } from "../../../../../chunks/trips.js";
import { c as calculateSpent } from "../../../../../chunks/calculations.js";
import { p as page } from "../../../../../chunks/stores.js";
import { B as BackButton } from "../../../../../chunks/BackButton.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const tripId = store_get($$store_subs ??= {}, "$page", page).params.id;
    const trip = (store_get($$store_subs ??= {}, "$trips", trips) ?? []).find((t) => t?.id === tripId) ?? null;
    const displayDestination = (() => {
      const legacyDestination = trip && typeof trip === "object" && "destination" in trip ? (
        /** @type {any} */
        trip.destination
      ) : "";
      return trip?.destinationName ?? legacyDestination ?? "";
    })();
    const totalBudget = trip?.budget ?? 0;
    const totalSpent = trip ? calculateSpent(trip.expenses ?? []) : 0;
    const remaining = Math.max(0, totalBudget - totalSpent);
    const hasExpenses = (trip?.expenses ?? []).length > 0;
    head("s4dktu", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(trip ? `${trip.name} · Analytics · TripWise` : "Trip Analytics · TripWise")}</title>`);
      });
    });
    if (!trip) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section class="page-shell svelte-s4dktu" data-animate="fadeUp"><div class="card-surface empty-card svelte-s4dktu"><div class="empty-icon svelte-s4dktu">`);
      Icon($$renderer2, { name: "bar-chart", size: 32 });
      $$renderer2.push(`<!----></div> <h1 class="svelte-s4dktu">Trip nicht gefunden</h1> <p class="svelte-s4dktu">Bitte kehre zur Übersicht zurück.</p> `);
      BackButton($$renderer2, { defaultHref: "/" });
      $$renderer2.push(`<!----></div></section>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<section class="page-shell svelte-s4dktu" data-animate="fadeUp"><header class="page-header card-surface svelte-s4dktu"><div class="page-headings svelte-s4dktu"><h1 class="svelte-s4dktu">${escape_html(trip.name)} – Analytics</h1> <p class="page-subtitle svelte-s4dktu">${escape_html(displayDestination)} • ${escape_html(trip.startDate)} – ${escape_html(trip.endDate)}</p></div> <div class="actions svelte-s4dktu"><button class="pill pill-secondary svelte-s4dktu" type="button">`);
      Icon($$renderer2, { name: "arrow-left", size: 16 });
      $$renderer2.push(`<!----> Zurück zur Reise</button></div></header> <div class="analytics-grid svelte-s4dktu"><article class="card-surface summary-card svelte-s4dktu"><div class="card-label-with-icon svelte-s4dktu">`);
      Icon($$renderer2, { name: "wallet", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-s4dktu">ÜBERSICHT</span></div> <div class="summary-grid svelte-s4dktu"><div class="stat svelte-s4dktu"><span class="label svelte-s4dktu">Budget</span> <span class="value neutral svelte-s4dktu">${escape_html(totalBudget.toFixed(2))} ${escape_html(trip.currency)}</span></div> <div class="stat svelte-s4dktu"><span class="label svelte-s4dktu">Spent</span> <span class="value warn svelte-s4dktu">${escape_html(totalSpent.toFixed(2))} ${escape_html(trip.currency)}</span></div> <div class="stat svelte-s4dktu"><span class="label svelte-s4dktu">Remaining</span> <span class="value ok svelte-s4dktu">${escape_html(remaining.toFixed(2))} ${escape_html(trip.currency)}</span></div></div></article> <article class="card-surface chart-card svelte-s4dktu"><div class="card-label-with-icon svelte-s4dktu">`);
      Icon($$renderer2, { name: "bar-chart", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-s4dktu">AUSGABEN NACH KATEGORIE</span></div> `);
      if (hasExpenses) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="chart-wrap svelte-s4dktu"><canvas></canvas></div> <div class="insights svelte-s4dktu"><p class="insight">${escape_html(totalSpent.toFixed(0))} ${escape_html(trip.currency)} ausgegeben – ${escape_html(remaining.toFixed(0))} ${escape_html(trip.currency)} verbleibend.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="empty-state svelte-s4dktu"><div class="empty-icon small svelte-s4dktu">`);
        Icon($$renderer2, { name: "receipt", size: 24 });
        $$renderer2.push(`<!----></div> <p class="empty svelte-s4dktu">Für diesen Trip wurden noch keine Ausgaben erfasst.</p></div>`);
      }
      $$renderer2.push(`<!--]--></article></div></section>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
