import { describe, expect, it } from 'vitest';
import {
  operatingPoint,
  quantityCost,
} from '../../src/features/notes/hardware-note-tools.ts';

describe('retained hardware calculation utilities', () => {
  it('recomputes the documented operating point and price arithmetic', () => {
    const curve: [number, number][] = [
      [0, 2.3],
      [7.73, 1.78],
      [15.01, 1.49],
      [23.21, 1.17],
      [31.62, 1.1],
      [40, 0.81],
      [47.52, 0.49],
      [55.97, -0.01],
    ];
    const [q, p] = operatingPoint(curve, 0.8);
    expect(q).toBeCloseTo(40.12, 1);
    expect(p).toBeCloseTo(0.8, 2);
    const offer = {
      bic: 1590,
      tsukumo: 1449,
      shipping: 550,
      freeFrom: 3300,
      g2Single: 4720,
      g2Pair: 8481,
    };
    expect(quantityCost(2, offer)).toEqual({
      bic: 3180,
      tsukumo: 3448,
      g2: 8481,
    });
    expect(quantityCost(3, offer)).toEqual({
      bic: 4770,
      tsukumo: 4347,
      g2: 13201,
    });
  });
});
