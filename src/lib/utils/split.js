import { convertToChf } from '$lib/utils/currency.js';

function normalizeParticipants(trip) {
  const list = Array.isArray(trip?.participants) ? trip.participants : [];
  if (list.length === 0) {
    return [{ id: 'me', name: 'Du' }];
  }

  const normalized = list
    .map((participant) => ({
      id: typeof participant?.id === 'string' && participant.id.trim() ? participant.id.trim() : undefined,
      name: typeof participant?.name === 'string' && participant.name.trim() ? participant.name.trim() : undefined
    }))
    .filter((participant) => participant.id && participant.name);

  return normalized.length > 0 ? normalized : [{ id: 'me', name: 'Du' }];
}

function ensureEntry(map, participant) {
  if (!map.has(participant.id)) {
    map.set(participant.id, {
      participant,
      paid: 0,
      share: 0
    });
  }
  return map.get(participant.id);
}

function normalizeAmount(amount) {
  const numeric = Number(amount);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function calculateSplit(trip, expenses) {
  const participants = normalizeParticipants(trip);
  const totals = new Map(
    participants.map((participant) => [participant.id, { participant, paid: 0, share: 0 }])
  );

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return participants.map((participant) => ({ participant, paid: 0, share: 0, net: 0 }));
  }

  for (const expense of expenses) {
    const amount = normalizeAmount(expense?.amount);
    if (amount <= 0) continue;

    const currency = typeof expense?.currency === 'string' ? expense.currency : 'CHF';
    const amountInChf = convertToChf(amount, currency);

    const payerId =
      typeof expense?.paidByParticipantId === 'string' && expense.paidByParticipantId.trim()
        ? expense.paidByParticipantId.trim()
        : participants[0]?.id ?? 'me';

    const payerEntry = ensureEntry(totals, totals.get(payerId)?.participant ?? {
      id: payerId,
      name: participants.find((participant) => participant.id === payerId)?.name || 'Unbekannt'
    });

    payerEntry.paid += amountInChf;

    if (expense?.splitBetweenAll === true && participants.length > 0) {
      const perHead = amountInChf / participants.length;
      for (const participant of participants) {
        const entry = ensureEntry(totals, participant);
        entry.share += perHead;
      }
    }
  }

  return Array.from(totals.values()).map((entry) => ({
    participant: entry.participant,
    paid: entry.paid,
    share: entry.share,
    net: entry.paid - entry.share
  }));
}
