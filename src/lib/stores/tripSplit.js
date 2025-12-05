// @ts-check
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

/** @typedef {import('$lib/types/tripSplit').TripSplitBalance} TripSplitBalance */
/** @typedef {import('$lib/types/tripSplit').TripSplitSettlement} TripSplitSettlement */
/** @typedef {import('$lib/types/tripSplit').TripSplitGroup} TripSplitGroup */
/** @typedef {import('$lib/types/tripSplit').TripSplitParticipant} TripSplitParticipant */
/** @typedef {import('$lib/types/tripSplit').TripSplitNewGroupInput} TripSplitNewGroupInput */
/** @typedef {import('$lib/types/tripSplit').TripSplitNewParticipantInput} TripSplitNewParticipantInput */
/** @typedef {import('$lib/types/tripSplit').TripSplitNewExpenseInput} TripSplitNewExpenseInput */
/** @typedef {import('$lib/types/tripSplit').TripSplitExpense} TripSplitExpense */

/** @type {import('svelte/store').Writable<TripSplitGroup[]>} */
export const tripSplitGroups = writable([]);

/** Loading state for initial fetch */
export const tripSplitLoading = writable(false);

/**
 * Reset store (for logout)
 */
export function resetTripSplit() {
  tripSplitGroups.set([]);
}

/**
 * Fetch helper with error handling
 * @param {string} url
 * @param {RequestInit} [options]
 */
async function fetchJSON(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(/** @type {Record<string,string>} */ (options.headers) || {}) };
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const payload = await res.json();
      if (payload?.error) message = payload.error;
    } catch {}
    const error = new Error(message);
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Einfache Id Helfer (fuer lokale IDs bei Participants/Expenses)
 * @param {string} [prefix]
 */
function createId(prefix = 'ts_') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/**
 * Gruppen vom Server laden
 */
export async function loadTripSplitGroups() {
  if (!browser) return;
  
  tripSplitLoading.set(true);
  try {
    const groups = await fetchJSON('/api/tripsplit');
    tripSplitGroups.set(groups);
  } catch (err) {
    // @ts-ignore
    if (err.status !== 401) {
      console.error('Fehler beim Laden der TripSplit Gruppen', err);
    }
    tripSplitGroups.set([]);
  } finally {
    tripSplitLoading.set(false);
  }
}

/**
 * Gruppe auf Server speichern (PUT)
 * @param {TripSplitGroup} group
 */
async function saveGroupToServer(group) {
  try {
    await fetchJSON(`/api/tripsplit/${group.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: group.name,
        participants: group.participants,
        expenses: group.expenses
      })
    });
  } catch (err) {
    console.error('Fehler beim Speichern der Gruppe', err);
    throw err;
  }
}

/**
 * Gruppe erstellen (Phase 4)
 * @param {TripSplitNewGroupInput} input
 * @returns {Promise<TripSplitGroup | null>}
 */
export async function createGroup(input) {
  try {
    const group = await fetchJSON('/api/tripsplit', {
      method: 'POST',
      body: JSON.stringify({ name: input.name, participants: [], expenses: [] })
    });

    tripSplitGroups.update((groups) => [...groups, group]);
    return group;
  } catch (err) {
    console.error('Fehler beim Erstellen der Gruppe', err);
    return null;
  }
}

/**
 * Teilnehmer hinzufuegen (Phase 5)
 * @param {string} groupId
 * @param {TripSplitNewParticipantInput} input
 * @returns {Promise<TripSplitParticipant | null>}
 */
export async function addParticipant(groupId, input) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  const participant = {
    id: createId('p_'),
    name: input.name,
    email: input.email
  };

  const updatedGroup = {
    ...group,
    participants: [...group.participants, participant],
    updatedAt: new Date().toISOString()
  };

  // Optimistic update
  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return participant;
  } catch (err) {
    // Rollback on error
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return null;
  }
}

/**
 * Ausgabe hinzufuegen (Phase 6)
 * Splits werden im UI vorbereitet, hier nur uebernommen
 * @param {string} groupId
 * @param {TripSplitNewExpenseInput} input
 * @returns {Promise<TripSplitExpense | null>}
 */
export async function addExpense(groupId, input) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  const now = new Date().toISOString();
  const expense = {
    id: createId('exp_'),
    groupId,
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    paidBy: input.paidBy,
    splits: input.splits,
    splitMode: input.splitMode ?? 'equal',
    createdAt: now
  };

  const updatedGroup = {
    ...group,
    expenses: [...group.expenses, expense],
    updatedAt: now
  };

  // Optimistic update
  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return expense;
  } catch (err) {
    // Rollback on error
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return null;
  }
}

/**
 * Gruppenname aktualisieren
 * @param {string} groupId
 * @param {string} name
 * @returns {Promise<TripSplitGroup | null>}
 */
export async function updateGroupName(groupId, name) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  const updatedGroup = {
    ...group,
    name,
    updatedAt: new Date().toISOString()
  };

  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return updatedGroup;
  } catch (err) {
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return null;
  }
}

/**
 * Gruppe entfernen
 * @param {string} groupId
 * @returns {Promise<boolean>}
 */
export async function deleteGroup(groupId) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return false;

  // Optimistic update
  tripSplitGroups.update((gs) => gs.filter((g) => g.id !== groupId));

  try {
    await fetchJSON(`/api/tripsplit/${groupId}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    // Rollback on error
    tripSplitGroups.update((gs) => [...gs, group]);
    console.error('Fehler beim Loeschen der Gruppe', err);
    return false;
  }
}

/**
 * Teilnehmer aktualisieren
 * @param {string} groupId
 * @param {string} participantId
 * @param {TripSplitNewParticipantInput} input
 * @returns {Promise<TripSplitParticipant | null>}
 */
export async function updateParticipant(groupId, participantId, input) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  /** @type {TripSplitParticipant | null} */
  let updatedParticipant = null;
  const nextParticipants = group.participants.map((p) => {
    if (p.id !== participantId) return p;
    updatedParticipant = { ...p, name: input.name, email: input.email };
    return updatedParticipant;
  });

  if (!updatedParticipant) return null;

  const updatedGroup = {
    ...group,
    participants: nextParticipants,
    updatedAt: new Date().toISOString()
  };

  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return updatedParticipant;
  } catch (err) {
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return null;
  }
}

