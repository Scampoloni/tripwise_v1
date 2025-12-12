import { V as attr, a0 as bind_props, U as attr_class } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { B as BackButton } from "../../../../chunks/BackButton.js";
import { f as fallback } from "../../../../chunks/utils2.js";
import { e as escape_html } from "../../../../chunks/context.js";
import { I as Icon } from "../../../../chunks/Icon.js";
function PlaceSearchInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let label = fallback($$props["label"], "Reiseziel");
    let placeholder = fallback($$props["placeholder"], "Stadt oder Ort eingeben");
    let initialValueName = fallback($$props["initialValueName"], "");
    let onSelect = fallback($$props["onSelect"], () => {
    });
    let query = initialValueName || "";
    if (initialValueName && !query) {
      query = initialValueName;
    }
    $$renderer2.push(`<div class="place-input svelte-1mck0n">`);
    if (
      // Versuch, Stadt + Land schoen anzuzeigen
      // kleines Delay, damit Klick auf einen Vorschlag noch durch geht
      label
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<label class="place-input__label svelte-1mck0n">${escape_html(label)}</label>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="place-input__field-wrapper svelte-1mck0n"><input class="place-input__field svelte-1mck0n" type="text"${attr("value", query)}${attr("placeholder", placeholder)} autocomplete="off"/> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { label, placeholder, initialValueName, onSelect });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let destinationName = "";
    let destinationLat = null;
    let destinationLon = null;
    let destinationCountry = "";
    let startDate = "";
    let endDate = "";
    let budgetStr = "";
    let currency = "CHF";
    function parseBudget(s) {
      const v = parseFloat(s.replace(/\s+/g, "").replace(",", "."));
      return Number.isFinite(v) && v >= 0 ? v : null;
    }
    parseBudget(budgetStr) !== null;
    function handlePlaceSelect(place) {
      destinationName = place.name;
      destinationLat = typeof place.lat === "number" ? place.lat : null;
      destinationLon = typeof place.lon === "number" ? place.lon : null;
      destinationCountry = place.country ?? "";
      console.log("Selected place for new trip", place);
    }
    $$renderer2.push(`<section class="page-shell svelte-s4msom" data-animate="fadeUp"><header class="page-header card-surface svelte-s4msom"><div class="page-headings svelte-s4msom"><div class="page-title-row svelte-s4msom"><div class="page-title-icon svelte-s4msom">`);
    Icon($$renderer2, { name: "plane", size: 22 });
    $$renderer2.push(`<!----></div> <h1 class="svelte-s4msom">New Trip</h1></div> <p class="page-subtitle svelte-s4msom">Lege eine neue Reise mit Budget, Zeitraum und Notiz an.</p></div> `);
    BackButton($$renderer2, { label: "Zurück", defaultHref: "/trips" });
    $$renderer2.push(`<!----></header> <div class="content-grid svelte-s4msom"><article class="form-card card-surface svelte-s4msom"><div class="stepper svelte-s4msom"><div${attr_class(`step ${"active"}`, "svelte-s4msom")}><span class="svelte-s4msom">1</span> <small class="svelte-s4msom">Basis</small></div> <div class="connector svelte-s4msom"></div> <div${attr_class(`step ${""}`, "svelte-s4msom")}><span class="svelte-s4msom">2</span> <small class="svelte-s4msom">Budget</small></div> <div class="connector svelte-s4msom"></div> <div${attr_class(`step ${""}`, "svelte-s4msom")}><span class="svelte-s4msom">3</span> <small class="svelte-s4msom">Prüfen</small></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section class="form-section svelte-s4msom"><span class="card-label-with-icon svelte-s4msom">`);
      Icon($$renderer2, { name: "map-pin", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-s4msom">Basisdaten</span></span> <div class="field svelte-s4msom"><label for="trip-name" class="svelte-s4msom">Reisetitel</label> <input id="trip-name" class="input svelte-s4msom"${attr("value", name)} placeholder="z. B. Sommer in Island"/></div> <div class="field svelte-s4msom">`);
      PlaceSearchInput($$renderer2, {
        label: "Reiseziel",
        placeholder: "Stadt oder Ort eingeben",
        initialValueName: destinationName,
        onSelect: handlePlaceSelect
      });
      $$renderer2.push(`<!----> `);
      if (destinationLat !== null && destinationLon !== null) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="place-debug svelte-s4msom">Ausgewaehlter Ort: ${escape_html(destinationName)} (${escape_html(destinationLat)}, ${escape_html(destinationLon)}) ${escape_html(destinationCountry)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="field-row svelte-s4msom"><div class="field svelte-s4msom"><label for="trip-start" class="svelte-s4msom">Startdatum</label> <input id="trip-start" class="input svelte-s4msom" type="date"${attr("value", startDate)}/></div> <div class="field svelte-s4msom"><label for="trip-end" class="svelte-s4msom">Enddatum</label> <input id="trip-end" class="input svelte-s4msom" type="date"${attr("value", endDate)}/></div></div> <div class="form-actions svelte-s4msom"><button class="btn ghost svelte-s4msom" type="button" disabled>`);
      Icon($$renderer2, { name: "arrow-left", size: 16 });
      $$renderer2.push(`<!----> Zurück</button> <button class="btn primary svelte-s4msom" type="button"${attr("disabled", true, true)}>Weiter `);
      Icon($$renderer2, { name: "arrow-right", size: 16 });
      $$renderer2.push(`<!----></button></div></section>`);
    }
    $$renderer2.push(`<!--]--></article> <aside class="preview-card card-surface svelte-s4msom"><header class="preview-header svelte-s4msom"><span class="card-label-with-icon svelte-s4msom">`);
    Icon($$renderer2, { name: "smartphone", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label svelte-s4msom">Live-Vorschau</span></span> <p class="svelte-s4msom">Deine Angaben aktualisieren sich in Echtzeit.</p></header> <div class="preview-body svelte-s4msom"><div class="preview-title svelte-s4msom">${escape_html("Neuer Trip")}</div> <div class="preview-meta svelte-s4msom">${escape_html(destinationName || "Ziel noch offen")}</div> <div class="preview-dates svelte-s4msom">${escape_html("—")} – ${escape_html("—")}</div> <div class="preview-budget svelte-s4msom">Budget: <strong class="svelte-s4msom">${escape_html(parseBudget(budgetStr) ?? 0)} ${escape_html(currency)}</strong></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="preview-tips svelte-s4msom"><span class="card-label-with-icon svelte-s4msom">`);
    Icon($$renderer2, { name: "lightbulb", size: 14 });
    $$renderer2.push(`<!----> <span class="card-label svelte-s4msom">Tipps</span></span> <ul class="svelte-s4msom"><li class="svelte-s4msom">Klare Kategorien helfen später bei Analytics.</li> <li class="svelte-s4msom">Währungen kannst du jederzeit anpassen.</li> <li class="svelte-s4msom">Nach dem Speichern landest du direkt in der Detailansicht.</li></ul></div></aside></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
