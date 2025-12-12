import { Z as attr_style, a0 as bind_props, W as store_get, _ as head, U as attr_class, V as attr, Y as ensure_array_like, X as unsubscribe_stores } from "../../../chunks/index2.js";
import { t as trips } from "../../../chunks/trips.js";
import { a as calculatePercentUsed } from "../../../chunks/calculations.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { e as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { I as Icon } from "../../../chunks/Icon.js";
function TripCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let expenses, rawBudget, cardBudget, rawCardSpent, cardSpent, percentUsed, daysRemaining, statusColor, displayDestination;
    let trip = $$props["trip"];
    function getInitials(name) {
      const trimmed = (name ?? "").trim();
      if (!trimmed) return "TR";
      const parts = trimmed.split(" ");
      if (parts.length === 1) {
        return trimmed.slice(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    expenses = Array.isArray(trip?.expenses) ? trip.expenses : [];
    rawBudget = typeof trip?.budget === "number" && Number.isFinite(trip.budget) ? trip.budget : Number(trip?.budget ?? trip?.totalBudget ?? 0) || 0;
    cardBudget = rawBudget > 0 ? rawBudget : 0;
    rawCardSpent = expenses.reduce(
      (sum, exp) => {
        const amount = Number(exp?.amount ?? 0);
        const s = Number.isFinite(sum) ? sum : 0;
        const v = Number.isFinite(amount) ? amount : 0;
        return s + v;
      },
      0
    );
    cardSpent = Number.isFinite(rawCardSpent) ? rawCardSpent : 0;
    percentUsed = calculatePercentUsed(cardSpent, cardBudget);
    daysRemaining = 0;
    statusColor = percentUsed >= 100 ? "var(--danger)" : percentUsed >= 80 ? "var(--warning)" : "var(--success)";
    displayDestination = trip?.destinationName ?? trip?.destination ?? "";
    getInitials(displayDestination || trip?.name || "");
    console.log("TRIPCARD LIST DATA", {
      id: trip?.id,
      name: trip?.name,
      budget: cardBudget,
      spent: cardSpent,
      rawBudget: trip?.budget,
      totalBudget: trip?.totalBudget,
      expensesCount: expenses.length
    });
    $$renderer2.push(`<div class="trip-card svelte-9jw4xf" role="button" tabindex="0"><button class="delete-btn svelte-9jw4xf" type="button" aria-label="Trip loeschen">`);
    Icon($$renderer2, { name: "trash", size: 14 });
    $$renderer2.push(`<!----></button> <div class="trip-inner svelte-9jw4xf"><div class="trip-avatar svelte-9jw4xf">`);
    Icon($$renderer2, { name: "map-pin", size: 22 });
    $$renderer2.push(`<!----></div> <div class="trip-main svelte-9jw4xf"><div class="trip-header svelte-9jw4xf"><div class="trip-title-block svelte-9jw4xf"><h3 class="svelte-9jw4xf">${escape_html(trip?.name)}</h3> `);
    if (displayDestination) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="trip-destination svelte-9jw4xf">${escape_html(displayDestination)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="trip-percentage svelte-9jw4xf"${attr_style(`color:${statusColor}`)}>${escape_html(Number.isFinite(percentUsed) ? `${percentUsed}%` : "--")}</div></div> <div class="budget-bar svelte-9jw4xf"><div class="budget-progress svelte-9jw4xf"${attr_style(`width:${Math.min(percentUsed || 0, 100)}%; background:${statusColor}`)}></div></div> <div class="trip-footer svelte-9jw4xf"><div class="budget-info svelte-9jw4xf"><span class="spent svelte-9jw4xf">${escape_html(cardSpent.toFixed(0))}</span> <span class="separator svelte-9jw4xf">/</span> <span class="total svelte-9jw4xf">${escape_html(cardBudget.toFixed(0))} ${escape_html(trip?.currency)}</span></div> <div class="trip-meta svelte-9jw4xf">`);
    if (daysRemaining > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="days">${escape_html(daysRemaining)} ${escape_html(daysRemaining === 1 ? "day" : "days")} left</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="days completed svelte-9jw4xf">Completed</span>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div>`);
    bind_props($$props, { trip });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const allTrips = store_get($$store_subs ??= {}, "$trips", trips) ?? [];
    let filterStatus = "all";
    let searchTerm = "";
    const today = startOfDay(/* @__PURE__ */ new Date());
    const filteredTrips = (() => {
      const list = Array.isArray(allTrips) ? allTrips : [];
      const byStatus = list.filter((trip) => matchesStatus());
      const term = searchTerm.trim().toLowerCase();
      const bySearch = term ? byStatus.filter((trip) => matchesSearch(trip, term)) : byStatus;
      return [...bySearch].sort((a, b) => smartSortTrips(a, b, today));
    })();
    const visibleTrips = filteredTrips.slice(0, 5);
    const hasMoreTrips = filteredTrips.length > 5;
    function destinationLabel(trip) {
      if (!trip) return "";
      return trip.destinationName ?? trip.destination ?? "";
    }
    function matchesSearch(trip, term) {
      const name = (trip?.name ?? "").toLowerCase();
      const destination = destinationLabel(trip).toLowerCase();
      return name.includes(term) || destination.includes(term);
    }
    function matchesStatus(trip, status, referenceDate) {
      return true;
    }
    function smartSortTrips(a, b, referenceDate) {
      const aActive = isActiveTrip(a, referenceDate);
      const bActive = isActiveTrip(b, referenceDate);
      const aFuture = isFutureTrip(a, referenceDate);
      const bFuture = isFutureTrip(b, referenceDate);
      const aPast = isPastTrip(a, referenceDate);
      const bPast = isPastTrip(b, referenceDate);
      const getPriority = (active, future, past) => {
        if (active) return 0;
        if (future) return 1;
        if (past) return 2;
        return 3;
      };
      const priorityA = getPriority(aActive, aFuture, aPast);
      const priorityB = getPriority(bActive, bFuture, bPast);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      if (aPast && bPast) {
        return toTime(parseDate(b?.endDate), -Infinity) - toTime(parseDate(a?.endDate), -Infinity);
      }
      return toTime(parseDate(a?.startDate), Infinity) - toTime(parseDate(b?.startDate), Infinity);
    }
    function parseDate(value) {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return startOfDay(date);
    }
    function startOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function toTime(date, fallback) {
      return date ? date.getTime() : fallback;
    }
    function isActiveTrip(trip, referenceDate) {
      const start = parseDate(trip?.startDate);
      const end = parseDate(trip?.endDate);
      if (!start || !end) return false;
      return start.getTime() <= referenceDate.getTime() && referenceDate.getTime() <= end.getTime();
    }
    function isFutureTrip(trip, referenceDate) {
      const start = parseDate(trip?.startDate);
      if (!start) return false;
      return start.getTime() > referenceDate.getTime();
    }
    function isPastTrip(trip, referenceDate) {
      const end = parseDate(trip?.endDate);
      if (!end) return false;
      return end.getTime() < referenceDate.getTime();
    }
    head("uegczf", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Trips, TripWise</title>`);
      });
    });
    $$renderer2.push(`<section class="page-shell svelte-uegczf" data-animate="fadeUp"><header class="page-header card-surface page-header--centered svelte-uegczf"><div class="page-headings page-headings--center svelte-uegczf"><h1 class="svelte-uegczf">Trip List</h1> <p class="page-subtitle svelte-uegczf">Alle Reisen im Überblick</p></div> <div class="actions actions--center svelte-uegczf"><button class="pill pill-cta svelte-uegczf" type="button">`);
    Icon($$renderer2, { name: "plus", size: 16 });
    $$renderer2.push(`<!----> Neuer Trip</button> <button class="pill pill-secondary svelte-uegczf" type="button">`);
    Icon($$renderer2, { name: "home", size: 16 });
    $$renderer2.push(`<!----> Dashboard</button></div></header> `);
    if (allTrips.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section class="empty-card card-surface svelte-uegczf"><span class="empty-icon svelte-uegczf">`);
      Icon($$renderer2, { name: "plane", size: 48, strokeWidth: 1.5 });
      $$renderer2.push(`<!----></span> <h2 class="svelte-uegczf">Starte deine erste Reise</h2> <p class="svelte-uegczf">Budget setzen, Ausgaben erfassen, Live-Insights erhalten</p> <button class="pill pill-cta svelte-uegczf" type="button">`);
      Icon($$renderer2, { name: "plus", size: 16 });
      $$renderer2.push(`<!----> Trip erstellen</button></section>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<section class="trip-list card-surface svelte-uegczf"><div class="trip-list-header svelte-uegczf"><div class="card-label-with-icon svelte-uegczf">`);
      Icon($$renderer2, { name: "plane", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-uegczf">Reisen</span></div> <span class="trip-count svelte-uegczf">${escape_html(filteredTrips.length)} ${escape_html(filteredTrips.length === 1 ? "Trip" : "Trips")}</span></div> <div class="triplist-controls svelte-uegczf"><div class="pill-group svelte-uegczf" role="tablist" aria-label="Trip Status Filter"><button type="button"${attr_class(`pill pill-toggle ${"is-active"}`, "svelte-uegczf")}${attr("aria-pressed", filterStatus === "all")}>Alle</button> <button type="button"${attr_class(`pill pill-toggle ${""}`, "svelte-uegczf")}${attr("aria-pressed", filterStatus === "active")}>Aktiv</button> <button type="button"${attr_class(`pill pill-toggle ${""}`, "svelte-uegczf")}${attr("aria-pressed", filterStatus === "upcoming")}>Zukünftig</button> <button type="button"${attr_class(`pill pill-toggle ${""}`, "svelte-uegczf")}${attr("aria-pressed", filterStatus === "past")}>Vergangen</button></div> <label class="search svelte-uegczf" aria-label="Suche nach Trips">`);
      Icon($$renderer2, { name: "search", size: 16 });
      $$renderer2.push(`<!----> <input type="search" placeholder="Nach Trip oder Ort suchen"${attr("value", searchTerm)} class="svelte-uegczf"/></label></div> `);
      if (filteredTrips.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="trip-list-empty svelte-uegczf"><p class="svelte-uegczf">Keine Trips entsprechen den aktuellen Filtern.</p> <button type="button" class="pill pill-secondary svelte-uegczf">`);
        Icon($$renderer2, { name: "x", size: 16 });
        $$renderer2.push(`<!----> Filter zurücksetzen</button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="trip-list-items svelte-uegczf"><!--[-->`);
        const each_array = ensure_array_like(visibleTrips);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let trip = each_array[$$index];
          TripCard($$renderer2, { trip });
        }
        $$renderer2.push(`<!--]--></div> `);
        if (hasMoreTrips && true) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button class="show-more-btn svelte-uegczf">Weitere Trips anzeigen (${escape_html(filteredTrips.length - 5)})</button>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></section>`);
    }
    $$renderer2.push(`<!--]--></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
