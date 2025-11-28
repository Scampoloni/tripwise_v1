// src/routes/trips/[id]/+page.server.js
import { error } from '@sveltejs/kit';
import { getTripById, getExpensesForTrip } from '$lib/server/db';

const FALLBACK_PARTICIPANTS = Object.freeze([{ id: 'me', name: 'Du' }]);

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeParticipants(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return FALLBACK_PARTICIPANTS.map((participant) => ({ ...participant }));
  }

  const sanitized = list
    .map((participant) => {
      if (!participant || typeof participant !== 'object') return null;
      const id = typeof participant.id === 'string' ? participant.id.trim() : '';
      const name = typeof participant.name === 'string' ? participant.name.trim() : '';
      if (!id || !name) return null;
      return { id, name };
    })
    .filter(Boolean);

  return sanitized.length > 0
    ? sanitized
    : FALLBACK_PARTICIPANTS.map((participant) => ({ ...participant }));
}

function normalizeExpenses(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((expense) => {
      if (!expense) return null;
      return {
        id: expense.id,
        tripId: expense.tripId,
        amount: toNumber(expense.amount),
        currency: expense.currency || 'CHF',
        category: expense.category || 'Other',
        date: expense.date || '',
        description: expense.description || '',
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        paidByParticipantId: expense.paidByParticipantId || 'me',
        splitBetweenAll: expense.splitBetweenAll !== false
      };
    })
    .filter(Boolean);
}

function mapTripToStoreTrip(trip, expenses) {
  return {
    id: trip.id,
    userId: trip.userId ?? null,
    name: trip.name,
    title: trip.title ?? trip.name,
    destinationName: trip.destinationName ?? trip.destination ?? '',
    destinationLat: trip.destinationLat,
    destinationLon: trip.destinationLon,
    destinationCountry: trip.destinationCountry,
    flag: trip.flag || '🌍',
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    budget: toNumber(trip.totalBudget ?? trip.budget ?? 0),
    totalBudget: typeof trip.totalBudget === 'number' ? trip.totalBudget : undefined,
    currency: trip.currency || 'CHF',
    status: trip.status || 'planning',
    participants: normalizeParticipants(trip.participants),
    expenses: normalizeExpenses(expenses),
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const userId = locals.userId;
  const tripId = params.id;

  if (!userId) {
    throw error(401, 'Nicht eingeloggt');
  }

  if (!tripId) {
    throw error(400, 'Trip ID fehlt');
  }

  const trip = await getTripById(tripId, userId);

  if (!trip) {
    throw error(404, 'Trip nicht gefunden');
  }

  const expenses = await getExpensesForTrip(tripId);
  const mappedTrip = mapTripToStoreTrip(trip, expenses);

  return {
    trip: mappedTrip
  };
}
