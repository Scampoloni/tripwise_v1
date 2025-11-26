<script lang="ts">
  const faqs = [
    { q: 'Wie lege ich eine neue Reise an?', a: 'Klicke auf „Neue Reise“. Erstelle Basis, Budget und Kategorien im 3-Schritt-Wizard.' },
    { q: 'Wie füge ich Ausgaben hinzu?', a: 'In der Detailansicht: „Ausgabe hinzufügen“. Betrag, Kategorie, Datum, Notiz – speichern.' },
    { q: 'Wie funktioniert der Theme-Schalter?', a: '„Auto“ folgt deiner System-Einstellung (prefers-color-scheme). Du kannst hell/dunkel manuell wählen.' },
    { q: 'Wo werden meine Daten gespeichert?', a: 'Lokal im Browser (Local Storage). Im MVP gibt es keinen Login und kein Server-Sync.' },
    { q: 'Kann ich Reisen teilen?', a: 'Ja, über einen Link-Export (read-only oder optional editierbar) – perfekt für Gruppen.' },
    { q: 'Währungsrechner', a: 'Live-Kurse mit Fallback. Du kannst Beträge direkt in Ausgaben umrechnen.' }
  ];
  let query = $state('');
   const filtered = $derived(
    faqs.filter(f =>
      (f.q + ' ' + f.a).toLowerCase().includes(query.toLowerCase())
    )
  );
</script>

<section class="help-hero">
  <div class="blob"></div>
  <h1>Hilfe & Tipps</h1>
  <p>Finde schnell Antworten und Best Practices für TripWise.</p>
  <div class="search">
    <input placeholder="Suche in FAQ …" bind:value={query} />
  </div>
</section>

<section class="help-grid">
  <article class="panel">
    <h2>FAQ</h2>
    <div class="faq">
      {#each filtered as item}
        <details>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      {/each}
      {#if filtered.length === 0}
        <p class="muted">Keine Treffer – probiere einen anderen Suchbegriff.</p>
      {/if}
    </div>
  </article>

  <article class="panel tips">
    <h2>Tipps</h2>
    <ul>
      <li>Nutze den <a href="/converter">Währungsrechner</a> direkt beim Erfassen von Ausgaben.</li>
      <li>Lege klare Kategorien an (Unterkunft, Essen, Transport) für bessere Insights.</li>
      <li>Teste einmal komplett: Neue Reise → Ausgaben → Budget-Check.</li>
      <li>Für Gruppen: Mitreisende früh eintragen, damit Split-Funktionen sauber rechnen.</li>
    </ul>
  </article>

  <article class="panel support">
    <h2>Feedback</h2>
    <p>Vorschlag oder Bug gefunden? Notiere ihn in deiner Projektdoku unter „Validate“. Konkrete Learnings bringen dir in der Bewertung Extrapunkte.</p>
    <div class="cta">
      <a class="btn" href="/trips/new">Neue Reise starten</a>
      <a class="btn ghost" href="/converter">Währungen umrechnen</a>
    </div>
  </article>
</section>

<style>
  :root { scrollbar-gutter: stable both-edges; }

  .help-hero {
    position: relative;
    max-width: 980px; margin: 2rem auto 1.2rem; padding: 1.6rem 1rem 2rem; text-align: center;
  }
  .help-hero h1 { font-size: 2rem; margin: 0; }
  .help-hero p { opacity: .85; margin: .3rem 0 1rem; }
  .help-hero .search input {
    width: min(560px, 100%); padding: .7rem .9rem; border-radius: 12px;
    border: 1px solid var(--color-border); background: var(--color-bg);
  }
  .help-hero .blob {
    position: absolute; inset: -40px auto auto 50%; transform: translateX(-50%);
    width: 520px; height: 220px; filter: blur(60px); z-index: -1; opacity: .5;
    background: radial-gradient(60% 60% at 40% 40%, var(--color-accent, #60a5fa), transparent 70%),
                radial-gradient(60% 60% at 60% 60%, #a78bfa, transparent 70%);
  }

  .help-grid {
    max-width: 980px; margin: 0 auto 2rem; padding: 0 1rem;
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  }
  @media (max-width: 920px) { .help-grid { grid-template-columns: 1fr; } }

  .panel {
    background: color-mix(in oklab, var(--color-bg) 85%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-border), transparent 35%);
    border-radius: 16px;
    box-shadow: 0 10px 30px color-mix(in oklab, #000 18%, transparent);
    backdrop-filter: blur(6px);
    padding: 1rem;
  }
  .panel h2 { margin: 0 0 .6rem; font-size: 1.2rem; }

  .faq details {
    border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg);
    margin: .5rem 0; padding: .4rem .6rem;
  }
  .faq summary { cursor: pointer; font-weight: 600; }
  .faq p { margin: .4rem 0 0; opacity: .95; }
  .muted { opacity: .6; }

  .tips ul { margin: 0; padding-left: 1.1rem; }
  .tips li { margin: .35rem 0; }

  .support .cta { display: flex; gap: .6rem; margin-top: .6rem; flex-wrap: wrap; }
  .btn {
    padding: .6rem .9rem; border-radius: 12px; border: 1px solid var(--color-border);
    background: linear-gradient(180deg, color-mix(in oklab, var(--color-accent, #60a5fa), white 10%), var(--color-bg-secondary));
    text-decoration: none; color: var(--color-text-primary);
  }
  .btn.ghost { background: var(--color-bg); }
</style>
