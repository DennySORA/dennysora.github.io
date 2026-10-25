import { describe, expect, it } from 'vitest';
import {
  candidatePrecision,
  lookaheadMargins,
  pearson,
  tracePath,
  traceTemplate,
  traceView,
} from '../../src/lib/article-demo-models.ts';
import {
  demoLabels,
  mixCopy,
  routeCopy,
  tunnelCopy,
  translationDemoLabels,
} from '../../src/lib/article-demo-copy.ts';

describe('reviewed manuscript teaching models', () => {
  it('preserves the 40 half-second samples, known lag and null tail', () => {
    expect(traceTemplate).toHaveLength(40);
    expect(traceView('same', 0).correlation).toBeCloseTo(-0.315, 3);
    expect(traceView('same', 3).correlation).toBeGreaterThan(0.998);
    expect(traceView('same', 3).y.slice(-3)).toEqual([null, null, null]);
    expect(traceView('same', Infinity).lag).toBe(0);
    expect(traceView('same', -5).lag).toBe(0);
    expect(traceView('same', 8).lag).toBe(6);
    expect(traceView('aggregate', 3).correlation).toBeLessThan(
      traceView('same', 3).correlation!,
    );
    expect(traceView('other', 3).y[0]).toBe(85);
    expect(tracePath(traceView('same', 0).y, 225)).toContain('M70.42 330.00');
    expect(tracePath([1, null, 2], 45).match(/M/g)).toHaveLength(2);
  });
  it('does not report a correlation for constant, missing or insufficient samples', () => {
    expect(pearson([1, 1], [2, 3])).toBeNull();
    expect(pearson([1, 2], [null, null])).toBeNull();
    expect(pearson([1], [1])).toBeNull();
    expect(pearson([1, 2, 3], [1, 2, 3])).toBe(1);
    expect(pearson([1, 2, 3], [3, 2, 1])).toBe(-1);
  });
  it('keeps the manuscript Bayes baseline and boundaries, not person probabilities', () => {
    const baseline = candidatePrecision(1000001, 0.00001, 0.9);
    expect(baseline?.fp).toBe(10);
    expect(baseline?.tp).toBe(0.9);
    expect(baseline?.ppv).toBeCloseTo(0.0825688073);
    expect(candidatePrecision(1, 0, 0)?.ppv).toBeNull();
    expect(candidatePrecision(1001, 0, 1)?.ppv).toBe(1);
    for (const [n, fpr, tpr] of [
      [0, 0, 1],
      [1.5, 0, 1],
      [1001, -1, 1],
      [1001, 1, 2],
      [Infinity, 0, 1],
    ] as const)
      expect(candidatePrecision(n, fpr, tpr)).toBeNull();
  });
  it('keeps lookahead direction, registration lead, cap, zero and invalid inputs', () => {
    expect(lookaheadMargins('reading', 'down', 800, 1000)).toEqual({
      top: 400,
      bottom: 2400,
    });
    expect(lookaheadMargins('reading', 'up', 800, 1000)).toEqual({
      top: 2400,
      bottom: 400,
    });
    expect(lookaheadMargins('reading', 'down', 800, 1000, 0.5)).toEqual({
      top: 400,
      bottom: 2800,
    });
    expect(lookaheadMargins('fast', 'down', 4000, 1000)).toEqual({
      top: 1000,
      bottom: 10000,
    });
    expect(lookaheadMargins('idle', 'down', 800, 1000)).toEqual({
      top: 400,
      bottom: 1200,
    });
    expect(lookaheadMargins('fast', 'up', 800, 0, 0.5)).toEqual({
      top: 0,
      bottom: 0,
    });
    for (const height of [NaN, -1, 0, 1.5, 4001])
      expect(lookaheadMargins('reading', 'down', height, 1000)).toBeNull();
    for (const base of [NaN, -1, 0.5, 10001])
      expect(lookaheadMargins('reading', 'down', 800, base)).toBeNull();
  });
  it('provides all localized control/result labels without untranslated English UI', () => {
    const check = (value: unknown): void => {
      if (typeof value !== 'object' || value === null) return;
      if ('zh-hant' in value) {
        const localized = value as Record<string, string>;
        for (const locale of ['zh-hant', 'en', 'ja'])
          expect(localized[locale]?.trim()).toBeTruthy();
        expect(localized['en']).not.toMatch(/[\u3400-\u9fff\u3040-\u30ff]/);
      } else for (const child of Object.values(value)) check(child);
    };
    check([demoLabels, translationDemoLabels, routeCopy, tunnelCopy, mixCopy]);
    expect(routeCopy.direct.nodes).toHaveLength(3);
    expect(routeCopy.multi.nodes).toHaveLength(4);
    expect(mixCopy).toHaveLength(3);
  });
});
