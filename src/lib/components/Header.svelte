<script>
  import { theme, toggleTheme } from '$lib/stores/theme.js';
  import { resetTrips } from '$lib/stores/trips.js';
  import { resetTripSplit } from '$lib/stores/tripSplit.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      resetTrips();
      resetTripSplit();
      goto('/login');
    }
  }
</script>

<header class="header">
  <div class="container">
    <a href="/" class="logo">
      <span class="logo-icon">
        <Icon name="plane" size={20} />
      </span>
      <span class="logo-text">TripWise</span>
    </a>

    <nav class="nav" aria-label="Main">
      <a
        href="/"
        class="nav-link"
        class:active={$page.url.pathname === '/'}
        aria-current={$page.url.pathname === '/' ? 'page' : undefined}
      >
        <Icon name="home" size={16} />
        <span class="nav-label">Dashboard</span>
      </a>

      <a
        href="/tripsplit"
        class="nav-link"
        class:active={$page.url.pathname === '/tripsplit'}
        aria-current={$page.url.pathname === '/tripsplit' ? 'page' : undefined}
      >
        <Icon name="users" size={16} />
        <span class="nav-label">TripSplit</span>
      </a>

      <a
        href="/converter"
        class="nav-link"
        class:active={$page.url.pathname === '/converter'}
        aria-current={$page.url.pathname === '/converter' ? 'page' : undefined}
      >
        <Icon name="credit-card" size={16} />
        <span class="nav-label">Converter</span>
      </a>

      <a
        href="/help"
        class="nav-link"
        class:active={$page.url.pathname === '/help'}
        aria-current={$page.url.pathname === '/help' ? 'page' : undefined}
      >
        <Icon name="help-circle" size={16} />
        <span class="nav-label">Help</span>
      </a>

      <div class="theme-controls">
        <!-- Theme Toggle -->
        <button
          class="theme-toggle"
          onclick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {#if $theme === 'light'}
            <Icon name="moon" size={16} />
          {:else}
            <Icon name="sun" size={16} />
          {/if}
        </button>

        <!-- Logout -->
        <button type="button" onclick={logout} class="pill">
          <Icon name="arrow-right" size={14} />
          Logout
        </button>
      </div>
    </nav>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: var(--z-header, 100);
    background: var(--surface-elev, var(--surface));
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem clamp(1rem, 4vw, 1.5rem);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--text);
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: .2px;
    transition: opacity .2s;
  }
  .logo:hover,
  .logo:focus-visible { opacity: .85; }
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    transition: background .2s, color .2s, transform .2s;
    outline: none;
  }
  .nav-link:hover,
  .nav-link:focus-visible {
    color: var(--text);
    background: var(--secondary);
  }
  .nav-link.active {
    color: var(--primary);
    background: var(--primary-light);
  }

  .theme-controls {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
  }

  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--secondary);
    border: 1px solid var(--border);
    padding: 0.5rem;
    border-radius: 999px;
    line-height: 1;
    cursor: pointer;
    color: var(--text-secondary);
    transition: transform .15s, background .2s, color .2s;
  }
  .theme-toggle:hover,
  .theme-toggle:focus-visible {
    background: var(--secondary-hover);
    transform: scale(1.05);
    color: var(--text);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .45rem .75rem;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid color-mix(in oklab, var(--primary) 22%, transparent);
    background: var(--primary-soft-bg, var(--primary-light));
    color: var(--primary);
    font-weight: 600;
    transition: background .2s, transform .15s;
  }
  .pill:hover,
  .pill:focus-visible { transform: translateY(-1px); }

  @media (max-width: 640px) {
    .nav { gap: .5rem; }
    .nav-link { padding: .375rem .5rem; font-size: .9rem; }
    .nav-label { display: none; }
    .logo-text { display: none; }
  }
</style>
