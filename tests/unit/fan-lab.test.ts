import { describe, expect, it } from 'vitest';
import {
  scenarioLimits,
  scenarioOperatingPoint,
  scenarioPressure,
  type FanScenario,
} from '../../src/features/notes/fan-lab-model.ts';

const fan: FanScenario = {
  flow: 80,
  pressure: 25,
  speed: 1,
  shape: 'linear',
  arrangement: 'single',
};

describe('hypothetical fan lab boundary', () => {
  it('solves only an enabled positive-resistance intersection inside the curve', () => {
    expect(scenarioOperatingPoint(fan, null)).toBeNull();
    const point = scenarioOperatingPoint(fan, 0.01);
    expect(point).not.toBeNull();
    if (!point) throw new Error('Expected model intersection');
    expect(point.flow).toBeGreaterThan(0);
    expect(point.flow).toBeLessThan(80);
    expect(point.pressure).toBeCloseTo(scenarioPressure(fan, point.flow)!, 10);
    expect(scenarioPressure(fan, 81)).toBeNull();
    for (const k of [0, -1, Infinity, NaN, 11])
      expect(scenarioOperatingPoint(fan, k)).toBeNull();
  });
  it('applies speed and ideal arrangement to separate curve endpoints', () => {
    expect(
      scenarioLimits({ ...fan, speed: 0.5, arrangement: 'parallel' }),
    ).toEqual({ flow: 80, pressure: 6.25 });
    expect(
      scenarioLimits({ ...fan, speed: 0.5, arrangement: 'series' }),
    ).toEqual({ flow: 40, pressure: 12.5 });
    expect(scenarioPressure({ ...fan, shape: 'quadratic' }, 40)).toBe(18.75);
    for (const speed of [0, -1, NaN, Infinity, 1.1])
      expect(scenarioLimits({ ...fan, speed })).toBeNull();
  });
});

import measuredData from '../../src/features/notes/fan-measured-data.json';
import {
  measuredPressure,
  mmH2OToPa,
  cfmToM3h,
} from '../../src/features/notes/fan-lab-model.ts';

describe('measured transcription boundary', () => {
  it('keeps the usable archive and mode-specific additions without private provenance', () => {
    expect(measuredData).toHaveLength(370);
    expect(
      measuredData.reduce((total, scan) => total + scan.points.length, 0),
    ).toBe(2960);
    expect(new Set(measuredData.map((scan) => scan.id)).size).toBe(370);
    for (const scan of measuredData) {
      expect(Object.keys(scan).sort()).toEqual([
        'fresh',
        'id',
        'name',
        'points',
        'report',
        'setting',
        'url',
      ]);
      expect(new URL(scan.url).hostname).toBe('www.cybenetics.com');
      let previous = -Infinity;
      for (const row of scan.points) {
        const q = row[0];
        const p = row[1];
        expect(typeof q).toBe('number');
        expect(typeof p).toBe('number');
        expect(q).toBeGreaterThan(previous);
        previous = q ?? 0;
        expect(Number.isFinite(p)).toBe(true);
      }
    }
    expect(measuredData.find((scan) => scan.id === 'cyb-240-100')?.fresh).toBe(
      true,
    );
    expect(measuredData.find((scan) => scan.id === 'cyb-238-100')?.fresh).toBe(
      false,
    );
  });
  it('preserves local rises and negative readings without endpoint extrapolation', () => {
    const points = [
      [0, 4],
      [10, 2],
      [20, 3],
      [30, -0.1],
    ];
    expect(measuredPressure(points, 15)).toBe(2.5);
    expect(measuredPressure(points, 30)).toBeCloseTo(-0.1, 10);
    for (const q of [-1, 31, NaN, Infinity])
      expect(measuredPressure(points, q)).toBeNull();
    expect(
      measuredPressure(
        [
          [0, 4],
          [0, 2],
        ],
        0,
      ),
    ).toBeNull();
    expect(mmH2OToPa).toBe(9.80665);
    expect(1 / cfmToM3h).toBeCloseTo(0.588578, 6);
  });
});
