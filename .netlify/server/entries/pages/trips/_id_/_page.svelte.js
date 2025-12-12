import { W as store_get, _ as head, V as attr, Y as ensure_array_like, U as attr_class, Z as attr_style, X as unsubscribe_stores } from "../../../../chunks/index2.js";
import { t as trips } from "../../../../chunks/trips.js";
import { c as convertToChf } from "../../../../chunks/currency.js";
import { p as page } from "../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
/* empty css                                                          */
import { I as Icon } from "../../../../chunks/Icon.js";
import { e as escape_html } from "../../../../chunks/context.js";
function normalizeParticipants(trip) {
  const list = Array.isArray(trip?.participants) ? trip.participants : [];
  if (list.length === 0) {
    return [{ id: "me", name: "Du" }];
  }
  const normalized = list.map((participant) => ({
    id: typeof participant?.id === "string" && participant.id.trim() ? participant.id.trim() : void 0,
    name: typeof participant?.name === "string" && participant.name.trim() ? participant.name.trim() : void 0
  })).filter((participant) => participant.id && participant.name);
  return normalized.length > 0 ? normalized : [{ id: "me", name: "Du" }];
}
function ensureEntry(map, participant) {
  if (!map.has(participant.id)) {
    map.set(participant.id, {
      participant,
      paid: 0,
      share: 0
    });
  }
  return map.get(participant.id);
}
function normalizeAmount(amount) {
  const numeric = Number(amount);
  return Number.isFinite(numeric) ? numeric : 0;
}
function calculateSplit(trip, expenses) {
  const participants = normalizeParticipants(trip);
  const totals = new Map(
    participants.map((participant) => [participant.id, { participant, paid: 0, share: 0 }])
  );
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return participants.map((participant) => ({ participant, paid: 0, share: 0, net: 0 }));
  }
  for (const expense of expenses) {
    const amount = normalizeAmount(expense?.amount);
    if (amount <= 0) continue;
    const currency = typeof expense?.currency === "string" ? expense.currency : "CHF";
    const amountInChf = convertToChf(amount, currency);
    const payerId = typeof expense?.paidByParticipantId === "string" && expense.paidByParticipantId.trim() ? expense.paidByParticipantId.trim() : participants[0]?.id ?? "me";
    const payerEntry = ensureEntry(totals, totals.get(payerId)?.participant ?? {
      id: payerId,
      name: participants.find((participant) => participant.id === payerId)?.name || "Unbekannt"
    });
    payerEntry.paid += amountInChf;
    if (expense?.splitBetweenAll === true && participants.length > 0) {
      const perHead = amountInChf / participants.length;
      for (const participant of participants) {
        const entry = ensureEntry(totals, participant);
        entry.share += perHead;
      }
    }
  }
  return Array.from(totals.values()).map((entry) => ({
    participant: entry.participant,
    paid: entry.paid,
    share: entry.share,
    net: entry.paid - entry.share
  }));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    function computeDateRange(value) {
      if (!value) return "";
      const start = formatDate(value.startDate);
      const end = formatDate(value.endDate);
      if (start && end) {
        return start === end ? start : `${start} - ${end}`;
      }
      return start || end || "";
    }
    const tripId = store_get($$store_subs ??= {}, "$page", page).params.id;
    const allTrips = store_get($$store_subs ??= {}, "$trips", trips) ?? [];
    const tripFromStore = allTrips.find((t) => t?.id === tripId) ?? null;
    const tripFromServer = store_get($$store_subs ??= {}, "$page", page).data?.trip ?? null;
    const trip = tripFromStore ?? tripFromServer ?? null;
    const displayDestination = (() => {
      const legacyDestination = trip && typeof trip === "object" && "destination" in trip ? (
        /** @type {any} */
        trip.destination
      ) : "";
      return trip?.destinationName ?? legacyDestination ?? "";
    })();
    const tripCurrency = trip?.currency ?? "CHF";
    const fallbackParticipants = [{ id: "me", name: "Du" }];
    (() => {
      const list = trip?.participants ?? [];
      if (!Array.isArray(list) || list.length === 0) {
        return fallbackParticipants;
      }
      const sanitized = list.map((participant) => ({
        id: typeof participant?.id === "string" ? participant.id.trim() : "",
        name: typeof participant?.name === "string" ? participant.name.trim() : ""
      })).filter((participant) => participant.id && participant.name);
      return sanitized.length > 0 ? sanitized : fallbackParticipants;
    })();
    const expenses = trip ? [...trip.expenses ?? []].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    expenses.slice(0, 4);
    (() => {
      if (!trip) return [];
      if (!Array.isArray(expenses) || expenses.length === 0) return [];
      return calculateSplit(trip, expenses);
    })();
    const totalBudget = (() => {
      const raw = Number(trip?.budget ?? 0);
      return Number.isFinite(raw) ? raw : 0;
    })();
    const expensesForBudget = (() => Array.isArray(trip?.expenses) ? trip.expenses : [])();
    const spent = (() => expensesForBudget.reduce(
      (sum, expense) => {
        const safeSum = Number.isFinite(sum) ? sum : 0;
        const amount = Number(expense?.amount ?? 0);
        const safeAmount = Number.isFinite(amount) ? amount : 0;
        return safeSum + safeAmount;
      },
      0
    ))();
    const remaining = (() => Math.max(0, totalBudget - spent))();
    const progressPct = (() => {
      if (totalBudget <= 0) return 0;
      const ratio = spent / totalBudget * 100;
      if (!Number.isFinite(ratio)) return 0;
      return Math.min(100, Math.max(0, Math.round(ratio)));
    })();
    const expenseCount = expenses.length;
    const hasExpenses = expenseCount > 0;
    function formatDate(iso) {
      if (!iso) return "";
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "short", year: "numeric" }).format(date);
    }
    function daysBetween(startIso, endIso) {
      if (!startIso || !endIso) return 0;
      const start = new Date(startIso);
      const end = new Date(endIso);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    }
    function pastDaysForTripRange(tripValue) {
      if (!tripValue?.startDate || !tripValue?.endDate) return 0;
      const start = new Date(tripValue.startDate);
      const end = new Date(tripValue.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
      const today = /* @__PURE__ */ new Date();
      const effectiveEnd = today.getTime() > end.getTime() ? end : today;
      const diffMs = effectiveEnd.getTime() - start.getTime();
      const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    }
    function startOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function parseTripDate(value) {
      if (!value) return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      return startOfDay(parsed);
    }
    function isActiveTripRange(tripValue, referenceDate) {
      if (!tripValue) return false;
      const start = parseTripDate(tripValue.startDate);
      const end = parseTripDate(tripValue.endDate);
      if (!start || !end) return false;
      const ref = referenceDate.getTime();
      return start.getTime() <= ref && ref <= end.getTime();
    }
    function isFutureTripRange(tripValue, referenceDate) {
      if (!tripValue) return false;
      const start = parseTripDate(tripValue.startDate);
      if (!start) return false;
      return start.getTime() > referenceDate.getTime();
    }
    function isPastTripRange(tripValue, referenceDate) {
      if (!tripValue) return false;
      const end = parseTripDate(tripValue.endDate);
      if (!end) return false;
      return end.getTime() < referenceDate.getTime();
    }
    function inferDerivedTripStatus(value, referenceDate) {
      if (!value) return null;
      if (isFutureTripRange(value, referenceDate)) return "planned";
      if (isPastTripRange(value, referenceDate)) return "completed";
      if (isActiveTripRange(value, referenceDate)) return "active";
      return null;
    }
    const statusLabels = {
      planned: "Geplant",
      active: "Aktiv",
      completed: "Abgeschlossen"
    };
    const statusReferenceDate = startOfDay(/* @__PURE__ */ new Date());
    const derivedTripStatus = (() => inferDerivedTripStatus(trip, statusReferenceDate))();
    const displayStatus = (() => {
      if (derivedTripStatus) {
        return statusLabels[derivedTripStatus];
      }
      return trip?.status ?? "";
    })();
    const dateRange = computeDateRange(trip);
    const percentUsedDisplay = (() => {
      const pct = Number(progressPct) || 0;
      return Math.max(0, Math.min(999, pct));
    })();
    const budgetStatus = (() => {
      let label = "Im Budget";
      let className = "badge--success";
      if (totalBudget <= 0) {
        label = "Kein Budget gesetzt";
        className = "badge--neutral";
      } else if (spent > totalBudget) {
        label = "Budget überschritten";
        className = "badge--danger";
      } else if (spent >= 0.8 * totalBudget) {
        label = "Nahe am Limit";
        className = "badge--warning";
      }
      return { label, className };
    })();
    const tripDays = (() => daysBetween(trip?.startDate, trip?.endDate))();
    const dailyBudget = (() => tripDays > 0 && totalBudget > 0 ? totalBudget / tripDays : 0)();
    const pastDays = (() => trip && (trip.status === "active" || trip.status === "completed") ? pastDaysForTripRange(trip) : 0)();
    const avgPerDay = (() => pastDays > 0 ? spent / pastDays : 0)();
    const topCategoryInsight = (() => {
      const expenses2 = expensesForBudget;
      if (!Array.isArray(expenses2) || expenses2.length === 0 || spent <= 0) {
        return { label: "", percent: 0 };
      }
      const byCategory = /* @__PURE__ */ new Map();
      for (const expense of expenses2) {
        const category = expense?.category || "Andere";
        const amount = Number(expense?.amount ?? 0);
        const safeAmount = Number.isFinite(amount) ? amount : 0;
        byCategory.set(category, (byCategory.get(category) ?? 0) + safeAmount);
      }
      let bestLabel = "";
      let bestSum = 0;
      for (const [category, sum] of byCategory.entries()) {
        if (sum > bestSum) {
          bestLabel = category;
          bestSum = sum;
        }
      }
      const percent = bestSum > 0 ? bestSum / spent * 100 : 0;
      return { label: bestLabel, percent };
    })();
    (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const overviewExpenses = expenses.slice(0, 3);
    head("xkuoj7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(trip ? `${trip.name} · TripWise` : "Trip · TripWise")}</title>`);
      });
    });
    if (!trip) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section class="page-shell page-empty svelte-xkuoj7" data-animate="fadeUp"><div class="empty-card card-surface svelte-xkuoj7"><div class="empty-icon svelte-xkuoj7">`);
      Icon($$renderer2, { name: "map-pin", size: 48 });
      $$renderer2.push(`<!----></div> <h1 class="svelte-xkuoj7">Trip nicht gefunden</h1> <p class="svelte-xkuoj7">Bitte kehre zur Übersicht zurück.</p> <a href="/trips" class="pill pill-cta svelte-xkuoj7">`);
      Icon($$renderer2, { name: "home", size: 16 });
      $$renderer2.push(`<!----> Zur Übersicht</a></div></section>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<section class="page-shell svelte-xkuoj7" data-animate="fadeUp"><header class="page-header card-surface svelte-xkuoj7"><div class="page-headings svelte-xkuoj7"><div class="page-headline-row svelte-xkuoj7"><div><h1 class="svelte-xkuoj7">${escape_html(trip.name)}</h1> `);
      if (displayDestination) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="page-subtitle svelte-xkuoj7">${escape_html(displayDestination)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (dateRange) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="page-meta svelte-xkuoj7">${escape_html(dateRange)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div></div> <div class="actions svelte-xkuoj7"><button type="button" class="pill pill-secondary svelte-xkuoj7">`);
      Icon($$renderer2, { name: "home", size: 16 });
      $$renderer2.push(`<!----> Übersicht</button> <button type="button" class="pill pill-secondary svelte-xkuoj7">`);
      Icon($$renderer2, { name: "bar-chart", size: 16 });
      $$renderer2.push(`<!----> Analytics</button> <button type="button" class="pill pill-cta svelte-xkuoj7">`);
      Icon($$renderer2, { name: "plus", size: 16 });
      $$renderer2.push(`<!----> Ausgabe erfassen</button></div></header> <div class="trip-detail-layout svelte-xkuoj7"><section class="trip-panel trip-panel--overview card-surface svelte-xkuoj7"><div class="summary-head svelte-xkuoj7"><span class="card-label-with-icon svelte-xkuoj7">`);
      Icon($$renderer2, { name: "globe", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-xkuoj7">Reiseüberblick</span></span> `);
      if (displayStatus) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="summary-badge svelte-xkuoj7"${attr("data-status", derivedTripStatus ?? void 0)}><span class="badge-dot svelte-xkuoj7"></span> ${escape_html(displayStatus)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="summary-grid svelte-xkuoj7"><div class="summary-item svelte-xkuoj7"><span class="summary-label svelte-xkuoj7">Destination</span> <span class="summary-value svelte-xkuoj7">${escape_html(displayDestination || "—")}</span></div> <div class="summary-item svelte-xkuoj7"><span class="summary-label svelte-xkuoj7">Zeitraum</span> <span class="summary-value svelte-xkuoj7">${escape_html(dateRange || "—")}</span></div></div> <div class="overview-expenses card-subsection expenses-card svelte-xkuoj7"><div class="expenses-head svelte-xkuoj7"><div><span class="card-label-with-icon svelte-xkuoj7">`);
      Icon($$renderer2, { name: "receipt", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-xkuoj7">Ausgaben</span></span> <p class="section-subtitle svelte-xkuoj7">${escape_html(hasExpenses ? "Alle erfassten Ausgaben im Überblick." : "Erfasse deine erste Ausgabe, um dein Budget im Blick zu behalten.")}</p></div></div> `);
      if (!hasExpenses) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty-state svelte-xkuoj7"><div class="empty-icon small svelte-xkuoj7">`);
        Icon($$renderer2, { name: "receipt", size: 28 });
        $$renderer2.push(`<!----></div> <h3 class="svelte-xkuoj7">Noch keine Ausgaben</h3> <p class="svelte-xkuoj7">Erstelle deine erste Ausgabe, um deinen Reiseverlauf zu starten.</p> <button class="pill pill-cta svelte-xkuoj7" type="button">`);
        Icon($$renderer2, { name: "plus", size: 16 });
        $$renderer2.push(`<!----> Ausgabe erfassen</button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<ul class="expense-list svelte-xkuoj7"><!--[-->`);
        const each_array = ensure_array_like(overviewExpenses);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let expense = each_array[$$index];
          $$renderer2.push(`<li class="expense-item svelte-xkuoj7"><div class="expense-meta svelte-xkuoj7"><div class="expense-title svelte-xkuoj7">${escape_html(expense.description)}</div> <div class="expense-sub svelte-xkuoj7">${escape_html(expense.category || "Ohne Kategorie")} • ${escape_html(formatDate(expense.date) || expense.date)}</div></div> <div class="expense-amount svelte-xkuoj7"><span>${escape_html(expense.amount.toFixed(2))} ${escape_html(tripCurrency)}</span> <button class="expense-delete svelte-xkuoj7" type="button" title="Ausgabe löschen" aria-label="Ausgabe löschen">`);
          Icon($$renderer2, { name: "trash", size: 14 });
          $$renderer2.push(`<!----></button></div></li>`);
        }
        $$renderer2.push(`<!--]--></ul> `);
        if (expenseCount > 3) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button type="button" class="show-more-btn svelte-xkuoj7">${escape_html(`Weitere Ausgaben anzeigen (${expenseCount - 3})`)}</button>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></section> <section class="trip-panel trip-panel--budget card-surface svelte-xkuoj7"><div class="budget-head svelte-xkuoj7"><span class="card-label-with-icon svelte-xkuoj7">`);
      Icon($$renderer2, { name: "wallet", size: 16 });
      $$renderer2.push(`<!----> <span class="card-label svelte-xkuoj7">Budget Status</span></span> <span${attr_class(`badge ${budgetStatus.className}`, "svelte-xkuoj7")}>${escape_html(budgetStatus.label)}</span></div> <div class="budget-progress svelte-xkuoj7"><div class="budget-progress__info svelte-xkuoj7"><span class="budget-progress__value svelte-xkuoj7">${escape_html(percentUsedDisplay.toFixed(0))}%</span> <span class="budget-progress__hint svelte-xkuoj7">${escape_html(remaining <= 0 ? "Budget ausgeschöpft" : `Noch ${remaining.toFixed(2)} ${tripCurrency} verfügbar`)}</span></div> <div class="progress svelte-xkuoj7" aria-label="Budget Fortschritt"><div class="progress__bar svelte-xkuoj7"${attr_style(`width:${Math.min(percentUsedDisplay, 100)}%`)}></div></div></div> <div class="budget-stats-grid svelte-xkuoj7"><div class="budget-stat svelte-xkuoj7"><span class="label svelte-xkuoj7">Gesamtbudget</span> <span class="value svelte-xkuoj7">${escape_html(totalBudget.toFixed(2))} ${escape_html(tripCurrency)}</span></div> <div class="budget-stat svelte-xkuoj7"><span class="label svelte-xkuoj7">Ausgegeben</span> <span class="value value--warn svelte-xkuoj7">${escape_html(spent.toFixed(2))} ${escape_html(tripCurrency)}</span></div> <div class="budget-stat svelte-xkuoj7"><span class="label svelte-xkuoj7">Verbleibend</span> <span${attr_class(`value ${remaining > 0 ? "value--ok" : "value--warn"}`, "svelte-xkuoj7")}>${escape_html(remaining.toFixed(2))} ${escape_html(tripCurrency)}</span></div></div> `);
      if (trip?.status === "active" || trip?.status === "completed") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="budget-daily svelte-xkuoj7"><div class="budget-daily__col svelte-xkuoj7"><span class="label svelte-xkuoj7">Tagesbudget</span> <span class="value svelte-xkuoj7">${escape_html(dailyBudget.toFixed(0))} ${escape_html(tripCurrency)}</span></div> <div class="budget-daily__col svelte-xkuoj7"><span class="label svelte-xkuoj7">Durchschnitt pro Tag</span> <span class="value svelte-xkuoj7">${escape_html(avgPerDay.toFixed(0))} ${escape_html(tripCurrency)}</span></div> `);
        if (dailyBudget > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="budget-daily__note svelte-xkuoj7">`);
          if (avgPerDay <= dailyBudget) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`Im Rahmen des Tagesbudgets`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`Über dem Tagesbudget`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (topCategoryInsight.label) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="budget-insight svelte-xkuoj7"><span class="label svelte-xkuoj7">Top Kategorie</span> <span class="value svelte-xkuoj7">${escape_html(topCategoryInsight.label)} (${escape_html(topCategoryInsight.percent.toFixed(0))}%)</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></section></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></section>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
