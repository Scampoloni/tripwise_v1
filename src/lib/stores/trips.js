// src/lib/stores/trips.js
// @ts-check

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/** @typedef {import('$lib/types/trips').StoreTrip} StoreTrip */
/** @typedef {import('$lib/types/trips').StoreExpense} StoreExpense */
/** @typedef {import('$lib/types/trips').Participant} Participant */
/** @typedef {import('$lib/types/trips').TripPayload} TripPayload */
/** @typedef {import('$lib/types/trips').ApiTrip} ApiTrip */
/** @typedef {import('$lib/types/trips').ApiExpense} ApiExpense */

export const trips = writable(/** @type {StoreTrip[]} */ ([]));

// Kleiner Helfer fuer API Requests
/**
 * @param {string} url
 * @param {RequestInit & { headers?: Record<string, string> }} [options]
 */
async function fetchJSON(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers
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
 * Mapping, API Trip -> Store Trip
 * @param {ApiTrip} apiTrip
 * @returns {StoreTrip}
 */
function mapApiTripToStoreTrip(apiTrip) {
  // @ts-ignore defensive fallback
  if (!apiTrip) return null;

  /** @type {Participant[]} */
  const participants =
    Array.isArray(apiTrip.participants) && apiTrip.participants.length > 0
      ? apiTrip.participants
      : [{ id: 'me', name: 'Du' }];

  const expenses = Array.isArray(apiTrip.expenses)
    ? apiTrip.expenses.map(mapApiExpenseToStoreExpense)
    : [];

  const rawBudget = Number(apiTrip.budget ?? apiTrip.totalBudget ?? 0);
  const budget = Number.isFinite(rawBudget) ? rawBudget : 0;
  const legacyTotal = typeof apiTrip.totalBudget === 'number' ? apiTrip.totalBudget : undefined;
  const legacyDestination = /** @type {any} */ (apiTrip)?.destination;

  return {
    id: apiTrip.id,
    userId: apiTrip.userId ?? null,
    name: apiTrip.name,
    title: apiTrip.title ?? apiTrip.name,
    destinationName: apiTrip.destinationName ?? legacyDestination ?? '',
    destinationLat:
      typeof apiTrip.destinationLat === 'number' ? apiTrip.destinationLat : undefined,
    destinationLon:
      typeof apiTrip.destinationLon === 'number' ? apiTrip.destinationLon : undefined,
    destinationCountry:
      typeof apiTrip.destinationCountry === 'string' ? apiTrip.destinationCountry : undefined,
    // optionale Flag fuer dein UI
    // @ts-ignore
    flag: apiTrip.flag || '\uD83C\uDF0D',
    startDate: apiTrip.startDate || '',
    endDate: apiTrip.endDate || '',
    budget,
    totalBudget: legacyTotal,
    currency: apiTrip.currency || 'CHF',
    status: apiTrip.status || 'planning',
    participants,
    expenses,
    createdAt: apiTrip.createdAt,
    updatedAt: apiTrip.updatedAt
  };
}

/**
 * Mapping, API Expense -> Store Expense
 * @param {ApiExpense} apiExp
 * @returns {StoreExpense}
 */
function mapApiExpenseToStoreExpense(apiExp) {
  // @ts-ignore defensive fallback
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
    console.log('DEBUG Phase3 loadTrips response', data);
    const mappedTrips = await Promise.all(
      (data || []).map(async (apiTrip) => {
        console.log('DEBUG Phase3 loadTrips apiTrip', apiTrip);
        const base = mapApiTripToStoreTrip(apiTrip);
        console.log('DEBUG Phase3 loadTrips storeTrip base', base);

        try {
          const expensesData = /** @type {ApiExpense[]} */ (
            await fetchJSON(`/api/trips/${base.id}/expenses`)
          );
          const mappedExpenses = (expensesData || []).map(mapApiExpenseToStoreExpense);
          const withExpenses = { ...base, expenses: mappedExpenses };
          console.log('DEBUG Phase3 loadTrips storeTrip withExpenses', withExpenses);
          return withExpenses;
        } catch (e) {
          console.warn('Konnte Expenses fuer Trip nicht laden', base.id, e);
          const fallback = { ...base, expenses: [] };
          console.log('DEBUG Phase3 loadTrips storeTrip fallback', fallback);
          return fallback;
        }
      })
    );

    trips.set(mappedTrips);
    console.log('=== RAW STORE TRIPS AFTER LOAD ===');
    console.log(JSON.stringify(mappedTrips, null, 2));
    mappedTrips.forEach((trip) => {
      console.log('DEBUG Phase3 storeTrip final', trip);
    });
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
 * @param {TripPayload} tripInput
 */
export async function addTrip(tripInput) {
  if (!browser) return;

  const normalizedBudget = Number(tripInput.budget ?? tripInput.totalBudget ?? 0);
  const payload = {
    name: tripInput.name,
    title: tripInput.title ?? tripInput.name,
    destinationName: tripInput.destinationName,
    destinationLat:
      typeof tripInput.destinationLat === 'number' ? tripInput.destinationLat : undefined,
    destinationLon:
      typeof tripInput.destinationLon === 'number' ? tripInput.destinationLon : undefined,
    destinationCountry:
      typeof tripInput.destinationCountry === 'string' ? tripInput.destinationCountry : undefined,
    startDate: tripInput.startDate || '',
    endDate: tripInput.endDate || '',
    budget: normalizedBudget,
    currency: tripInput.currency || 'CHF',
    status: tripInput.status || 'planning',
    participants: tripInput.participants || []
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
 *  title?: string;
 *  destinationName?: string;
 *  destinationLat?: number | null;
 *  destinationLon?: number | null;
 *  destinationCountry?: string | null;
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

  /** @type {Record<string, unknown>} */
  const payload = {};

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.destinationName !== undefined) payload.destinationName = updates.destinationName;
  if (updates.destinationLat !== undefined) payload.destinationLat = updates.destinationLat;
  if (updates.destinationLon !== undefined) payload.destinationLon = updates.destinationLon;
  if (updates.destinationCountry !== undefined) payload.destinationCountry = updates.destinationCountry;
  if (updates.startDate !== undefined) payload.startDate = updates.startDate;
  if (updates.endDate !== undefined) payload.endDate = updates.endDate;
  if (updates.budget !== undefined) payload.budget = updates.budget;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.participants !== undefined) payload.participants = updates.participants;

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
/** @param {string} id */
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
/**
 * @param {string} tripId
 * @param {string} expenseId
 */
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
/** @param {string} tripId */
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
