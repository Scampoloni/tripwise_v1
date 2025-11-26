<script>
  import '$lib/styles/variables.css'; // Tokens zuerst
  import '$lib/styles/globals.css';   // nutzt die Tokens
  import Header from '$lib/components/Header.svelte';
  import { loadTrips, resetTrips } from '$lib/stores/trips.js';
  import { browser } from '$app/environment';

  const props = $props();

  const userId = $derived(props.data?.userId ?? null);
  let lastLoadedUserId = $state(null);
  let inflightUserId = $state(null);

  $effect(() => {
    if (!browser) return;

    const currentUserId = userId;

    if (!currentUserId) {
      if (lastLoadedUserId || inflightUserId) {
        resetTrips();
      }
      lastLoadedUserId = null;
      inflightUserId = null;
      return;
    }

    if (currentUserId === lastLoadedUserId || currentUserId === inflightUserId) {
      return;
    }

    inflightUserId = currentUserId;

    (async () => {
      try {
        await loadTrips();
        lastLoadedUserId = currentUserId;
      } catch (err) {
        console.error('Trips konnten nicht geladen werden', err);
      } finally {
        inflightUserId = null;
      }
    })();
  });
</script>

<div class="app">
  <Header />

  <main class="main">
    {@render props.children()}
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--background);
    color: var(--text);
  }

  .main {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 640px) {
    .main {
      gap: 1.5rem;
    }
  }
</style>
