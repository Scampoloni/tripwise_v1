// @ts-check
import { writable } from 'svelte/store';

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
