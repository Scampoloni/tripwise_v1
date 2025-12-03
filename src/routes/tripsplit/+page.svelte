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

<section class="tripsplit">
  <header class="ts-header">
    <h1>TripSplit Gruppen</h1>
    <div class="ts-new-group">
      <input
        placeholder="Neue Gruppe, z B WG Spanien"
        bind:value={newGroupName}
      />
      <button on:click={handleCreateGroup}>Gruppe erstellen</button>
    </div>
  </header>

  <main class="ts-main">
    <aside class="ts-sidebar">
      <h2>Gruppen</h2>
      {#if groups.length === 0}
        <p>Noch keine Gruppen, lege die erste an.</p>
      {:else}
        <ul>
          {#each groups as group}
            <li
              class:selected={selectedGroupId === group.id}
              on:click={() => handleSelectGroup(group.id)}
            >
              <span>{group.name}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </aside>

    <section class="ts-content">
      {#if selectedGroup}
        <h2>{selectedGroup.name}</h2>

        <!-- Teilnehmer Bereich -->
        <h3>Teilnehmer</h3>

        {#if selectedGroup.participants.length === 0}
          <p>Noch keine Teilnehmer.</p>
        {:else}
          <ul>
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

        <div class="ts-add-participant">
          <input
            placeholder="Name"
            bind:value={newParticipantName}
          />
          <input
            placeholder="E Mail optional"
            bind:value={newParticipantEmail}
          />
          <button on:click={handleAddParticipant}>
            Teilnehmer hinzufuegen
          </button>
        </div>

        <!-- Ausgaben Bereich -->
        <h3 style="margin-top: 1.5rem;">Ausgaben</h3>

        {#if selectedGroup.expenses.length === 0}
          <p>Noch keine Ausgaben.</p>
        {:else}
          <table class="ts-expenses">
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
        {/if}

        <div class="ts-add-expense">
          <input
            placeholder="Beschreibung, z B Abendessen"
            bind:value={newExpenseDescription}
          />
          <input
            type="number"
            min="0"
            step="0.05"
            placeholder="Betrag"
            bind:value={newExpenseAmount}
          />

          <select bind:value={newExpenseCurrency}>
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          <select bind:value={newExpensePaidBy}>
            <option value={null} disabled selected={newExpensePaidBy === null}>
              Bezahlt von ...
            </option>
            {#each selectedGroup.participants as p}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>

          <button on:click={handleAddExpense}>
            Ausgabe hinzufuegen
          </button>
        </div>

        <!-- Balances -->
        <h3 style="margin-top: 1.5rem;">Saldo pro Person</h3>
        {#if selectedGroup.expenses.length === 0}
          <p>Noch keine Salden, da es noch keine Ausgaben gibt.</p>
        {:else}
          <table class="ts-balances">
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
        {/if}

        <!-- Settlements -->
        <h3 style="margin-top: 1rem;">Ausgleichszahlungen</h3>
        {#if !selectedGroup.expenses.length}
          <p>Keine Vorschlaege, da noch keine Ausgaben erfasst sind.</p>
        {:else if settlements.length === 0}
          <p>Alles ist bereits ausgeglichen.</p>
        {:else}
          <ul class="ts-settlements">
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
        <p>Waehle eine Gruppe aus der Liste, oder erstelle eine neue.</p>
      {/if}
    </section>
  </main>
</section>

<style>
  .tripsplit {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .ts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ts-new-group {
    display: flex;
    gap: 0.5rem;
  }

  .ts-main {
    display: grid;
    grid-template-columns: minmax(220px, 260px) 1fr;
    gap: 1rem;
    min-height: 400px;
  }

  .ts-sidebar {
    border-radius: 12px;
    padding: 1rem;
  }

  .ts-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .ts-sidebar li {
    padding: 0.5rem 0.7rem;
    border-radius: 8px;
    cursor: pointer;
  }

  .ts-sidebar li.selected {
    font-weight: 600;
    text-decoration: underline;
  }

  .ts-content {
    border-radius: 12px;
    padding: 1.5rem;
  }

  .ts-add-participant {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ts-expenses {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .ts-expenses th,
  .ts-expenses td {
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    text-align: left;
  }

  .ts-add-expense {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ts-balances {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .ts-balances th,
  .ts-balances td {
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    text-align: left;
  }

  .ts-settlements {
    margin: 0.5rem 0 0.75rem;
    padding-left: 1.2rem;
  }

  .ts-settlements li {
    margin-bottom: 0.2rem;
  }
</style>
