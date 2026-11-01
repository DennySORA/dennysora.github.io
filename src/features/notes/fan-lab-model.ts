/** Educational curves only: these are not fits to any commercial fan. */
export type FanShape = 'linear' | 'quadratic';
export type FanArrangement = 'single' | 'parallel' | 'series';
export type FanScenario = {
  flow: number;
  pressure: number;
  speed: number;
  shape: FanShape;
  arrangement: FanArrangement;
};
export type FanPoint = { flow: number; pressure: number };

export function scenarioLimits(scenario: FanScenario): FanPoint | null {
  const { flow, pressure, speed, shape, arrangement } = scenario;
  if (
    ![flow, pressure, speed].every(Number.isFinite) ||
    flow <= 0 ||
    flow > 1000 ||
    pressure <= 0 ||
    pressure > 1000 ||
    speed <= 0 ||
    speed > 1 ||
    !['linear', 'quadratic'].includes(shape) ||
    !['single', 'parallel', 'series'].includes(arrangement)
  )
    return null;
  return {
    flow: flow * speed * (arrangement === 'parallel' ? 2 : 1),
    pressure: pressure * speed ** 2 * (arrangement === 'series' ? 2 : 1),
  };
}

export function scenarioPressure(
  scenario: FanScenario,
  flow: number,
): number | null {
  const limits = scenarioLimits(scenario);
  if (!limits || !Number.isFinite(flow) || flow < 0 || flow > limits.flow)
    return null;
  const fraction = flow / limits.flow;
  return (
    limits.pressure *
    (1 - (scenario.shape === 'linear' ? fraction : fraction ** 2))
  );
}

/** A root exists only on the explicitly modelled nonnegative fan domain. */
export function scenarioOperatingPoint(
  scenario: FanScenario,
  k: number | null,
): FanPoint | null {
  const limits = scenarioLimits(scenario);
  if (!limits || k === null || !Number.isFinite(k) || k <= 0 || k > 10)
    return null;
  let low = 0;
  let high = limits.flow;
  for (let step = 0; step < 64; step++) {
    const flow = (low + high) / 2;
    const pressure = scenarioPressure(scenario, flow);
    if (pressure === null) return null;
    if (pressure > k * flow ** 2) low = flow;
    else high = flow;
  }
  const flow = (low + high) / 2;
  return { flow, pressure: k * flow ** 2 };
}

export const mmH2OToPa = 9.80665;
export const cfmToM3h = 1.69901082;

/** Preserve measured negative pressures and nonmonotonic segments; never extrapolate. */
export function measuredPressure(
  points: readonly (readonly number[])[],
  flow: number,
): number | null {
  if (!Number.isFinite(flow) || points.length < 2) return null;
  const first = points[0];
  const last = points.at(-1);
  if (
    !first ||
    !last ||
    first[0] === undefined ||
    last[0] === undefined ||
    flow < first[0] ||
    flow > last[0]
  )
    return null;
  for (let i = 1; i < points.length; i++) {
    const left = points[i - 1];
    const right = points[i];
    if (!left || !right) return null;
    const [q0, p0] = left;
    const [q1, p1] = right;
    if (
      q0 === undefined ||
      p0 === undefined ||
      q1 === undefined ||
      p1 === undefined ||
      ![q0, p0, q1, p1].every(Number.isFinite) ||
      q1 <= q0
    )
      return null;
    if (flow >= q0 && flow <= q1)
      return p0 + ((p1 - p0) * (flow - q0)) / (q1 - q0);
  }
  return null;
}
