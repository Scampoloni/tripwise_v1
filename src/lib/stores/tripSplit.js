// @ts-check
import { writable } from 'svelte/store';

const STORAGE_KEY = 'tripwise_tripsplit_v1';

/**
 * Initialstate aus localStorage laden
 * @returns {TripSplitGroup[]}
 */
function loadInitialGroups() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('TripSplit, Fehler beim Laden aus localStorage', err);
    return [];
  }
}

/** @typedef {import('$lib/types/tripSplit').TripSplitBalance} TripSplitBalance */
/** @typedef {import('$lib/types/tripSplit').TripSplitSettlement} TripSplitSettlement */
/** @typedef {import('$lib/types/tripSplit').TripSplitGroup} TripSplitGroup */
/** @typedef {import('$lib/types/tripSplit').TripSplitParticipant} TripSplitParticipant */
/** @typedef {import('$lib/types/tripSplit').TripSplitNewGroupInput} TripSplitNewGroupInput */
/** @typedef {import('$lib/types/tripSplit').TripSplitNewParticipantInput} TripSplitNewParticipantInput */
/** @typedef {import('$lib/types/tripSplit').TripSplitNewExpenseInput} TripSplitNewExpenseInput */
/** @typedef {import('$lib/types/tripSplit').TripSplitExpense} TripSplitExpense */

/** @type {import('svelte/store').Writable<TripSplitGroup[]>} */
export const tripSplitGroups = writable(loadInitialGroups());

if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  tripSplitGroups.subscribe((groups) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch (err) {
      console.error('TripSplit, Fehler beim Speichern in localStorage', err);
    }
  });
}

/**
 * Einfache Id Helfer
 * @param {string} [prefix]
 */
function createId(prefix = 'ts_') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/**
 * Gruppe erstellen (Phase 4)
 * @param {TripSplitNewGroupInput} input
 * @returns {TripSplitGroup}
 */
export function createGroup(input) {
  const now = new Date().toISOString();

  const group = {
    id: createId('group_'),
    name: input.name,
    participants: [],
    expenses: [],
    createdAt: now,
    updatedAt: now
  };

  tripSplitGroups.update((groups) => [...groups, group]);
  return group;
}

/**
 * Teilnehmer hinzufuegen (Phase 5)
 * @param {string} groupId
 * @param {TripSplitNewParticipantInput} input
 * @returns {TripSplitParticipant | null}
 */
export function addParticipant(groupId, input) {
  /** @type {TripSplitParticipant | null} */
  let created = null;

  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;

      const participant = {
        id: createId('p_'),
        name: input.name,
        email: input.email
      };

      created = participant;

      return {
        ...g,
        participants: [...g.participants, participant],
        updatedAt: new Date().toISOString()
      };
    })
  );

  return created;
}

/**
 * Ausgabe hinzufuegen (Phase 6)
 * Splits werden im UI vorbereitet, hier nur uebernommen
 * @param {string} groupId
 * @param {TripSplitNewExpenseInput} input
 * @returns {TripSplitExpense | null}
 */
export function addExpense(groupId, input) {
  /** @type {TripSplitExpense | null} */
  let created = null;

  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;

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

      created = expense;

      return {
        ...g,
        expenses: [...g.expenses, expense],
        updatedAt: now
      };
    })
  );

  return created;
}

/**
 * Gruppenname aktualisieren
 * @param {string} groupId
 * @param {string} name
 * @returns {TripSplitGroup | null}
 */
export function updateGroupName(groupId, name) {
  /** @type {TripSplitGroup | null} */
  let updated = null;

  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;
      const next = {
        ...g,
        name,
        updatedAt: new Date().toISOString()
      };
      updated = next;
      return next;
    })
  );

  return updated;
}

/**
 * Gruppe entfernen
 * @param {string} groupId
 */
export function deleteGroup(groupId) {
  tripSplitGroups.update((groups) => groups.filter((g) => g.id !== groupId));
}

/**
 * Teilnehmer aktualisieren
 * @param {string} groupId
 * @param {string} participantId
 * @param {TripSplitNewParticipantInput} input
 * @returns {TripSplitParticipant | null}
 */
export function updateParticipant(groupId, participantId, input) {
  /** @type {TripSplitParticipant | null} */
  let updatedParticipant = null;

  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;

      let participantChanged = false;
      const nextParticipants = g.participants.map((p) => {
        if (p.id !== participantId) return p;
        participantChanged = true;
        const next = {
          ...p,
          name: input.name,
          email: input.email
        };
        updatedParticipant = next;
        return next;
      });

      if (!participantChanged) return g;

      return {
        ...g,
        participants: nextParticipants,
        updatedAt: new Date().toISOString()
      };
    })
  );

  return updatedParticipant;
}

/**
 * Teilnehmer entfernen und Splits bereinigen
 * @param {string} groupId
 * @param {string} participantId
 */
export function deleteParticipant(groupId, participantId) {
  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;
      const nextParticipants = g.participants.filter((p) => p.id !== participantId);

      // Entferne Teilnehmer aus Splits, belasse paidBy wie gefordert
      const nextExpenses = g.expenses.map((expense) => ({
        ...expense,
        splits: (expense.splits || []).filter((split) => split.participantId !== participantId)
      }));

      return {
        ...g,
        participants: nextParticipants,
        expenses: nextExpenses,
        updatedAt: new Date().toISOString()
      };
    })
  );
}

/**
 * Ausgabe aktualisieren
 * @param {string} groupId
 * @param {string} expenseId
 * @param {Partial<TripSplitNewExpenseInput>} updates
 * @returns {TripSplitExpense | null}
 */
export function updateExpense(groupId, expenseId, updates) {
  /** @type {TripSplitExpense | null} */
  let updatedExpense = null;

  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;

      let expenseChanged = false;
      const nextExpenses = g.expenses.map((expense) => {
        if (expense.id !== expenseId) return expense;
        expenseChanged = true;
        const next = {
          ...expense,
          description: updates.description ?? expense.description,
          amount: updates.amount ?? expense.amount,
          currency: updates.currency ?? expense.currency,
          paidBy: updates.paidBy ?? expense.paidBy,
          splits: updates.splits ?? expense.splits,
          splitMode: updates.splitMode ?? expense.splitMode
        };
        updatedExpense = next;
        return next;
      });

      if (!expenseChanged) return g;

      return {
        ...g,
        expenses: nextExpenses,
        updatedAt: new Date().toISOString()
      };
    })
  );

  return updatedExpense;
}

/**
 * Ausgabe entfernen
 * @param {string} groupId
 * @param {string} expenseId
 */
export function deleteExpense(groupId, expenseId) {
  tripSplitGroups.update((groups) =>
    groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        expenses: g.expenses.filter((expense) => expense.id !== expenseId),
        updatedAt: new Date().toISOString()
      };
    })
  );
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
