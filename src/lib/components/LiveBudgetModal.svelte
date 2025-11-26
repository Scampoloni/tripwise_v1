<script>
  import { trips } from '$lib/stores/trips.js';
  import { calculateUserShare } from '$lib/utils/calculations.js';
  import { convertToChf } from '$lib/utils/currency.js';
  import { goto } from '$app/navigation';

  const { open = false, onClose = () => {} } = $props();

  const allTrips = $derived($trips ?? []);

  const MS_PER_DAY = 86_400_000;

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

  function formatMoney(amount, currency = 'CHF') {
    const numeric = Number(amount) || 0;
    try {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(numeric);
    } catch {
      return `${numeric.toFixed(2)} ${currency}`;
    }
  }

  function formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function statusFromRatio(spent, expected) {
    if (!Number.isFinite(expected) || expected <= 0) {
      if (spent <= 0) return { label: 'im Plan', tone: 'plan' };
      return { label: 'über Budget', tone: 'over' };
    }

    const ratio = spent / expected;
    if (ratio > 1.1) return { label: 'über Budget', tone: 'over' };
    if (ratio < 0.75) return { label: 'unter Budget', tone: 'under' };
    return { label: 'im Plan', tone: 'plan' };
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

    const today = startOfDay(new Date());
    if (today < start || today > end) return null;

    const budget = Number(trip.budget ?? 0);
    const currency = trip.currency ?? 'CHF';

    const expenses = Array.isArray(trip.expenses) ? trip.expenses : [];
    const participants = Array.isArray(trip.participants) ? trip.participants : [];
    const participantCount = participants.length > 0 ? participants.length : 1;
    const currentUserId = 'me';

    const spent = expenses.reduce(
      (sum, exp) => sum + calculateUserShare(exp, currentUserId, participantCount),
      0
    );

    const totalDays = Math.max(1, diffInDays(start, end) + 1);
    const daysElapsed = Math.min(totalDays, Math.max(1, diffInDays(start, today) + 1));
    const daysLeft = Math.max(0, diffInDays(today, end));
    const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const expected = budget > 0 ? budget * (daysElapsed / totalDays) : 0;
    const status = budget > 0 ? statusFromRatio(spent, expected) : { label: 'Kein Budget', tone: 'neutral' };

    return {
      id: trip.id ?? trip._id ?? `${trip.name ?? 'trip'}-${start.getTime()}`,
      name: trip.name ?? 'Unbenannter Trip',
      destination: trip.destination ?? '',
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

    const today = startOfDay(new Date());
    const daysUntilStart = diffInDays(today, start);
    if (daysUntilStart <= 0 || daysUntilStart > 60) return null;

    const budget = Number(trip.budget ?? 0);
    const currency = trip.currency ?? 'CHF';

    return {
      id: trip.id ?? trip._id ?? `${trip.name ?? 'trip'}-${start.getTime()}`,
      name: trip.name ?? 'Unbenannter Trip',
      destination: trip.destination ?? '',
      startsIn: daysUntilStart,
      startDate: formatDate(start),
      budget,
      currency,
      budgetChf: convertToChf(budget, currency)
    };
  }

  const runningTrips = $derived(allTrips.map(toRunningTrip).filter(Boolean));
  const upcomingTrips = $derived(allTrips.map(toUpcomingTrip).filter(Boolean));
  const upcomingBudgetTotalChf = $derived(
    upcomingTrips.reduce((sum, trip) => sum + (trip.budgetChf ?? 0), 0)
  );

  function onBackdrop(event) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleBackdropKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }

  function handleNewTrip() {
    onClose();
    goto('/trips/new');
  }
</script>

