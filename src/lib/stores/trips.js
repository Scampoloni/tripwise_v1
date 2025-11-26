// src/lib/stores/trips.js
// @ts-check

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/** @typedef {import('$lib/types/trips').StoreTrip} StoreTrip */
/** @typedef {import('$lib/types/trips').StoreExpense} StoreExpense */
/** @typedef {import('$lib/types/trips').Participant} Participant */
/** @typedef {import('$lib/types/trips').ApiTrip} ApiTrip */
/** @typedef {import('$lib/types/trips').ApiExpense} ApiExpense */

export const trips = writable(/** @type {StoreTrip[]} */ ([]));

// Kleiner Helfer fuer API Requests
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let payload;
    try {
      payload = await res.json();
      if (payload && (payload.error || payload.errors)) {
        message = JSON.stringify(payload);
      }
    } catch {
      payload = null;
    }

    if (res.status !== 401) {
      console.error(message);
    }

    const error = new Error(message);
    // @ts-ignore
    error.status = res.status;
    if (payload) {
      // @ts-ignore
      error.payload = payload;
    }
    throw error;
  }
  return res.json();
}

export function resetTrips() {
  trips.set([]);
}

/**
 * Mapping, API Trip → Store Trip
 * @param {ApiTrip} apiTrip
 * @returns {StoreTrip}
 */
function mapApiTripToStoreTrip(apiTrip) {
  // apiTrip kommt in deinem Flow immer gesetzt, dieser Guard ist nur defensive
  // @ts-ignore
  if (!apiTrip) return null;

  /** @type {Participant[]} */
  const participants =
    Array.isArray(apiTrip.participants) && apiTrip.participants.length > 0
      ? apiTrip.participants
      : [{ id: 'me', name: 'Du' }];

  /** @type {StoreExpense[]} */
  const expenses = Array.isArray(apiTrip.expenses) ? apiTrip.expenses : [];

  return {
    id: apiTrip.id,
    name: apiTrip.name,
    destination: apiTrip.destination,
    // optionale Flag fuer dein UI
    // @ts-ignore
    flag: apiTrip.flag || '🌍',
    startDate: apiTrip.startDate || '',
    endDate: apiTrip.endDate || '',
    budget: apiTrip.totalBudget ?? 0,
    currency: apiTrip.currency || 'CHF',
    status: apiTrip.status || 'planning',
    participants,
    expenses,
    createdAt: apiTrip.createdAt,
    updatedAt: apiTrip.updatedAt
  };
}

/**
 * Mapping, API Expense → Store Expense
 * @param {ApiExpense} apiExp
 * @returns {StoreExpense}
 */
function mapApiExpenseToStoreExpense(apiExp) {
  // @ts-ignore
  if (!apiExp) return null;
  return {
    id: apiExp.id,
    tripId: apiExp.tripId,
    amount: apiExp.amount,
    currency: apiExp.currency,
    category: apiExp.category,
    date: apiExp.date,
    description: apiExp.description,
    createdAt: apiExp.createdAt,
    updatedAt: apiExp.updatedAt,
    paidByParticipantId: apiExp.paidByParticipantId,
    splitBetweenAll: apiExp.splitBetweenAll
  };
}

/* ---------- Initial Load aus der DB ---------- */

export async function loadTrips() {
  if (!browser) return [];

  try {
    const data = /** @type {ApiTrip[]} */ (await fetchJSON('/api/trips'));
    const mappedTrips = await Promise.all(
      (data || []).map(async (apiTrip) => {
        const base = mapApiTripToStoreTrip(apiTrip);

        try {
          const expensesData = /** @type {ApiExpense[]} */ (
            await fetchJSON(`/api/trips/${base.id}/expenses`)
          );
          const mappedExpenses = (expensesData || []).map(mapApiExpenseToStoreExpense);
          return { ...base, expenses: mappedExpenses };
        } catch (e) {
          console.warn('Konnte Expenses fuer Trip nicht laden', base.id, e);
          return { ...base, expenses: [] };
        }
      })
    );

    trips.set(mappedTrips);
    return mappedTrips;
  } catch (err) {
    // @ts-ignore
    if (err && err.status === 401) {
      resetTrips();
      return [];
    }

    console.error('Fehler beim Laden der Trips aus der API', err);
    resetTrips();
    return [];
  }
}

/* ---------- CRUD Funktionen fuer das UI ---------- */

