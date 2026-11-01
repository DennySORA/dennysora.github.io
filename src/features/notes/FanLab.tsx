import '../../styles/fan-lab.css';
import { useId, useState } from 'react';
import type { Locale } from '../../i18n/index.ts';
import { fanLabCopy, measuredFanCopy } from './fan-lab-copy.ts';
import measuredData from './fan-measured-data.json';
import {
  measuredPressure,
  mmH2OToPa,
  cfmToM3h,
  scenarioLimits,
  scenarioOperatingPoint,
  scenarioPressure,
  type FanArrangement,
  type FanScenario,
  type FanShape,
} from './fan-lab-model.ts';

const format = (value: number) => value.toFixed(2);

/** Self-contained educational model; no product data, effects or persistence. */
function ScenarioLab({ locale }: { locale: Locale }) {
  const t = fanLabCopy[locale];
  const id = useId();
  const [flow, setFlow] = useState('80');
  const [pressure, setPressure] = useState('25');
  const [speed, setSpeed] = useState('1');
  const [shape, setShape] = useState<FanShape>('linear');
  const [arrangement, setArrangement] = useState<FanArrangement>('single');
  const [system, setSystem] = useState(false);
  const [resistance, setResistance] = useState('');
  const scenario: FanScenario = {
    flow: Number(flow),
    pressure: Number(pressure),
    speed: Number(speed),
    shape,
    arrangement,
  };
  const limits = scenarioLimits(scenario);
  const k = system && resistance.trim() ? Number(resistance) : null;
  const invalidK =
    system &&
    resistance.trim() !== '' &&
    (k === null || !Number.isFinite(k) || k <= 0 || k > 10);
  const point = !invalidK ? scenarioOperatingPoint(scenario, k) : null;
  const x = (q: number) => 60 + (q / (limits?.flow ?? 1)) * 520;
  const y = (p: number) => 280 - (p / (limits?.pressure ?? 1)) * 230;
  const fanPath = limits
    ? Array.from({ length: 81 }, (_, index) => {
        const q = (limits.flow * index) / 80;
        return `${index === 0 ? 'M' : 'L'}${x(q)},${y(scenarioPressure(scenario, q) ?? 0)}`;
      }).join(' ')
    : '';
  const systemPath =
    limits && point && k !== null
      ? Array.from({ length: 81 }, (_, index) => {
          const q =
            (Math.min(limits.flow, Math.sqrt(limits.pressure / k)) * index) /
            80;
          return `${index === 0 ? 'M' : 'L'}${x(q)},${y(k * q ** 2)}`;
        }).join(' ')
      : '';
  return (
    <section className="fan-lab" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{t.title}</h2>
      <p>{t.intro}</p>
      <noscript>
        <p>{t.noScript}</p>
      </noscript>
      <fieldset
        className="fan-lab-controls requires-js"
        aria-describedby={`${id}-validation`}
      >
        <legend>{t.controls}</legend>
        <label>
          {t.flow}
          <input
            type="number"
            min="0.01"
            max="1000"
            step="any"
            value={flow}
            onChange={(event) => setFlow(event.target.value)}
          />
        </label>
        <label>
          {t.pressure}
          <input
            type="number"
            min="0.01"
            max="1000"
            step="any"
            value={pressure}
            onChange={(event) => setPressure(event.target.value)}
          />
        </label>
        <label>
          {t.speed}
          <input
            type="number"
            min="0.01"
            max="1"
            step="0.05"
            value={speed}
            onChange={(event) => setSpeed(event.target.value)}
          />
        </label>
        <label>
          {t.shape}
          <select
            value={shape}
            onChange={(event) => setShape(event.target.value as FanShape)}
          >
            <option value="linear">{t.linear}</option>
            <option value="quadratic">{t.quadratic}</option>
          </select>
        </label>
        <label>
          {t.arrangement}
          <select
            value={arrangement}
            onChange={(event) =>
              setArrangement(event.target.value as FanArrangement)
            }
          >
            <option value="single">{t.single}</option>
            <option value="parallel">{t.parallel}</option>
            <option value="series">{t.series}</option>
          </select>
        </label>
        <label className="fan-lab-check">
          <input
            type="checkbox"
            checked={system}
            onChange={(event) => setSystem(event.target.checked)}
          />
          {t.system}
        </label>
        {system ? (
          <label>
            {t.k}
            <input
              type="number"
              min="0.000001"
              max="10"
              step="any"
              value={resistance}
              aria-describedby={`${id}-k-help`}
              onChange={(event) => setResistance(event.target.value)}
            />
          </label>
        ) : null}
      </fieldset>
      <p id={`${id}-k-help`}>{t.kHelp}</p>
      <p
        id={`${id}-validation`}
        className={!limits || invalidK ? 'fan-lab-error' : undefined}
        role="status"
      >
        {!limits || invalidK
          ? t.invalid
          : point
            ? `${t.result}: Q = ${format(point.flow)} CFM; ΔP = ${format(point.pressure)} Pa`
            : system
              ? t.pending
              : t.off}
      </p>
      {limits ? (
        <>
          <figure>
            <svg
              className="fan-lab-chart"
              viewBox="0 0 640 340"
              role="img"
              aria-labelledby={`${id}-chart-title ${id}-chart-description`}
            >
              <title id={`${id}-chart-title`}>{t.chart}</title>
              <desc id={`${id}-chart-description`}>
                {t.fan}. {systemPath ? t.resistance : t.off}{' '}
                {point
                  ? `${t.result}: ${format(point.flow)} CFM, ${format(point.pressure)} Pa.`
                  : ''}
              </desc>
              <path className="fan-lab-axis" d="M60,45 V280 H590" />
              <text x="60" y="24">
                {t.pressureAxis}
              </text>
              <text x="320" y="331" textAnchor="middle">
                {t.flowAxis}
              </text>
              <text x="50" y="296" textAnchor="end">
                0
              </text>
              <text x="580" y="301" textAnchor="end">
                {format(limits.flow)}
              </text>
              <text x="55" y="54" textAnchor="end">
                {format(limits.pressure)}
              </text>
              <path className="fan-lab-fan" d={fanPath} />
              {systemPath ? (
                <path className="fan-lab-system" d={systemPath} />
              ) : null}
              {point ? (
                <circle
                  className="fan-lab-point"
                  cx={x(point.flow)}
                  cy={y(point.pressure)}
                  r="6"
                />
              ) : null}
            </svg>
            <figcaption>
              {t.fan}
              {systemPath ? ` · ${t.resistance}` : ''}
            </figcaption>
          </figure>
          <div className="fan-lab-table">
            <table>
              <caption>{t.table}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.sample}</th>
                  <th scope="col">Q (CFM)</th>
                  <th scope="col">ΔP (Pa)</th>
                </tr>
              </thead>
              <tbody>
                {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => (
                  <tr key={fraction}>
                    <th scope="row">{index + 1}</th>
                    <td>{format(limits.flow * fraction)}</td>
                    <td>
                      {format(
                        scenarioPressure(scenario, limits.flow * fraction) ?? 0,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      <p>{t.limits}</p>
      <p>{t.assumptions}</p>
    </section>
  );
}

export function FanLab({ locale }: { locale: Locale }) {
  const t = measuredFanCopy[locale];
  const id = useId();
  const [selected, setSelected] = useState('cyb-204-100');
  const [probe, setProbe] = useState('40');
  const scan =
    measuredData.find((entry) => entry.id === selected) ?? measuredData[0];
  if (!scan) return null;
  const points = scan.points.map((row) => [row[0] ?? 0, row[1] ?? 0]);
  const qMax = Math.max(...points.map((row) => row[0] ?? 0));
  const pMin = Math.min(0, ...points.map((row) => row[1] ?? 0));
  const pMax = Math.max(...points.map((row) => row[1] ?? 0));
  const x = (q: number) => 65 + (q / qMax) * 515;
  const y = (p: number) => 275 - ((p - pMin) / (pMax - pMin)) * 220;
  const pressure = probe.trim()
    ? measuredPressure(points, Number(probe))
    : null;
  const path = points
    .map(
      (row, index) => `${index ? 'L' : 'M'}${x(row[0] ?? 0)},${y(row[1] ?? 0)}`,
    )
    .join(' ');
  const groups = [...new Set(measuredData.map((entry) => entry.name))];
  return (
    <div className="fan-lab">
      <section aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`}>{t.title}</h2>
        <p>{t.intro}</p>
        <p>{t.caveat}</p>
        <noscript>
          <p>{t.noScript}</p>
        </noscript>
        <div className="fan-lab-controls requires-js">
          <label>
            {t.select}
            <select
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              {groups.map((name) => (
                <optgroup key={name} label={name}>
                  {measuredData
                    .filter((entry) => entry.name === name)
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {t.report} {entry.report} · {t.setting} {entry.setting}%
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            {t.probe}
            <input
              type="number"
              step="any"
              min={points[0]?.[0] ?? 0}
              max={qMax}
              value={probe}
              onChange={(event) => setProbe(event.target.value)}
              aria-describedby={`${id}-probe`}
            />
          </label>
        </div>
        <h3>
          {scan.name} · {t.report} {scan.report} · {t.setting} {scan.setting}%
        </h3>
        <p>
          <a href={scan.url}>{t.source}</a> ·{' '}
          {scan.fresh ? t.fresh : t.archived}
        </p>
        <p id={`${id}-probe`} role="status">
          {pressure === null
            ? t.invalid
            : `${t.result}: Q = ${format(Number(probe))} CFM (${format(Number(probe) * cfmToM3h)} m³/h); ΔP = ${format(pressure)} mmH₂O (${format(pressure * mmH2OToPa)} Pa)`}
        </p>
        <figure>
          <svg
            className="fan-lab-chart"
            viewBox="0 0 640 335"
            role="img"
            aria-labelledby={`${id}-chart`}
          >
            <title id={`${id}-chart`}>
              {scan.name}: {t.chart}
            </title>
            <path className="fan-lab-axis" d="M65,45 V275 H590" />
            <text x="65" y="25">
              ΔP (mmH₂O)
            </text>
            <text x="320" y="325" textAnchor="middle">
              Q (CFM)
            </text>
            <text x="58" y="280" textAnchor="end">
              {format(pMin)}
            </text>
            <text x="58" y="58" textAnchor="end">
              {format(pMax)}
            </text>
            <text x="580" y="301" textAnchor="end">
              {format(qMax)}
            </text>
            <path className="fan-lab-fan" d={path} />
            {points.map((row, index) => (
              <circle
                key={index}
                className="fan-lab-point"
                cx={x(row[0] ?? 0)}
                cy={y(row[1] ?? 0)}
                r="4"
              />
            ))}
          </svg>
          <figcaption>{t.chart}</figcaption>
        </figure>
        <div className="fan-lab-table">
          <table>
            <caption>{t.table}</caption>
            <thead>
              <tr>
                <th scope="col">{t.flow} (CFM)</th>
                <th scope="col">{t.flow} (m³/h)</th>
                <th scope="col">{t.pressure} (mmH₂O)</th>
                <th scope="col">{t.pressure} (Pa)</th>
                <th scope="col">{t.rpm} (RPM)</th>
                <th scope="col">{t.current} (A)</th>
                <th scope="col">{t.power} (W)</th>
              </tr>
            </thead>
            <tbody>
              {scan.points.map((row, index) => (
                <tr key={index}>
                  <td>{row[0]}</td>
                  <td>{format((row[0] ?? 0) * cfmToM3h)}</td>
                  <td>{row[1]}</td>
                  <td>{format((row[1] ?? 0) * mmH2OToPa)}</td>
                  <td>{row[2] ?? '—'}</td>
                  <td>{row[3] ?? '—'}</td>
                  <td>{row[4] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <details className="fan-lab-sandbox">
        <summary>{t.sandbox}</summary>
        <ScenarioLab locale={locale} />
      </details>
    </div>
  );
}
