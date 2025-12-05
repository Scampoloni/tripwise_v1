<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Redirect von alter URL /trips/analytics zur neuen /analytics
  onMount(() => {
    goto('/analytics', { replaceState: true });
  });
</script>

<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">
  Weiterleitung zu Analytics...
</p>