{#if open}
<div
  class="modal-backdrop"
  role="presentation"
  tabindex="-1"
  onclick={onBackdrop}
  onkeydown={handleBackdropKey}
>
  <div class="modal card" role="dialog" aria-modal="true" aria-label="Live Budget Übersicht">
    <header class="modal-header">
      <div class="title-group">
        <h3>Live Budget</h3>
        <p>Aktuelle und bevorstehende Reisen auf einen Blick.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="cta-button" onclick={handleNewTrip}>New Trip</button>
        <button type="button" class="close-button" onclick={onClose} aria-label="Schliessen">✕</button>
      </div>
    </header>

    <section class="section">
      <div class="section-header">
        <h4>Aktuelle Reisen</h4>
        {#if runningTrips.length}
          <span class="section-count">{runningTrips.length}</span>
        {/if}
      </div>

      {#if runningTrips.length === 0}
        <p class="empty-hint">Derzeit laufen keine Reisen. Plane eine neue Reise, um dein Budget hier zu verfolgen.</p>
      {:else}
        <div class="trip-list">
          {#each runningTrips as trip (trip.id)}
            <article class="trip-card">
              <div class="trip-top">
                <div class="trip-heading">
                  <h5>{trip.name}</h5>
                  {#if trip.destination}
                    <p class="trip-sub">{trip.destination}</p>
                  {/if}
                </div>
                <span class={`status status--${trip.statusTone}`}>{trip.statusText}</span>
              </div>

              <div class="metrics">
                <div class="metric">
                  <span class="label">Ausgegeben</span>
                  <span class="value">{formatMoney(trip.spent, trip.currency)}</span>
                </div>
                <div class="metric">
                  <span class="label">Budget</span>
                  <span class="value">{formatMoney(trip.budget, trip.currency)}</span>
                </div>
                <div class="metric">
                  <span class="label">Fortschritt</span>
                  <span class="value">{percentLabel(trip.percent)}</span>
                </div>
                <div class="metric">
                  <span class="label">Tage übrig</span>
                  <span class="value">{trip.daysLeft}</span>
                </div>
              </div>

              <div class="progress-track" aria-hidden="true">
                <div class="progress-bar" style={`width:${percentWidth(trip.percent)}`}></div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <section class="section upcoming">
      <div class="section-header">
        <h4>Bevorstehende Reisen</h4>
        {#if upcomingTrips.length}
          <span class="section-meta">Gesamt (CHF): {formatMoney(upcomingBudgetTotalChf, 'CHF')}</span>
        {/if}
      </div>

      {#if upcomingTrips.length === 0}
        <p class="empty-hint">Keine Trips starten in den nächsten 60 Tagen.</p>
      {:else}
        <div class="trip-list upcoming-list">
          {#each upcomingTrips as trip (trip.id)}
            <article class="upcoming-card">
              <div class="trip-top">
                <div class="trip-heading">
                  <h5>{trip.name}</h5>
                  {#if trip.destination}
                    <p class="trip-sub">{trip.destination}</p>
                  {/if}
                </div>
                <span class="starts-in">Startet in {trip.startsIn} {trip.startsIn === 1 ? 'Tag' : 'Tagen'}</span>
              </div>

              <div class="upcoming-meta">
                <div class="meta-block">
                  <span class="label">Start</span>
                  <span class="value">{trip.startDate}</span>
                </div>
                <div class="meta-block">
                  <span class="label">Budget</span>
                  <span class="value">{formatMoney(trip.budget, trip.currency)}</span>
                </div>
                <div class="meta-block">
                  <span class="label">≈ in CHF</span>
                  <span class="value">{formatMoney(trip.budgetChf, 'CHF')}</span>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <footer class="modal-footer">
      <button type="button" class="dismiss-button" onclick={onClose}>Fenster schliessen</button>
    </footer>
  </div>
</div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: var(--z-modal, 1000);
  }

  .modal {
    width: min(880px, 92vw);
    padding: 1.6rem 1.8rem;
    border-radius: 1.5rem;
    background: var(--surface);
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .title-group h3 {
    margin: 0;
    font-size: 1.45rem;
    letter-spacing: 0.01em;
  }

  .title-group p {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 1.2rem;
    border-radius: 999px;
    border: none;
    background: var(--primary);
    color: var(--primary-contrast);
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    box-shadow: 0 8px 20px color-mix(in oklab, var(--primary) 30%, transparent);
    transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .cta-button:hover {
    transform: translateY(-1px);
    background: var(--primary-hover);
    box-shadow: 0 12px 24px color-mix(in oklab, var(--primary) 35%, transparent);
  }

  .cta-button:focus-visible {
    outline: 3px solid color-mix(in oklab, var(--primary) 60%, transparent);
    outline-offset: 2px;
  }

  .close-button {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    background: var(--secondary);
    color: var(--text-secondary);
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 1rem;
    transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease;
  }

  .close-button:hover {
    transform: translateY(-1px);
    background: color-mix(in oklab, var(--secondary-hover) 80%, transparent);
    color: var(--text);
  }

  .close-button:focus-visible {
    outline: 3px solid color-mix(in oklab, var(--primary) 50%, transparent);
    outline-offset: 2px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.2rem;
    border-top: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
  }

  .section:first-of-type {
    padding-top: 0.2rem;
    border-top: none;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .section-header h4 {
    margin: 0;
    font-size: 1.1rem;
  }

  .section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--primary-soft-bg);
    color: var(--primary);
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0 0.65rem;
  }

  .section-meta {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .trip-list {
    display: grid;
    gap: 0.9rem;
  }

  .trip-card,
  .upcoming-card {
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    border-radius: 1rem;
    padding: 1rem 1.1rem;
    background: color-mix(in oklab, var(--surface) 92%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    box-shadow: 0 6px 16px color-mix(in oklab, #0f172a 12%, transparent);
  }

  .trip-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .trip-heading h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .trip-sub {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.88rem;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .status--plan {
    background: color-mix(in oklab, var(--success) 18%, transparent);
    color: var(--success);
  }

  .status--over {
    background: color-mix(in oklab, var(--danger) 18%, transparent);
    color: var(--danger);
  }

  .status--under {
    background: color-mix(in oklab, var(--warning) 15%, transparent);
    color: var(--warning);
  }

  .status--neutral {
    background: color-mix(in oklab, var(--text-secondary) 16%, transparent);
    color: var(--text-secondary);
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: color-mix(in oklab, var(--text-secondary) 85%, transparent);
  }

  .value {
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--text);
  }

  .progress-track {
    height: 0.45rem;
    border-radius: 0.45rem;
    overflow: hidden;
    background: color-mix(in oklab, var(--text-secondary) 18%, transparent);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 65%, #ffffff 35%));
    transition: width 0.35s ease;
  }

  .upcoming-list .upcoming-card {
    gap: 0.75rem;
  }

  .starts-in {
    color: var(--primary);
    font-weight: 600;
    font-size: 0.85rem;
  }

  .upcoming-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.75rem;
  }

  .meta-block {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .empty-hint {
    margin: 0;
    padding: 0.8rem 0.6rem;
    border-radius: 0.9rem;
    background: color-mix(in oklab, var(--secondary) 88%, transparent);
    color: color-mix(in oklab, var(--text-secondary) 92%, transparent);
    font-size: 0.9rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
  }

  .dismiss-button {
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    background: transparent;
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .dismiss-button:hover {
    background: color-mix(in oklab, var(--secondary-hover) 75%, transparent);
    color: var(--text);
  }

  .dismiss-button:focus-visible {
    outline: 3px solid color-mix(in oklab, var(--primary) 50%, transparent);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .modal {
      padding: 1.2rem 1.25rem;
    }

    .header-actions {
      flex-direction: row-reverse;
    }

    .cta-button {
      padding: 0.5rem 1rem;
    }

    .trip-card,
    .upcoming-card {
      padding: 0.85rem 0.9rem;
    }

    .metrics,
    .upcoming-meta {
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    }
  }
</style>
