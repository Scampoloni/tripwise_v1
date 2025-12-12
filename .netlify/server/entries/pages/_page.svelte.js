import { W as store_get, Y as ensure_array_like, U as attr_class, Z as attr_style, X as unsubscribe_stores, _ as head, $ as stringify } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import { e as escape_html } from "../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { t as trips } from "../../chunks/trips.js";
import { c as calculateSpent } from "../../chunks/calculations.js";
import { c as convertToChf, a as convertWithCachedRates } from "../../chunks/currency.js";
import { I as Icon } from "../../chunks/Icon.js";
function LiveBudgetModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { open = false } = $$props;
    const allTrips = store_get($$store_subs ??= {}, "$trips", trips) ?? [];
    const MS_PER_DAY = 864e5;
    function startOfDay(value) {
      if (!value) return null;
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    function parseDate(value) {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return startOfDay(date);
    }
    function diffInDays(from, to) {
      if (!from || !to) return 0;
      const start = startOfDay(from);
      const end = startOfDay(to);
      return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
    }
    function formatMoney(amount, currency = "CHF") {
      const numeric = Number(amount) || 0;
      try {
        return new Intl.NumberFormat("de-CH", { style: "currency", currency }).format(numeric);
      } catch {
        return `${numeric.toFixed(2)} ${currency}`;
      }
    }
    function formatDate(date) {
      if (!date) return "";
      return date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    function statusFromRatio(spent, expected) {
      if (!Number.isFinite(expected) || expected <= 0) {
        if (spent <= 0) return { label: "im Plan", tone: "plan" };
        return { label: "über Budget", tone: "over" };
      }
      const ratio = spent / expected;
      if (ratio > 1.1) return { label: "über Budget", tone: "over" };
      if (ratio < 0.75) return { label: "unter Budget", tone: "under" };
      return { label: "im Plan", tone: "plan" };
    }
    function clampPercent(value, ceiling = 999) {
      if (!Number.isFinite(value)) return 0;
      return Math.min(Math.max(Math.round(value), 0), ceiling);
    }
    function percentLabel(value) {
      return `${clampPercent(value)}%`;
    }
    function percentWidth(value) {
      return `${clampPercent(value, 120)}%`;
    }
    function toRunningTrip(trip) {
      if (!trip) return null;
      const start = parseDate(trip.startDate);
      const end = parseDate(trip.endDate);
      if (!start || !end) return null;
      const today = startOfDay(/* @__PURE__ */ new Date());
      if (today < start || today > end) return null;
      const budget = Number(trip.budget ?? 0);
      const currency = trip.currency ?? "CHF";
      const spent = Number(calculateSpent(trip.expenses ?? [])) || 0;
      const totalDays = Math.max(1, diffInDays(start, end) + 1);
      const daysElapsed = Math.min(totalDays, Math.max(1, diffInDays(start, today) + 1));
      const daysLeft = Math.max(0, diffInDays(today, end));
      const percent = budget > 0 ? Math.round(spent / budget * 100) : 0;
      const expected = budget > 0 ? budget * (daysElapsed / totalDays) : 0;
      const status = budget > 0 ? statusFromRatio(spent, expected) : { label: "Kein Budget", tone: "neutral" };
      const destinationLabel = trip.destinationName ?? trip.destination ?? "";
      return {
        id: trip.id ?? trip._id ?? `${trip.name ?? "trip"}-${start.getTime()}`,
        name: trip.name ?? "Unbenannter Trip",
        destinationName: destinationLabel,
        spent,
        budget,
        currency,
        percent,
        daysLeft,
        statusText: status.label,
        statusTone: status.tone
      };
    }
    function toUpcomingTrip(trip) {
      if (!trip) return null;
      const start = parseDate(trip.startDate);
      if (!start) return null;
      const today = startOfDay(/* @__PURE__ */ new Date());
      const daysUntilStart = diffInDays(today, start);
      if (daysUntilStart <= 0 || daysUntilStart > 60) return null;
      const budget = Number(trip.budget ?? 0);
      const currency = trip.currency ?? "CHF";
      const destinationLabel = trip.destinationName ?? trip.destination ?? "";
      return {
        id: trip.id ?? trip._id ?? `${trip.name ?? "trip"}-${start.getTime()}`,
        name: trip.name ?? "Unbenannter Trip",
        destinationName: destinationLabel,
        startsIn: daysUntilStart,
        startDate: formatDate(start),
        budget,
        currency,
        budgetChf: convertToChf(budget, currency)
      };
    }
    const runningTrips = allTrips.map(toRunningTrip).filter(Boolean);
    const upcomingTrips = allTrips.map(toUpcomingTrip).filter(Boolean);
    const upcomingBudgetTotalChf = upcomingTrips.reduce((sum, trip) => sum + (trip.budgetChf ?? 0), 0);
    if (open) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-backdrop svelte-1rm8f18" role="presentation" tabindex="-1"><div class="modal card svelte-1rm8f18" role="dialog" aria-modal="true" aria-label="Live Budget Übersicht"><header class="modal-header svelte-1rm8f18"><div class="title-group svelte-1rm8f18"><h3 class="svelte-1rm8f18">Live Budget</h3> <p class="svelte-1rm8f18">Aktuelle und bevorstehende Reisen auf einen Blick.</p></div> <div class="header-actions svelte-1rm8f18"><button type="button" class="cta-button svelte-1rm8f18">New Trip</button> <button type="button" class="close-button svelte-1rm8f18" aria-label="Schliessen">✕</button></div></header> <section class="section svelte-1rm8f18"><div class="section-header svelte-1rm8f18"><h4 class="svelte-1rm8f18">Aktuelle Reisen</h4> `);
      if (runningTrips.length) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="section-count svelte-1rm8f18">${escape_html(runningTrips.length)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (runningTrips.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="empty-hint svelte-1rm8f18">Derzeit laufen keine Reisen. Plane eine neue Reise, um dein Budget hier zu verfolgen.</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="trip-list svelte-1rm8f18"><!--[-->`);
        const each_array = ensure_array_like(runningTrips);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let trip = each_array[$$index];
          $$renderer2.push(`<article class="trip-card svelte-1rm8f18"><div class="trip-top svelte-1rm8f18"><div class="trip-heading svelte-1rm8f18"><h5 class="svelte-1rm8f18">${escape_html(trip.name)}</h5> `);
          if (trip.destinationName) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="trip-sub svelte-1rm8f18">${escape_html(trip.destinationName)}</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div> <span${attr_class(`status status--${trip.statusTone}`, "svelte-1rm8f18")}>${escape_html(trip.statusText)}</span></div> <div class="metrics svelte-1rm8f18"><div class="metric svelte-1rm8f18"><span class="label svelte-1rm8f18">Ausgegeben</span> <span class="value svelte-1rm8f18">${escape_html(formatMoney(trip.spent, trip.currency))}</span></div> <div class="metric svelte-1rm8f18"><span class="label svelte-1rm8f18">Budget</span> <span class="value svelte-1rm8f18">${escape_html(formatMoney(trip.budget, trip.currency))}</span></div> <div class="metric svelte-1rm8f18"><span class="label svelte-1rm8f18">Fortschritt</span> <span class="value svelte-1rm8f18">${escape_html(percentLabel(trip.percent))}</span></div> <div class="metric svelte-1rm8f18"><span class="label svelte-1rm8f18">Tage übrig</span> <span class="value svelte-1rm8f18">${escape_html(trip.daysLeft)}</span></div></div> <div class="progress-track svelte-1rm8f18" aria-hidden="true"><div class="progress-bar svelte-1rm8f18"${attr_style(`width:${percentWidth(trip.percent)}`)}></div></div></article>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></section> <section class="section upcoming svelte-1rm8f18"><div class="section-header svelte-1rm8f18"><h4 class="svelte-1rm8f18">Bevorstehende Reisen</h4> `);
      if (upcomingTrips.length) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="section-meta svelte-1rm8f18">Gesamt (CHF): ${escape_html(formatMoney(upcomingBudgetTotalChf, "CHF"))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (upcomingTrips.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="empty-hint svelte-1rm8f18">Keine Trips starten in den nächsten 60 Tagen.</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="trip-list upcoming-list svelte-1rm8f18"><!--[-->`);
        const each_array_1 = ensure_array_like(upcomingTrips);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let trip = each_array_1[$$index_1];
          $$renderer2.push(`<article class="upcoming-card svelte-1rm8f18"><div class="trip-top svelte-1rm8f18"><div class="trip-heading svelte-1rm8f18"><h5 class="svelte-1rm8f18">${escape_html(trip.name)}</h5> `);
          if (trip.destinationName) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="trip-sub svelte-1rm8f18">${escape_html(trip.destinationName)}</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div> <span class="starts-in svelte-1rm8f18">Startet in ${escape_html(trip.startsIn)} ${escape_html(trip.startsIn === 1 ? "Tag" : "Tagen")}</span></div> <div class="upcoming-meta svelte-1rm8f18"><div class="meta-block svelte-1rm8f18"><span class="label svelte-1rm8f18">Start</span> <span class="value svelte-1rm8f18">${escape_html(trip.startDate)}</span></div> <div class="meta-block svelte-1rm8f18"><span class="label svelte-1rm8f18">Budget</span> <span class="value svelte-1rm8f18">${escape_html(formatMoney(trip.budget, trip.currency))}</span></div> <div class="meta-block svelte-1rm8f18"><span class="label svelte-1rm8f18">≈ in CHF</span> <span class="value svelte-1rm8f18">${escape_html(formatMoney(trip.budgetChf, "CHF"))}</span></div></div></article>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></section> <footer class="modal-footer svelte-1rm8f18"><button type="button" class="dismiss-button svelte-1rm8f18">Fenster schliessen</button></footer></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { data } = $$props;
    const currentUser = data?.user ?? null;
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    function emailLocalPart(email) {
      if (!email || typeof email !== "string") return null;
      const at = email.indexOf("@");
      if (at === -1) return email.trim() || null;
      const local = email.slice(0, at).trim();
      return local || null;
    }
    const greetingName = currentUser?.displayName && currentUser.displayName.trim() ? currentUser.displayName.trim() : emailLocalPart(currentUser?.email) || "Travel Buddy";
    const greetingText = `Hallo ${greetingName}, dein Reisejahr ${currentYear} auf einen Blick 🌍`;
    const allTrips = store_get($$store_subs ??= {}, "$trips", trips) ?? [];
    const BASE_CURRENCY = "CHF";
    function toBaseCurrency(amount, currency = BASE_CURRENCY) {
      return convertWithCachedRates(amount, currency || BASE_CURRENCY, BASE_CURRENCY);
    }
    const MS_PER_DAY = 864e5;
    function startOfDay(date) {
      if (!date) return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function parseDate(value) {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : startOfDay(d);
    }
    function getYear(value) {
      const d = parseDate(value);
      return d ? d.getFullYear() : null;
    }
    function isActiveTrip(t) {
      const start = parseDate(t?.startDate);
      const end = parseDate(t?.endDate);
      if (!start || !end) return false;
      const today = startOfDay(/* @__PURE__ */ new Date());
      if (start.getFullYear() < today.getFullYear()) return false;
      return today >= start && today <= end;
    }
    function diffInDays(from, to) {
      if (!from || !to) return 0;
      const start = startOfDay(from);
      const end = startOfDay(to);
      return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
    }
    function budgetToChf(trip) {
      if (!trip) return 0;
      return toBaseCurrency(trip.budget ?? 0, trip.currency);
    }
    function spentToChf(trip) {
      if (!trip) return 0;
      const expenses = Array.isArray(trip.expenses) ? trip.expenses : [];
      if (expenses.length === 0) {
        const fallback = Number(calculateSpent(trip.expenses ?? [])) || 0;
        return toBaseCurrency(fallback, trip.currency);
      }
      return expenses.reduce((sum, exp) => sum + toBaseCurrency(exp?.amount ?? 0, exp?.currency || trip.currency || BASE_CURRENCY), 0);
    }
    function destinationLabel(trip) {
      if (!trip) return "";
      return trip.destinationName ?? trip.destination ?? "";
    }
    function formatCurrency(amount, currency = BASE_CURRENCY) {
      const numeric = Number(amount) || 0;
      try {
        return new Intl.NumberFormat("de-CH", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(numeric);
      } catch {
        return `${numeric.toFixed(0)} ${currency}`;
      }
    }
    function formatDateShort(date) {
      if (!date) return "";
      return date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    function nextFutureTrip(trips2) {
      const today = startOfDay(/* @__PURE__ */ new Date());
      const candidates = (trips2 ?? []).map((trip) => {
        const start = parseDate(trip?.startDate);
        if (!start || start <= today) return null;
        const budget = Number(trip?.budget) || 0;
        const fallbackCurrency = trip?.currency || BASE_CURRENCY;
        const budgetChf = toBaseCurrency(budget, fallbackCurrency);
        const daysUntil = Math.max(0, diffInDays(today, start));
        return {
          id: trip?.id,
          name: trip?.name ?? "Unbenannter Trip",
          destinationName: destinationLabel(trip),
          cityName: trip?.cityName,
          countryName: trip?.countryName,
          latitude: trip?.latitude ?? trip?.destinationLat,
          longitude: trip?.longitude ?? trip?.destinationLon,
          heroImageUrl: trip?.heroImageUrl ?? null,
          weatherPreview: trip?.weatherPreview ?? null,
          startDate: trip?.startDate,
          start,
          startFormatted: formatDateShort(start),
          daysUntil,
          countdownLabel: daysUntil === 0 ? "Heute" : daysUntil === 1 ? "in 1 Tag" : `in ${daysUntil} Tagen`,
          currency: fallbackCurrency,
          budget,
          budgetChf,
          budgetFormatted: formatCurrency(budget, fallbackCurrency),
          budgetChfFormatted: formatCurrency(budgetChf, BASE_CURRENCY),
          flag: trip?.flag || "🌍"
        };
      }).filter(Boolean).sort((a, b) => a.start - b.start);
      return candidates[0] ?? null;
    }
    function buildLiveOverview(trips2) {
      const today = startOfDay(/* @__PURE__ */ new Date());
      const active = (trips2 ?? []).filter((trip) => {
        if (!isActiveTrip(trip)) return false;
        const start = parseDate(trip?.startDate);
        return start && start.getFullYear() >= today.getFullYear();
      });
      const totalBudgetChf = active.reduce((sum, trip) => sum + budgetToChf(trip), 0);
      const totalSpentChf = active.reduce((sum, trip) => sum + spentToChf(trip), 0);
      const rawPercent = totalBudgetChf > 0 ? totalSpentChf / totalBudgetChf * 100 : 0;
      const percent = Number.isFinite(rawPercent) ? Math.round(rawPercent) : 0;
      const barPercent = Math.max(0, Math.min(rawPercent, 130));
      let status = "plan";
      let statusLabel = "Im Plan";
      if (rawPercent >= 100) {
        status = "over";
        statusLabel = "Über Budget";
      } else if (rawPercent >= 80) {
        status = "warning";
        statusLabel = "Achtung";
      }
      return {
        count: active.length,
        activeTrips: active,
        totalBudgetChf,
        totalSpentChf,
        percent,
        barPercent,
        status,
        statusLabel
      };
    }
    function buildYearSpendStats(trips2, year) {
      const filtered = (trips2 ?? []).filter((trip) => getYear(trip?.startDate) === year);
      const perTrip = filtered.map((trip) => {
        const spentChf = spentToChf(trip);
        const budgetChf = budgetToChf(trip);
        return { trip, spentChf, budgetChf };
      });
      const totalSpentChf = perTrip.reduce((sum, entry) => sum + entry.spentChf, 0);
      const totalBudgetChf = perTrip.reduce((sum, entry) => sum + entry.budgetChf, 0);
      const utilization = totalBudgetChf > 0 ? totalSpentChf / totalBudgetChf : 0;
      const tripsCount = filtered.length;
      const avgPerTripChf = tripsCount > 0 ? totalSpentChf / tripsCount : 0;
      const mostExpensive = perTrip.reduce(
        (best, entry) => {
          if (!entry?.trip) return best;
          if (!best || entry.spentChf > best.spentChf) return entry;
          return best;
        },
        null
      );
      return {
        trips: filtered,
        totalSpentChf,
        totalBudgetChf,
        utilization,
        tripsCount,
        avgPerTripChf,
        mostExpensiveTrip: mostExpensive ? {
          name: mostExpensive.trip?.name ?? "Trip",
          destination: destinationLabel(mostExpensive.trip),
          spentChf: mostExpensive.spentChf
        } : null
      };
    }
    function buildInsightsForYear(stats) {
      if (!stats) return [];
      const insights = [];
      if (!stats.tripsCount || stats.tripsCount === 0) {
        return ["Du hast für 2025 noch keine Reiseausgaben erfasst."];
      }
      if (stats.utilization < 0.4) {
        insights.push("Du liegst deutlich unter deinem Jahresbudget, du könntest dir spontan einen Kurztrip gönnen.");
      } else if (stats.utilization <= 0.85) {
        insights.push("Deine Ausgaben bewegen sich in einem guten Rahmen im Vergleich zu deinem Jahresbudget.");
      } else {
        insights.push("Du bist nahe an deinem Jahresbudget, plane deine nächsten Reisen vorsichtiger.");
      }
      if (stats.mostExpensiveTrip) {
        insights.push(`Teuerster Trip 2025: ${stats.mostExpensiveTrip.name} mit ca. ${formatCurrency(stats.mostExpensiveTrip.spentChf, BASE_CURRENCY)}`);
      }
      if (stats.avgPerTripChf > 0) {
        insights.push(`Durchschnittlich gibst du pro Trip etwa ${formatCurrency(stats.avgPerTripChf, BASE_CURRENCY)} aus.`);
      }
      return insights.filter(Boolean).slice(0, 3);
    }
    const nextTrip = nextFutureTrip(allTrips);
    const liveOverview = buildLiveOverview(allTrips);
    const spend2025 = buildYearSpendStats(allTrips, 2025);
    const insights2025 = buildInsightsForYear(spend2025);
    const utilizationPct2025 = Math.round(Math.max(0, spend2025?.utilization || 0) * 100);
    let modalOpen = false;
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Dashboard, TripWise</title>`);
      });
    });
    $$renderer2.push(`<section class="page-shell svelte-1uha8ag" data-animate="fadeUp"><header class="page-header card-surface svelte-1uha8ag"><div class="page-headings svelte-1uha8ag"><h1 class="svelte-1uha8ag">Dashboard</h1> <p class="page-subtitle svelte-1uha8ag">${escape_html(greetingText)}</p></div> <div class="actions svelte-1uha8ag"><button class="pill pill-secondary svelte-1uha8ag" type="button">`);
    Icon($$renderer2, { name: "plane", size: 16 });
    $$renderer2.push(`<!----> Trips</button> <button class="pill pill-secondary svelte-1uha8ag" type="button">`);
    Icon($$renderer2, { name: "bar-chart", size: 16 });
    $$renderer2.push(`<!----> Analytics</button> <button class="pill pill-secondary svelte-1uha8ag" type="button">`);
    Icon($$renderer2, { name: "globe", size: 16 });
    $$renderer2.push(`<!----> Globe</button></div></header> <div class="stats-layout svelte-1uha8ag"><div class="primary-row svelte-1uha8ag"><article class="overview-card card-surface svelte-1uha8ag"><div class="overview-top svelte-1uha8ag"><div><div class="card-label-with-icon svelte-1uha8ag">`);
    Icon($$renderer2, { name: "trending-up", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label svelte-1uha8ag">Live Overview</span></div> `);
    if (liveOverview.count > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<h2 class="overview-title svelte-1uha8ag">`);
      if (liveOverview.count === 1) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(liveOverview.activeTrips[0]?.name || "Trip")}`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`${escape_html(liveOverview.activeTrips.map((t) => t.name).join(", "))}`);
      }
      $$renderer2.push(`<!--]--></h2> <p class="overview-subtitle svelte-1uha8ag">${escape_html(liveOverview.count === 1 ? "Aktiver Trip" : `${liveOverview.count} aktive Trips`)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<h2 class="overview-title svelte-1uha8ag">Keine laufenden Reisen</h2> <p class="overview-subtitle svelte-1uha8ag">Starte einen Trip, um hier den Überblick zu sehen.</p>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="overview-pill svelte-1uha8ag"><span class="overview-percent svelte-1uha8ag">${escape_html(liveOverview.percent)}%</span> <span${attr_class(`status-badge status-${liveOverview.status}`, "svelte-1uha8ag")}>${escape_html(liveOverview.statusLabel)}</span></div></div> <div class="overview-progress svelte-1uha8ag"><div class="progress-header svelte-1uha8ag">Budgetverbrauch</div> <div class="progress-track svelte-1uha8ag"><div class="progress-fill svelte-1uha8ag"${attr_style(`width:${liveOverview.barPercent}%`)}></div></div></div> <div class="overview-metrics svelte-1uha8ag"><div><span class="metric-label svelte-1uha8ag">Budget gesamt</span> <span class="metric-value svelte-1uha8ag">${escape_html(formatCurrency(liveOverview.totalBudgetChf, BASE_CURRENCY))}</span></div> <div><span class="metric-label svelte-1uha8ag">Ausgegeben</span> <span class="metric-value svelte-1uha8ag">${escape_html(formatCurrency(liveOverview.totalSpentChf, BASE_CURRENCY))}</span></div></div></article> <aside class="next-trip-card card-surface svelte-1uha8ag"><div class="card-label-row svelte-1uha8ag"><div class="card-label-with-icon svelte-1uha8ag">`);
    Icon($$renderer2, { name: "calendar", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label svelte-1uha8ag">Nächster Trip</span></div> <span class="trip-icon svelte-1uha8ag">`);
    Icon($$renderer2, { name: "map-pin", size: 20 });
    $$renderer2.push(`<!----></span></div> `);
    if (nextTrip) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`next-trip-hero ${nextTrip.heroImageUrl ? "has-image" : ""}`, "svelte-1uha8ag")}${attr_style(nextTrip.heroImageUrl ? `background-image: url('${nextTrip.heroImageUrl}')` : "")}><div class="next-trip-hero-overlay svelte-1uha8ag">`);
      if (nextTrip.destinationName) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="next-trip-destination svelte-1uha8ag">${escape_html(nextTrip.destinationName)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <h3 class="next-trip-title svelte-1uha8ag">${escape_html(nextTrip.name)}</h3> <div class="next-trip-date svelte-1uha8ag"><span>${escape_html(nextTrip.startFormatted)}</span> <span class="countdown svelte-1uha8ag">${escape_html(nextTrip.countdownLabel)}</span></div></div></div> <div class="next-trip-body svelte-1uha8ag"><div class="next-trip-budget-row svelte-1uha8ag"><div><div class="next-trip-budget-label svelte-1uha8ag">Budget</div> <div class="next-trip-budget-main svelte-1uha8ag">${escape_html(nextTrip.budgetFormatted)}</div></div></div> <div class="next-trip-weather svelte-1uha8ag"><div class="next-trip-weather-label svelte-1uha8ag">`);
      Icon($$renderer2, { name: "sun", size: 16 });
      $$renderer2.push(`<!----> <span>Wetter am Anreisetag</span></div> `);
      if (nextTrip.daysUntil > 14) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="next-trip-weather-main svelte-1uha8ag">Wettervorhersage ab 14 Tage vor Abreise verfügbar.</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (nextTrip.daysUntil >= 0 && nextTrip.weatherPreview) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="next-trip-weather-main svelte-1uha8ag">`);
          if (nextTrip.weatherPreview.minTemp != null && nextTrip.weatherPreview.maxTemp != null) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`${escape_html(nextTrip.weatherPreview.minTemp)}–${escape_html(nextTrip.weatherPreview.maxTemp)} °C,`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> ${escape_html(nextTrip.weatherPreview.description || "Vorhersage")}</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (nextTrip.daysUntil >= 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="next-trip-weather-main svelte-1uha8ag">Wetterdaten werden geladen, bitte später erneut versuchen.</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<p class="next-trip-weather-main svelte-1uha8ag">Reise abgeschlossen, keine aktuelle Wettervorhersage.</p>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="next-trip-empty svelte-1uha8ag"><h3 class="svelte-1uha8ag">Kein nächster Trip geplant</h3> <p class="svelte-1uha8ag">Erstelle einen Trip, um hier eine Vorschau zu sehen.</p> <button class="pill pill-ghost svelte-1uha8ag" type="button">`);
      Icon($$renderer2, { name: "plus", size: 16 });
      $$renderer2.push(`<!----> Neuer Trip</button></div>`);
    }
    $$renderer2.push(`<!--]--></aside></div> <div class="secondary-row svelte-1uha8ag"><article class="year-spend-card card-surface svelte-1uha8ag"><div class="year-spend-header svelte-1uha8ag"><div><div class="card-label-with-icon svelte-1uha8ag">`);
    Icon($$renderer2, { name: "wallet", size: 16 });
    $$renderer2.push(`<!----> <span class="card-label svelte-1uha8ag">Reiseausgaben 2025</span></div> <p class="year-spend-subtitle svelte-1uha8ag">über ${escape_html(spend2025.tripsCount === 1 ? "1 Trip" : `${spend2025.tripsCount} Trips`)} mit Start 2025</p></div> <div class="year-spend-total svelte-1uha8ag"><div class="year-spend-total-main svelte-1uha8ag">${escape_html(formatCurrency(Math.round(spend2025.totalSpentChf), BASE_CURRENCY))}</div> `);
    if (spend2025.totalBudgetChf > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="year-spend-total-sub svelte-1uha8ag">${escape_html(utilizationPct2025)} Prozent deines Jahresbudgets sind bereits ausgegeben</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="year-spend-total-sub svelte-1uha8ag">Kein Jahresbudget hinterlegt</div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="year-spend-body svelte-1uha8ag"><div class="year-chips svelte-1uha8ag">`);
    if (spend2025.mostExpensiveTrip && spend2025.mostExpensiveTrip.spentChf > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="chip svelte-1uha8ag">Teuerster Trip: ${escape_html(formatCurrency(Math.round(spend2025.mostExpensiveTrip.spentChf), BASE_CURRENCY))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (spend2025.avgPerTripChf > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="chip svelte-1uha8ag">Ø pro Trip: ${escape_html(formatCurrency(Math.round(spend2025.avgPerTripChf), BASE_CURRENCY))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (spend2025.totalBudgetChf > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`chip status-chip ${stringify(spend2025.utilization >= 0.85 ? "warn" : spend2025.utilization < 0.4 ? "ok" : "mid")}`, "svelte-1uha8ag")}>`);
      if (spend2025.utilization < 0.4) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Unter Budget`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (spend2025.utilization < 0.85) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`Im grünen Bereich`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`Nahe am Budget`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="year-insights svelte-1uha8ag"><div class="year-insights-label svelte-1uha8ag">Smart Insights</div> `);
    if (insights2025.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<ul class="svelte-1uha8ag"><!--[-->`);
      const each_array = ensure_array_like(insights2025.slice(0, 3));
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let insight = each_array[idx];
        $$renderer2.push(`<li class="svelte-1uha8ag">${escape_html(insight)}</li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="insights-empty svelte-1uha8ag">Du hast für 2025 noch keine Reiseausgaben erfasst.</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></article></div></div> `);
    LiveBudgetModal($$renderer2, { open: modalOpen });
    $$renderer2.push(`<!----></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
