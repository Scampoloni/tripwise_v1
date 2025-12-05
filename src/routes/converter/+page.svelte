<script lang="ts">
  import { fetchRateViaProxy, getStaticRate } from '$lib/utils/currency.js';
  import Icon from '$lib/components/Icon.svelte';

  let amountStr = $state<string>(''); // kein fuehrendes "0"
  let base = $state<'CHF' | 'EUR' | 'USD' | 'JPY' | 'GBP'>('CHF');
  let target = $state<'CHF' | 'EUR' | 'USD' | 'JPY' | 'GBP'>('EUR');
  let rate = $state<number | null>(null);
  let result = $state<number>(0);
  let loading = $state<boolean>(false);
  let error = $state<string | null>(null);
  let rateDate = $state<string | null>(null);
  let showAccuracy = $state<boolean>(false);

  // lokale Mini-Historie (nur im Browser, ohne Backend)
  let history = $state<Array<{ ts: number; base: string; target: string; amount: number; result: number }>>([]);

  const SYMBOL: Record<string, string> = { CHF: 'CHF', EUR: '€', USD: '$', JPY: '¥', GBP: '£' };

  function parseAmount(s: string): number {
    const v = parseFloat(s.replace(/\s+/g, '').replace(',', '.'));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }

  function round(n: number, d = 4) {
    const f = 10 ** d;
    return Math.round(n * f) / f;
  }

  function fmtMoney(n: number, code: string) {
    try {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency: code }).format(n);
    } catch {
      return `${round(n, 2)} ${code}`;
    }
  }

  async function loadRate() {
    loading = true;
    error = null;
    rateDate = null;
    try {
      const r = await fetchRateViaProxy(base, target);
      rate = r;
      rateDate = new Date().toISOString().slice(0, 10);
    } catch {
      error = 'Live-Kurs nicht verfuegbar, Fallback aktiv.';
      rate = getStaticRate(base, target);
      rateDate = 'Fallback';
    } finally {
      loading = false;
      recalc();
    }
  }

  function recalc() {
    const amount = parseAmount(amountStr);
    result = round(amount * (rate ?? 1));
  }

  // Neu laden wenn Basis/Ziel wechseln
  $effect(() => {
    loadRate();
  });

  // Neu rechnen wenn Betrag sich aendert
  $effect(() => {
    recalc();
  });

  function swap() {
    const b = base;
    base = target;
    target = b;

    const el = document.querySelector<HTMLButtonElement>('.swap');
    el?.classList.remove('spin');
    requestAnimationFrame(() => el?.classList.add('spin'));
  }

  function copyResult() {
    const txt = fmtMoney(result, target);
    navigator.clipboard?.writeText(txt);
    const btn = document.querySelector<HTMLButtonElement>('.copy-btn');
    btn?.classList.add('flash');
    setTimeout(() => btn?.classList.remove('flash'), 400);
  }

  function addToHistory() {
    const amount = parseAmount(amountStr);
    if (amount <= 0) return;
    history = [{ ts: Date.now(), base, target, amount, result }, ...history].slice(0, 5);
  }

 const effectiveRate = $derived(
  round((result || 0) / (parseAmount(amountStr) || 1), 6)
);


