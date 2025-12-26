<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

  const faqs = [
    { 
      q: 'Wie lege ich eine neue Reise an?', 
      a: 'Gehe auf „Trips" und klicke „Neue Reise". Gib Name, Reiseziel, Datum und Budget ein. Die Reise erscheint sofort auf deinem Dashboard.' 
    },
    { 
      q: 'Wie füge ich Ausgaben hinzu?', 
      a: 'Öffne eine Reise und wähle „Ausgabe hinzufügen". Trage Betrag, Kategorie und Datum ein. Die Ausgabe wird automatisch zum Budget-Tracker hinzugefügt.' 
    },
    { 
      q: 'Was zeigt das Dashboard?', 
      a: 'Das Dashboard gibt dir einen Überblick über alle aktiven Reisen, dein Gesamtbudget in CHF, anstehende Trips und den aktuellen Ausgabenstand.' 
    },
    { 
      q: 'Wie funktioniert der Währungsrechner?', 
      a: 'Der Converter nutzt Live-Wechselkurse. Gib einen Betrag ein, wähle Ausgangs- und Zielwährung – das Ergebnis wird sofort angezeigt.' 
    },
    { 
      q: 'Was ist TripSplit?', 
      a: 'Mit TripSplit kannst du Gruppenausgaben fair aufteilen. Erstelle eine Gruppe, füge Teilnehmer hinzu und erfasse gemeinsame Ausgaben. Die App berechnet automatisch, wer wem wie viel schuldet.' 
    },
    { 
      q: 'Wo werden meine Daten gespeichert?', 
      a: 'Alle Daten werden lokal in deinem Browser gespeichert (Local Storage). Es gibt keinen Server-Sync – deine Daten bleiben privat auf deinem Gerät.' 
    },
    { 
      q: 'Kann ich zwischen Hell- und Dunkelmodus wechseln?', 
      a: 'Ja, über das Theme-Icon in der Navigation. „Auto" folgt deiner System-Einstellung, oder du wählst manuell hell/dunkel.' 
    },
    { 
      q: 'Wie lösche ich eine Reise?', 
      a: 'Öffne die Reise und scrolle nach unten. Dort findest du den „Reise löschen"-Button. Achtung: Gelöschte Reisen können nicht wiederhergestellt werden.' 
    }
  ];

  let query = $state('');
  let showAllFaqs = $state(false);
  
  const filtered = $derived(
    faqs.filter(f =>
      (f.q + ' ' + f.a).toLowerCase().includes(query.toLowerCase())
    )
  );

  const visibleFaqs = $derived(
    showAllFaqs ? filtered : filtered.slice(0, 3)
  );

  const hasMoreFaqs = $derived(filtered.length > 3);