/**
 * Trip erstellen
 * @param {{
 *  name: string;
 *  destination: string;
 *  startDate?: string;
 *  endDate?: string;
 *  budget?: number;
 *  totalBudget?: number;
 *  currency?: string;
 *  status?: string;
 * }} tripInput
 */
export async function addTrip(tripInput) {
  if (!browser) return;

  const payload = {
    name: tripInput.name,
    destination: tripInput.destination,
    startDate: tripInput.startDate || '',
    endDate: tripInput.endDate || '',
    totalBudget: tripInput.budget ?? tripInput.totalBudget ?? 0,
    currency: tripInput.currency || 'CHF',
    status: tripInput.status || 'planning'
  };

  const apiTrip = /** @type {ApiTrip} */ (
    await fetchJSON('/api/trips', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  );

  const storeTrip = mapApiTripToStoreTrip(apiTrip);
  trips.update((list) => [...list, storeTrip]);
  return storeTrip;
}

/**
 * Trip aktualisieren
 * @param {string} id
 * @param {{
 *  name?: string;
 *  destination?: string;
 *  startDate?: string;
 *  endDate?: string;
 *  budget?: number;
 *  currency?: string;
 *  status?: string;
 *  participants?: Participant[];
 * }} updates
 */
export async function updateTrip(id, updates) {
  if (!browser) return;

  const payload = {
    ...(updates.name && { name: updates.name }),
    ...(updates.destination && { destination: updates.destination }),
    ...(updates.startDate && { startDate: updates.startDate }),
    ...(updates.endDate && { endDate: updates.endDate }),
    ...(updates.budget !== undefined && { totalBudget: updates.budget }),
    ...(updates.currency && { currency: updates.currency }),
    ...(updates.status && { status: updates.status }),
    ...(updates.participants && { participants: updates.participants })
  };

  const apiTrip = /** @type {ApiTrip} */ (
    await fetchJSON(`/api/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  );

  const storeTrip = mapApiTripToStoreTrip(apiTrip);
  trips.update((list) => list.map((t) => (t.id === id ? storeTrip : t)));
  return storeTrip;
}

// Trip loeschen
export async function deleteTrip(id) {
  if (!browser) return;

  await fetchJSON(`/api/trips/${id}`, {
    method: 'DELETE'
  });

  trips.update((list) => list.filter((t) => t.id !== id));
}

/* ---------- Expenses ---------- */

/**
 * Expense anlegen
 * @param {string} tripId
 * @param {{
 *  amount: number;
 *  currency?: string;
 *  category?: string;
 *  date: string;
 *  description?: string;
 *  paidByParticipantId: string;
 *  splitBetweenAll: boolean;
 * }} expenseInput
 */
export async function addExpense(tripId, expenseInput) {
  if (!browser) return;

  const payload = {
    amount: expenseInput.amount,
    currency: expenseInput.currency || 'CHF',
    category: expenseInput.category || 'Other',
    date: expenseInput.date,
    description: expenseInput.description || '',
    paidByParticipantId: expenseInput.paidByParticipantId,
    splitBetweenAll: expenseInput.splitBetweenAll
  };

  const apiExp = /** @type {ApiExpense} */ (
    await fetchJSON(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  );

  const storeExp = mapApiExpenseToStoreExpense(apiExp);

  trips.update(
    /** @param {StoreTrip[]} list */ (list) =>
      list.map((t) =>
        t.id === tripId
          ? { ...t, expenses: [...(t.expenses || []), storeExp] }
          : t
      )
  );

  return storeExp;
}

// Expense loeschen
export async function deleteExpense(tripId, expenseId) {
  if (!browser) return;

  await fetchJSON(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: 'DELETE'
  });

  trips.update(
    /** @param {StoreTrip[]} list */ (list) =>
      list.map((t) =>
        t.id === tripId
          ? {
              ...t,
              expenses: (t.expenses || []).filter((e) => e.id !== expenseId)
            }
          : t
      )
  );
}

// Expenses fuer einen Trip neu laden
export async function reloadExpensesForTrip(tripId) {
  if (!browser) return;

  const data = /** @type {ApiExpense[]} */ (
    await fetchJSON(`/api/trips/${tripId}/expenses`)
  );
  const mapped = (data || []).map(mapApiExpenseToStoreExpense);

  trips.update(
    /** @param {StoreTrip[]} list */ (list) =>
      list.map((t) => (t.id === tripId ? { ...t, expenses: mapped } : t))
  );

  return mapped;
}
