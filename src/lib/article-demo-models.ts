/** Deterministic teaching data transcribed and reviewed from the supplied manuscripts.
 * These functions do not execute uploaded JavaScript, capture traffic or call APIs. */
export const traceWindowSeconds = 0.5;
export const traceTemplate = [
  8, 10, 12, 10, 60, 120, 90, 30, 12, 9, 12, 14, 90, 150, 125, 35, 12, 10, 8,
  14, 55, 110, 90, 40, 12, 9, 10, 12, 100, 140, 80, 15, 0, 0, 0, 0, 0, 0, 0, 0,
] as const;
const variation = [2, -3, 1, 4, -2, 2, 0, -4, 3, 1, -1, 2, -3, 4, -2, 1];
const unrelated = [
  45, 72, 95, 85, 55, 24, 10, 7, 8, 10, 22, 38, 52, 32, 11, 8, 40, 90, 130, 110,
  65, 20, 12, 9, 8, 10, 30, 45, 25, 10, 8, 7, 55, 115, 155, 105, 45, 12, 8, 10,
];
const background = [
  80, 65, 40, 20, 10, 30, 65, 95, 115, 85, 40, 15, 10, 25, 55, 70, 100, 130,
  100, 60, 20, 10, 25, 50, 80, 110, 120, 85, 40, 15, 20, 35, 75, 100, 125, 90,
  45, 15, 10, 25,
];
export type TraceMode = 'same' | 'other' | 'aggregate';
export function pearson(
  a: readonly number[],
  b: readonly (number | null)[],
): number | null {
  const pairs = a.flatMap((x, i) => {
    const y = b[i];
    return Number.isFinite(x) && typeof y === 'number' && Number.isFinite(y)
      ? [[x, y] as const]
      : [];
  });
  if (pairs.length < 2) return null;
  const mx = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const my = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
  let cov = 0,
    vx = 0,
    vy = 0;
  for (const [x, y] of pairs) {
    cov += (x - mx) * (y - my);
    vx += (x - mx) ** 2;
    vy += (y - my) ** 2;
  }
  return vx === 0 || vy === 0
    ? null
    : Math.max(-1, Math.min(1, cov / Math.sqrt(vx * vy)));
}
export function traceView(mode: TraceMode, lag: number) {
  const shift = Number.isFinite(lag)
    ? Math.max(0, Math.min(6, Math.round(lag)))
    : 0;
  const same = traceTemplate.map((_, i) => {
    const original = i >= 3 ? (traceTemplate[i - 3] ?? 0) : 0;
    return original
      ? Math.max(0, original * 0.92 + (variation[i % variation.length] ?? 0))
      : 0;
  });
  const raw =
    mode === 'other'
      ? unrelated
      : mode === 'aggregate'
        ? same.map((v, i) => v + (background[i] ?? 0))
        : same;
  const y = traceTemplate.map((_, i) => raw[i + shift] ?? null);
  return {
    x: [...traceTemplate],
    y,
    lag: shift,
    correlation: pearson(traceTemplate, y),
  };
}
export function tracePath(
  values: readonly (number | null)[],
  top: number,
): string {
  let connected = false;
  return values
    .map((v, i) => {
      if (v === null || !Number.isFinite(v)) {
        connected = false;
        return '';
      }
      const x = 62 + (i + 0.5) * (674 / 40),
        y = top + 105 - (v / 320) * 105;
      const point = `${connected ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
      connected = true;
      return point;
    })
    .join(' ');
}
export function candidatePrecision(n: number, fpr: number, tpr: number) {
  if (
    ![n, fpr, tpr].every(Number.isFinite) ||
    n < 1 ||
    !Number.isInteger(n) ||
    fpr < 0 ||
    fpr > 1 ||
    tpr < 0 ||
    tpr > 1
  )
    return null;
  const fp = (n - 1) * fpr,
    tp = tpr;
  return { fp, tp, ppv: tp + fp > 0 ? tp / (tp + fp) : null };
}
export type ReadingLevel = 'idle' | 'reading' | 'fast';
export type ReadingDirection = 'up' | 'down';
export const readingMultipliers = { idle: 1.5, reading: 3, fast: 5 } as const;
export function lookaheadMargins(
  level: ReadingLevel,
  direction: ReadingDirection,
  height: number,
  base: number,
  lead = 0,
) {
  if (
    !Number.isInteger(height) ||
    height < 1 ||
    height > 4000 ||
    !Number.isInteger(base) ||
    base < 0 ||
    base > 10000 ||
    !Number.isFinite(lead) ||
    lead < 0
  )
    return null;
  if (base === 0) return { top: 0, bottom: 0 };
  const ahead = Math.min(
    10000,
    Math.max(base, Math.round((readingMultipliers[level] + lead) * height)),
  );
  const behind = Math.min(base, Math.round(0.5 * height));
  return direction === 'down'
    ? { top: behind, bottom: ahead }
    : { top: ahead, bottom: behind };
}
