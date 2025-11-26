<script lang="ts">
  import { goto } from '$app/navigation';

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
  <title>Login · TripWise</title>
</svelte:head>

<section class="auth-layout">
  <div class="card">
    <h1>TripWise</h1>
    <p class="subtitle">Melde dich an oder erstelle ein Konto, um deine Trips zu speichern.</p>

    <div class="tabs">
      <button
        type="button"
        class:selected={mode === 'login'}
        on:click={() => switchMode('login')}
      >
        Login
      </button>
      <button
        type="button"
        class:selected={mode === 'register'}
        on:click={() => switchMode('register')}
      >
        Registrieren
      </button>
    </div>

    <form
      class="form"
      on:submit|preventDefault={handleSubmit}
    >
      <label>
        Email
        <input
          class="field"
          type="email"
          bind:value={email}
          autocomplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label>
        Passwort
        <input
          class="field"
          type="password"
          bind:value={password}
          autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="••••••••"
        />
      </label>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button class="btn-primary" type="submit" disabled={loading}>
        {#if loading}
          {mode === 'login' ? 'Wird eingeloggt …' : 'Wird erstellt …'}
        {:else}
          {mode === 'login' ? 'Einloggen' : 'Konto erstellen'}
        {/if}
      </button>

      <!-- Optional spaeter: Gastmodus Button -->
      <!--
      <button type="button" class="btn-ghost full">
        Als Gast fortfahren
      </button>
      -->
    </form>
  </div>
</section>

<style>
  .auth-layout{
    min-height: 100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding: 1.5rem;
    background:
      radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 55%),
      radial-gradient(circle at bottom, rgba(56,189,248,0.13), transparent 55%),
      var(--color-bg, #020617);
  }

  .card{
    width: 100%;
    max-width: 420px;
    background: var(--surface, #020617);
    border-radius: 1.25rem;
    border: 1px solid color-mix(in oklab, var(--border, #1f2937), transparent 10%);
    box-shadow: 0 22px 60px rgba(0,0,0,0.55);
    padding: 1.6rem 1.8rem 1.5rem;
  }

  h1{
    margin: 0;
    font-size: 1.7rem;
    letter-spacing: .03em;
  }

  .subtitle{
    margin: .3rem 0 1.2rem;
    color: var(--text-secondary, #9ca3af);
    font-size: .95rem;
  }

  .tabs{
    display:flex;
    padding:.18rem;
    border-radius:999px;
    background: color-mix(in oklab, var(--surface,#020617) 90%, #111827 10%);
    border: 1px solid color-mix(in oklab, var(--border,#1f2937) 80%, transparent 20%);
    margin-bottom: 1rem;
  }

  .tabs button{
    flex:1;
    border:none;
    background: transparent;
    padding:.45rem .6rem;
    border-radius: 999px;
    font: inherit;
    cursor:pointer;
    color: var(--text-secondary,#9ca3af);
    transition: background .18s, color .18s, transform .12s;
  }

  .tabs button.selected{
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    color:#fff;
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(37,99,235,.45);
  }

  .form{
    display:flex;
    flex-direction:column;
    gap:.7rem;
    margin-top:.4rem;
  }

  label{
    display:flex;
    flex-direction:column;
    gap:.25rem;
    font-size:.9rem;
    font-weight:600;
  }

  .field{
    border-radius: .9rem;
    border: 1.6px solid color-mix(in oklab, var(--border,#1f2937) 80%, var(--primary,#3b82f6) 8%);
    padding:.65rem .75rem;
    background: color-mix(in oklab, var(--surface,#020617) 92%, transparent 8%);
    color: var(--text,#e5e7eb);
    transition: border-color .18s, box-shadow .18s, background .18s;
  }

  .field:focus{
    outline:none;
    border-color: var(--primary,#3b82f6);
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--primary,#3b82f6), transparent 70%);
    background: color-mix(in oklab, var(--surface,#020617) 96%, #020617 4%);
  }

  .btn-primary{
    margin-top:.5rem;
    width:100%;
    border:none;
    border-radius:.9rem;
    padding:.7rem 1rem;
    cursor:pointer;
    font-weight:700;
    letter-spacing:.03em;
    color:#fff;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    box-shadow: 0 10px 26px rgba(37,99,235,.45);
    transition: transform .18s, box-shadow .18s, opacity .18s;
  }

  .btn-primary:disabled{
    opacity:.7;
    cursor:default;
    transform:none;
    box-shadow:none;
  }

  .btn-primary:not(:disabled):hover{
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(37,99,235,.5);
  }

  .btn-ghost.full{
    margin-top:.3rem;
    width:100%;
    border-radius:.9rem;
    padding:.65rem 1rem;
    border:1px solid color-mix(in oklab, var(--border,#1f2937) 80%, transparent 20%);
    background: transparent;
    color: var(--text-secondary,#9ca3af);
    cursor:pointer;
  }

  .error{
    margin: .2rem 0 0;
    color: #fca5a5;
    font-size:.9rem;
  }
</style>