/**
 * Teilnehmer entfernen und Splits bereinigen
 * @param {string} groupId
 * @param {string} participantId
 * @returns {Promise<boolean>}
 */
export async function deleteParticipant(groupId, participantId) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return false;

  const nextParticipants = group.participants.filter((p) => p.id !== participantId);
  const nextExpenses = group.expenses.map((expense) => ({
    ...expense,
    splits: (expense.splits || []).filter((split) => split.participantId !== participantId)
  }));

  const updatedGroup = {
    ...group,
    participants: nextParticipants,
    expenses: nextExpenses,
    updatedAt: new Date().toISOString()
  };

  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return true;
  } catch (err) {
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return false;
  }
}

/**
 * Ausgabe aktualisieren
 * @param {string} groupId
 * @param {string} expenseId
 * @param {Partial<TripSplitNewExpenseInput>} updates
 * @returns {Promise<TripSplitExpense | null>}
 */
export async function updateExpense(groupId, expenseId, updates) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  /** @type {TripSplitExpense | null} */
  let updatedExpense = null;
  const nextExpenses = group.expenses.map((expense) => {
    if (expense.id !== expenseId) return expense;
    updatedExpense = {
      ...expense,
      description: updates.description ?? expense.description,
      amount: updates.amount ?? expense.amount,
      currency: updates.currency ?? expense.currency,
      paidBy: updates.paidBy ?? expense.paidBy,
      splits: updates.splits ?? expense.splits,
      splitMode: updates.splitMode ?? expense.splitMode
    };
    return updatedExpense;
  });

  if (!updatedExpense) return null;

  const updatedGroup = {
    ...group,
    expenses: nextExpenses,
    updatedAt: new Date().toISOString()
  };

  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return updatedExpense;
  } catch (err) {
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return null;
  }
}

/**
 * Ausgabe entfernen
 * @param {string} groupId
 * @param {string} expenseId
 * @returns {Promise<boolean>}
 */
export async function deleteExpense(groupId, expenseId) {
  const groups = get(tripSplitGroups);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return false;

  const updatedGroup = {
    ...group,
    expenses: group.expenses.filter((expense) => expense.id !== expenseId),
    updatedAt: new Date().toISOString()
  };

  tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? updatedGroup : g)));

  try {
    await saveGroupToServer(updatedGroup);
    return true;
  } catch (err) {
    tripSplitGroups.update((gs) => gs.map((g) => (g.id === groupId ? group : g)));
    return false;
  }
}

/**
 * Balances fuer eine Gruppe berechnen
 * positive net = bekommt Geld, negative net = schuldet Geld
 * @param {TripSplitGroup} group
 * @returns {TripSplitBalance[]}
 */
export function computeBalances(group) {
  /** @type {Record<string, number>} */
  const map = {};

  // alle Teilnehmer initialisieren
  for (const p of group.participants) {
    map[p.id] = 0;
  }

  // jede Ausgabe durchgehen
  for (const e of group.expenses) {
    if (!e) continue;

    // Zahler bekommt erstmal den vollen Betrag gutgeschrieben
    if (typeof map[e.paidBy] !== 'number') {
      map[e.paidBy] = 0;
    }
    map[e.paidBy] += e.amount;

    // jeder, der einen Anteil hat, schuldet diesen Anteil
    for (const split of e.splits || []) {
      if (typeof map[split.participantId] !== 'number') {
        map[split.participantId] = 0;
      }
      map[split.participantId] -= split.share;
    }
  }

  /** @type {TripSplitBalance[]} */
  const balances = Object.entries(map).map(([participantId, net]) => ({
    participantId,
    net
  }));

  return balances;
}

/**
 * Ausgleichszahlungen aus Balances berechnen
 * @param {TripSplitBalance[]} balances
 * @returns {TripSplitSettlement[]}
 */
export function computeSettlements(balances) {
  /** @type {{ participantId: string; amount: number }[]} */
  const creditors = [];
  /** @type {{ participantId: string; amount: number }[]} */
  const debtors = [];

  for (const b of balances) {
    if (b.net > 0.01) {
      creditors.push({ participantId: b.participantId, amount: b.net });
    } else if (b.net < -0.01) {
      debtors.push({ participantId: b.participantId, amount: -b.net });
    }
  }

  /** @type {TripSplitSettlement[]} */
  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        fromParticipantId: debtor.participantId,
        toParticipantId: creditor.participantId,
        amount: Math.round(amount * 100) / 100 // auf Rappen runden
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return settlements;
}
