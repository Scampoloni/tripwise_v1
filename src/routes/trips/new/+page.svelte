<script lang="ts">
  import { addTrip } from '$lib/stores/trips.js';
  import { goto } from '$app/navigation';
  import BackButton from '$lib/components/BackButton.svelte';
  import PlaceSearchInput from '$lib/components/PlaceSearchInput.svelte';
  import Icon from '$lib/components/Icon.svelte';

  // Wizard
  let step = $state(1);

  // Form
  let name = $state('');
  let destinationName = $state('');
  let destinationLat = $state<number | null>(null);
  let destinationLon = $state<number | null>(null);
  let destinationCountry = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let budgetStr = $state('');
  let currency = $state<'CHF'|'EUR'|'USD'|'JPY'|'GBP'>('CHF');
  let note = $state('');

  // UI
  let saving = $state(false);
  let savedId = $state<string | null>(null);
  let error = $state<string | null>(null);

  const currencies = ['CHF','EUR','USD','JPY','GBP'];

  function parseBudget(s: string) {
    const v = parseFloat(s.replace(/\s+/g,'').replace(',','.'));
    return Number.isFinite(v) && v >= 0 ? v : null;
  }

  const validStep1 = $derived(!!name && !!destinationName && !!startDate && !!endDate);
  const validStep2 = $derived(parseBudget(budgetStr) !== null);

  function handlePlaceSelect(place: { name: string; lat: number; lon: number; country?: string }) {
    destinationName = place.name;
    destinationLat = typeof place.lat === 'number' ? place.lat : null;
    destinationLon = typeof place.lon === 'number' ? place.lon : null;
    destinationCountry = place.country ?? '';
    console.log('Selected place for new trip', place);
  }

  function next() {
    if ((step === 1 && validStep1) || (step === 2 && validStep2)) step++;
  }
  function back() {
    if (step > 1) step--;
  }

  async function saveTrip() {
    error = null;
    saving = true;

    const budget = parseBudget(budgetStr) ?? 0;

    try {
      // 🔥 Hier geht es jetzt ueber die API in die DB
      const created = await addTrip({
        name,
        destinationName,
        destinationLat: destinationLat ?? undefined,
        destinationLon: destinationLon ?? undefined,
        destinationCountry: destinationCountry || undefined,
        startDate,
        endDate,
        budget,
        currency,
        status: 'active'
        // note koenntest du spaeter separat mappen, falls deine API das Feld hat
      });

      if (!created) {
        throw new Error('Trip konnte nicht erstellt werden');
      }

      const id = created.id;
      savedId = id;

      // kurze Success-Animation, dann zur Detailseite
      setTimeout(() => goto(`/trips/${id}`), 650);
    } catch (e) {
      console.error(e);
      error = 'Konnte nicht speichern, bitte versuche es erneut.';
    } finally {
      saving = false;
    }
  }
