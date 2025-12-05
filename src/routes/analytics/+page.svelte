<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { trips } from '$lib/stores/trips.js';
  import { convertWithCachedRates, loadRatesIfNeeded } from '$lib/utils/currency.js';
  import Icon from '$lib/components/Icon.svelte';

  const BASE_CURRENCY = 'CHF';
  let fxRefreshKey = $state(0);

  let Chart;
  let pieCanvas;
  let barCanvas;
  let pie;
  let bar;

  const allTrips = $derived($trips ?? []);

  function toBaseCurrency(amount, currency = BASE_CURRENCY) {
    fxRefreshKey; // trigger reactivity
    return convertWithCachedRates(amount, currency || BASE_CURRENCY, BASE_CURRENCY);
  }

  async function ensureRates() {
    try {
      await loadRatesIfNeeded(BASE_CURRENCY);
      fxRefreshKey++;
    } catch (err) {
      console.error('Failed to load rates:', err);
    }
  }

  function buildCharts() {
    if (!browser || !Chart || !pieCanvas || !barCanvas) return;
    pie?.destroy();
    bar?.destroy();

    const categories = {};
    for (const trip of allTrips) {
      const fallbackCurrency = trip?.currency || 'CHF';
      for (const exp of trip.expenses ?? []) {
        const cat = exp?.category ?? 'Sonstiges';
        const valInBase = toBaseCurrency(exp?.amount ?? 0, exp?.currency || fallbackCurrency);
        categories[cat] = (categories[cat] ?? 0) + valInBase;
      }
    }

    const catLabels = Object.keys(categories);
    const catValues = Object.values(categories);

    pie = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: catLabels,
        datasets: [
          {
            data: catValues,
            backgroundColor: [
              '#60a5fa',
              '#34d399',
              '#fb923c',
              '#f97373',
              '#a855f7'
            ]
          }
        ]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    const totalsPerTrip = allTrips.map((t) => {
      const fallbackCurrency = t?.currency || 'CHF';
      return (t.expenses ?? []).reduce(
        (sum, exp) => sum + toBaseCurrency(exp?.amount ?? 0, exp?.currency || fallbackCurrency),
        0
      );
    });

    bar = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: allTrips.map((t) => t.name ?? t.id),
        datasets: [
          {
            label: `Spent (${BASE_CURRENCY})`,
            data: totalsPerTrip,
            backgroundColor: '#60a5fa'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  onMount(async () => {
    if (!browser) return;

    ensureRates();

    try {
      const mod = await import('chart.js/auto');
      Chart = mod.default;
      buildCharts();
    } catch (err) {
      console.error('Analytics load failed:', err);
    }

    return () => {
      pie?.destroy();
      bar?.destroy();
    };
  });

  // Wenn Trips sich aendern (z.B. nach Laden aus dem Backend), Charts neu bauen
  $effect(() => {
    fxRefreshKey;
    if (!Chart) return;
    buildCharts();
  });
</script>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface page-header--centered">
    <div class="page-headings page-headings--center">
      <h1>Analytics</h1>
      <p class="page-subtitle">Globale Reise-Insights auf einen Blick</p>
    </div>
    <div class="actions actions--center">
      <button class="pill pill-secondary" type="button" onclick={() => goto('/')}>
        <Icon name="home" size={16} />
        Zurück zum Dashboard
      </button>
    </div>
  </header>

  <section class="analytics card-surface">
    <div class="grid">
      <div class="card">
        <span class="card-label-with-icon">
          <Icon name="target" size={16} />
          <span class="card-label">Ausgaben nach Kategorie</span>
        </span>
        <canvas bind:this={pieCanvas} height="280"></canvas>
      </div>
      <div class="card tall">
        <span class="card-label-with-icon">
          <Icon name="bar-chart" size={16} />
          <span class="card-label">Ausgaben pro Trip</span>
        </span>
        <div class="chart-wrap">
          <canvas bind:this={barCanvas}></canvas>
        </div>
      </div>
    </div>
  </section>
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(85vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem 1.8rem 2.4rem;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    flex-wrap: wrap;
    padding: 1.6rem 2rem;
  }

  .page-header--centered {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .card-surface {
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

  .page-headings--center {
    align-items: center;
    text-align: center;
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
    gap: 0.8rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .actions--center {
    justify-content: center;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.65rem 1.3rem;
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
  }

  .pill-secondary {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    color: var(--text);
    border-color: color-mix(in oklab, var(--border) 80%, transparent);
  }

  .analytics {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    padding: 1.8rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }

  .card {
    background: var(--surface);
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    border-radius: 1rem;
    padding: 1rem;
  }

  .tall .chart-wrap {
    height: 360px;
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
    margin-bottom: 0.75rem;
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.2rem;
    }
  }
</style>
