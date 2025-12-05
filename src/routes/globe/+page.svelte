<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import WorldGlobe from '$lib/components/WorldGlobe.svelte';
  import { trips, loadTrips } from '$lib/stores/trips.js';
  import { getTripsWithCoordinates } from '$lib/utils/tripsView.js';
  import { getWorldTravelStats } from '$lib/utils/worldStats.js';
  import Icon from '$lib/components/Icon.svelte';

  const allTrips = $derived($trips ?? []);
  const globeTrips = $derived(getTripsWithCoordinates(allTrips));
  const worldStats = $derived(getWorldTravelStats(allTrips));

  // Show all countries toggle
  let showAllCountries = $state(false);
  const MAX_COUNTRIES = 5;
  const visibleCountries = $derived(
    showAllCountries ? worldStats.countries : worldStats.countries.slice(0, MAX_COUNTRIES)
  );
  const hasMoreCountries = $derived(worldStats.countries.length > MAX_COUNTRIES);

  let isLoading = $state(true);

  onMount(async () => {
    // Load trips when page is refreshed directly
    try {
      await loadTrips();
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>World Globe, TripWise</title>
</svelte:head>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface page-header--centered">
    <div class="page-headings page-headings--center">
      <h1>World Globe</h1>
      <p class="page-subtitle">Alle Trips mit Koordinaten auf einen Blick</p>
    </div>
    <div class="actions actions--center">
      <button class="pill pill-secondary" type="button" onclick={() => goto('/')}>
        <Icon name="home" size={16} />
        Zurück zum Dashboard
      </button>
    </div>
  </header>

  <article class="stats-card card-surface">
    <div>
      <span class="card-label-with-icon">
        <Icon name="map-pin" size={16} />
        <span class="card-label">Visited countries</span>
      </span>
      <h2 class="stats-value">{worldStats.visitedCount} / {worldStats.totalCountries}</h2>
      <p class="stats-subtitle">Du hast {worldStats.visitedPercent}% aller Länder gesehen.</p>
    </div>

    {#if worldStats.countries.length > 0}
      <div class="country-list">
        {#each visibleCountries as code}
          <span class="country-chip">{code}</span>
        {/each}
        {#if hasMoreCountries}
          <button 
            class="country-toggle" 
            type="button" 
            onclick={() => showAllCountries = !showAllCountries}
          >
            {showAllCountries ? 'Weniger' : `+${worldStats.countries.length - MAX_COUNTRIES} mehr`}
          </button>
        {/if}
      </div>
    {:else}
      <p class="stats-hint">Noch keine abgeschlossenen Reisen mit Länder-Code.</p>
    {/if}
  </article>

  <section class="globe-panel card-surface">
    <div class="globe-header">
      <span class="card-label-with-icon">
        <Icon name="globe" size={16} />
        <span class="card-label">World map</span>
      </span>
      <h2>Trips mit Koordinaten</h2>
      <p>Visualisiert geplante, aktive und abgeschlossene Ziele</p>
    </div>
    {#if isLoading}
      <div class="globe-loading">
        <p>Lade Trips...</p>
      </div>
    {:else}
      <WorldGlobe trips={globeTrips} height={420} />
    {/if}
  </section>
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(85vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1.6rem 1.9rem;
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
    font-size: clamp(2rem, 4vw, 2.5rem);
  }

  .page-subtitle {
    margin: 0.2rem 0 0;
    color: var(--text-secondary);
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

  .actions {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .actions--center {
    justify-content: center;
  }

  .stats-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.8rem;
  }

  .stats-value {
    margin: 0.2rem 0 0;
    font-size: clamp(2.2rem, 3vw, 2.8rem);
  }

  .stats-subtitle {
    margin: 0.1rem 0 0;
    color: var(--text-secondary);
  }

  .stats-hint {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .country-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .country-chip {
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--primary-soft-bg) 65%, transparent);
    color: var(--text);
    font-size: 0.85rem;
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  }

  .country-toggle {
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: transparent;
    color: var(--primary);
    font-size: 0.85rem;
    border: 1px dashed color-mix(in oklab, var(--primary) 50%, transparent);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .country-toggle:hover {
    background: color-mix(in oklab, var(--primary) 10%, transparent);
    border-color: var(--primary);
  }

  .globe-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.6rem;
  }

  .globe-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 420px;
    color: var(--text-secondary);
  }

  .globe-header h2 {
    margin: 0.15rem 0 0;
  }

  .globe-header p {
    margin: 0.1rem 0 0;
    color: var(--text-secondary);
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

  .card-label-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-secondary);
  }

  .page-title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: color-mix(in oklab, var(--primary-soft-bg, #e0e7ff) 50%, var(--surface) 50%);
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.2rem;
    }
  }
</style>
