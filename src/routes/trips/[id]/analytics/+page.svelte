<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { trips } from '$lib/stores/trips.js';
  import { calculateSpent } from '$lib/utils/calculations.js';
  import { page } from '$app/stores';
  import BackButton from '$lib/components/BackButton.svelte';
  import Icon from '$lib/components/Icon.svelte';

  // Route-Param + Trip aus dem Store holen (Runes)
  const tripId = $derived($page.params.id);
  const trip = $derived(($trips ?? []).find(t => t?.id === tripId) ?? null);
  const displayDestination = $derived.by(() => {
    const legacyDestination = trip && typeof trip === 'object' && 'destination' in trip
      ? /** @type {any} */ (trip).destination
      : '';
    return trip?.destinationName ?? legacyDestination ?? '';
  });

  // Kennzahlen fuer diesen Trip
  const totalBudget = $derived(trip?.budget ?? 0);
  const totalSpent  = $derived(trip ? calculateSpent(trip.expenses ?? []) : 0);
  const remaining   = $derived(Math.max(0, totalBudget - totalSpent));
  const hasExpenses = $derived((trip?.expenses ?? []).length > 0);

  let barCanvas = /** @type {HTMLCanvasElement | null} */ ($state(null));
  let destroy = /** @type {() => void} */ ($state(() => {}));

  onMount(async () => {
    // wenn Trip noch nicht da ist oder keine Ausgaben → kein Chart
    if (!trip || !barCanvas || !hasExpenses) return;

    try {
      const { default: Chart } = await import('chart.js/auto');

      // Kategorien aggregieren
      const categories = {};
      for (const e of (trip.expenses ?? [])) {
        const key = e?.category ?? 'Other';
        categories[key] = (categories[key] ?? 0) + (e?.amount ?? 0);
      }

      const bar = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(categories),
          datasets: [{
            label: 'Ausgaben',
            data: Object.values(categories)
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { autoSkip: false }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });

      destroy = () => bar.destroy();
    } catch (err) {
      console.error('Trip Analytics load failed:', err);
      destroy = () => {};
    }

    return () => destroy();
  });

  // Beim Rerender / Route-Wechsel Chart aufraeumen
  $effect(() => () => destroy());
</script>

<svelte:head>
  <title>{trip ? `${trip.name} · Analytics · TripWise` : 'Trip Analytics · TripWise'}</title>
</svelte:head>

{#if !trip}
  <section class="page-shell" data-animate="fadeUp">
    <div class="card-surface empty-card">
      <div class="empty-icon">
        <Icon name="bar-chart" size={32} />
      </div>
      <h1>Trip nicht gefunden</h1>
      <p>Bitte kehre zur Übersicht zurück.</p>
      <BackButton defaultHref="/" />
    </div>
  </section>
{:else}
  <section class="page-shell" data-animate="fadeUp">
    <header class="page-header card-surface">
      <div class="page-headings">
        <h1>{trip.name} – Analytics</h1>
        <p class="page-subtitle">{displayDestination} • {trip.startDate} – {trip.endDate}</p>
      </div>
      <div class="actions">
        <button class="pill pill-secondary" type="button" onclick={() => goto(`/trips/${tripId}`)}>
          <Icon name="arrow-left" size={16} />
          Zurück zur Reise
        </button>
      </div>
    </header>

    <div class="analytics-grid">
      <article class="card-surface summary-card">
        <div class="card-label-with-icon">
          <Icon name="wallet" size={16} />
          <span class="card-label">ÜBERSICHT</span>
        </div>
        <div class="summary-grid">
          <div class="stat">
            <span class="label">Budget</span>
            <span class="value neutral">{totalBudget.toFixed(2)} {trip.currency}</span>
          </div>
          <div class="stat">
            <span class="label">Spent</span>
            <span class="value warn">{totalSpent.toFixed(2)} {trip.currency}</span>
          </div>
          <div class="stat">
            <span class="label">Remaining</span>
            <span class="value ok">{remaining.toFixed(2)} {trip.currency}</span>
          </div>
        </div>
      </article>

      <article class="card-surface chart-card">
        <div class="card-label-with-icon">
          <Icon name="bar-chart" size={16} />
          <span class="card-label">AUSGABEN NACH KATEGORIE</span>
        </div>

        {#if hasExpenses}
          <div class="chart-wrap">
            <canvas bind:this={barCanvas}></canvas>
          </div>
          <div class="insights">
            <p class="insight">{totalSpent.toFixed(0)} {trip.currency} ausgegeben – {remaining.toFixed(0)} {trip.currency} verbleibend.</p>
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon small">
              <Icon name="receipt" size={24} />
            </div>
            <p class="empty">Für diesen Trip wurden noch keine Ausgaben erfasst.</p>
          </div>
        {/if}
      </article>
    </div>
  </section>
{/if}

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    width: 100%;
    margin-bottom: 2.4rem;
    padding: 0;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.1rem;
    flex-wrap: wrap;
    padding: 1.4rem 1.6rem;
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
    font-size: clamp(1.9rem, 3vw, 2.25rem);
    letter-spacing: -0.01em;
  }

  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.98rem;
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
    padding: 0.7rem 1.3rem;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    color: var(--text);
    text-decoration: none;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .pill:hover {
    transform: translateY(-1px);
    background: color-mix(in oklab, var(--primary-soft-bg) 65%, var(--surface) 35%);
  }

  .card-surface {
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 82%, transparent);
    box-shadow: var(--shadow-soft);
    padding: 1.5rem 1.6rem;
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 1.2rem;
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.9rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.95rem 1.05rem;
    border-radius: 1rem;
    background: color-mix(in oklab, var(--surface) 92%, var(--primary-soft-bg) 8%);
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  }

  .label {
    display: block;
    color: var(--text-secondary);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .value.neutral {
    color: var(--text);
  }

  .value.ok {
    color: var(--success, #16a34a);
  }

  .value.warn {
    color: var(--danger, #ef4444);
  }

  .chart-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .chart-wrap {
    position: relative;
    height: 360px;
  }

  .insights {
    padding: 0.85rem 1rem;
    border-radius: 0.9rem;
    background: color-mix(in oklab, var(--surface) 94%, var(--primary-soft-bg) 6%);
    border: 1px solid color-mix(in oklab, var(--border) 72%, transparent);
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .empty {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .card-label {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
  }

  .card-label-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-secondary);
    margin-bottom: 0.35rem;
  }

  .empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    padding: 2.4rem 1.6rem;
  }

  .empty-card h1 {
    margin: 0;
  }

  .empty-card p {
    margin: 0;
    max-width: 320px;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: color-mix(in oklab, var(--primary-soft-bg, #e0e7ff) 50%, var(--surface) 50%);
    color: var(--primary);
  }

  .empty-icon.small {
    width: 56px;
    height: 56px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.4rem;
  }

  :global([data-theme='dark']) .card-surface {
    background: color-mix(in oklab, var(--surface) 90%, var(--surface-soft) 10%);
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
  }

  :global([data-theme='dark']) .stat,
  :global([data-theme='dark']) .insights,
  :global([data-theme='dark']) .empty-card,
  :global([data-theme='dark']) .empty-state {
    background: color-mix(in oklab, var(--surface) 70%, var(--surface-soft) 30%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }

  :global([data-theme='dark']) .insights {
    color: var(--text-secondary);
  }

  :global([data-theme='dark']) .pill {
    background: color-mix(in oklab, var(--surface) 78%, var(--primary-soft-bg) 22%);
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.1rem 2rem;
    }

    .page-header {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
