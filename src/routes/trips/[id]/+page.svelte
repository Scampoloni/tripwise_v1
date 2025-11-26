<script lang="ts">
  import {
    trips,
    reloadExpensesForTrip,
    deleteExpense as deleteExpenseFromStore,
    addExpense,
    updateTrip as updateTripInStore
  } from '$lib/stores/trips.js';
  import type { Writable } from 'svelte/store';
  import { calculateSplit } from '$lib/utils/split.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import BackButton from '$lib/components/BackButton.svelte';
  import type { StoreTrip, StoreExpense, Participant } from '$lib/types/trips';

  type SplitRow = {
    participant: Participant;
    paid: number;
    share: number;
    net: number;
  };

  function computeDateRange(value: StoreTrip | null): string {
    if (!value) return '';
    const start = formatDate(value.startDate);
    const end = formatDate(value.endDate);
    if (start && end) {
      return start === end ? start : `${start} - ${end}`;
    }
    return start || end || '';
  }

  const tripId = $derived($page.params.id as string);

  const allTrips = $derived(($trips as StoreTrip[] | null) ?? []);
  const tripFromStore = $derived<StoreTrip | null>(
    allTrips.find((t) => t?.id === tripId) ?? null
  );

  const tripFromServer = $derived<StoreTrip | null>(
    ($page.data?.trip as StoreTrip | null) ?? null
  );

  const trip = $derived<StoreTrip | null>(tripFromStore ?? tripFromServer ?? null);

  const tripCurrency = $derived<string>(trip?.currency ?? 'CHF');

  const fallbackParticipants: Participant[] = [{ id: 'me', name: 'Du' }];

  const participants = $derived.by<Participant[]>(() => {
    const list = trip?.participants ?? [];
    if (!Array.isArray(list) || list.length === 0) {
      return fallbackParticipants;
    }

    const sanitized = list
      .map((participant) => ({
        id: typeof participant?.id === 'string' ? participant.id.trim() : '',
        name: typeof participant?.name === 'string' ? participant.name.trim() : ''
      }))
      .filter((participant) => participant.id && participant.name);

    return sanitized.length > 0 ? sanitized : fallbackParticipants;
  });

  const expenses = $derived<StoreExpense[]>(
    trip
      ? [...(trip.expenses ?? [])].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      : []
  );

  const recentExpenses = $derived(expenses.slice(0, 4));

  const splitResult = $derived.by<SplitRow[]>(() => {
    if (!trip) return [];
    if (!Array.isArray(expenses) || expenses.length === 0) return [];
    return calculateSplit(trip, expenses);
  });

  const totalBudget = $derived.by(() => {
    const raw = Number(trip?.budget ?? 0);
    return Number.isFinite(raw) ? raw : 0;
  });

  const expensesForBudget = $derived.by<StoreExpense[]>(() =>
    Array.isArray(trip?.expenses) ? trip.expenses : []
  );

  const spent = $derived.by(() =>
    expensesForBudget.reduce((sum, expense) => {
      const safeSum = Number.isFinite(sum) ? sum : 0;
      const amount = Number(expense?.amount ?? 0);
      const safeAmount = Number.isFinite(amount) ? amount : 0;
      return safeSum + safeAmount;
    }, 0)
  );

  const remaining = $derived.by(() => Math.max(0, totalBudget - spent));

  const progressPct = $derived.by(() => {
    if (totalBudget <= 0) return 0;
    const ratio = (spent / totalBudget) * 100;
    if (!Number.isFinite(ratio)) return 0;
    return Math.min(100, Math.max(0, Math.round(ratio)));
  });

  $effect(() => {
    console.log('DEBUG Phase2 DetailTrip Budget', {
      tripBudget: trip?.budget,
      tripTotalBudget: trip?.totalBudget,
      totalBudget,
      spent,
      remaining,
      progressPct
    });
  });
  const expenseCount = $derived(expenses.length);
  const hasExpenses = $derived(expenseCount > 0);

  function formatDate(iso: string | undefined) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  const dateRange = $derived(computeDateRange(trip));

  const categories = ['Unterkunft', 'Essen', 'Transport', 'Erlebnis', 'Shopping', 'Misc'];

  let addOpen = $state(false);
  let exDesc = $state('');
  let exAmountStr = $state('');
  let exCategory = $state(categories[0]);
  let exDate = $state(new Date().toISOString().slice(0, 10));
  let expenseError = $state<string | null>(null);
  let savingExpense = $state(false);
  let payerId = $state('');
  let newParticipantName = $state('');
  let participantError = $state<string | null>(null);
  let isSavingParticipant = $state(false);
  let expensesLoadedForTripId = $state<string | null>(null);


  const canSaveExpense = $derived(
    !!exDesc && parseAmount(exAmountStr) !== null && !!exDate && !!payerId
  );

  const canAddParticipant = $derived(() => newParticipantName.trim().length > 0);

  function parseAmount(input: string): number | null {
    const value = parseFloat((input || '').replace(/\s+/g, '').replace(',', '.'));
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  function resetExpenseForm() {
    exDesc = '';
    exAmountStr = '';
    exCategory = categories[0];
    exDate = new Date().toISOString().slice(0, 10);
    expenseError = null;
  }

  function generateParticipantId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `participant-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  $effect(() => {
    const list = participants;
    if (!Array.isArray(list) || list.length === 0) return;
    if (payerId && list.some((participant) => participant.id === payerId)) {
      return;
    }
    const fallback = list.find((participant) => participant.id === 'me') ?? list[0];
    payerId = fallback?.id ?? '';
  });

  $effect(() => {
    const serverTrip = tripFromServer;
    if (!serverTrip) return;

    trips.update((list) => {
      if (list.some((t) => t.id === serverTrip.id)) {
        return list;
      }
      return [...list, serverTrip];
    });
  });

  $effect(() => {
    if (!tripId || !trip) return;
    if (expensesLoadedForTripId === tripId) {
      return;
    }

    (async () => {
      try {
        await reloadExpensesForTrip(tripId);
        expensesLoadedForTripId = tripId;
      } catch (err) {
        console.error('Expenses konnten nicht geladen werden', err);
      }
    })();
  });

  function openAddModal() {
    resetExpenseForm();
    addOpen = true;
  }

  async function handleAddExpense() {
    if (!trip) return;

    const amount = parseAmount(exAmountStr);
    if (amount === null) {
      expenseError = 'Bitte einen gültigen Betrag eingeben.';
      return;
    }

    savingExpense = true;
    expenseError = null;

    try {
      await addExpense(trip.id, {
        amount,
        currency: trip.currency || 'CHF',
        category: exCategory,
        date: exDate || new Date().toISOString().slice(0, 10),
        description: exDesc,
        paidByParticipantId: payerId,
        splitBetweenAll: true
      });

      resetExpenseForm();
      addOpen = false;
    } catch (err) {
      console.error('Expense speichern fehlgeschlagen', err);
      expenseError = err instanceof Error && err.message
        ? err.message
        : 'Ausgabe konnte nicht gespeichert werden.';
    } finally {
      savingExpense = false;
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!trip) return;

    try {
      await deleteExpenseFromStore(trip.id, expenseId);
    } catch (err) {
      console.error('Expense löschen fehlgeschlagen', err);
    }
  }

  async function handleAddParticipant() {
    if (!trip) return;

    const name = newParticipantName.trim();
    if (!name) {
      participantError = 'Name darf nicht leer sein.';
      return;
    }

    const newParticipant = {
      id: generateParticipantId(),
      name
    };

    const nextParticipants = [...participants, newParticipant];

    isSavingParticipant = true;
    participantError = null;

    try {
      await updateTripInStore(trip.id, {
        participants: nextParticipants
      });

      newParticipantName = '';
    } catch (err) {
      console.error('Teilnehmer speichern fehlgeschlagen', err);
      participantError = err instanceof Error && err.message
        ? err.message
        : 'Konnte Person nicht speichern.';
    } finally {
      isSavingParticipant = false;
    }
  }

  const to = (path: string) => goto(path);
</script>

<svelte:head>
  <title>{trip ? `${trip.name} · TripWise` : 'Trip · TripWise'}</title>
</svelte:head>



{#if !trip}
  <section class="page-shell page-empty" data-animate="fadeUp">
    <div class="empty-card card-surface">
      <h1>Trip nicht gefunden</h1>
      <p>Bitte kehre zur Übersicht zurück.</p>
      <a href="/trips" class="pill pill-cta">Zur Übersicht</a>
    </div>
  </section>
{:else}
  <section class="page-shell" data-animate="fadeUp">
    <header class="page-header card-surface">
      <div class="page-headings">
        <h1>{trip.name}</h1>
        {#if trip.destination}
          <p class="page-subtitle">{trip.destination}</p>
        {/if}
        {#if dateRange}
          <p class="page-meta">{dateRange}</p>
        {/if}
      </div>

      <div class="actions">
        <button type="button" class="pill pill-secondary" onclick={() => to('/trips')}>
          Zur Trip Übersicht
        </button>
        <button type="button" class="pill pill-secondary" onclick={() => to(`/trips/${trip.id}/analytics`)}>
          Analytics
        </button>
        <button type="button" class="pill pill-cta" onclick={openAddModal}>
          + Ausgabe erfassen
        </button>
      </div>
    </header>

    <div class="overview-grid">
      <section class="trip-summary card-surface">
        <div class="summary-head">
          <h2>Reiseüberblick</h2>
          {#if trip.status}
            <span class="summary-badge">
              <span class="badge-dot"></span>
              {trip.status}
            </span>
          {/if}
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Destination</span>
            <span class="summary-value">{trip.destination || '—'}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Zeitraum</span>
            <span class="summary-value">{dateRange || '—'}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Budget</span>
            <span class="summary-value">{(Number(totalBudget) || 0).toFixed(2)} {tripCurrency}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Ausgaben</span>
            <span class="summary-value">{expenseCount}</span>
          </div>
        </div>
      </section>

      <section class="trip-group card-surface">
        <div class="group-head">
          <div>
            <h2>Reisegruppe</h2>
            <p class="group-subtitle">Teile die Reise mit den richtigen Personen.</p>
          </div>
        </div>

        <div class="participant-list" aria-live="polite">
          {#each participants as participant (participant.id)}
            <div class="participant-pill">
              <span class="participant-avatar" aria-hidden="true">
                {participant.name.slice(0, 1).toUpperCase()}
              </span>
              <span class="participant-name">{participant.name}</span>
            </div>
          {/each}
        </div>

        <div class="group-form">
          <label class="field-label" for="new-participant">Name der Person</label>
          <div class="group-input">
            <input
              id="new-participant"
              class="input"
              placeholder="z. B. Alex"
              bind:value={newParticipantName}
            />
            <button
              type="button"
              class="pill pill-secondary"
              onclick={handleAddParticipant}
              disabled={!canAddParticipant || isSavingParticipant}
            >
              {isSavingParticipant ? 'Wird hinzugefügt …' : 'Person hinzufügen'}
            </button>
          </div>
          {#if participantError}
            <p class="form-error" role="alert">{participantError}</p>
          {/if}
        </div>
      </section>

      <section class="budget-card card-surface">
        <div class="budget-head">
          <h2>Budget Status</h2>
          <span class="budget-percent">{Math.min(Math.max(Number(progressPct) || 0, 0), 100)}%</span>
        </div>

        <div class="budget-stats">
          <div class="stat">
            <span class="stat-label">Budget</span>
            <span class="stat-value">{(Number(totalBudget) || 0).toFixed(2)} {tripCurrency}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Ausgegeben</span>
            <span class="stat-value warn">{(Number(spent) || 0).toFixed(2)} {tripCurrency}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Verbleibend</span>
            <span class={`stat-value ${Number(remaining) > 0 ? 'ok' : 'warn'}`}>
              {(Number(remaining) || 0).toFixed(2)} {tripCurrency}
            </span>
          </div>
        </div>

        <div class="progress-wrap" aria-label="Budget Fortschritt">
          <div class="progress-track">
            <div class="progress-bar" style={`width:${Math.min(Math.max(Number(progressPct) || 0, 0), 100)}%`}></div>
          </div>
          <p class="progress-hint">
            {Number(remaining) <= 0
              ? 'Budget ausgeschöpft'
              : `Noch ${(Number(remaining) || 0).toFixed(2)} ${tripCurrency} verfügbar`}
          </p>
        </div>

        <div class="recent-expenses card-surface subtle">
          <div class="recent-head">
            <h3>Letzte Ausgaben</h3>
            {#if hasExpenses}
              <span class="recent-count">{expenseCount} gesamt</span>
            {/if}
          </div>

          {#if hasExpenses}
            <ul class="recent-list">
              {#each recentExpenses as expense (expense.id)}
                <li class="recent-item">
                  <div class="recent-meta">
                    <p class="recent-title">{expense.description}</p>
                    <p class="recent-sub">
                      {formatDate(expense.date) || expense.date}
                      {#if expense.category}
                        • {expense.category}
                      {/if}
                    </p>
                  </div>
                  <span class="recent-amount">{expense.amount.toFixed(2)} {tripCurrency}</span>
                </li>
              {/each}
            </ul>
              <section class="trip-split card-surface">
                <div class="split-head">
                  <h2>Kostenaufteilung</h2>
                  <p class="split-subtitle">Wer hat wie viel bezahlt und welcher Anteil wäre fair?</p>
                </div>

                {#if splitResult.length === 0}
                  <p class="split-empty">Noch keine Ausgaben erfasst.</p>
                {:else}
                  <div class="split-table-wrap">
                    <table class="split-table">
                      <thead>
                        <tr>
                          <th>Person</th>
                          <th>Bezahlt (CHF)</th>
                          <th>Anteil (CHF)</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each splitResult as row (row.participant.id)}
                          <tr>
                            <td>{row.participant.name}</td>
                            <td>{row.paid.toFixed(2)}</td>
                            <td>{row.share.toFixed(2)}</td>
                            <td
                              class="split-balance"
                              class:positive={row.net > 0}
                              class:negative={row.net < 0}
                            >
                              {#if row.net > 0}
                                +{row.net.toFixed(2)} CHF (bekommt Geld)
                              {:else if row.net < 0}
                                {row.net.toFixed(2)} CHF (schuldet)
                              {:else}
                                0.00 CHF (ausgeglichen)
                              {/if}
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {/if}
              </section>
          {:else}
            <p class="recent-empty">Noch keine Ausgaben erfasst.</p>
          {/if}
        </div>
      </section>
    </div>

    <section class="expenses-card card-surface">
      <div class="expenses-head">
        <div>
          <h2>Ausgaben</h2>
          <p class="section-subtitle">
            {hasExpenses
              ? 'Alle erfassten Ausgaben im Überblick.'
              : 'Erfasse deine erste Ausgabe, um dein Budget im Blick zu behalten.'}
          </p>
        </div>
        <div class="expenses-actions">
          <button type="button" class="pill pill-cta" onclick={openAddModal}>
            + Ausgabe erfassen
          </button>
        </div>
      </div>

      {#if !hasExpenses}
        <div class="empty-state">
          <h3>Noch keine Ausgaben</h3>
          <p>Erstelle deine erste Ausgabe, um deinen Reiseverlauf zu starten.</p>
          <button class="pill" type="button" onclick={openAddModal}>+ Ausgabe erfassen</button>
        </div>
      {:else}
        <ul class="expense-list">
          {#each expenses as expense (expense.id)}
            <li class="expense-item">
              <div class="expense-meta">
                <div class="expense-title">{expense.description}</div>
                <div class="expense-sub">
                  {expense.category || 'Ohne Kategorie'} • {formatDate(expense.date) || expense.date}
                </div>
              </div>
              <div class="expense-amount">
                <span>{expense.amount.toFixed(2)} {tripCurrency}</span>
                <button
                  class="expense-delete"
                  type="button"
                  title="Ausgabe löschen"
                  onclick={() => handleDeleteExpense(expense.id)}
                >
                  x
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </section>
{/if}

{#if addOpen}
  <div
    class="modal-backdrop"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) addOpen = false;
    }}
  >
    <div class="modal-card card-surface" role="dialog" aria-modal="true" aria-label="Ausgabe hinzufügen">
      <header class="modal-header">
        <h3>Neue Ausgabe</h3>
        <button class="modal-close" type="button" onclick={() => (addOpen = false)}>x</button>
      </header>

      <div class="modal-body">
        <label class="field-label" for="expense-description">Beschreibung</label>
        <input
          id="expense-description"
          class="input"
          placeholder="z. B. Dinner in Shibuya"
          bind:value={exDesc}
        />

        <label class="field-label" for="expense-amount">Betrag</label>
        <div class="amount-wrap">
          <span class="amount-prefix">{tripCurrency}</span>
          <input
            id="expense-amount"
            class="input amount-input"
            inputmode="decimal"
            placeholder="z. B. 45.50"
            bind:value={exAmountStr}
          />
        </div>

        <div class="modal-grid">
          <div>
            <label class="field-label" for="expense-category">Kategorie</label>
            <select id="expense-category" class="input" bind:value={exCategory}>
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="field-label" for="expense-date">Datum</label>
            <input id="expense-date" class="input" type="date" bind:value={exDate} />
          </div>
          <div>
            <label class="field-label" for="expense-payer">Wer hat bezahlt?</label>
            <select
              id="expense-payer"
              class="input"
              bind:value={payerId}
            >
              {#each participants as participant (participant.id)}
                <option value={participant.id}>{participant.name}</option>
              {/each}
            </select>
          </div>
        </div>

        {#if expenseError}
          <p class="form-error">{expenseError}</p>
        {/if}
      </div>

      <footer class="modal-actions">
        <button class="pill" type="button" onclick={() => (addOpen = false)}>Abbrechen</button>
        <button
          class="pill pill-cta"
          type="button"
          disabled={!canSaveExpense || savingExpense}
          onclick={handleAddExpense}
        >
          {savingExpense ? 'Wird gespeichert ...' : 'Speichern'}
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(92vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem 1.8rem 2.6rem;
    box-sizing: border-box;
  }

  .page-empty {
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .card-surface {
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    box-shadow: var(--shadow-soft);
    padding: 1.9rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.4rem;
    flex-wrap: wrap;
  }

  .page-headings {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .page-headings h1 {
    margin: 0;
    font-size: 2.25rem;
    letter-spacing: 0.16px;
  }

  .page-subtitle,
  .page-meta {
    margin: 0;
    color: var(--text-secondary);
  }

  .page-meta {
    font-size: 0.95rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 1.4rem;
  }

  .trip-summary,
  .budget-card {
    gap: 1.25rem;
  }

  .trip-split {
    gap: 1.1rem;
  }

  .trip-group {
    gap: 1.2rem;
  }

  .summary-head,
  .budget-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .summary-head h2,
  .budget-head h2,
  .expenses-head h2,
  .split-head h2 {
    margin: 0;
    font-size: 1.35rem;
  }

  .split-head {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .split-subtitle,
  .split-empty {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .split-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .split-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 480px;
  }

  .split-table th,
  .split-table td {
    text-align: left;
    padding: 0.85rem 0.65rem;
  }

  .split-table thead th {
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    border-bottom: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  }

  .split-table tbody td {
    border-bottom: 1px solid color-mix(in oklab, var(--border) 55%, transparent);
    font-weight: 600;
  }

  .split-table tbody tr:last-child td {
    border-bottom: none;
  }

  .split-balance {
    font-weight: 700;
  }

  .split-balance.positive {
    color: var(--success, #16a34a);
  }

  .split-balance.negative {
    color: var(--danger, #ef4444);
  }

  .group-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .group-subtitle {
    margin-top: 0.2rem;
    font-size: 0.92rem;
  }

  .participant-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .participant-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.5rem 0.9rem 0.5rem 0.5rem;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--border) 65%, transparent);
    background: color-mix(in oklab, var(--surface) 92%, var(--secondary, #38bdf8) 8%);
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .participant-avatar {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: color-mix(in oklab, var(--secondary, #38bdf8) 75%, #fff 25%);
    color: var(--surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    text-transform: uppercase;
  }

  .group-form {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .group-input {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .summary-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--primary-soft-bg) 65%, var(--surface) 35%);
    border: 1px solid color-mix(in oklab, var(--primary) 26%, transparent);
    font-weight: 600;
    font-size: 0.92rem;
    text-transform: capitalize;
  }

  .badge-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: var(--primary);
    display: inline-block;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: color-mix(in oklab, var(--surface) 92%, var(--primary-soft-bg) 8%);
    border: 1px solid color-mix(in oklab, var(--border) 68%, transparent);
  }

  .summary-label {
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .summary-value {
    font-size: 1.05rem;
    font-weight: 600;
  }

  .budget-percent {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .budget-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.85rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: color-mix(in oklab, var(--surface) 88%, var(--primary-soft-bg) 12%);
    border: 1px solid color-mix(in oklab, var(--border) 62%, transparent);
  }

  .stat-label {
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .stat-value {
    font-size: 1.15rem;
    font-weight: 700;
  }

  .stat-value.ok {
    color: var(--success, #16a34a);
  }

  .stat-value.warn {
    color: var(--warning, #f97316);
  }

  .progress-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .progress-track {
    width: 100%;
    height: 12px;
    border-radius: 999px;
    background: color-mix(in oklab, var(--surface) 78%, var(--primary-soft-bg) 22%);
    border: 1px solid color-mix(in oklab, var(--border) 68%, transparent);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--secondary, #38bdf8), var(--primary));
    transition: width 0.25s ease;
  }

  .progress-hint {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .recent-expenses {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: color-mix(in oklab, var(--surface) 94%, var(--primary-soft-bg) 6%);
    border: 1px solid color-mix(in oklab, var(--border) 68%, transparent);
  }

  .recent-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
  }

  .recent-head h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .recent-count {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .recent-item {
    display: flex;
    justify-content: space-between;
    gap: 0.85rem;
  }

  .recent-meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .recent-title {
    margin: 0;
    font-weight: 600;
  }

  .recent-sub {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .recent-amount {
    font-weight: 700;
    white-space: nowrap;
  }

  .recent-empty {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.92rem;
  }

  .expenses-card {
    gap: 1.4rem;
  }

  .expenses-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .expenses-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .section-subtitle {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
    padding: 2.2rem 1.4rem;
    border-radius: 1.2rem;
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    border: 1px solid color-mix(in oklab, var(--border) 65%, transparent);
  }

  .empty-state h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .empty-state p {
    margin: 0;
    color: var(--text-secondary);
    max-width: 320px;
  }

  .expense-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .expense-item {
    display: flex;
    justify-content: space-between;
    gap: 1.1rem;
    padding: 1rem 1.1rem;
    border-radius: 1.1rem;
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    background: color-mix(in oklab, var(--surface) 94%, var(--primary-soft-bg) 6%);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  }

  .expense-meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .expense-title {
    font-weight: 700;
    font-size: 1.05rem;
  }

  .expense-sub {
    color: var(--text-secondary);
    font-size: 0.92rem;
  }

  .expense-amount {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-weight: 700;
  }

  .expense-delete {
    border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    background: color-mix(in oklab, var(--surface) 85%, var(--primary-soft-bg) 15%);
    border-radius: 999px;
    padding: 0.4rem 0.55rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  .expense-delete:hover {
    transform: translateY(-1px);
    background: color-mix(in oklab, var(--primary-soft-bg) 65%, var(--surface) 35%);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.72rem 1.45rem;
    border-radius: 999px;
    border: 1px solid color-mix(in oklab, var(--primary) 24%, transparent);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    transition: transform 0.15s, background 0.2s, box-shadow 0.2s, border-color 0.2s;
    text-decoration: none;
    white-space: nowrap;
    background: color-mix(in oklab, var(--surface) 94%, var(--primary-soft-bg) 6%);
    color: var(--primary);
  }

  .pill:hover {
    transform: translateY(-1px);
    background: color-mix(in oklab, var(--primary-soft-bg) 70%, var(--surface) 30%);
  }

  .pill-cta {
    background: var(--primary);
    color: var(--primary-contrast, #fff);
    border-color: transparent;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.28);
  }

  .pill-cta:hover {
    background: var(--primary-hover, #2563eb);
  }

  .pill-secondary {
    background: color-mix(in oklab, var(--surface) 90%, var(--secondary, #38bdf8) 10%);
    color: color-mix(in oklab, var(--text) 85%, var(--primary) 15%);
    border-color: color-mix(in oklab, var(--secondary, #38bdf8) 24%, transparent);
  }

  .empty-card {
    gap: 1rem;
    text-align: center;
    align-items: center;
    padding: 2.6rem 1.6rem;
  }

  .empty-card h1 {
    margin: 0;
    font-size: 2rem;
  }

  .empty-card p {
    margin: 0;
    color: var(--text-secondary);
    max-width: 340px;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.6);
    backdrop-filter: blur(4px);
    display: grid;
    place-items: center;
    padding: 1.2rem;
    z-index: 100;
  }

  .modal-card {
    width: min(640px, 100%);
    gap: 1.4rem;
    padding: 1.8rem;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.2rem;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.4rem;
  }

  .modal-close {
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    border-radius: 999px;
    padding: 0.35rem 0.55rem;
    cursor: pointer;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.8rem;
  }

  .field-label {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .input {
    width: 100%;
    padding: 0.75rem 0.9rem;
    border-radius: 0.9rem;
    border: 1.6px solid color-mix(in oklab, var(--border) 72%, transparent);
    background: color-mix(in oklab, var(--surface) 95%, var(--primary-soft-bg) 5%);
    color: var(--text);
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  }

  .input:focus {
    outline: none;
    border-color: color-mix(in oklab, var(--primary) 45%, var(--border));
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 22%, transparent);
    background: color-mix(in oklab, var(--surface) 98%, var(--primary-soft-bg) 2%);
  }

  .amount-wrap {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.6rem;
    align-items: center;
  }

  .amount-prefix {
    padding: 0.65rem 0.95rem;
    border-radius: 0.9rem;
    background: color-mix(in oklab, var(--surface) 92%, var(--primary-soft-bg) 8%);
    border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    font-weight: 600;
    min-width: 3ch;
    text-align: center;
  }

  .form-error {
    margin: 0;
    color: var(--danger, #ef4444);
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  :global([data-theme='dark']) .card-surface {
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
    background: color-mix(in oklab, var(--surface) 90%, var(--surface-soft) 10%);
  }

  :global([data-theme='dark']) .summary-item,
  :global([data-theme='dark']) .stat,
  :global([data-theme='dark']) .expense-item,
  :global([data-theme='dark']) .empty-state,
  :global([data-theme='dark']) .input,
  :global([data-theme='dark']) .amount-prefix,
  :global([data-theme='dark']) .participant-pill {
    background: color-mix(in oklab, var(--surface) 65%, var(--surface-soft) 35%);
    border-color: color-mix(in oklab, var(--border) 65%, transparent);
  }

  :global([data-theme='dark']) .split-table tbody td,
  :global([data-theme='dark']) .split-table thead th {
    border-color: color-mix(in oklab, var(--border) 60%, transparent);
  }

  :global([data-theme='dark']) .participant-avatar {
    color: var(--surface);
    background: color-mix(in oklab, var(--secondary, #38bdf8) 65%, var(--surface) 35%);
  }

  :global([data-theme='dark']) .expense-item {
    box-shadow: var(--shadow-soft);
  }

  :global([data-theme='dark']) .modal-backdrop {
    background: rgba(2, 6, 23, 0.78);
  }

  :global([data-theme='dark']) .pill {
    background: color-mix(in oklab, var(--surface) 70%, var(--primary-soft-bg) 30%);
  }

  @media (max-width: 1080px) {
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.2rem;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.1rem;
    }

    .actions {
      justify-content: flex-start;
    }

    .card-surface {
      padding: 1.4rem;
      border-radius: 1.15rem;
    }

    .expenses-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }

  @media (max-width: 640px) {
    .expense-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .expense-amount {
      width: 100%;
      justify-content: space-between;
    }

    .modal-card {
      padding: 1.5rem;
    }

    .group-input {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
