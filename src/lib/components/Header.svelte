<script>
  import { theme, themeAuto, toggleTheme } from '$lib/stores/theme.js';
  import { resetTrips } from '$lib/stores/trips.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      resetTrips();
      goto('/login');
    }
  }
</script>

<header class="header">
  <div class="container">
    <a href="/" class="logo">
      <span class="logo-icon">✈️</span>
      <span class="logo-text">TripWise</span>
    </a>

    <nav class="nav" aria-label="Main">
      <a
        href="/"
        class="nav-link"
        class:active={$page.url.pathname === '/'}
        aria-current={$page.url.pathname === '/' ? 'page' : undefined}
      >Dashboard</a>

        <a
        href="/tripsplit"
        class="nav-link"
        class:active={$page.url.pathname === '/tripsplit'}
        aria-current={$page.url.pathname === '/tripsplit' ? 'page' : undefined}
      >TripSplit</a>

      <a
        href="/converter"
        class="nav-link"
        class:active={$page.url.pathname === '/converter'}
        aria-current={$page.url.pathname === '/converter' ? 'page' : undefined}
      >Converter</a>

      <a
        href="/help"
        class="nav-link"
        class:active={$page.url.pathname === '/help'}
        aria-current={$page.url.pathname === '/help' ? 'page' : undefined}
      >Help</a>

      <div class="theme-controls">
        <!-- Theme Toggle -->
        <button
          class="theme-toggle"
          on:click={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {#if $theme === 'light'}🌙{:else}☀️{/if}
        </button>

        <!-- Subtiler Auto-Switch -->
        <button
          type="button"
          class="auto-switch"
          role="switch"
          aria-checked={$themeAuto}
          aria-label="Auto theme"
          on:click={() => themeAuto.update(v => !v)}
        >
          <span class="auto-label">Auto</span>
          <span class="auto-track">
            <span class:auto-thumb-on={$themeAuto} class="auto-thumb"></span>
          </span>
        </button>

        <!-- Logout -->
        <button type="button" on:click={logout} class="pill">
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
  .logo-icon { font-size: 1.4rem; }

  .nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-link {
    position: relative;
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
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    transition: transform .15s, background .2s;
  }
  .theme-toggle:hover,
  .theme-toggle:focus-visible {
    background: var(--secondary-hover);
    transform: scale(1.05);
  }

  .auto-switch {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: var(--text-secondary);
  }

  .auto-label {
    font-size: .85rem;
  }

  .auto-track {
    position: relative;
    width: 32px;
    height: 18px;
    border-radius: 999px;
    background: color-mix(in oklab, var(--border) 70%, transparent);
    transition: background .2s;
  }

  .auto-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: var(--surface-elev, #fff);
    box-shadow: 0 1px 3px rgba(0,0,0,.18);
    transition: transform .2s;
  }

  .auto-thumb-on {
    transform: translateX(14px);
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
    .logo-text { display: none; }
  }
</style>