</script>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface">
    <div class="page-headings">
      <div class="page-title-row">
        <div class="page-title-icon">
          <Icon name="plane" size={22} />
        </div>
        <h1>New Trip</h1>
      </div>
      <p class="page-subtitle">Lege eine neue Reise mit Budget, Zeitraum und Notiz an.</p>
    </div>
    <BackButton label="Zurück" defaultHref="/trips" />
  </header>

  <div class="content-grid">
    <article class="form-card card-surface">
      <div class="stepper">
        <div class={`step ${step >= 1 ? 'active' : ''}`}>
          <span>1</span>
          <small>Basis</small>
        </div>
        <div class="connector"></div>
        <div class={`step ${step >= 2 ? 'active' : ''}`}>
          <span>2</span>
          <small>Budget</small>
        </div>
        <div class="connector"></div>
        <div class={`step ${step === 3 ? 'active' : ''}`}>
          <span>3</span>
          <small>Prüfen</small>
        </div>
      </div>

      {#if step === 1}
        <section class="form-section">
          <span class="card-label-with-icon">
            <Icon name="map-pin" size={16} />
            <span class="card-label">Basisdaten</span>
          </span>

          <div class="field">
            <label for="trip-name">Reisetitel</label>
            <input
              id="trip-name"
              class="input"
              bind:value={name}
              placeholder="z. B. Sommer in Island"
            />
          </div>

          <div class="field">
            <PlaceSearchInput
              label="Reiseziel"
              placeholder="Stadt oder Ort eingeben"
              initialValueName={destinationName}
              onSelect={handlePlaceSelect}
            />
            {#if destinationLat !== null && destinationLon !== null}
              <p class="place-debug">
                Ausgewaehlter Ort: {destinationName} ({destinationLat}, {destinationLon}) {destinationCountry}
              </p>
            {/if}
          </div>

          <div class="field-row">
            <div class="field">
              <label for="trip-start">Startdatum</label>
              <input id="trip-start" class="input" type="date" bind:value={startDate} />
            </div>
            <div class="field">
              <label for="trip-end">Enddatum</label>
              <input id="trip-end" class="input" type="date" bind:value={endDate} />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn ghost" type="button" disabled>
              <Icon name="arrow-left" size={16} />
              Zurück
            </button>
            <button class="btn primary" type="button" onclick={next} disabled={!validStep1}>
              Weiter
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </section>
      {:else if step === 2}
        <section class="form-section">
          <span class="card-label-with-icon">
            <Icon name="wallet" size={16} />
            <span class="card-label">Budget & Notizen</span>
          </span>

          <div class="field">
            <label for="trip-budget">Budget & Währung</label>
            <div class="input-group-combined">
              <input
                id="trip-budget"
                class="input-main"
                inputmode="decimal"
                placeholder="0.00"
                bind:value={budgetStr}
              />
              <div class="currency-select-wrapper">
                <select id="trip-currency" class="currency-select" bind:value={currency}>
                  {#each currencies as c}
                    <option value={c}>{c}</option>
                  {/each}
                </select>
                <div class="select-icon"><Icon name="chevron-down" size={14} /></div>
              </div>
            </div>
            {#if parseBudget(budgetStr) === null}
              <p class="field-hint warn">Bitte einen gültigen Betrag eingeben.</p>
            {/if}
          </div>

          <div class="field">
            <label for="trip-note">Notiz (optional)</label>
            <textarea
              id="trip-note"
              class="input textarea"
              rows="3"
              bind:value={note}
              placeholder="z. B. Unterkunft bereits gebucht …"
            ></textarea>
          </div>

          <div class="form-actions">
            <button class="btn ghost" type="button" onclick={back}>
              <Icon name="arrow-left" size={16} />
              Zurück
            </button>
            <button class="btn primary" type="button" onclick={next} disabled={!validStep2}>
              Weiter
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </section>
      {:else}
        <section class="form-section">
          <span class="card-label-with-icon">
            <Icon name="check" size={16} />
            <span class="card-label">Übersicht</span>
          </span>

          <div class="summary">
            <div><span>Titel</span><strong>{name}</strong></div>
            <div><span>Ziel</span><strong>{destinationName}</strong></div>
            <div><span>Zeitraum</span><strong>{startDate} – {endDate}</strong></div>
            <div><span>Budget</span><strong>{parseBudget(budgetStr) ?? 0} {currency}</strong></div>
            {#if note}<div class="note"><span>Notiz</span><em>{note}</em></div>{/if}
          </div>

          {#if error}<p class="field-hint warn">{error}</p>{/if}

          <div class="form-actions">
            <button class="btn ghost" type="button" onclick={back}>
              <Icon name="arrow-left" size={16} />
              Zurück
            </button>
            <button class="btn primary" type="button" onclick={saveTrip} disabled={saving}>
              <Icon name="plus" size={16} />
              {saving ? 'Wird erstellt …' : 'Reise erstellen'}
            </button>
          </div>
        </section>
      {/if}
    </article>

    <aside class="preview-card card-surface">
      <header class="preview-header">
        <span class="card-label-with-icon">
          <Icon name="smartphone" size={16} />
          <span class="card-label">Live-Vorschau</span>
        </span>
        <p>Deine Angaben aktualisieren sich in Echtzeit.</p>
      </header>

      <div class="preview-body">
        <div class="preview-title">{name || 'Neuer Trip'}</div>
        <div class="preview-meta">{destinationName || 'Ziel noch offen'}</div>
        <div class="preview-dates">{startDate || '—'} – {endDate || '—'}</div>
        <div class="preview-budget">
          Budget: <strong>{parseBudget(budgetStr) ?? 0} {currency}</strong>
        </div>
        {#if note}<div class="preview-note">„{note}“</div>{/if}
      </div>

      <div class="preview-tips">
        <span class="card-label-with-icon">
          <Icon name="lightbulb" size={14} />
          <span class="card-label">Tipps</span>
        </span>
        <ul>
          <li>Klare Kategorien helfen später bei Analytics.</li>
          <li>Währungen kannst du jederzeit anpassen.</li>
          <li>Nach dem Speichern landest du direkt in der Detailansicht.</li>
        </ul>
      </div>
    </aside>
  </div>
</section>

<!-- Success-Overlay: verhindert „leere Seite“ selbst dann, wenn Detailroute fehlt -->
{#if savedId}
  <div class="success">
    <div class="card success-card">
      <div class="check">
        <Icon name="check" size={28} />
      </div>
      <h3>Reise erstellt</h3>
      <p>Wir leiten dich weiter …</p>
      <a class="btn primary" href={"/trips/" + savedId}>
        <Icon name="arrow-right" size={16} />
        Falls keine Weiterleitung: Hier öffnen
      </a>
    </div>
  </div>
{/if}

<style>
  .page-shell {
    width: 100%;
    margin-bottom: 2.8rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
  }

  .page-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1.6rem 2rem;
  }

  .page-headings {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
    text-align: center;
  }

  .page-headings h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.4rem);
    letter-spacing: -0.01em;
  }

  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
    gap: 1.5rem;
    align-items: start;
  }

  .card-surface {
    background: var(--surface);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-soft);
  }

  .form-card {
    padding: 1.6rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
  }

  .preview-card {
    padding: 1.6rem 1.7rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: sticky;
    top: 1.4rem;
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }

  .step span {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .step.active span {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--primary-contrast);
    box-shadow: 0 12px 26px color-mix(in oklab, var(--primary) 25%, transparent);
  }

  .connector {
    flex: 1;
    height: 2px;
    background: color-mix(in oklab, var(--border) 75%, transparent);
    border-radius: 999px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field label {
    font-weight: 600;
    font-size: 0.95rem;
    color: color-mix(in oklab, var(--text) 78%, var(--text-secondary) 22%);
  }

  .place-debug {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .input {
    width: 100%;
    border-radius: 1rem;
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    background: color-mix(in oklab, var(--surface) 94%, var(--secondary) 6%);
    color: var(--text);
    padding: 0.75rem 0.9rem;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .input:hover {
    border-color: color-mix(in oklab, var(--primary) 26%, var(--border));
  }

  .input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 28%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
  }

  .input.select {
    appearance: none;
    cursor: pointer;
  }

  .textarea {
    min-height: 112px;
    resize: vertical;
  }

  .input-with-prefix {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    border-radius: 1rem;
    background: color-mix(in oklab, var(--surface) 94%, var(--secondary) 6%);
    padding: 0.55rem 0.65rem;
  }

  .input-with-prefix .prefix {
    padding: 0.35rem 0.7rem;
    border-radius: 0.85rem;
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    border: 1px solid color-mix(in oklab, var(--border) 78%, transparent);
    font-weight: 600;
    min-width: 3ch;
    text-align: center;
  }

  .input-with-prefix .input {
    border: none;
    background: transparent;
    padding: 0;
  }

  .input-with-prefix .input:focus {
    box-shadow: none;
  }

  .field-row {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-hint {
    margin: 0.35rem 0 0;
    font-size: 0.88rem;
    color: var(--text-secondary);
  }

  .field-hint.warn {
    color: var(--danger);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.75rem 1.1rem;
    border-radius: 0.9rem;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  }

  .btn.primary {
    background: var(--primary);
    color: var(--primary-contrast);
    box-shadow: 0 10px 22px color-mix(in oklab, var(--primary) 30%, transparent);
  }

  .btn.primary:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px color-mix(in oklab, var(--primary) 34%, transparent);
  }

  .btn.primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn.ghost {
    background: color-mix(in oklab, var(--surface) 94%, transparent);
    border-color: color-mix(in oklab, var(--border) 78%, transparent);
    color: var(--text);
  }

  .btn.ghost:hover:enabled {
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    transform: translateY(-1px);
  }

  .btn.ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .summary {
    display: grid;
    gap: 0.5rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: color-mix(in oklab, var(--surface) 92%, var(--secondary) 8%);
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
  }

  .summary div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.95rem;
  }

  .summary span {
    color: var(--text-secondary);
  }

  .summary .note span {
    align-self: flex-start;
  }

  .summary .note em {
    font-style: italic;
    color: var(--text);
  }

  .preview-header p {
    margin: 0.3rem 0 0;
    color: var(--text-secondary);
    font-size: 0.92rem;
  }

  .preview-body {
    display: grid;
    gap: 0.35rem;
    padding: 1.1rem 1.2rem;
    border-radius: 1.1rem;
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    border: 1px solid color-mix(in oklab, var(--primary) 24%, transparent);
  }

  .preview-title {
    font-size: 1.2rem;
    font-weight: 600;
  }

  .preview-meta {
    color: var(--text-secondary);
  }

  .preview-dates {
    margin-top: 0.2rem;
    color: color-mix(in oklab, var(--text-secondary) 85%, transparent);
  }

  .preview-budget {
    margin-top: 0.4rem;
    font-weight: 600;
  }

  .preview-note {
    margin-top: 0.35rem;
    font-style: italic;
    color: var(--text);
  }

  .preview-tips ul {
    margin: 0.45rem 0 0;
    padding-left: 1.2rem;
    color: var(--text-secondary);
    display: grid;
    gap: 0.35rem;
    font-size: 0.92rem;
  }

  .success {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: color-mix(in oklab, #000 35%, transparent);
    z-index: 50;
    animation: fadeIn 0.3s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .success-card {
    padding: 1.5rem 1.8rem;
    text-align: center;
    border-radius: 1.3rem;
    background: var(--surface);
    border: 1px solid color-mix(in oklab, var(--border) 72%, transparent);
    box-shadow: 0 20px 36px rgba(0, 0, 0, 0.25);
  }

  .check {
    width: 60px;
    height: 60px;
    margin: 0 auto 0.5rem;
    border-radius: 999px;
    background: var(--success);
    color: white;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 1.4rem;
    box-shadow: 0 12px 28px rgba(16, 185, 129, 0.35);
    animation: pop 0.4s ease forwards;
  }

  @keyframes pop {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .success .btn.primary {
    margin-top: 0.7rem;
    text-decoration: none;
  }

  :global([data-theme='dark']) .card-surface {
    background: color-mix(in oklab, var(--surface) 88%, var(--surface-soft) 12%);
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
  }

  :global([data-theme='dark']) .input,
  :global([data-theme='dark']) .input-with-prefix {
    background: color-mix(in oklab, var(--surface) 65%, var(--surface-soft) 35%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }

  :global([data-theme='dark']) .preview-body {
    background: color-mix(in oklab, var(--surface) 62%, var(--primary-soft-bg) 38%);
    border-color: color-mix(in oklab, var(--primary) 35%, transparent);
  }

  :global([data-theme='dark']) .preview-tips ul {
    color: color-mix(in oklab, var(--text-secondary) 85%, transparent);
  }

  :global([data-theme='dark']) .btn.ghost {
    border-color: color-mix(in oklab, var(--border) 60%, transparent);
  }

  @media (max-width: 980px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .preview-card {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .page-shell {
      padding: 1.2rem 1.2rem 2.2rem;
    }

    .page-header {
      padding: 1.2rem 1.3rem;
    }

    .form-card {
      padding: 1.4rem 1.5rem;
    }

    .field-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .btn {
      width: 100%;
    }
  }

  .card-label {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
  }

  .card-label-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-secondary);
  }

  .page-title-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  /* Combined Input Group */
  .input-group-combined {
    display: flex;
    align-items: center;
    border-radius: 1rem;
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    background: color-mix(in oklab, var(--surface) 94%, var(--secondary) 6%);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    overflow: hidden;
  }

  .input-group-combined:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 28%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
  }

  .input-main {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem 0.9rem;
    font-size: 1rem;
    color: var(--text);
    min-width: 0;
  }

  .input-main:focus {
    outline: none;
  }

  .currency-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border-left: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    height: 100%;
  }

  .currency-select {
    appearance: none;
    border: none;
    background: transparent;
    padding: 0.75rem 2.2rem 0.75rem 1rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    outline: none;
    height: 100%;
  }

  /* 
     Fix für Darkmode-Kontrast:
     Wir erzwingen für die Dropdown-Liste (Options) ein helles Theme (schwarzer Text auf weißem Grund).
     Das garantiert Lesbarkeit unabhängig vom Browser-Hover-Verhalten.
     Das geschlossene Feld bleibt dunkel (durch .currency-select color: var(--text)).
  */
  :global([data-theme='dark']) .currency-select option {
    background-color: #ffffff;
    color: #000000;
  }

  .select-icon {
    position: absolute;
    right: 0.8rem;
    pointer-events: none;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
  }

  :global([data-theme='dark']) .input-group-combined {
    background: color-mix(in oklab, var(--surface) 65%, var(--surface-soft) 35%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }
</style>
