<script lang="ts">
  import {
    tripSplitGroups,
    createGroup,
    addParticipant,
    addExpense,
    computeBalances,
    computeSettlements
  } from '$lib/stores/tripSplit';
  import type {
    TripSplitGroup,
    TripSplitCurrencyCode,
    TripSplitBalance,
    TripSplitSettlement
  } from '$lib/types/tripSplit';

  // Runes: $tripSplitGroups wird automatisch aus dem Store erzeugt
  const groups = $derived<TripSplitGroup[]>($tripSplitGroups ?? []);

  // Phase 4, Gruppen State
  let newGroupName = $state('');
  let selectedGroupId = $state<string | null>(null);

  const selectedGroup = $derived<TripSplitGroup | null>(
    groups.find((g) => g.id === selectedGroupId) ?? null
  );

  // Phase 5, Teilnehmer State
  let newParticipantName = $state('');
  let newParticipantEmail = $state('');

  // Phase 6, Ausgaben State
  let newExpenseDescription = $state('');
  let newExpenseAmount = $state(''); // als String aus dem Input
  let newExpenseCurrency = $state<TripSplitCurrencyCode>('CHF');
  let newExpensePaidBy = $state<string | null>(null);

  // Phase 7, Balances + Settlements
  const balances = $derived<TripSplitBalance[]>(
    selectedGroup ? computeBalances(selectedGroup) : []
  );

  const settlements = $derived<TripSplitSettlement[]>(
    balances.length > 0 ? computeSettlements(balances) : []
  );

  function handleCreateGroup() {
    const name = newGroupName.trim();
    if (!name) return;

    const group = createGroup({ name });
    newGroupName = '';
    selectedGroupId = group.id;
  }

  function handleSelectGroup(id: string) {
    selectedGroupId = id;
  }

  function handleAddParticipant() {
    if (!selectedGroup) return;

    const name = newParticipantName.trim();
    const email = newParticipantEmail.trim();

    if (!name) return;

    addParticipant(selectedGroup.id, {
      name,
      email: email || undefined
    });

    newParticipantName = '';
    newParticipantEmail = '';
  }

  function handleAddExpense() {
    if (!selectedGroup) return;
    if (selectedGroup.participants.length === 0) return;

    const description = newExpenseDescription.trim();
    const amountNum = parseFloat(newExpenseAmount);

    if (!description) return;
    if (!Number.isFinite(amountNum) || amountNum <= 0) return;

    // Falls kein Zahler gewaehlt wurde, nimm den ersten Teilnehmer
    const paidBy =
      newExpensePaidBy ??
      (selectedGroup.participants.length > 0 ? selectedGroup.participants[0].id : null);

    if (!paidBy) return;

    // Gleichmaessiger Split auf alle Teilnehmer
    const count = selectedGroup.participants.length;
    const rawShare = amountNum / count;

    const splits = selectedGroup.participants.map((p) => ({
      participantId: p.id,
      share: rawShare
    }));

    addExpense(selectedGroup.id, {
      description,
      amount: amountNum,
      currency: newExpenseCurrency,
      paidBy,
      splits,
      splitMode: 'equal'
    });

    newExpenseDescription = '';
    newExpenseAmount = '';
    newExpensePaidBy = null;
  }

  // Helper fuer Anzeige des Namens
  function getParticipantName(group: TripSplitGroup, participantId: string) {
    const p = group.participants.find((x) => x.id === participantId);
    return p ? p.name : 'Unbekannt';
  }
</script>

