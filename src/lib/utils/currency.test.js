import { describe, expect, it, vi } from 'vitest';

describe('utils/currency', () => {
  it('getStaticRate normalizes currencies and falls back to 1', async () => {
    const mod = await import('./currency.js');

    expect(mod.getStaticRate(' chf ', 'eur')).toBe(1.03);
    expect(mod.getStaticRate('EUR', 'CHF')).toBe(0.97);
    expect(mod.getStaticRate('CHF', 'CHF')).toBe(1);

    // unknown currencies => safe fallback
    expect(mod.getStaticRate('XXX', 'CHF')).toBe(1);
  });

  it('convertWithCachedRates converts using static table when no live rates are cached', async () => {
    const mod = await import('./currency.js');

    // 1 CHF = 1.03 EUR => 100 EUR ~= 97.09 CHF
    const converted = mod.convertWithCachedRates(100, 'EUR', 'CHF');
    expect(converted).toBeCloseTo(97.087, 3);

    expect(mod.convertWithCachedRates('12.5', 'CHF', 'CHF')).toBe(12.5);
    expect(mod.convertWithCachedRates('nope', 'CHF', 'CHF')).toBe(0);
  });

  it('loadRatesIfNeeded falls back to static rates on proxy error', async () => {
    vi.resetModules();
    const mod = await import('./currency.js');

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

    await mod.loadRatesIfNeeded('CHF');

    // should still be able to convert after fallback was applied
    const converted = mod.convertWithCachedRates(100, 'EUR', 'CHF');
    expect(converted).toBeCloseTo(97.087, 3);

    fetchSpy.mockRestore();
  });
});
