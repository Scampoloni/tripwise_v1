<script>
  import { onMount } from 'svelte';
  import { trips } from '$lib/stores/trips.js';
  import { calculateSpent } from '$lib/utils/calculations.js';
  import { page } from '$app/stores';
  import BackButton from "$lib/components/BackButton.svelte";

  // Route-Param + Trip aus dem Store holen (Runes)
  const tripId = $derived($page.params.id);
  const trip = $derived(($trips ?? []).find(t => t?.id === tripId) ?? null);
  const displayDestination = $derived(() => {
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
  <section class="analytics">
    <div class="card">
      <h1>Trip nicht gefunden</h1>
      <p>Bitte kehre zur Uebersicht zurueck.</p>
      <BackButton defaultHref="/" />
    </div>
  </section>
{:else}
  <section class="analytics">
    <h1>{trip.name} – Analytics</h1>
    <p class="subtitle">
      {displayDestination} • {trip.startDate} – {trip.endDate}
    </p>

    <div class="grid">
      <!-- Zusammenfassungskarte -->
      <div class="card summary">
        <h2>Uebersicht</h2>
        <div class="summary-grid">
          <div>
            <span class="label">Budget</span>
            <div class="value">
              {totalBudget.toFixed(2)} {trip.currency}
            </div>
          </div>
          <div>
            <span class="label">Spent</span>
            <div class="value warn">
              {totalSpent.toFixed(2)} {trip.currency}
            </div>
          </div>
          <div>
            <span class="label">Remaining</span>
            <div class="value ok">
              {remaining.toFixed(2)} {trip.currency}
            </div>
          </div>
        </div>
      </div>

      <!-- Balkendiagramm Ausgaben nach Kategorie -->
      <div class="card tall">
        <h2>Ausgaben nach Kategorie</h2>

        {#if hasExpenses}
          <div class="chart-wrap">
            <canvas bind:this={barCanvas}></canvas>
          </div>
        {:else}
          <p class="empty">
            Fuer diesen Trip wurden noch keine Ausgaben erfasst.
          </p>
        {/if}
      </div>
    </div>

    <BackButton defaultHref={`/trips/${tripId}`} />
  </section>
{/if}

<style>
  .analytics{
    display:flex;
    flex-direction:column;
    gap:1rem;
  }

  h1{
    margin:.25rem 0 0;
  }

  .subtitle{
    margin:.15rem 0 1rem;
    color: var(--text-secondary);
    font-size:.95rem;
  }

  .grid{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap:1rem;
  }

  .card{
    background: var(--surface);
    border:1px solid var(--border);
    border-radius:1rem;
    padding:1rem;
  }

  h2{
    margin:.25rem 0 .5rem;
    font-size:1.1rem;
  }

  .tall .chart-wrap{
    height: 360px;
  }

  .chart-wrap{
    position:relative;
  }

  .summary-grid{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap:.75rem;
    margin-top:.5rem;
  }

  .label{
    display:block;
    color: var(--text-secondary);
    font-size:.8rem;
    text-transform:uppercase;
    letter-spacing:.06em;
  }

  .value{
    font-size:1.2rem;
    font-weight:700;
  }

  .value.ok{
    color:#10b981;
  }

  .value.warn{
    color:#ef4444;
  }

  .empty{
    margin: .5rem 0 0;
    color: var(--text-secondary);
    font-size:.9rem;
  }
</style>
