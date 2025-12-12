import { W as store_get, X as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { t as trips } from "../../../chunks/trips.js";
import { I as Icon } from "../../../chunks/Icon.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$trips", trips) ?? [];
    $$renderer2.push(`<section class="page-shell svelte-1m0gshv" data-animate="fadeUp"><header class="page-header card-surface page-header--centered svelte-1m0gshv"><div class="page-headings page-headings--center svelte-1m0gshv"><h1 class="svelte-1m0gshv">Analytics</h1> <p class="page-subtitle svelte-1m0gshv">Globale Reise-Insights auf einen Blick</p></div> <div class="actions actions--center svelte-1m0gshv"><button class="pill pill-secondary svelte-1m0gshv" type="button">`);
    Icon($$renderer2, {
      name: "home",
      size: (
        // Wenn Trips sich aendern (z.B. nach Laden aus dem Backend), Charts neu bauen
        16
      )
    });
    $$renderer2.push(`<!----> Zurück zum Dashboard</button></div></header> <section class="analytics card-surface svelte-1m0gshv"><div class="grid svelte-1m0gshv"><div class="card svelte-1m0gshv"><span class="card-label-with-icon svelte-1m0gshv">`);
    Icon($$renderer2, { name: "target", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label svelte-1m0gshv">Ausgaben nach Kategorie</span></span> <canvas height="280"></canvas></div> <div class="card tall svelte-1m0gshv"><span class="card-label-with-icon svelte-1m0gshv">`);
    Icon($$renderer2, { name: "bar-chart", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label svelte-1m0gshv">Ausgaben pro Trip</span></span> <div class="chart-wrap svelte-1m0gshv"><canvas></canvas></div></div></div></section></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
