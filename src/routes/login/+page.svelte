<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';

  let mode = $state<'login' | 'register'>('login');
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  function switchMode(next: 'login' | 'register') {
    mode = next;
    error = null;
  }

  async function handleSubmit() {
    error = null;
    if (!email || !password) {
      error = 'Bitte Email und Passwort eingeben.';
      return;
    }

    loading = true;
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        error = data?.error || 'Es ist ein Fehler aufgetreten.';
        return;
      }

      // Erfolgreich: zur Startseite
      goto('/');
    } catch (e) {
      console.error(e);
      error = 'Server nicht erreichbar.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{mode === 'login' ? 'Anmelden' : 'Registrieren'} · TripWise</title>
</svelte:head>

<section class="auth-layout">
  <div class="card">
    <!-- Logo & Header -->
    <div class="card-header">
      <div class="logo-icon">
        <Icon name="plane" size={28} />
      </div>
      <h1>TripWise</h1>
      <p class="subtitle">
        {#if mode === 'login'}
          Willkommen zurück! Melde dich an, um fortzufahren.
        {:else}
          Erstelle ein Konto, um deine Reisen zu planen.
        {/if}
      </p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        type="button"
        class:active={mode === 'login'}
        onclick={() => switchMode('login')}
      >
        Anmelden
      </button>
      <button
        type="button"
        class:active={mode === 'register'}
        onclick={() => switchMode('register')}
      >
        Registrieren
      </button>
    </div>

    <!-- Form -->
    <form class="form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div class="field-group">
        <label for="email" class="label">E-Mail</label>
        <div class="input-wrapper">
          <Icon name="mail" size={18} />
          <input
            id="email"
            type="email"
            bind:value={email}
            autocomplete="email"
            placeholder="name@beispiel.com"
          />
        </div>
      </div>

      <div class="field-group">
        <label for="password" class="label">Passwort</label>
        <div class="input-wrapper">
          <Icon name="lock" size={18} />
          <input
            id="password"
            type="password"
            bind:value={password}
            autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
          />
        </div>
      </div>

      {#if error}
        <div class="error-box">
          <Icon name="alert-circle" size={16} />
          <span>{error}</span>
        </div>
      {/if}

      <button class="btn-primary" type="submit" disabled={loading}>
        {#if loading}
          <span class="spinner"></span>
          {mode === 'login' ? 'Wird angemeldet…' : 'Wird erstellt…'}
        {:else}
          {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        {/if}
      </button>
    </form>

    <!-- Footer hint -->
    <p class="footer-hint">
      {#if mode === 'login'}
        Noch kein Konto? <button type="button" class="link-btn" onclick={() => switchMode('register')}>Jetzt registrieren</button>
      {:else}
        Bereits registriert? <button type="button" class="link-btn" onclick={() => switchMode('login')}>Zur Anmeldung</button>
      {/if}
    </p>
  </div>
</section>

<style>
  .auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    background: var(--bg);
    background-image:
      radial-gradient(ellipse at top, color-mix(in oklab, var(--primary) 12%, transparent), transparent 60%),
      radial-gradient(ellipse at bottom right, color-mix(in oklab, var(--accent) 8%, transparent), transparent 50%);
  }

  .card {
    width: 100%;
    max-width: 400px;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-soft);
    padding: var(--space-xl);
  }

  .card-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    background: var(--primary-soft-bg);
    color: var(--primary);
    margin-bottom: var(--space-md);
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .subtitle {
    margin: var(--space-xs) 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: var(--space-xs);
    padding: 4px;
    border-radius: var(--radius-md);
    background: var(--secondary);
    margin-bottom: var(--space-lg);
  }

  .tabs button {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.6rem 1rem;
    border-radius: calc(var(--radius-md) - 2px);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .tabs button:hover:not(.active) {
    color: var(--text);
  }

  .tabs button.active {
    background: var(--surface);
    color: var(--primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  /* Form */
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border);
    background: var(--surface);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-wrapper:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus-outer);
  }

  .input-wrapper :global(svg) {
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .input-wrapper input {
    flex: 1;
    border: none;
    background: transparent;
    font: inherit;
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
  }

  .input-wrapper input::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  /* Error */
  .error-box {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--danger) 10%, transparent);
    border: 1px solid color-mix(in oklab, var(--danger) 30%, transparent);
    color: var(--danger);
    font-size: 0.875rem;
  }

  /* Primary Button */
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    width: 100%;
    margin-top: var(--space-sm);
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: var(--radius-md);
    background: var(--primary);
    color: var(--primary-contrast);
    font: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px color-mix(in oklab, var(--primary) 35%, transparent);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Spinner */
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Footer */
  .footer-hint {
    margin-top: var(--space-lg);
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .link-btn {
    border: none;
    background: none;
    padding: 0;
    font: inherit;
    color: var(--primary);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.15s;
  }

  .link-btn:hover {
    color: var(--primary-hover);
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .card {
      padding: var(--space-lg);
    }

    h1 {
      font-size: 1.5rem;
    }
  }
</style>