<section class="page-shell" data-animate="fadeUp">
  <header class="page-header card-surface header-centered">
    <div class="page-headings">
      <h1>TripSplit</h1>
      <p class="page-subtitle">Gruppenausgaben planen, Splits berechnen</p>
    </div>
  </header>

  <section class="page-body">
    <div class="split-grid">
      <aside class="card-surface split-sidebar">
      <div class="split-sidebar-head">
        <h2>Gruppen</h2>
        <p class="muted">Lege eine neue Gruppe an oder wähle eine bestehende.</p>
      </div>
      <div class="split-new">
        <input
          class="input"
          placeholder="Neue Gruppe, z. B. WG Spanien"
          bind:value={newGroupName}
        />
        <button class="pill pill-cta" type="button" onclick={handleCreateGroup}>Gruppe erstellen</button>
      </div>
      {#if groups.length === 0}
        <p class="muted">Noch keine Gruppen vorhanden.</p>
      {:else}
        <ul class="split-group-list">
          {#each groups as group}
            <li>
              <button
                type="button"
                class={`pill pill-ghost split-group-item ${selectedGroupId === group.id ? 'is-active' : ''}`}
                onclick={() => handleSelectGroup(group.id)}
              >
                {group.name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </aside>

      <section class="card-surface split-content">
      {#if selectedGroup}
        <div class="split-content-head">
          <div>
            <h2>{selectedGroup.name}</h2>
            <p class="muted">{selectedGroup.participants.length} {selectedGroup.participants.length === 1 ? 'Teilnehmer' : 'Teilnehmer:innen'}</p>
          </div>
        </div>

        <!-- Teilnehmer Bereich -->
        <h3>Teilnehmer</h3>

        {#if selectedGroup.participants.length === 0}
          <p class="muted">Noch keine Teilnehmer hinzugefügt.</p>
        {:else}
          <ul class="split-list">
            {#each selectedGroup.participants as p}
              <li>
                {p.name}
                {#if p.email}
                  {' '}({p.email})
                {/if}
              </li>
            {/each}
          </ul>
        {/if}

        <div class="split-form-grid">
          <input
            class="input"
            placeholder="Name"
            bind:value={newParticipantName}
          />
          <input
            class="input"
            placeholder="E-Mail optional"
            bind:value={newParticipantEmail}
          />
          <button class="pill pill-secondary" type="button" onclick={handleAddParticipant}>
            Teilnehmer hinzufügen
          </button>
        </div>

        <!-- Ausgaben Bereich -->
        <h3>Ausgaben</h3>

        {#if selectedGroup.expenses.length === 0}
          <p class="muted">Noch keine Ausgaben erfasst.</p>
        {:else}
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Beschreibung</th>
                  <th>Betrag</th>
                  <th>Bezahlt von</th>
                </tr>
              </thead>
              <tbody>
                {#each selectedGroup.expenses as e}
                  <tr>
                    <td>{e.description}</td>
                    <td>{e.amount.toFixed(2)} {e.currency}</td>
                    <td>{getParticipantName(selectedGroup, e.paidBy)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        <div class="split-form-grid">
          <input
            class="input"
            placeholder="Beschreibung, z. B. Abendessen"
            bind:value={newExpenseDescription}
          />
          <input
            class="input"
            type="number"
            min="0"
            step="0.05"
            placeholder="Betrag"
            bind:value={newExpenseAmount}
          />

          <select class="input" bind:value={newExpenseCurrency}>
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          <select class="input" bind:value={newExpensePaidBy}>
            <option value={null} disabled selected={newExpensePaidBy === null}>
              Bezahlt von ...
            </option>
            {#each selectedGroup.participants as p}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>

          <button class="pill pill-cta" type="button" onclick={handleAddExpense}>
            Ausgabe hinzufügen
          </button>
        </div>

        <!-- Balances -->
        <h3>Saldo pro Person</h3>
        {#if selectedGroup.expenses.length === 0}
          <p class="muted">Noch keine Salden, da bisher keine Ausgaben existieren.</p>
        {:else}
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Saldo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {#each balances as b}
                  <tr>
                    <td>{getParticipantName(selectedGroup, b.participantId)}</td>
                    <td>{b.net.toFixed(2)} {newExpenseCurrency}</td>
                    <td>
                      {#if b.net > 0.01}
                        bekommt Geld
                      {:else if b.net < -0.01}
                        schuldet Geld
                      {:else}
                        ausgeglichen
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        <!-- Settlements -->
        <h3>Ausgleichszahlungen</h3>
        {#if !selectedGroup.expenses.length}
          <p class="muted">Keine Vorschläge, da noch keine Ausgaben erfasst sind.</p>
        {:else if settlements.length === 0}
          <p class="muted">Alles ist bereits ausgeglichen.</p>
        {:else}
          <ul class="split-settlements">
            {#each settlements as s}
              <li>
                {getParticipantName(selectedGroup, s.fromParticipantId)}
                zahlt
                {s.amount.toFixed(2)} {newExpenseCurrency}
                an
                {getParticipantName(selectedGroup, s.toParticipantId)}
              </li>
            {/each}
          </ul>
        {/if}
      {:else}
        <div class="empty-state">
          <h3>Keine Gruppe ausgewählt</h3>
          <p>Erstelle links eine neue Gruppe oder wähle eine bestehende aus der Liste.</p>
        </div>
      {/if}
      </section>
    </div>
  </section>
</section>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(85vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem 1.8rem 2.6rem;
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
    gap: 0.35rem;
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

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.72rem 1.45rem;
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    transition:
      background 0.2s,
      color 0.2s,
      transform 0.15s,
      box-shadow 0.2s,
      border-color 0.2s;
    text-decoration: none;
    white-space: nowrap;
  }

  .pill-cta {
    background: var(--primary);
    color: var(--primary-contrast);
    border: 1px solid color-mix(in oklab, var(--primary) 45%, transparent);
    box-shadow: 0 20px 38px color-mix(in oklab, var(--primary) 24%, transparent);
  }

  .pill-cta:hover {
    transform: translateY(-1px);
    background: var(--primary-hover);
  }

  .pill-secondary {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    color: var(--text);
    border-color: color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: 0 14px 30px color-mix(in oklab, #0f172a 14%, transparent);
  }

  .pill-secondary:hover {
    transform: translateY(-1px);
  }

  .pill-ghost {
    background: transparent;
    border-color: color-mix(in oklab, var(--primary) 45%, transparent);
    color: var(--primary);
    box-shadow: none;
  }

  .pill-ghost:hover {
    background: color-mix(in oklab, var(--primary-soft-bg) 55%, transparent);
  }

  :global([data-theme='dark']) .pill-secondary {
    background: color-mix(in oklab, var(--surface) 70%, var(--primary-soft-bg) 30%);
    border-color: color-mix(in oklab, var(--text) 18%, transparent);
    color: var(--text);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
  }

  :global([data-theme='dark']) .pill-ghost {
    border-color: color-mix(in oklab, var(--primary) 55%, transparent);
    color: color-mix(in oklab, var(--primary) 70%, var(--text));
  }

  :global([data-theme='dark']) .pill-ghost:hover {
    background: color-mix(in oklab, var(--primary-soft-bg) 70%, transparent);
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

  .muted {
    color: var(--text-secondary);
    font-size: 0.92rem;
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

  select.input {
    appearance: none;
    cursor: pointer;
  }

  .page-body .card-surface {
    padding: 1.6rem 1.8rem;
  }

  .split-grid {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: 1.5rem;
    width: 100%;
  }

  .split-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .split-sidebar-head h2 {
    margin: 0;
  }

  .split-new {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: center;
  }

  .split-group-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .split-group-item {
    width: 100%;
    justify-content: flex-start;
    padding: 0.65rem 1rem;
  }

  .split-group-item.is-active {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--primary-contrast);
    box-shadow: 0 8px 18px color-mix(in oklab, var(--primary) 22%, transparent);
  }

  .split-content {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .split-content-head h2 {
    margin: 0;
  }

  .split-list {
    list-style: none;
    padding-left: 0;
    margin: 0.4rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .split-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    align-items: center;
  }

  .table-scroll {
    width: 100%;
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.8rem;
    text-align: left;
    border-bottom: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
    font-size: 0.95rem;
  }

  .split-settlements {
    margin: 0.5rem 0 0;
    padding-left: 1.1rem;
  }

  .split-settlements li {
    margin-bottom: 0.25rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
  }

  @media (max-width: 900px) {
    .split-grid {
      grid-template-columns: 1fr;
    }

    .page-body .card-surface {
      padding: 1.4rem;
    }

    .split-new {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.4rem;
    }
  }
</style>
