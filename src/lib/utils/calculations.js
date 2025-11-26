// src/lib/utils/calculations.js

// Summe aller Ausgaben
export function calculateSpent(expenses = []) {
  if (!Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, exp) => sum + toNumber(exp?.amount), 0);
}

// Anteil einer Ausgabe fuer den aktuellen Benutzer
export function calculateUserShare(expense, currentUserId, participantCount) {
  if (!expense) return 0;
  const amount = toNumber(expense.amount);
  if (amount <= 0) return 0;

  const payerId = typeof expense.paidByParticipantId === 'string'
    ? expense.paidByParticipantId
    : null;

  const isPayer = !!payerId && !!currentUserId && payerId === currentUserId;
  const count = typeof participantCount === 'number' && Number.isFinite(participantCount)
    ? participantCount
    : 0;
  const isSplit = expense.splitBetweenAll === true && count > 0;

  if (isSplit) {
    const perHead = amount / count;
    return Number.isFinite(perHead) ? perHead : 0;
  }

  // Nicht geteilt, voller Betrag fuer den Zahler, sonst 0
  return isPayer ? amount : 0;
}

// Restbudget, niemals negativ
export function calculateRemaining(budget, spent) {
  const b = toNumber(budget);
  const s = toNumber(spent);
  return Math.max(0, b - s);
}

// Verbrauch in Prozent, 0 bei fehlendem Budget
export function calculatePercentUsed(spent, budget) {
  const b = toNumber(budget);
  const s = toNumber(spent);
  if (b <= 0) return 0;
  return Math.round((s / b) * 100);
}

// Gruppierung nach Kategorie
export function calculateByCategory(expenses = []) {
  const grouped = {};
  if (!Array.isArray(expenses) || expenses.length === 0) return grouped;

  for (const exp of expenses) {
    const cat = exp?.category ?? 'Uncategorized';
    if (!grouped[cat]) {
      grouped[cat] = { total: 0, count: 0, icon: exp?.icon };
    }
    grouped[cat].total += toNumber(exp?.amount);
    grouped[cat].count += 1;
  }
  return grouped;
}

/**
 * Tagesdurchschnitt, basierend auf bisher vergangener Reisedauer.
 * Nutzt optional "now", sonst Date.now. Clampt auf [1, totalDays].
 */
export function calculateDailyAverage(expenses = [], startDate, endDate, now = Date.now()) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end) return 0;

  const totalDays = diffDaysInclusive(start, end);
  const today = new Date(now);

  // Tage seit Start, aber nicht nach Reiseende und mindestens 1
  const daysElapsed = clamp(diffDaysInclusive(start, minDate(today, end)), 1, totalDays);

  const spent = calculateSpent(expenses);
  return spent / daysElapsed;
}

/**
 * Prognose Budgetstatus bis Reiseende.
 * Uebergib optional "now" fuer deterministische Berechnungen.
 */
export function predictBudgetStatus(spent, budget, startDate, endDate, now = Date.now()) {
  const s = toNumber(spent);
  const b = toNumber(budget);
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end || b <= 0) return null;

  const today = new Date(now);
  const totalDays = diffDaysInclusive(start, end);
  const daysElapsed = clamp(diffDaysInclusive(start, minDate(today, end)), 1, totalDays);

  const dailyRate = s / daysElapsed;
  const projectedTotal = dailyRate * totalDays;
  const overspend = projectedTotal - b;

  return {
    projectedTotal,
    overspend,
    dailyRate,
    isOverBudget: overspend > 0
  };
}

export function calculateDaysRemaining(endDate, now = Date.now()) {
  const end = toDate(endDate);
  if (!end) return 0;
  const today = new Date(now);
  const ms = end.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  const days = Math.ceil(ms / 86400000);
  return Math.max(0, days);
}

// ---------- interne Helfer ----------

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toDate(v) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function diffDaysInclusive(a, b) {
  // inklusive beider Tage, mindestens 1
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil(ms / 86400000) + 1);
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function minDate(a, b) {
  return a < b ? a : b;
}
