<script>
  import { trips, deleteTrip, loadTrips } from '$lib/stores/trips.js';
  import TripCard from '$lib/components/TripCard.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  const allTrips = $derived($trips ?? []);

  let hasRequestedTrips = $state(false);

  $effect(() => {
    if (!browser) return;
    if (hasRequestedTrips) return;
    hasRequestedTrips = true;
    (async () => {
      try {
        await loadTrips();
      } catch (err) {
        console.error('Trips konnten nicht geladen werden', err);
      }
    })();
  });

  $effect(() => {
    if (!browser) return;
    if (!Array.isArray(allTrips) || allTrips.length === 0) return;
    console.log('TRIPS PAGE allTrips snapshot', allTrips);
  });

  let filterStatus = $state('all'); // all | active | upcoming | past
  let searchTerm = $state('');

  const today = startOfDay(new Date());

  let confirmOpen = $state(false);
  let tripToDelete = $state(null);

  const filteredTrips = $derived.by(() => {
    const list = Array.isArray(allTrips) ? allTrips : [];
    const byStatus = list.filter(trip => matchesStatus(trip, filterStatus, today));

    const term = searchTerm.trim().toLowerCase();
    const bySearch = term
      ? byStatus.filter(trip => matchesSearch(trip, term))
      : byStatus;

    return [...bySearch].sort((a, b) => sortTrips(a, b, filterStatus));
  });

  function askDelete(trip) {
    tripToDelete = trip;
    confirmOpen = true;
  }

  async function confirmDelete() {
    if (!tripToDelete) return;
    await deleteTrip(tripToDelete.id);
    confirmOpen = false;
    tripToDelete = null;
  }

  function cancelDelete() {
    confirmOpen = false;
    tripToDelete = null;
  }

  function matchesSearch(trip, term) {
    const name = (trip?.name ?? '').toLowerCase();
    const destination = (trip?.destination ?? '').toLowerCase();
    return name.includes(term) || destination.includes(term);
  }

  function matchesStatus(trip, status, referenceDate) {
    if (status === 'active') return isActiveTrip(trip, referenceDate);
    if (status === 'upcoming') return isFutureTrip(trip, referenceDate);
    if (status === 'past') return isPastTrip(trip, referenceDate);
    return true;
  }

  function sortTrips(a, b, status) {
    if (status === 'past') {
      return toTime(parseDate(b?.endDate), -Infinity) - toTime(parseDate(a?.endDate), -Infinity);
    }
    const ascTimeA = toTime(parseDate(a?.startDate), Infinity);
    const ascTimeB = toTime(parseDate(b?.startDate), Infinity);
    return ascTimeA - ascTimeB;
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return startOfDay(date);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function toTime(date, fallback) {
    return date ? date.getTime() : fallback;
  }

  function isActiveTrip(trip, referenceDate) {
    const start = parseDate(trip?.startDate);
    const end = parseDate(trip?.endDate);
    if (!start || !end) return false;
    return start.getTime() <= referenceDate.getTime() && referenceDate.getTime() <= end.getTime();
  }

  function isFutureTrip(trip, referenceDate) {
    const start = parseDate(trip?.startDate);
    if (!start) return false;
    return start.getTime() > referenceDate.getTime();
  }

  function isPastTrip(trip, referenceDate) {
    const end = parseDate(trip?.endDate);
    if (!end) return false;
    return end.getTime() < referenceDate.getTime();
  }
</script>

<svelte:head>
  <title>Trips, TripWise</title>
</svelte:head>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface">
    <div class="page-headings">
      <h1>Trip List</h1>
      <p class="page-subtitle">Alle Reisen im Überblick</p>
    </div>
    <button class="pill pill-cta" type="button" onclick={() => goto('/trips/new')}>
      New Trip
    </button>
  </header>

  <ConfirmDialog
    open={confirmOpen}
    title="Trip loeschen?"
    message={tripToDelete ? `Willst du "${tripToDelete.name}" wirklich loeschen?` : ''}
    confirmLabel="Ja, loeschen"
    cancelLabel="Abbrechen"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />

  {#if allTrips.length === 0}
    <section class="empty-card card-surface">
      <h2>Starte deine erste Reise</h2>
      <p>Budget setzen, Ausgaben erfassen, Live-Insights erhalten</p>
      <button class="pill pill-cta" type="button" onclick={() => goto('/trips/new')}>
        Create Trip
      </button>
    </section>
  {:else}
    <section class="trip-list card-surface">
      <div class="trip-list-header">
        <h2>Reisen</h2>
        <p>{filteredTrips.length} {filteredTrips.length === 1 ? 'Trip' : 'Trips'}</p>
      </div>

      <div class="triplist-controls">
        <div class="pill-group" role="tablist" aria-label="Trip Status Filter">
          <button
            type="button"
            class={`pill pill-toggle ${filterStatus === 'all' ? 'is-active' : ''}`}
            aria-pressed={filterStatus === 'all'}
            onclick={() => (filterStatus = 'all')}
          >
            Alle
          </button>
          <button
            type="button"
            class={`pill pill-toggle ${filterStatus === 'active' ? 'is-active' : ''}`}
            aria-pressed={filterStatus === 'active'}
            onclick={() => (filterStatus = 'active')}
          >
            Aktiv
          </button>
          <button
            type="button"
            class={`pill pill-toggle ${filterStatus === 'upcoming' ? 'is-active' : ''}`}
            aria-pressed={filterStatus === 'upcoming'}
            onclick={() => (filterStatus = 'upcoming')}
          >
            Zukünftig
          </button>
          <button
            type="button"
            class={`pill pill-toggle ${filterStatus === 'past' ? 'is-active' : ''}`}
            aria-pressed={filterStatus === 'past'}
            onclick={() => (filterStatus = 'past')}
          >
            Vergangen
          </button>
        </div>

        <label class="search" aria-label="Suche nach Trips">
          <span class="sr-only"></span>
          <input
            type="search"
            placeholder="Nach Trip oder Ort suchen"
            bind:value={searchTerm}
          />
        </label>
      </div>
      {#if filteredTrips.length === 0}
        <div class="trip-list-empty">
          <p>Keine Trips entsprechen den aktuellen Filtern.</p>
          <button
            type="button"
            class="pill pill-secondary"
            onclick={() => {
              filterStatus = 'all';
              searchTerm = '';
            }}
          >
            Filter zurücksetzen
          </button>
        </div>
      {:else}
        <div class="trip-list-items">
          {#each filteredTrips as trip (trip.id)}
            <TripCard
              {trip}
              on:delete={(event) => askDelete(event.detail)}
            />
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(85vw, 1240px);
    margin: 0 auto 2.6rem;
    padding: 1.8rem 1.8rem 2.4rem;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    flex-wrap: wrap;
    padding: 1.5rem 1.8rem;
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
    font-size: clamp(1.9rem, 3vw, 2.3rem);
    letter-spacing: -0.01em;
  }

  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
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
    box-shadow: 0 18px 34px color-mix(in oklab, var(--primary) 22%, transparent);
  }

  .pill-cta:hover {
    transform: translateY(-1px);
    background: var(--primary-hover);
  }

  .card-surface {
    position: relative;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    box-shadow: var(--shadow-soft);
    padding: 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .trip-list {
    gap: 1.25rem;
  }

  .triplist-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding: 0.8rem 0 0.2rem;
    border-top: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
  }

  .pill-group {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0.15rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--surface) 85%, var(--secondary) 15%);
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
  }

  .pill-toggle {
    padding: 0.55rem 1.1rem;
    font-size: 0.9rem;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    transition: background 0.2s ease, color 0.2s ease;
  }

  .pill-toggle.is-active {
    background: var(--surface);
    color: var(--text);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--border) 60%, transparent);
  }

  .search {
    flex: 1;
    min-width: 220px;
    display: flex;
    align-items: center;
    border-radius: 999px;
    padding: 0.25rem 0.9rem;
    background: color-mix(in oklab, var(--surface) 94%, transparent);
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
  }

  .search input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    padding: 0.55rem 0;
    color: var(--text);
  }

  .search input::placeholder {
    color: color-mix(in oklab, var(--text-secondary) 75%, transparent);
  }

  .search input:focus {
    outline: none;
  }

  .trip-list-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
  }

  .trip-list-header h2 {
    margin: 0;
    font-size: 1.4rem;
  }

  .trip-list-header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .trip-list-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .trip-list-empty {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
    padding: 1.4rem;
    border-radius: var(--radius-lg);
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    border: 1px dashed color-mix(in oklab, var(--border) 70%, transparent);
  }

  .trip-list-empty p {
    color: var(--text-secondary);
  }

  .empty-card {
    align-items: center;
    text-align: center;
    gap: 1rem;
    padding: 2.6rem 1.8rem;
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: var(--shadow-soft);
  }

  .empty-card h2 {
    margin: 0;
    font-size: 1.6rem;
  }

  .empty-card p {
    margin: 0;
    color: var(--text-secondary);
    max-width: 340px;
  }

  :global([data-theme='dark']) .card-surface {
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
    background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
  }

  :global([data-theme='dark']) .triplist-controls {
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }

  :global([data-theme='dark']) .pill-group {
    background: color-mix(in oklab, var(--surface) 55%, var(--primary-soft-bg) 45%);
    border-color: color-mix(in oklab, var(--primary) 40%, transparent);
  }

  :global([data-theme='dark']) .pill-toggle.is-active {
    background: color-mix(in oklab, var(--surface) 70%, transparent);
    color: var(--text);
  }

  :global([data-theme='dark']) .search {
    background: color-mix(in oklab, var(--surface) 60%, var(--surface-soft) 40%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }

  :global([data-theme='dark']) .empty-card {
    background: color-mix(in oklab, var(--surface) 70%, var(--primary-soft-bg) 30%);
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
  }

  :global([data-theme='dark']) .pill-cta {
    box-shadow: 0 20px 40px color-mix(in oklab, var(--primary) 35%, transparent);
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

    .trip-list-items {
      gap: 1rem;
    }
  }

  @media (max-width: 640px) {
    .card-surface {
      padding: 1.4rem;
      border-radius: var(--radius-lg);
    }

    .page-header {
      padding: 1.3rem 1.4rem;
    }

    .empty-card {
      padding: 2.2rem 1.5rem;
    }
  }
</style>
