<script lang="ts">
  import {
    tripSplitGroups,
    createGroup,
    addParticipant,
    addExpense,
    updateGroupName,
    deleteGroup,
    updateParticipant,
    deleteParticipant,
    updateExpense,
    deleteExpense,
    computeBalances,
    computeSettlements
  } from '$lib/stores/tripSplit';
  import type {
    TripSplitGroup,
    TripSplitCurrencyCode,
    TripSplitBalance,
    TripSplitSettlement
  } from '$lib/types/tripSplit';
  import Button from '$lib/ui/Button.svelte';
  import Input from '$lib/ui/Input.svelte';
  import ListRow from '$lib/ui/ListRow.svelte';

  // Runes: $tripSplitGroups wird automatisch aus dem Store erzeugt
  const groups = $derived<TripSplitGroup[]>($tripSplitGroups ?? []);

  // Phase 4, Gruppen State
  let newGroupName = $state('');
  let selectedGroupId = $state<string | null>(null);

  const selectedGroup = $derived<TripSplitGroup | null>(
    groups.find((g) => g.id === selectedGroupId) ?? null
  );

  const activeParticipants = $derived(selectedGroup?.participants ?? []);

  // Phase 5, Teilnehmer State
  let newParticipantName = $state('');
  let newParticipantEmail = $state('');

  // Phase 6, Ausgaben State
  let newExpenseDescription = $state('');
  let newExpenseAmount = $state(''); // als String aus dem Input
  let newExpenseCurrency = $state<TripSplitCurrencyCode>('CHF');
  let newExpensePaidBy = $state<string>('');

  // Edit State
  let editingGroupId = $state<string | null>(null);
  let editingGroupName = $state('');
  let confirmingDeleteGroupId = $state<string | null>(null);

  let editingParticipantId = $state<string | null>(null);
  let editingParticipantName = $state('');
  let editingParticipantEmail = $state('');

  let editingExpenseId = $state<string | null>(null);
  let editingExpenseDescription = $state('');
  let editingExpenseAmount = $state('');

  // Phase 7, Balances + Settlements
  const balances = $derived<TripSplitBalance[]>(
    selectedGroup ? computeBalances(selectedGroup) : []
  );

  const settlements = $derived<TripSplitSettlement[]>(
    balances.length > 0 ? computeSettlements(balances) : []
  );

  $effect(() => {
    const participants = activeParticipants;

    if (participants.length === 0) {
      newExpensePaidBy = '';
      return;
    }

    const currentParticipantExists = participants.some((p) => p.id === newExpensePaidBy);

    if (!currentParticipantExists) {
      newExpensePaidBy = participants[0].id;
    }
  });

  const canCreateGroup = $derived(newGroupName.trim().length > 0);

  const canAddParticipant = $derived(newParticipantName.trim().length > 0);

  const expenseAmountValue = $derived((() => {
    const parsed = Number.parseFloat(newExpenseAmount);
    return Number.isFinite(parsed) ? parsed : 0;
  })());

  const canAddExpense = $derived(
    newExpenseDescription.trim().length > 0 && expenseAmountValue > 0 && Boolean(newExpensePaidBy)
  );

  $effect(() => {
    selectedGroup;
    editingParticipantId = null;
    editingParticipantName = '';
    editingParticipantEmail = '';
    editingExpenseId = null;
    editingExpenseDescription = '';
    editingExpenseAmount = '';
  });

  function handleCreateGroup() {
    const name = newGroupName.trim();
    if (!name) return;

    const group = createGroup({ name });
    newGroupName = '';
    selectedGroupId = group.id;
  }

  function handleSelectGroup(id: string) {
    selectedGroupId = id;
    cancelDeleteGroup();
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

    if (!newExpensePaidBy) return;
    const paidBy = newExpensePaidBy;

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
    newExpensePaidBy = '';
  }

  // Helper fuer Anzeige des Namens
  function getParticipantName(group: TripSplitGroup, participantId: string) {
    const p = group.participants.find((x) => x.id === participantId);
    return p ? p.name : 'Unbekannt';
  }

  function startGroupRename(group: TripSplitGroup) {
    editingGroupId = group.id;
    editingGroupName = group.name;
  }

  function cancelGroupRename() {
    editingGroupId = null;
    editingGroupName = '';
  }

  function handleSaveGroupName(groupId: string) {
    const name = editingGroupName.trim();
    if (!name) return;
    updateGroupName(groupId, name);
    cancelGroupRename();
  }

  function requestDeleteGroup(groupId: string) {
    confirmingDeleteGroupId = groupId;
  }

  function cancelDeleteGroup() {
    confirmingDeleteGroupId = null;
  }

  function handleDeleteGroup(groupId: string) {
    deleteGroup(groupId);
    if (selectedGroupId === groupId) {
      selectedGroupId = null;
    }
    if (editingGroupId === groupId) {
      cancelGroupRename();
    }
    if (confirmingDeleteGroupId === groupId) {
      cancelDeleteGroup();
    }
  }

  function startParticipantEdit(participant: { id: string; name: string; email?: string }) {
    editingParticipantId = participant.id;
    editingParticipantName = participant.name;
    editingParticipantEmail = participant.email ?? '';
  }

  function cancelParticipantEdit() {
    editingParticipantId = null;
    editingParticipantName = '';
    editingParticipantEmail = '';
  }

  function handleSaveParticipant(participantId: string) {
    if (!selectedGroup) return;
    const name = editingParticipantName.trim();
    const email = editingParticipantEmail.trim();
    if (!name) return;
    updateParticipant(selectedGroup.id, participantId, {
      name,
      email: email || undefined
    });
    cancelParticipantEdit();
  }

  function handleDeleteParticipant(participantId: string) {
    if (!selectedGroup) return;
    if (!confirm('Teilnehmer wirklich löschen?')) return;
    deleteParticipant(selectedGroup.id, participantId);
    if (editingParticipantId === participantId) {
      cancelParticipantEdit();
    }
  }

  function startExpenseEdit(expense: { id: string; description: string; amount: number }) {
    editingExpenseId = expense.id;
    editingExpenseDescription = expense.description;
    editingExpenseAmount = expense.amount.toString();
  }

  function cancelExpenseEdit() {
    editingExpenseId = null;
    editingExpenseDescription = '';
    editingExpenseAmount = '';
  }

  function handleSaveExpense(expenseId: string) {
    if (!selectedGroup) return;
    const description = editingExpenseDescription.trim();
    const amount = Number.parseFloat(editingExpenseAmount);
    if (!description) return;
    if (!Number.isFinite(amount) || amount <= 0) return;
    updateExpense(selectedGroup.id, expenseId, {
      description,
      amount
    });
    cancelExpenseEdit();
  }

  function handleDeleteExpense(expenseId: string) {
    if (!selectedGroup) return;
    if (!confirm('Ausgabe wirklich löschen?')) return;
    deleteExpense(selectedGroup.id, expenseId);
    if (editingExpenseId === expenseId) {
      cancelExpenseEdit();
    }
  }

  $effect(() => {
    const ids = groups.map((g) => g.id);
    if (editingGroupId && !ids.includes(editingGroupId)) {
      cancelGroupRename();
    }
    if (confirmingDeleteGroupId && !ids.includes(confirmingDeleteGroupId)) {
      cancelDeleteGroup();
    }
  });
