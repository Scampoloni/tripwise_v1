<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { trips } from '$lib/stores/trips.js';
  import LiveBudgetModal from '$lib/components/LiveBudgetModal.svelte';
  import { calculateSpent } from '$lib/utils/calculations.js';
  import { convertWithCachedRates, loadRatesIfNeeded } from '$lib/utils/currency.js';
  import Icon from '$lib/components/Icon.svelte';

  const { data } = $props();
  const currentUser = $derived(data?.user ?? null);
  const currentYear = new Date().getFullYear();

  function emailLocalPart(email) {
    if (!email || typeof email !== 'string') return null;
    const at = email.indexOf('@');
    if (at === -1) return email.trim() || null;
    const local = email.slice(0, at).trim();
    return local || null;
  }

  const greetingName = $derived(
    (currentUser?.displayName && currentUser.displayName.trim())
      ? currentUser.displayName.trim()
      : emailLocalPart(currentUser?.email) || 'Travel Buddy'
  );

  const greetingText = $derived(
    `Hallo ${greetingName}, dein Reisejahr ${currentYear} auf einen Blick 🌍`
  );

  const allTrips = $derived($trips ?? []);
  const BASE_CURRENCY = 'CHF';
  let fxRefreshKey = $state(0);

  function toBaseCurrency(amount, currency = BASE_CURRENCY) {
    fxRefreshKey;
    return convertWithCachedRates(amount, currency || BASE_CURRENCY, BASE_CURRENCY);
  }

  onMount(async () => {
    if (!browser) return;
    try {
      await loadRatesIfNeeded(BASE_CURRENCY);
    } catch (err) {
      console.warn('FX rates not available, using fallback', err);
    } finally {
      fxRefreshKey += 1;
    }
  });

  const MS_PER_DAY = 86_400_000;

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
    const today = startOfDay(new Date());
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
    return expenses.reduce(
      (sum, exp) =>
        sum + toBaseCurrency(exp?.amount ?? 0, exp?.currency || trip.currency || BASE_CURRENCY),
      0
    );
  }

  function destinationLabel(trip) {
    if (!trip) return '';
    return trip.destinationName ?? trip.destination ?? '';
  }

  function formatCurrency(amount, currency = BASE_CURRENCY) {
    const numeric = Number(amount) || 0;
    try {
      return new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numeric);
    } catch {
      return `${numeric.toFixed(0)} ${currency}`;
    }
  }

  function formatDateShort(date) {
    if (!date) return '';
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function nextFutureTrip(trips) {
    const today = startOfDay(new Date());
    const candidates = (trips ?? [])
      .map((trip) => {
        const start = parseDate(trip?.startDate);
        if (!start || start <= today) return null;
        const budget = Number(trip?.budget) || 0;
        const fallbackCurrency = trip?.currency || BASE_CURRENCY;
        const budgetChf = toBaseCurrency(budget, fallbackCurrency);
        const daysUntil = Math.max(0, diffInDays(today, start));
        return {
          id: trip?.id,
          name: trip?.name ?? 'Unbenannter Trip',
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
          countdownLabel:
            daysUntil === 0
              ? 'Heute'
              : daysUntil === 1
              ? 'in 1 Tag'
              : `in ${daysUntil} Tagen`,
          currency: fallbackCurrency,
          budget,
          budgetChf,
          budgetFormatted: formatCurrency(budget, fallbackCurrency),
          budgetChfFormatted: formatCurrency(budgetChf, BASE_CURRENCY),
          flag: trip?.flag || '🌍'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    return candidates[0] ?? null;
  }

  function buildLiveOverview(trips) {
    const today = startOfDay(new Date());
    const active = (trips ?? []).filter((trip) => {
      if (!isActiveTrip(trip)) return false;
      const start = parseDate(trip?.startDate);
      return start && start.getFullYear() >= today.getFullYear();
    });

    const totalBudgetChf = active.reduce((sum, trip) => sum + budgetToChf(trip), 0);
    const totalSpentChf = active.reduce((sum, trip) => sum + spentToChf(trip), 0);
    const rawPercent = totalBudgetChf > 0 ? (totalSpentChf / totalBudgetChf) * 100 : 0;
    const percent = Number.isFinite(rawPercent) ? Math.round(rawPercent) : 0;
    const barPercent = Math.max(0, Math.min(rawPercent, 130));

    let status = 'plan';
    let statusLabel = 'Im Plan';
    if (rawPercent >= 100) {
      status = 'over';
      statusLabel = 'Über Budget';
    } else if (rawPercent >= 80) {
      status = 'warning';
      statusLabel = 'Achtung';
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

  function buildYearSpendStats(trips, year) {
    const filtered = (trips ?? []).filter((trip) => getYear(trip?.startDate) === year);

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

    const mostExpensive = perTrip.reduce((best, entry) => {
      if (!entry?.trip) return best;
      if (!best || entry.spentChf > best.spentChf) return entry;
      return best;
    }, null);

    return {
      trips: filtered,
      totalSpentChf,
      totalBudgetChf,
      utilization,
      tripsCount,
      avgPerTripChf,
      mostExpensiveTrip: mostExpensive
        ? {
            name: mostExpensive.trip?.name ?? 'Trip',
            destination: destinationLabel(mostExpensive.trip),
            spentChf: mostExpensive.spentChf
          }
        : null
    };
  }

  function buildInsightsForYear(stats) {
    if (!stats) return [];
    const insights = [];

    if (!stats.tripsCount || stats.tripsCount === 0) {
      return ['Du hast für 2025 noch keine Reiseausgaben erfasst.'];
    }

    if (stats.utilization < 0.4) {
      insights.push('Du liegst deutlich unter deinem Jahresbudget, du könntest dir spontan einen Kurztrip gönnen.');
    } else if (stats.utilization <= 0.85) {
      insights.push('Deine Ausgaben bewegen sich in einem guten Rahmen im Vergleich zu deinem Jahresbudget.');
    } else {
      insights.push('Du bist nahe an deinem Jahresbudget, plane deine nächsten Reisen vorsichtiger.');
    }

    if (stats.mostExpensiveTrip) {
      insights.push(
        `Teuerster Trip 2025: ${stats.mostExpensiveTrip.name} mit ca. ${formatCurrency(stats.mostExpensiveTrip.spentChf, BASE_CURRENCY)}`
      );
    }

    if (stats.avgPerTripChf > 0) {
      insights.push(`Durchschnittlich gibst du pro Trip etwa ${formatCurrency(stats.avgPerTripChf, BASE_CURRENCY)} aus.`);
    }

    return insights.filter(Boolean).slice(0, 3);
  }

  const nextTrip = $derived(nextFutureTrip(allTrips));

  const liveOverview = $derived(buildLiveOverview(allTrips));

  const spend2025 = $derived(buildYearSpendStats(allTrips, 2025));
  const insights2025 = $derived(buildInsightsForYear(spend2025));
  const utilizationPct2025 = $derived(Math.round(Math.max(0, spend2025?.utilization || 0) * 100));

  let modalOpen = $state(false);
</script>


<svelte:head>
  <title>Dashboard, TripWise</title>
</svelte:head>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface">
    <div class="page-headings">
      <h1>Dashboard</h1>
      <p class="page-subtitle">{greetingText}</p>
    </div>

    <div class="actions">
     
      <button class="pill pill-secondary" type="button" onclick={() => goto('/trips')}>
        <Icon name="plane" size={16} /> Trips
      </button>
      <button class="pill pill-secondary" type="button" onclick={() => goto('/analytics')}>
        <Icon name="bar-chart" size={16} /> Analytics
      </button>
      <button class="pill pill-secondary" type="button" onclick={() => goto('/globe')}>
        <Icon name="globe" size={16} /> Globe
      </button>
    </div>
  </header>

  {#if allTrips.length > 0}
  <div class="stats-layout">
    <div class="primary-row">
      <article class="overview-card card-surface">
        <div class="overview-top">
          <div>
            <div class="card-label-with-icon">
              <Icon name="trending-up" size={16} />
              <span class="card-label">Live Overview</span>
            </div>
            {#if liveOverview.count > 0}
              <h2 class="overview-title">
                {#if liveOverview.count === 1}
                  {liveOverview.activeTrips[0]?.name || 'Trip'}
                {:else}
                  {liveOverview.activeTrips.map(t => t.name).join(', ')}
                {/if}
              </h2>
              <p class="overview-subtitle">
                {liveOverview.count === 1 ? 'Aktiver Trip' : `${liveOverview.count} aktive Trips`}
              </p>
            {:else}
              <h2 class="overview-title">Keine laufenden Reisen</h2>
              <p class="overview-subtitle">Starte einen Trip, um hier den Überblick zu sehen.</p>
            {/if}
          </div>
          <div class="overview-pill">
            <span class="overview-percent">{liveOverview.percent}%</span>
            <span class={`status-badge status-${liveOverview.status}`}>
              {liveOverview.statusLabel}
            </span>
          </div>
        </div>

        <div class="overview-progress">
          <div class="progress-header">Budgetverbrauch</div>
          <div class="progress-track">
            <div class="progress-fill" style={`width:${liveOverview.barPercent}%`}></div>
          </div>
        </div>

        <div class="overview-metrics">
          <div>
            <span class="metric-label">Budget gesamt</span>
            <span class="metric-value">{formatCurrency(liveOverview.totalBudgetChf, BASE_CURRENCY)}</span>
          </div>
          <div>
            <span class="metric-label">Ausgegeben</span>
            <span class="metric-value">{formatCurrency(liveOverview.totalSpentChf, BASE_CURRENCY)}</span>
          </div>
        </div>
      </article>

      <aside class="next-trip-card card-surface">
        <div class="card-label-row">
          <div class="card-label-with-icon">
            <Icon name="calendar" size={16} />
            <span class="card-label">Nächster Trip</span>
          </div>
          <span class="trip-icon"><Icon name="map-pin" size={20} /></span>
        </div>

        {#if nextTrip}
          <div
            class={`next-trip-hero ${nextTrip.heroImageUrl ? 'has-image' : ''}`}
            style={nextTrip.heroImageUrl ? `background-image: url('${nextTrip.heroImageUrl}')` : ''}
          >
            <div class="next-trip-hero-overlay">
              {#if nextTrip.destinationName}
                <p class="next-trip-destination">{nextTrip.destinationName}</p>
              {/if}
              <h3 class="next-trip-title">{nextTrip.name}</h3>
              <div class="next-trip-date">
                <span>{nextTrip.startFormatted}</span>
                <span class="countdown">{nextTrip.countdownLabel}</span>
              </div>
            </div>
          </div>

          <div class="next-trip-body">
            <div class="next-trip-budget-row">
              <div>
                <div class="next-trip-budget-label">Budget</div>
                <div class="next-trip-budget-main">{nextTrip.budgetFormatted}</div>
              </div>
            </div>

            <div class="next-trip-weather">
              <div class="next-trip-weather-label">
                <Icon name="sun" size={16} />
                <span>Wetter am Anreisetag</span>
              </div>
              {#if nextTrip.daysUntil > 14}
                <p class="next-trip-weather-main">Wettervorhersage ab 14 Tage vor Abreise verfügbar.</p>
              {:else if nextTrip.daysUntil >= 0 && nextTrip.weatherPreview}
                <p class="next-trip-weather-main">
                  {#if nextTrip.weatherPreview.minTemp != null && nextTrip.weatherPreview.maxTemp != null}
                    {nextTrip.weatherPreview.minTemp}–{nextTrip.weatherPreview.maxTemp} °C,
                  {/if}
                  {nextTrip.weatherPreview.description || 'Vorhersage'}
                </p>
              {:else if nextTrip.daysUntil >= 0}
                <p class="next-trip-weather-main">Wetterdaten werden geladen, bitte später erneut versuchen.</p>
              {:else}
                <p class="next-trip-weather-main">Reise abgeschlossen, keine aktuelle Wettervorhersage.</p>
              {/if}
            </div>
          </div>
        {:else}
          <div class="next-trip-empty">
            <h3>Kein nächster Trip geplant</h3>
            <p>Erstelle einen Trip, um hier eine Vorschau zu sehen.</p>
            <button class="pill pill-ghost" type="button" onclick={() => goto('/trips/new')}>
              <Icon name="plus" size={16} /> Neuer Trip
            </button>
          </div>
        {/if}
      </aside>
    </div>

    <div class="secondary-row">
      <article class="year-spend-card card-surface">
        <div class="year-spend-header">
          <div>
            <div class="card-label-with-icon">
              <Icon name="wallet" size={16} />
              <span class="card-label">Reiseausgaben 2025</span>
            </div>
            <p class="year-spend-subtitle">
              über {spend2025.tripsCount === 1 ? '1 Trip' : `${spend2025.tripsCount} Trips`} mit Start 2025
            </p>
          </div>
          <div class="year-spend-total">
            <div class="year-spend-total-main">{formatCurrency(Math.round(spend2025.totalSpentChf), BASE_CURRENCY)}</div>
            {#if spend2025.totalBudgetChf > 0}
              <div class="year-spend-total-sub">{utilizationPct2025} Prozent deines Jahresbudgets sind bereits ausgegeben</div>
            {:else}
              <div class="year-spend-total-sub">Kein Jahresbudget hinterlegt</div>
            {/if}
          </div>
        </div>

        <div class="year-spend-body">
          <div class="year-chips">
            {#if spend2025.mostExpensiveTrip && spend2025.mostExpensiveTrip.spentChf > 0}
              <div class="chip">Teuerster Trip: {formatCurrency(Math.round(spend2025.mostExpensiveTrip.spentChf), BASE_CURRENCY)}</div>
            {/if}
            {#if spend2025.avgPerTripChf > 0}
              <div class="chip">Ø pro Trip: {formatCurrency(Math.round(spend2025.avgPerTripChf), BASE_CURRENCY)}</div>
            {/if}
            {#if spend2025.totalBudgetChf > 0}
              <div class="chip status-chip {spend2025.utilization >= 0.85 ? 'warn' : spend2025.utilization < 0.4 ? 'ok' : 'mid'}">
                {#if spend2025.utilization < 0.4}
                  Unter Budget
                {:else if spend2025.utilization < 0.85}
                  Im grünen Bereich
                {:else}
                  Nahe am Budget
                {/if}
              </div>
            {/if}
          </div>

          <div class="year-insights">
            <div class="year-insights-label">Smart Insights</div>
            {#if insights2025.length > 0}
              <ul>
                {#each insights2025.slice(0, 3) as insight, idx (idx)}
                  <li>{insight}</li>
                {/each}
              </ul>
            {:else}
              <p class="insights-empty">Du hast für 2025 noch keine Reiseausgaben erfasst.</p>
            {/if}
          </div>
        </div>
      </article>
    </div>
  </div>
  {:else}
    <div class="empty-dashboard card-surface">
      <div class="empty-content">
        <div class="empty-icon">
          <Icon name="map" size={48} />
        </div>
        <h2>Noch keine Reisen geplant</h2>
        <p>Erstelle deinen ersten Trip, um Budget und Ausgaben im Blick zu behalten.</p>
        <button class="pill pill-cta" type="button" onclick={() => goto('/trips/new')}>
          <Icon name="plus" size={18} /> Trip erstellen
        </button>
      </div>
    </div>
  {/if}

  <!-- Live Budget Modal -->
  <LiveBudgetModal
    open={modalOpen}
    onClose={() => (modalOpen = false)}
  />
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: 100%;
    margin-bottom: 2.8rem;
    padding: 0;
    box-sizing: border-box;
  }

  .empty-dashboard {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    background: linear-gradient(145deg,
        color-mix(in oklab, var(--surface) 95%, var(--primary-soft-bg) 5%),
        color-mix(in oklab, var(--surface) 90%, transparent)
      );
  }

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    padding: 2rem;
  }

  .empty-icon {
    color: var(--primary);
    margin-bottom: 0.5rem;
    padding: 1rem;
    background: color-mix(in oklab, var(--primary) 10%, transparent);
    border-radius: 50%;
  }

  .empty-dashboard h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text);
  }

  .empty-dashboard p {
    margin: 0 0 1.5rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    flex-wrap: wrap;
    padding: 1.6rem 2rem;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: var(--shadow-soft);
    text-align: center;
  }

  .page-headings {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
    text-align: center;
    width: 100%;
  }

  .page-headings h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.4rem);
    letter-spacing: -0.01em;
  }

  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.72rem 1.45rem;
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    transition:
      background 0.2s,
      color 0.2s,
      transform 0.15s,
      box-shadow 0.2s,
      border-color 0.2s;
    text-decoration: none;
    white-space: nowrap;
  }

  .pill-cta {
    background: var(--primary);
    color: var(--primary-contrast);
    border: 1px solid color-mix(in oklab, var(--primary) 45%, transparent);
    box-shadow: 0 20px 38px color-mix(in oklab, var(--primary) 24%, transparent);
  }
  .pill-cta:hover {
    transform: translateY(-1px);
    background: var(--primary-hover);
  }

  .pill-secondary {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    color: var(--text);
    border-color: color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: 0 14px 30px color-mix(in oklab, #0f172a 14%, transparent);
  }
  .pill-secondary:hover {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    transform: translateY(-1px);
  }

  .pill-ghost {
    background: transparent;
    border-color: color-mix(in oklab, var(--primary) 45%, transparent);
    color: var(--primary);
    box-shadow: none;
  }
  .pill-ghost:hover {
    background: color-mix(in oklab, var(--primary-soft-bg) 55%, transparent);
  }

  :global([data-theme='dark']) .pill-secondary {
    background: color-mix(in oklab, var(--surface) 70%, var(--primary-soft-bg) 30%);
    border-color: color-mix(in oklab, var(--text) 18%, transparent);
    color: var(--text);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
  }

  :global([data-theme='dark']) .pill-secondary:hover {
    background: color-mix(in oklab, var(--surface) 78%, var(--primary-soft-bg) 22%);
  }

  :global([data-theme='dark']) .pill-ghost {
    border-color: color-mix(in oklab, var(--primary) 55%, transparent);
    color: color-mix(in oklab, var(--primary) 70%, var(--text));
  }

  :global([data-theme='dark']) .pill-ghost:hover {
    background: color-mix(in oklab, var(--primary-soft-bg) 70%, transparent);
  }

  .stats-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1.75rem;
  }

  .primary-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: stretch;
  }

  .secondary-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .card-surface {
    position: relative;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    box-shadow: var(--shadow-soft);
    padding: 1.9rem;
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
  }

  .overview-card {
    overflow: hidden;
    background: linear-gradient(145deg,
        color-mix(in oklab, var(--surface) 90%, var(--primary) 10%),
        color-mix(in oklab, var(--surface) 78%, var(--primary-soft-bg) 22%)
      );
    border: 1px solid color-mix(in oklab, var(--primary) 24%, var(--border));
    box-shadow: var(--shadow-elevated);
    height: 100%;
  }

  .overview-card::after {
    content: '';
    position: absolute;
    inset: -30% 30% 35% -30%;
    background: radial-gradient(circle at top right,
        color-mix(in oklab, var(--primary) 35%, transparent) 0%,
        transparent 60%
      );
    opacity: 0.45;
    pointer-events: none;
  }

  .overview-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .overview-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.45rem;
  }

  .overview-percent {
    font-size: 2.35rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1;
  }

  .overview-title {
    margin: 0.35rem 0 0;
    font-size: 1.65rem;
    font-weight: 600;
    color: var(--text);
  }

  .overview-subtitle {
    margin: 0.35rem 0 0;
    color: color-mix(in oklab, var(--text-secondary) 88%, transparent);
    font-size: 1rem;
    max-width: 28rem;
  }

  .card-label {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .card-label-with-icon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
  }

  .card-label-with-icon .card-label {
    color: inherit;
  }

  .status-badge {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    border: 1px solid transparent;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  }

  .status-badge.status-plan {
    background: color-mix(in oklab, var(--surface) 78%, var(--success) 22%);
    color: color-mix(in oklab, var(--success) 55%, var(--text));
    border-color: color-mix(in oklab, var(--success) 42%, transparent);
  }

  .status-badge.status-warning {
    background: color-mix(in oklab, var(--surface) 70%, var(--warning) 30%);
    color: color-mix(in oklab, var(--warning) 60%, var(--text));
    border-color: color-mix(in oklab, var(--warning) 45%, transparent);
  }

  .status-badge.status-over {
    background: color-mix(in oklab, var(--surface) 68%, var(--danger) 32%);
    color: color-mix(in oklab, var(--danger) 65%, var(--text));
    border-color: color-mix(in oklab, var(--danger) 48%, transparent);
  }

  .overview-progress {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .progress-header {
    font-size: 0.93rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: color-mix(in oklab, var(--text) 68%, var(--text-secondary) 32%);
    font-weight: 600;
  }

  .progress-track {
    height: 1rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--surface) 78%, var(--primary-soft-bg) 22%);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: color-mix(in oklab, var(--primary) 78%, var(--primary-hover) 22%);
    border-radius: inherit;
    transition: width 0.45s ease;
    box-shadow: 0 8px 24px color-mix(in oklab, var(--primary) 28%, transparent);
  }

  .overview-metrics {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .metric-label {
    display: block;
    font-size: 0.85rem;
    color: color-mix(in oklab, var(--text-secondary) 88%, transparent);
  }

  .metric-value {
    display: block;
    margin-top: 0.2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
  }

  .card-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .trip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: color-mix(in oklab, var(--primary) 12%, transparent);
    color: var(--primary);
  }

  .next-trip-card {
    background: linear-gradient(160deg,
          color-mix(in oklab, var(--surface) 94%, var(--primary-soft-bg) 6%),
          color-mix(in oklab, var(--surface) 98%, transparent)
        );
    box-shadow: var(--shadow-soft);
    overflow: hidden;
    padding: 1.2rem 1.1rem 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    align-self: stretch;
  }

  .next-trip-hero {
    position: relative;
    border-radius: calc(var(--radius-card) - 6px);
    background: linear-gradient(180deg, color-mix(in oklab, var(--primary) 12%, transparent), color-mix(in oklab, var(--accent) 10%, transparent));
    min-height: 160px;
    display: flex;
    align-items: flex-end;
    padding: 1rem 1rem 1.1rem;
    color: white;
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }

  .next-trip-hero.has-image::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.55));
    pointer-events: none;
  }

  .next-trip-hero-overlay {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .next-trip-title {
    margin: 0.1rem 0 0;
    font-size: 1.45rem;
    font-weight: 700;
    color: inherit;
  }

  .next-trip-destination {
    margin: 0;
    color: color-mix(in oklab, white 78%, transparent);
    font-size: 0.98rem;
  }

  .next-trip-date {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-weight: 600;
    color: inherit;
  }

  .countdown {
    color: var(--primary);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .next-trip-body {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    flex: 1;
    justify-content: space-between;
  }

  .next-trip-budget-row {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 0.9rem;
    padding: 0.3rem 0.2rem 0.05rem;
    margin-top: 0.2rem;
  }

  .next-trip-budget-label {
    display: block;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-bottom: 0.15rem;
  }

  .next-trip-budget-main {
    font-weight: 700;
    color: var(--text);
    line-height: 1.1;
  }

  .next-trip-weather {
    border-top: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    padding-top: 0.75rem;
    margin-top: 0.4rem;
  }

  .next-trip-weather-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--text);
  }

  .next-trip-weather-main {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .next-trip-empty {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .next-trip-empty h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .next-trip-empty p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .totals-card {
    background: linear-gradient(140deg,
        color-mix(in oklab, var(--surface) 92%, var(--secondary) 8%),
        color-mix(in oklab, var(--surface) 97%, transparent)
      );
    gap: 0.9rem;
  }

  .totals-value {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text);
  }

  .totals-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .year-spend-card {
    background: radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--primary-soft-bg) 26%, transparent) 0%, transparent 32%),
      radial-gradient(circle at 80% 0%, color-mix(in oklab, var(--secondary) 18%, transparent) 0%, transparent 32%),
      color-mix(in oklab, var(--surface) 94%, var(--surface-soft) 6%);
    border: 1px solid color-mix(in oklab, var(--border) 78%, transparent);
    gap: 1rem;
  }

  .year-spend-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .year-spend-subtitle {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .year-spend-total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    text-align: right;
  }

  .year-spend-total-main {
    font-size: 2.05rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.1;
  }

  .year-spend-total-sub {
    color: var(--text-secondary);
    font-size: 0.95rem;
    max-width: 22rem;
  }

  .year-spend-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .year-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    background: color-mix(in oklab, var(--surface) 92%, var(--primary-soft-bg) 8%);
    color: var(--text);
    font-size: 0.9rem;
    font-weight: 600;
    gap: 0.3rem;
  }

  .status-chip.ok {
    border-color: color-mix(in oklab, var(--success) 45%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--success) 10%);
    color: color-mix(in oklab, var(--success) 65%, var(--text));
  }

  .status-chip.mid {
    border-color: color-mix(in oklab, var(--warning) 35%, transparent);
    background: color-mix(in oklab, var(--surface) 92%, var(--warning) 8%);
    color: color-mix(in oklab, var(--warning) 65%, var(--text));
  }

  .status-chip.warn {
    border-color: color-mix(in oklab, var(--danger) 45%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--danger) 10%);
    color: color-mix(in oklab, var(--danger) 70%, var(--text));
  }

  .year-insights {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 0.2rem;
    border-top: 1px solid color-mix(in oklab, var(--border) 82%, transparent);
  }

  .year-insights-label {
    font-size: 0.9rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: 700;
  }

  .year-insights ul {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .year-insights li {
    color: var(--text);
    line-height: 1.4;
  }

  .insights-empty {
    margin: 0;
    color: var(--text-secondary);
  }

  :global([data-theme='dark']) .card-surface {
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
    background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
  }

  :global([data-theme='dark']) .year-spend-card {
    background: radial-gradient(circle at 15% 15%, color-mix(in oklab, var(--primary-soft-bg) 45%, transparent) 0%, transparent 34%),
      radial-gradient(circle at 85% 5%, color-mix(in oklab, var(--secondary) 26%, transparent) 0%, transparent 32%),
      color-mix(in oklab, var(--surface) 78%, var(--surface-soft) 22%);
    border-color: color-mix(in oklab, var(--border) 60%, transparent);
  }

  :global([data-theme='dark']) .overview-card {
    background: linear-gradient(150deg,
        color-mix(in oklab, var(--surface) 65%, var(--primary-soft-bg) 35%),
        color-mix(in oklab, var(--surface) 55%, var(--primary) 45%)
      );
    box-shadow: var(--shadow-elevated);
  }

  :global([data-theme='dark']) .overview-percent {
    color: var(--primary-hover);
  }

  :global([data-theme='dark']) .overview-subtitle {
    color: color-mix(in oklab, var(--text-secondary) 80%, transparent);
  }

  :global([data-theme='dark']) .progress-track {
    background: color-mix(in oklab, var(--surface) 62%, var(--primary-soft-bg) 38%);
  }

  :global([data-theme='dark']) .next-trip-card {
    background: linear-gradient(165deg,
          color-mix(in oklab, var(--surface) 62%, var(--primary-soft-bg) 38%),
          color-mix(in oklab, var(--surface) 72%, transparent)
        );
  }

  :global([data-theme='dark']) .totals-card {
    background: linear-gradient(150deg,
        color-mix(in oklab, var(--surface) 62%, var(--secondary) 38%),
        color-mix(in oklab, var(--surface) 74%, transparent)
      );
  }

  @media (max-width: 1080px) {
    .primary-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 980px) {
    .year-spend-body {
      grid-template-columns: 1fr;
    }

    .year-spend-total {
      align-items: flex-start;
      text-align: left;
    }
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.2rem;
    }

    .page-header {
      flex-direction: column;
      align-items: center;
      gap: 1.1rem;
    }

    .actions {
      justify-content: center;
    }
  }

  @media (max-width: 640px) {
    .card-surface {
      padding: 1.3rem;
      border-radius: 1rem;
    }

    .overview-title {
      font-size: 1.45rem;
    }

    .totals-value {
      font-size: 1.7rem;
    }
  }
</style>