</script>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface header-centered">
    <div class="page-headings">
      <h1>Hilfe & Support</h1>
      <p class="page-subtitle">Finde Antworten auf häufige Fragen und lerne TripWise besser kennen.</p>
    </div>
    <div class="search-wrap">
      <input 
        class="search-input" 
        type="text" 
        placeholder="FAQ durchsuchen …" 
        bind:value={query} 
      />
    </div>
  </header>

  <div class="page-body">
    <div class="help-grid">
      <!-- FAQ Section -->
      <section class="card-surface faq-card">
        <span class="card-label">Häufige Fragen</span>
        <div class="faq-list">
          {#each visibleFaqs as item}
            <details class="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          {/each}
          {#if filtered.length === 0}
            <p class="no-results">Keine Treffer – probiere einen anderen Suchbegriff.</p>
          {/if}
        </div>
        {#if hasMoreFaqs && !showAllFaqs}
          <button class="show-more-btn" onclick={() => showAllFaqs = true}>
            Weitere Fragen anzeigen ({filtered.length - 3})
          </button>
        {/if}
        {#if showAllFaqs && hasMoreFaqs}
          <button class="show-more-btn" onclick={() => showAllFaqs = false}>
            Weniger anzeigen
          </button>
        {/if}
      </section>

      <!-- Quick Tips -->
      <section class="card-surface tips-card">
        <span class="card-label">Quick Tips</span>
        <ul class="tips-list">
          <li>
            <span class="tip-icon"><Icon name="lightbulb" size={18} /></span>
            <span>Nutze den <a href="/converter">Währungsrechner</a> vor Reiseantritt, um ein Gefühl für lokale Preise zu bekommen.</span>
          </li>
          <li>
            <span class="tip-icon"><Icon name="bar-chart" size={18} /></span>
            <span>Lege klare Kategorien an (Unterkunft, Essen, Transport) für bessere Budget-Übersicht.</span>
          </li>
          <li>
            <span class="tip-icon"><Icon name="users" size={18} /></span>
            <span>Bei Gruppenreisen: Nutze <a href="/tripsplit">TripSplit</a> für faire Kostenaufteilung.</span>
          </li>
          <li>
            <span class="tip-icon"><Icon name="target" size={18} /></span>
            <span>Setze dein Budget realistisch – plane einen Puffer von 10-15% für Unvorhergesehenes ein.</span>
          </li>
          <li>
            <span class="tip-icon"><Icon name="smartphone" size={18} /></span>
            <span>TripWise funktioniert offline – erfasse Ausgaben auch ohne Internetverbindung.</span>
          </li>
        </ul>
      </section>

      <!-- Getting Started -->
      <section class="card-surface start-card">
        <span class="card-label">Erste Schritte</span>
        <div class="steps-list">
          <div class="step">
            <span class="step-num">1</span>
            <div class="step-content">
              <strong>Reise erstellen</strong>
              <p>Starte mit einer neuen Reise – Name, Ziel, Daten und Budget festlegen.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <div class="step-content">
              <strong>Ausgaben tracken</strong>
              <p>Erfasse jeden Kauf direkt vor Ort. Je genauer, desto besser die Übersicht.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <div class="step-content">
              <strong>Budget im Blick</strong>
              <p>Das Dashboard zeigt dir jederzeit den aktuellen Stand – Budget vs. Ausgaben.</p>
            </div>
          </div>
        </div>
      </section>

      </div>
  </div>
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: 100%;
    margin-bottom: 2.8rem;
    padding: 0;
    box-sizing: border-box;
  }

  .page-header {
    margin-bottom: 0;
  }

  .header-centered {
    text-align: center;
  }

  .page-headings {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .page-headings h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.2rem);
    letter-spacing: -0.01em;
  }

  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .search-wrap {
    margin-top: 1.25rem;
  }

  .search-input {
    width: 100%;
    max-width: 480px;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 1px solid var(--border);
    background: var(--secondary);
    color: var(--text);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
  }

  .search-input::placeholder {
    color: var(--text-secondary);
  }

  .page-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .help-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 800px) {
    .help-grid {
      grid-template-columns: 1fr;
    }
  }

  .card-surface {
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    box-shadow: var(--shadow-soft);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card-label {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
  }

  /* FAQ Card */
  .faq-card {
    grid-column: 1 / -1;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .faq-item {
    border: 1px solid var(--border);
    border-radius: 0.9rem;
    background: var(--secondary);
    padding: 0;
    overflow: hidden;
  }

  .faq-item summary {
    padding: 0.85rem 1rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background 0.15s;
  }

  .faq-item summary::-webkit-details-marker {
    display: none;
  }

  .faq-item summary::after {
    content: '+';
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--text-secondary);
    transition: transform 0.2s;
  }

  .faq-item[open] summary::after {
    transform: rotate(45deg);
  }

  .faq-item summary:hover {
    background: color-mix(in oklab, var(--secondary) 80%, var(--primary-soft-bg) 20%);
  }

  .faq-item p {
    margin: 0;
    padding: 0 1rem 1rem;
    color: var(--text-secondary);
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .no-results {
    color: var(--text-secondary);
    font-size: 0.92rem;
    text-align: center;
    padding: 1rem;
  }

  /* Tips Card */
  .tips-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .tips-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .tip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--primary);
    margin-top: 0.1rem;
  }

  .tips-list a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
  }

  .tips-list a:hover {
    text-decoration: underline;
  }

  /* Start Card */
  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: var(--primary);
    color: var(--primary-contrast);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
  }

  .step-content strong {
    display: block;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .step-content p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.45;
  }

  /* Show More Button */
  .show-more-btn {
    width: 100%;
    padding: 0.85rem 1rem;
    margin-top: 0.5rem;
    border-radius: 0.9rem;
    border: 1px dashed var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.92rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .show-more-btn:hover {
    background: var(--secondary);
    color: var(--text);
    border-color: color-mix(in oklab, var(--primary) 50%, transparent);
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.2rem;
    }

    .card-surface {
      padding: 1.4rem;
    }
  }

  @media (max-width: 600px) {
    .card-surface {
      padding: 1.25rem;
    }
  }
</style>