</script>

<section class="page-shell" data-animate="fadeUp">
  <!-- Header Card -->
  <header class="page-header card-surface header-centered">
    <div class="page-headings">
      <h1>TripSplit</h1>
      <p class="page-subtitle">Gruppenausgaben planen, Splits berechnen</p>
    </div>
  </header>

  <div class="page-body">
    <!-- Gruppen-Navigation Card -->
    <section class="card-surface">
      <span class="card-label">Gruppen</span>
      
      {#if groups.length === 0}
        <p class="empty-hint">Noch keine Gruppen vorhanden.</p>
      {:else}
        <div class="nav-list">
          {#each groups as group}
            <ListRow 
              divider={true} 
              clickable={true} 
              active={selectedGroupId === group.id}
            >
              <button
                slot="content"
                type="button"
                class="nav-item-btn"
                onclick={() => handleSelectGroup(group.id)}
              >
                {group.name}
              </button>
              <span slot="actions">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onclick={(event: MouseEvent) => {
                    event.stopPropagation();
                    if (editingGroupId === group.id) {
                      cancelGroupRename();
                    } else if (confirmingDeleteGroupId === group.id) {
                      cancelDeleteGroup();
                    } else {
                      startGroupRename(group);
                    }
                  }}
                >
                  ⋯
                </Button>
              </span>
            </ListRow>
          {/each}
        </div>
      {/if}

      <!-- Inline Edit/Delete Form -->
      {#if editingGroupId}
        {@const editingGroup = groups.find(g => g.id === editingGroupId)}
        {#if editingGroup}
          <div class="action-form">
            <p class="form-label">Gruppe umbenennen: <strong>{editingGroup.name}</strong></p>
            <Input
              placeholder="Neuer Name"
              bind:value={editingGroupName}
            />
            <div class="form-actions">
              <button class="pill pill-cta" type="button" onclick={() => editingGroupId && handleSaveGroupName(editingGroupId)}>
                Speichern
              </button>
              <button class="pill pill-ghost" type="button" onclick={() => editingGroupId && requestDeleteGroup(editingGroupId)}>
                Löschen
              </button>
              <button class="pill pill-secondary" type="button" onclick={cancelGroupRename}>
                Abbrechen
              </button>
            </div>
          </div>
        {/if}
      {/if}

      {#if confirmingDeleteGroupId}
        {@const deletingGroup = groups.find(g => g.id === confirmingDeleteGroupId)}
        {#if deletingGroup}
          <div class="confirm-card">
            <p class="confirm-title">„{deletingGroup.name}" wirklich löschen?</p>
            <p class="confirm-desc">Alle Teilnehmer:innen und Ausgaben dieser Gruppe werden unwiderruflich entfernt.</p>
            <div class="form-actions">
              <button class="pill pill-danger" type="button" onclick={() => confirmingDeleteGroupId && handleDeleteGroup(confirmingDeleteGroupId)}>
                Ja, löschen
              </button>
              <button class="pill pill-secondary" type="button" onclick={cancelDeleteGroup}>
                Abbrechen
              </button>
            </div>
          </div>
        {/if}
      {/if}

      <!-- New Group Form -->
      <div class="new-group-form">
        <Input
          placeholder="Neue Gruppe, z. B. WG Spanien"
          bind:value={newGroupName}
        />
        <button class="pill pill-cta" type="button" onclick={handleCreateGroup} disabled={!canCreateGroup}>
          Neue Gruppe
        </button>
      </div>
    </section>

    <!-- Main Content Area -->
    {#if selectedGroup}
      <!-- Group Header Card -->
      <section class="card-surface">
        <div class="content-header">
          <h2 class="content-title">{selectedGroup.name}</h2>
          <p class="content-meta">{selectedGroup.participants.length} {selectedGroup.participants.length === 1 ? 'Teilnehmer' : 'Teilnehmer:innen'}</p>
        </div>
      </section>

      <!-- Teilnehmer Card -->
      <section class="card-surface">
        <span class="card-label">Teilnehmer</span>

        {#if selectedGroup.participants.length === 0}
          <p class="empty-hint">Noch keine Teilnehmer hinzugefügt.</p>
        {:else}
          <div class="list-container">
            {#each selectedGroup.participants as p}
              {#if editingParticipantId === p.id}
                <div class="inline-form">
                  <Input
                    placeholder="Name"
                    bind:value={editingParticipantName}
                  />
                  <Input
                    placeholder="E-Mail (optional)"
                    bind:value={editingParticipantEmail}
                  />
                  <div class="inline-actions">
                    <button class="pill pill-cta" type="button" onclick={() => handleSaveParticipant(p.id)}>
                      Speichern
                    </button>
                    <button class="pill pill-ghost" type="button" onclick={() => handleDeleteParticipant(p.id)}>
                      Löschen
                    </button>
                    <button class="pill pill-secondary" type="button" onclick={cancelParticipantEdit}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              {:else}
                <ListRow>
                  <div slot="content" class="participant-info">
                    <span class="participant-name">{p.name}</span>
                    {#if p.email}
                      <span class="participant-email">{p.email}</span>
                    {/if}
                  </div>
                  <span slot="actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onclick={() => {
                        if (editingParticipantId === p.id) {
                          cancelParticipantEdit();
                        } else {
                          startParticipantEdit(p);
                        }
                      }}
                    >
                      ⋯
                    </Button>
                  </span>
                </ListRow>
              {/if}
            {/each}
          </div>
        {/if}

        <div class="form-row">
          <Input
            placeholder="Name"
            bind:value={newParticipantName}
          />
          <Input
            placeholder="E-Mail (optional)"
            bind:value={newParticipantEmail}
          />
          <button class="pill pill-cta" type="button" onclick={handleAddParticipant} disabled={!canAddParticipant}>
            Hinzufügen
          </button>
        </div>
      </section>

      <!-- Ausgaben Card -->
      <section class="card-surface">
        <span class="card-label">Ausgaben</span>

        {#if selectedGroup.expenses.length === 0}
          <p class="empty-hint">Noch keine Ausgaben erfasst.</p>
        {:else}
          <div class="list-container">
            {#each selectedGroup.expenses as e}
              {#if editingExpenseId === e.id}
                <div class="inline-form">
                  <Input
                    placeholder="Beschreibung"
                    bind:value={editingExpenseDescription}
                  />
                  <div class="amount-edit">
                    <Input
                      type="number"
                      bind:value={editingExpenseAmount}
                    />
                    <span class="currency-tag">{e.currency}</span>
                  </div>
                  <div class="inline-actions">
                    <button class="pill pill-cta" type="button" onclick={() => handleSaveExpense(e.id)}>
                      Speichern
                    </button>
                    <button class="pill pill-ghost" type="button" onclick={() => handleDeleteExpense(e.id)}>
                      Löschen
                    </button>
                    <button class="pill pill-secondary" type="button" onclick={cancelExpenseEdit}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              {:else}
                <ListRow>
                  <div slot="content" class="expense-info">
                    <span class="expense-desc">{e.description}</span>
                    <span class="expense-meta">{e.amount.toFixed(2)} {e.currency} • {getParticipantName(selectedGroup, e.paidBy)}</span>
                  </div>
                  <span slot="actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onclick={() => {
                        if (editingExpenseId === e.id) {
                          cancelExpenseEdit();
                        } else {
                          startExpenseEdit(e);
                        }
                      }}
                    >
                      ⋯
                    </Button>
                  </span>
                </ListRow>
              {/if}
            {/each}
          </div>
        {/if}

        <div class="form-row">
          <Input
            placeholder="Beschreibung, z. B. Abendessen"
            bind:value={newExpenseDescription}
          />
          <Input
            type="number"
            placeholder="Betrag"
            bind:value={newExpenseAmount}
          />
          <select class="select-input" bind:value={newExpenseCurrency}>
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <select class="select-input" bind:value={newExpensePaidBy}>
            <option value="" disabled>Bezahlt von ...</option>
            {#each selectedGroup.participants as p}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
          <button class="pill pill-cta" type="button" onclick={handleAddExpense} disabled={!canAddExpense}>
            Hinzufügen
          </button>
        </div>
      </section>

      <!-- Balance Layout: Saldo + Ausgleichszahlungen -->
      <div class="balance-layout">
        <!-- Saldo Card -->
        <section class="card-surface">
          <span class="card-label">Saldo pro Person</span>
          {#if selectedGroup.expenses.length === 0}
            <p class="empty-hint">Noch keine Salden, da bisher keine Ausgaben existieren.</p>
          {:else}
            <div class="list-container">
              {#each balances as b}
                <ListRow>
                  <div slot="content" class="balance-info">
                    <span class="balance-name">{getParticipantName(selectedGroup, b.participantId)}</span>
                  </div>
                  <div slot="actions" class="balance-status">
                    <span class="balance-amount" class:positive={b.net > 0.01} class:negative={b.net < -0.01}>
                      {b.net.toFixed(2)} {newExpenseCurrency}
                    </span>
                    {#if b.net > 0.01}
                      <span class="status-badge status-positive">bekommt</span>
                    {:else if b.net < -0.01}
                      <span class="status-badge status-negative">schuldet</span>
                    {:else}
                      <span class="status-badge status-neutral">ausgeglichen</span>
                    {/if}
                  </div>
                </ListRow>
              {/each}
            </div>
          {/if}
        </section>

        <!-- Ausgleichszahlungen Card -->
        <section class="card-surface">
          <span class="card-label">Ausgleichszahlungen</span>
          {#if !selectedGroup.expenses.length}
            <p class="empty-hint">Keine Vorschläge, da noch keine Ausgaben erfasst sind.</p>
          {:else if settlements.length === 0}
            <p class="empty-hint">Alles ist bereits ausgeglichen.</p>
          {:else}
            <div class="list-container">
              {#each settlements as s}
                <ListRow divider={true}>
                  <div slot="content" class="settlement-info">
                    <span class="settlement-text">
                      <strong>{getParticipantName(selectedGroup, s.fromParticipantId)}</strong>
                      <span class="settlement-arrow">→</span>
                      <strong>{getParticipantName(selectedGroup, s.toParticipantId)}</strong>
                    </span>
                  </div>
                  <span slot="actions" class="settlement-amount">
                    {s.amount.toFixed(2)} {newExpenseCurrency}
                  </span>
                </ListRow>
              {/each}
            </div>
          {/if}
        </section>
      </div>
    {:else}
      <section class="card-surface">
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3 class="empty-title">Keine Gruppe ausgewählt</h3>
          <p class="empty-desc">Wähle oben eine bestehende Gruppe aus oder erstelle eine neue.</p>
        </div>
      </section>
    {/if}
  </div>
</section>

<style>
  /* ===== PAGE LAYOUT (matches Dashboard/Converter) ===== */
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
    width: min(85vw, 1240px);
    margin: 0 auto 2.8rem;
    padding: 1.8rem 1.8rem 2.8rem;
    box-sizing: border-box;
  }

  .page-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ===== CARD SURFACE (matches Dashboard/Converter) ===== */
  .card-surface {
    position: relative;
    background: var(--surface);
    border-radius: var(--radius-card);
    border: 1px solid color-mix(in oklab, var(--border) 85%, transparent);
    box-shadow: var(--shadow-soft);
    padding: 1.9rem;
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
    box-sizing: border-box;
  }

  :global([data-theme='dark']) .card-surface {
    border-color: color-mix(in oklab, var(--border) 70%, transparent);
    box-shadow: var(--shadow-elevated);
    background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
  }

  /* ===== HEADER (matches Dashboard/Converter) ===== */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    flex-wrap: wrap;
    padding: 1.6rem 2rem;
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

  /* ===== CARD LABEL (matches Dashboard) ===== */
  .card-label {
    display: inline-block;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in oklab, var(--text) 62%, var(--text-secondary) 38%);
    margin-bottom: 0.5rem;
  }

  /* ===== NAVIGATION LIST ===== */
  .nav-list {
    display: flex;
    flex-direction: column;
  }

  .nav-item-btn {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 1.0625rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    letter-spacing: -0.01em;
  }

  :global(.list-row--active) .nav-item-btn {
    color: var(--primary);
    font-weight: 600;
  }

  /* ===== PILL BUTTONS (matches Dashboard) ===== */
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

  .pill:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .pill-cta {
    background: var(--primary);
    color: var(--primary-contrast);
    border: 1px solid color-mix(in oklab, var(--primary) 45%, transparent);
    box-shadow: 0 20px 38px color-mix(in oklab, var(--primary) 24%, transparent);
  }
  .pill-cta:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--primary-hover);
  }

  .pill-secondary {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    color: var(--text);
    border-color: color-mix(in oklab, var(--border) 80%, transparent);
    box-shadow: 0 14px 30px color-mix(in oklab, #0f172a 14%, transparent);
  }
  .pill-secondary:hover:not(:disabled) {
    background: color-mix(in oklab, var(--surface) 90%, var(--primary-soft-bg) 10%);
    transform: translateY(-1px);
  }

  .pill-ghost {
    background: transparent;
    border-color: color-mix(in oklab, var(--primary) 45%, transparent);
    color: var(--primary);
    box-shadow: none;
  }
  .pill-ghost:hover:not(:disabled) {
    background: color-mix(in oklab, var(--primary-soft-bg) 55%, transparent);
  }

  .pill-danger {
    background: var(--danger);
    color: #fff;
    border-color: color-mix(in oklab, var(--danger) 45%, transparent);
    box-shadow: 0 20px 38px color-mix(in oklab, var(--danger) 24%, transparent);
  }
  .pill-danger:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  :global([data-theme='dark']) .pill-secondary {
    background: color-mix(in oklab, var(--surface) 70%, var(--primary-soft-bg) 30%);
    border-color: color-mix(in oklab, var(--text) 18%, transparent);
    color: var(--text);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
  }

  :global([data-theme='dark']) .pill-secondary:hover:not(:disabled) {
    background: color-mix(in oklab, var(--surface) 78%, var(--primary-soft-bg) 22%);
  }

  :global([data-theme='dark']) .pill-ghost {
    border-color: color-mix(in oklab, var(--primary) 55%, transparent);
    color: color-mix(in oklab, var(--primary) 70%, var(--text));
  }

  :global([data-theme='dark']) .pill-ghost:hover:not(:disabled) {
    background: color-mix(in oklab, var(--primary-soft-bg) 70%, transparent);
  }

  /* ===== ACTION FORMS ===== */
  .action-form {
    margin-top: 1rem;
    padding: 1.5rem;
    background: var(--secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-label {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  /* ===== NEW GROUP FORM ===== */
  .new-group-form {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .new-group-form :global(.tw-input-wrapper) {
    flex: 1;
    min-width: 200px;
  }

  /* ===== INLINE FORMS ===== */
  .inline-form {
    margin-top: 0.75rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
  }

  .inline-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  /* ===== CONFIRM CARD ===== */
  .confirm-card {
    margin-top: 1rem;
    padding: 1.5rem;
    background: color-mix(in oklab, var(--danger) 12%, var(--surface) 88%);
    border: 1px solid color-mix(in oklab, var(--danger) 35%, transparent);
    border-radius: var(--radius-lg);
  }

  .confirm-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--danger);
  }

  .confirm-desc {
    margin: 0.5rem 0 1rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* ===== EMPTY HINTS ===== */
  .empty-hint {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 1rem 0;
    padding: 1.5rem 1rem;
    text-align: center;
    background: var(--secondary);
    border-radius: var(--radius-lg);
    line-height: 1.5;
  }

  /* ===== CONTENT HEADER ===== */
  .content-header {
    text-align: center;
    padding: 0.5rem 0;
  }

  .content-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.025em;
  }

  .content-meta {
    margin: 0.5rem 0 0;
    font-size: 1rem;
    color: var(--text-secondary);
  }

  /* ===== LIST CONTAINER ===== */
  .list-container {
    margin-bottom: 1rem;
  }

  /* ===== PARTICIPANT INFO ===== */
  .participant-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .participant-name {
    font-size: 1.0625rem;
    font-weight: 500;
    color: var(--text);
  }

  .participant-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  /* ===== EXPENSE INFO ===== */
  .expense-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .expense-desc {
    font-size: 1.0625rem;
    font-weight: 500;
    color: var(--text);
  }

  .expense-meta {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  /* ===== BALANCE LAYOUT ===== */
  .balance-layout {
    display: grid;
    gap: 1.5rem;
  }

  @media (min-width: 900px) {
    .balance-layout {
      grid-template-columns: 1.2fr 1fr;
    }
  }

  /* ===== BALANCE INFO ===== */
  .balance-info {
    display: flex;
    align-items: center;
  }

  .balance-name {
    font-size: 1.0625rem;
    font-weight: 500;
    color: var(--text);
  }

  .balance-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .balance-amount {
    font-size: 1.0625rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }

  .balance-amount.positive {
    color: var(--success);
  }

  .balance-amount.negative {
    color: var(--danger);
  }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid transparent;
  }

  .status-badge.status-positive {
    background: color-mix(in oklab, var(--success) 18%, var(--surface) 82%);
    color: var(--success);
    border-color: color-mix(in oklab, var(--success) 35%, transparent);
  }

  .status-badge.status-negative {
    background: color-mix(in oklab, var(--danger) 18%, var(--surface) 82%);
    color: var(--danger);
    border-color: color-mix(in oklab, var(--danger) 35%, transparent);
  }

  .status-badge.status-neutral {
    background: var(--secondary);
    color: var(--text-secondary);
    border-color: var(--border);
  }

  /* ===== SETTLEMENT INFO ===== */
  .settlement-info {
    display: flex;
    align-items: center;
  }

  .settlement-text {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.0625rem;
  }

  .settlement-arrow {
    color: var(--text-secondary);
    font-weight: 400;
  }

  .settlement-amount {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--primary);
    font-variant-numeric: tabular-nums;
  }

  /* ===== FORM ROW ===== */
  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    margin-top: 1rem;
  }

  .form-row :global(.tw-input-wrapper) {
    flex: 1;
    min-width: 140px;
  }

  /* ===== SELECT INPUT (matches Converter) ===== */
  .select-input {
    flex: 1;
    min-width: 120px;
    height: 44px;
    padding: 0 1rem;
    background: var(--secondary);
    border: 1px solid var(--border);
    border-radius: 1rem;
    color: var(--text);
    font: inherit;
    font-size: 0.98rem;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236e6e73' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
  }

  .select-input:hover {
    border-color: var(--border-strong);
    background: var(--secondary-hover);
  }

  .select-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus-outer);
  }

  /* ===== AMOUNT EDIT ===== */
  .amount-edit {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .amount-edit :global(.tw-input-wrapper) {
    width: 100px;
  }

  .currency-tag {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  /* ===== EMPTY STATE ===== */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    background: var(--secondary);
    border-radius: var(--radius-lg);
  }

  .empty-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
    filter: grayscale(20%);
  }

  .empty-title {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.015em;
  }

  .empty-desc {
    margin: 0.5rem auto 0;
    font-size: 1rem;
    color: var(--text-secondary);
    max-width: 340px;
    line-height: 1.5;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 720px) {
    .page-shell {
      width: 100%;
      padding: 1.4rem 1.2rem 2.4rem;
    }
  }

  @media (max-width: 640px) {
    .page-shell {
      padding: 1rem 1rem 2rem;
      gap: 1rem;
    }

    .card-surface {
      padding: 1.3rem;
      border-radius: 1rem;
    }

    .page-headings h1 {
      font-size: 1.625rem;
    }

    .page-subtitle {
      font-size: 0.9375rem;
    }

    .content-title {
      font-size: 1.375rem;
    }

    .nav-item-btn {
      font-size: 1rem;
    }

    .form-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .form-row :global(.tw-input-wrapper),
    .form-row .select-input,
    .form-row .pill {
      width: 100%;
      flex: none;
      min-width: 0;
    }

    .new-group-form {
      flex-direction: column;
    }

    .new-group-form :global(.tw-input-wrapper) {
      min-width: 0;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions .pill {
      width: 100%;
    }

    .inline-actions {
      flex-direction: column;
    }

    .inline-actions .pill {
      width: 100%;
    }

    .empty-state {
      padding: 2rem 1rem;
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .empty-title {
      font-size: 1.125rem;
    }

    .empty-desc {
      font-size: 0.9375rem;
    }

    .balance-status {
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
    }

    .settlement-text {
      flex-wrap: wrap;
    }

    .pill {
      padding: 0.65rem 1.2rem;
      font-size: 0.9rem;
    }
  }
</style>