</script>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface header-centered">
    <div class="page-headings">
      <h1>Währungsrechner</h1>
      <p class="page-subtitle">Konvertiere Beträge schnell und präzise – mit Live-Kursen und ruhigem Design.</p>
    </div>
  </header>

  <div class="page-body">
    <section class="converter-card card-surface">
    <!-- Betrag -->
    <div class="field">
      <label for="amount">Betrag</label>
      <div class="amount-wrap">
        <span class="prefix">{SYMBOL[base]}</span>
        <input
          id="amount"
          inputmode="decimal"
          placeholder="Betrag eingeben"
          bind:value={amountStr}
          aria-label="Betrag in Ausgangswährung"
        />
      </div>
    </div>

    <!-- Von / Nach -->
    <div class="field grid">
      <div>
        <label for="base">Von</label>
        <select id="base" bind:value={base}>
          <option>CHF</option>
          <option>EUR</option>
          <option>USD</option>
          <option>JPY</option>
          <option>GBP</option>
        </select>
      </div>

      <div class="swap-col">
        <button type="button" class="swap" onclick={swap} aria-label="Währungen tauschen">
          <Icon name="arrow-right" size={20} />
        </button>
      </div>

      <div>
        <label for="target">Nach</label>
        <select id="target" bind:value={target}>
          <option>CHF</option>
          <option>EUR</option>
          <option>USD</option>
          <option>JPY</option>
          <option>GBP</option>
        </select>
      </div>
    </div>

    <!-- Ergebnisbereich -->
    <div class="result-panel">
      <div class="result-main">
        <div class="result-line">
          <span class="from">
            {fmtMoney(parseAmount(amountStr), base)}
          </span>
          <span class="eq">=</span>
          <span class="to">
            {fmtMoney(result, target)}
          </span>
          <button class="copy-btn" type="button" onclick={copyResult} title="Ergebnis kopieren">
            <Icon name="copy" size={16} />
          </button>
        </div>
        <div class="rate-line">
          {#if loading}
            <span class="dot"></span> Kurs wird geladen …
          {:else}
            1 {base} = {effectiveRate} {target}
            <span class="sep">•</span>
            <span class="date">Stand: {rateDate}</span>
          {/if}
          {#if error}
            <span class="warn">— {error}</span>
          {/if}
        </div>
      </div>

      <div class="result-actions">
        <button class="pill pill-cta" type="button" onclick={addToHistory}>
          <Icon name="plus" size={16} /> Zur Historie
        </button>
      </div>
    </div>

    <!-- Hinweis zur Genauigkeit -->
    <div class="accuracy">
      <button
        type="button"
        class="accuracy-toggle"
        onclick={() => (showAccuracy = !showAccuracy)}
      >
        <span>Hinweis zur Genauigkeit</span>
        <span class="chevron">{showAccuracy ? '▲' : '▼'}</span>
      </button>

      {#if showAccuracy}
        <div class="accuracy-text">
          Live-Kurse kommen über die Frankfurter API (EZB). Bei Ausfall nutzen wir lokale
          Fallback-Kurse. Werte können leicht von den Kursen deiner Bank abweichen.
        </div>
      {/if}
    </div>
    </section>

    {#if history.length}
      <section class="history card-surface">
        <span class="card-label">Letzte Umrechnungen</span>
        <ul class="history-list">
          {#each history as h}
            <li class="history-item">
              <span class="history-icon"><Icon name="credit-card" size={16} /></span>
              <span class="history-time">
                {new Date(h.ts).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span class="history-entry">
                {fmtMoney(h.amount, h.base)} →
                <strong>{fmtMoney(h.result, h.target)}</strong>
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(85vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem 1.8rem 2.8rem;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    flex-wrap: wrap;
    padding: 1.6rem 2rem;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: var(--shadow-soft);
  }

  .page-header.header-centered {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }

  .page-headings {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .header-centered .page-headings {
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

  .page-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-surface {
    background: var(--surface);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-soft);
    box-sizing: border-box;
  }

  .converter-card {
    padding: 1.8rem 1.8rem 1.6rem;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .history {
    padding: 1.5rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ===== CARD LABEL (matches Help/TripSplit) ===== */
  .card-label {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  :global([data-theme='dark']) .card-surface {
    background: color-mix(in oklab, var(--surface) 88%, var(--surface-soft) 12%);
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.4rem;
    }
  }

  .field {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1.2rem;
  }

  label {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .amount-wrap {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    border-radius: 1rem;
    border: 1px solid var(--border);
    background: var(--secondary);
  }

  .prefix {
    min-width: 2.7ch;
    text-align: center;
    opacity: 0.85;
    font-weight: 600;
  }

  input {
    border: none;
    outline: none;
    background: transparent;
    color: var(--text);
    font-size: 1.2rem;
  }

  input::placeholder {
    color: color-mix(in oklab, var(--text-secondary) 70%, transparent);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    padding: 0.4rem;
    border-radius: 0.6rem;
    cursor: pointer;
    color: var(--text-secondary);
    opacity: 0.7;
    transition: all 0.15s ease;
  }

  .copy-btn:hover {
    opacity: 1;
    color: var(--primary);
    background: color-mix(in oklab, var(--primary) 12%, transparent);
    transform: scale(1.1);
  }

  :global(.copy-btn.flash) {
    color: var(--success, #22c55e);
    transform: scale(1.15);
    opacity: 1;
  }

  .grid {
    grid-template-columns: 1fr auto 1fr;
    gap: 0.9rem;
    align-items: end;
  }

  select {
    width: 100%;
    padding: 0.65rem 0.9rem;
    border-radius: 1rem;
    border: 1px solid var(--border);
    background: var(--secondary);
    color: var(--text);
    font-size: 0.98rem;
  }

  .swap-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swap {
    width: 48px;
    height: 48px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    font-size: 1.1rem;
    transition: transform 0.25s ease, background 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  }
  .swap:hover {
    background: var(--secondary-hover);
    transform: rotate(90deg);
  }
  :global(.swap.spin) {
    animation: spin 0.5s ease;
  }
  @keyframes spin {
    to {
      transform: rotate(540deg);
    }
  }

  .result-panel {
    margin-top: 0.6rem;
    padding: 1.1rem 1.2rem 1rem;
    border-radius: 1.25rem;
    background: linear-gradient(
      135deg,
      color-mix(in oklab, var(--primary-soft-bg) 80%, #ffffff 20%),
      var(--primary-soft-bg)
    );
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .result-main {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .result-line {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: baseline;
    justify-content: center;
    font-size: 1.35rem;
  }

  .from {
    opacity: 0.9;
  }

  .eq {
    opacity: 0.7;
  }

  .to {
    font-weight: 650;
  }

  .rate-line {
    text-align: center;
    font-size: 0.88rem;
    opacity: 0.9;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: center;
    align-items: center;
  }

  .sep {
    opacity: 0.5;
  }

  .date {
    opacity: 0.85;
  }

  .dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: var(--primary);
    display: inline-block;
    animation: pulse 1.2s infinite ease-in-out;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }

  .warn {
    color: #ef4444;
  }

  .result-actions {
    display: flex;
    justify-content: center;
    margin-top: 0.2rem;
  }

  /* ===== PILL BUTTONS (matches Help/TripSplit) ===== */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.3rem;
    border-radius: 999px;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .pill-cta {
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--primary) 88%, #ffffff 12%),
      var(--primary)
    );
    color: var(--primary-contrast);
    border-color: color-mix(in oklab, var(--primary) 40%, transparent);
    box-shadow: 0 6px 14px color-mix(in oklab, var(--primary) 18%, transparent);
  }

  .pill-cta:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px color-mix(in oklab, var(--primary) 25%, transparent);
  }

  .accuracy {
    margin-top: 1rem;
  }

  .accuracy-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0;
  }

  .accuracy-toggle:hover {
    color: var(--text);
  }

  .chevron {
    font-size: 0.8rem;
  }

  .accuracy-text {
    margin-top: 0.45rem;
    padding: 0.7rem 0.9rem;
    border-radius: 0.9rem;
    background: var(--secondary);
    color: var(--text-secondary);
    font-size: 0.9rem;
    height: 60px;
    overflow: auto;
  }

  /* ===== HISTORY LIST (matches Help/TripSplit item-list) ===== */
  .history-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.9rem;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 0.92rem;
    transition: background 0.15s ease;
  }

  .history-item:hover {
    background: var(--secondary);
  }

  .history-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .history-time {
    color: var(--text-secondary);
    font-size: 0.85rem;
    min-width: 3.5rem;
  }

  .history-entry {
    flex: 1;
  }

  .history-entry strong {
    font-weight: 600;
    color: var(--primary);
  }

  @media (max-width: 640px) {
    .converter-card {
      padding: 1.4rem 1.3rem 1.3rem;
    }
    .grid {
      grid-template-columns: 1fr;
    }
    .swap-col {
      order: 3;
      margin-top: 0.4rem;
    }
    .swap {
      width: 42px;
      height: 42px;
    }
  }
</style>
