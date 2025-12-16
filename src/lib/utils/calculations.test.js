import { describe, expect, it } from 'vitest';

import {
  calculateByCategory,
  calculateDailyAverage,
  calculateDaysRemaining,
  calculatePercentUsed,
  calculateRemaining,
  calculateSpent,
  predictBudgetStatus
} from './calculations.js';

describe('utils/calculations', () => {
  it('calculateSpent sums amounts safely', () => {
    expect(calculateSpent([{ amount: 10 }, { amount: '2' }, { amount: null }, {}])).toBe(12);
    expect(calculateSpent(null)).toBe(0);
  });

  it('calculateRemaining never returns negative values', () => {
    expect(calculateRemaining(100, 30)).toBe(70);
    expect(calculateRemaining(50, 80)).toBe(0);
  });

  it('calculatePercentUsed returns 0 if budget is missing', () => {
    expect(calculatePercentUsed(10, 0)).toBe(0);
    expect(calculatePercentUsed(10, -5)).toBe(0);
  });

  it('calculateByCategory groups totals and counts', () => {
    const grouped = calculateByCategory([
      { amount: 10, category: 'Food', icon: 'utensils' },
      { amount: 5, category: 'Food' },
      { amount: 20, category: 'Transport' },
      { amount: 1 }
    ]);

    expect(grouped.Food.total).toBe(15);
    expect(grouped.Food.count).toBe(2);
    expect(grouped.Food.icon).toBe('utensils');

    expect(grouped.Transport.total).toBe(20);
    expect(grouped.Transport.count).toBe(1);

    expect(grouped.Uncategorized.total).toBe(1);
    expect(grouped.Uncategorized.count).toBe(1);
  });

  it('calculateDailyAverage uses elapsed days (inclusive)', () => {
    const expenses = [{ amount: 100 }];
    const startDate = '2025-01-01';
    const endDate = '2025-01-10';
    const now = new Date('2025-01-05T12:00:00Z').getTime();

    // Jan 1..Jan 5 inclusive => 5 days elapsed
    expect(calculateDailyAverage(expenses, startDate, endDate, now)).toBe(20);
  });

  it('predictBudgetStatus projects overspend correctly', () => {
    const startDate = '2025-01-01';
    const endDate = '2025-01-10';
    const now = new Date('2025-01-05T12:00:00Z').getTime();

    const status = predictBudgetStatus(100, 150, startDate, endDate, now);
    expect(status).not.toBeNull();
    expect(status.isOverBudget).toBe(true);
    expect(status.dailyRate).toBe(20);
    expect(status.projectedTotal).toBe(200);
    expect(status.overspend).toBe(50);
  });

  it('calculateDaysRemaining clamps to >= 0', () => {
    const now = new Date('2025-01-05T00:00:00Z').getTime();

    expect(calculateDaysRemaining('2025-01-10', now)).toBe(5);
    expect(calculateDaysRemaining('2025-01-01', now)).toBe(0);
  });
});
