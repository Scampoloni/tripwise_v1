<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { trips } from '$lib/stores/trips.js';
  import { convertToChf } from '$lib/utils/currency.js';
  import BackButton from '$lib/components/BackButton.svelte';

  const allTrips = $derived($trips ?? []);

  let pieCanvas;
  let barCanvas;

  let Chart = null;
  let pie = null;
  let bar = null;

  function buildCharts() {
    if (!Chart || !pieCanvas || !barCanvas) return;

    // alte Charts entfernen
    pie?.destroy();
    bar?.destroy();

    // Kategorien aggregieren
    const categories = {};
    for (const t of allTrips) {
      const fallbackCurrency = t?.currency || 'CHF';
      for (const e of (t.expenses ?? [])) {
        const key = e?.category ?? 'Other';
        const amountChf = convertToChf(e?.amount ?? 0, e?.currency || fallbackCurrency);
        categories[key] = (categories[key] ?? 0) + amountChf;
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
        (sum, exp) => sum + convertToChf(exp?.amount ?? 0, exp?.currency || fallbackCurrency),
        0
      );
    });

    bar = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: allTrips.map((t) => t.name ?? t.id),
        datasets: [
          {
            label: 'Spent (CHF)',
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
    if (!Chart) return;
    buildCharts();
  });
</script>

<section class="analytics">
  <h1>Analytics</h1>
  <div class="grid">
    <div class="card">
      <h2>Ausgaben nach Kategorie</h2>
      <canvas bind:this={pieCanvas} height="280"></canvas>
    </div>
    <div class="card tall">
      <h2>Ausgaben pro Trip</h2>
      <div class="chart-wrap">
        <canvas bind:this={barCanvas}></canvas>
      </div>
    </div>
  </div>
</section>

<BackButton defaultHref="/" />

<style>
  .analytics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1rem;
  }
  .tall .chart-wrap {
    height: 360px;
  }
  h1 {
    margin: 0.25rem 0 0;
  }
  h2 {
    margin: 0.25rem 0 0.5rem;
    font-size: 1.1rem;
  }
</style>
