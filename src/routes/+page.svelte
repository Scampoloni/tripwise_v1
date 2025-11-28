<script>
  import { trips } from '$lib/stores/trips.js';
  import LiveBudgetModal from '$lib/components/LiveBudgetModal.svelte';
  import { calculateSpent } from '$lib/utils/calculations.js';
  import { convertToChf } from '$lib/utils/currency.js';
  import { goto } from '$app/navigation';

  const allTrips = $derived($trips ?? []);

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
    return convertToChf(trip.budget ?? 0, trip.currency);
  }

  function spentToChf(trip) {
    if (!trip) return 0;
    const expenses = Array.isArray(trip.expenses) ? trip.expenses : [];
    if (expenses.length === 0) {
      const fallback = Number(calculateSpent(trip.expenses ?? [])) || 0;
      return convertToChf(fallback, trip.currency);
    }
    return expenses.reduce(
      (sum, exp) => sum + convertToChf(exp?.amount ?? 0, exp?.currency || trip.currency || 'CHF'),
      0
    );
  }

  function destinationLabel(trip) {
    if (!trip) return '';
    return trip.destinationName ?? trip.destination ?? '';
  }

  function formatCurrency(amount, currency = 'CHF') {
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
        const budgetChf = convertToChf(budget, trip?.currency || 'CHF');
        const daysUntil = Math.max(0, diffInDays(today, start));
        return {
          id: trip?.id,
          name: trip?.name ?? 'Unbenannter Trip',
          destinationName: destinationLabel(trip),
          start,
          startFormatted: formatDateShort(start),
          daysUntil,
          countdownLabel:
            daysUntil === 0
              ? 'Heute'
              : daysUntil === 1
              ? 'in 1 Tag'
              : `in ${daysUntil} Tagen`,
          currency: trip?.currency || 'CHF',
          budget,
          budgetChf,
          budgetFormatted: formatCurrency(budget, trip?.currency || 'CHF'),
          budgetChfFormatted: formatCurrency(budgetChf, 'CHF'),
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
      totalBudgetChf,
      totalSpentChf,
      percent,
      barPercent,
      status,
      statusLabel
    };
  }

  function summariseSpentForYear(trips, year) {
    const filtered = (trips ?? []).filter((trip) => getYear(trip?.startDate) === year);
    const totalSpentChf = filtered.reduce((sum, trip) => sum + spentToChf(trip), 0);
    return {
      totalSpent: totalSpentChf,
      count: filtered.length
    };
  }

  const nextTrip = $derived(nextFutureTrip(allTrips));

  const liveOverview = $derived(buildLiveOverview(allTrips));

  const spent2025 = $derived(summariseSpentForYear(allTrips, 2025));

  let modalOpen = $state(false);
</script>


<svelte:head>
  <title>Dashboard, TripWise</title>
</svelte:head>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface">
    <div class="page-headings">
      <h1>Your Trips</h1>
      <p class="page-subtitle">Heute im Überblick</p>
    </div>

    <div class="actions">
      <button class="pill pill-cta" type="button" onclick={() => goto('/trips/new')}>
        New Trip
      </button>
      <button class="pill pill-secondary" type="button" onclick={() => goto('/trips')}>
        Trip List
      </button>
      <button class="pill pill-secondary" type="button" onclick={() => goto('/trips/analytics')}>
        Analytics
      </button>
    </div>
  </header>

  <div class="stats-layout">
    <div class="primary-row">
      <article class="overview-card card-surface">
        <div class="overview-top">
          <div>
            <span class="card-label">Live overview</span>
            {#if liveOverview.count > 0}
              <h2 class="overview-title">
                {liveOverview.count} {liveOverview.count === 1 ? 'aktiver Trip' : 'aktive Trips'}
              </h2>
              <p class="overview-subtitle">
                {formatCurrency(liveOverview.totalSpentChf, 'CHF')} von {formatCurrency(liveOverview.totalBudgetChf, 'CHF')} genutzt
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
            <span class="metric-value">{formatCurrency(liveOverview.totalBudgetChf, 'CHF')}</span>
          </div>
          <div>
            <span class="metric-label">Ausgegeben</span>
            <span class="metric-value">{formatCurrency(liveOverview.totalSpentChf, 'CHF')}</span>
          </div>
        </div>
      </article>

      <aside class="next-trip-card card-surface">
        <div class="card-label-row">
          <span class="card-label">Next trip</span>
          {#if nextTrip}
            <span class="trip-flag" aria-hidden="true">{nextTrip.flag}</span>
          {/if}
        </div>

        {#if nextTrip}
          <h3 class="next-trip-title">{nextTrip.name}</h3>
          {#if nextTrip.destinationName}
            <p class="next-trip-destination">{nextTrip.destinationName}</p>
          {/if}
          <div class="next-trip-date">
            <span>{nextTrip.startFormatted}</span>
            <span class="countdown">{nextTrip.countdownLabel}</span>
          </div>
          <div class="next-trip-budget">
            <span>{nextTrip.budgetFormatted}</span>
            <span class="budget-chf">{nextTrip.budgetChfFormatted}</span>
          </div>
        {:else}
          <div class="next-trip-empty">
            <h3>Kein nächster Trip geplant</h3>
            <p>Erstelle einen Trip, um hier eine Vorschau zu sehen.</p>
            <button class="pill pill-ghost" type="button" onclick={() => goto('/trips/new')}>
              New Trip
            </button>
          </div>
        {/if}
      </aside>
    </div>

    <div class="secondary-row">
      <article class="totals-card card-surface">
        <span class="card-label">Reiseausgaben 2025</span>
        <h3 class="totals-value">{formatCurrency(spent2025.totalSpent, 'CHF')}</h3>
        <p class="totals-subtitle">
          über {spent2025.count === 1 ? '1 Trip' : `${spent2025.count} Trips`} mit Start 2025
        </p>
      </article>
    </div>
  </div>

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
    width: min(85vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem 1.8rem 2.6rem;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    flex-wrap: wrap;
    padding: 1.6rem 2rem;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: var(--shadow-soft);
  }

  .page-headings {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
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
    justify-content: flex-end;
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
    grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr);
    gap: 1.5rem;
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
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in oklab, var(--text) 62%, var(--text-secondary) 38%);
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

  .trip-flag {
    font-size: 1.5rem;
  }

  .next-trip-card {
    background: linear-gradient(160deg,
          color-mix(in oklab, var(--surface) 94%, var(--primary-soft-bg) 6%),
          color-mix(in oklab, var(--surface) 98%, transparent)
        );
      box-shadow: var(--shadow-soft);
  }

  .next-trip-title {
    margin: 0.75rem 0 0;
    font-size: 1.45rem;
    font-weight: 600;
    color: var(--text);
  }

  .next-trip-destination {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.98rem;
  }

  .next-trip-date {
    margin-top: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-weight: 500;
    color: var(--text);
  }

  .countdown {
    color: var(--primary);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .next-trip-budget {
    margin-top: 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-weight: 600;
    color: var(--text);
  }

  .budget-chf {
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
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

  :global([data-theme='dark']) .card-surface {
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
    background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
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

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.2rem;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.1rem;
    }

    .actions {
      justify-content: flex-start;
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
