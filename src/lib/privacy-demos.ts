import type { Locale } from '../i18n/index.ts';
import {
  candidatePrecision,
  tracePath,
  traceView,
  traceWindowSeconds,
} from './article-demo-models.ts';
import {
  demoLabels,
  mixCopy,
  routeCopy,
  tunnelCopy,
} from './privacy-demo-copy.ts';

/** Trusted, local-only enhancement. Uploaded markup never supplies handlers or code. */
export function enhancePrivacyDemos(
  root: HTMLElement,
  locale: Locale,
): () => void {
  const cleanups: (() => void)[] = [];
  const text = (zh: string, en: string, ja: string) =>
    ({ 'zh-hant': zh, en, ja })[locale];
  const label = (key: keyof typeof demoLabels) => demoLabels[key][locale];
  const find = (id: string) => root.querySelector<HTMLElement>(`#${id}`);
  const put = (id: string, value: string) => {
    const element = find(id);
    if (element) element.textContent = value;
  };
  const listen = (
    target: EventTarget,
    type: string,
    callback: EventListener,
  ) => {
    target.addEventListener(type, callback);
    cleanups.push(() => target.removeEventListener(type, callback));
  };
  const create = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    value = '',
  ) => {
    const element = document.createElement(tag);
    element.textContent = value;
    return element;
  };
  const button = (parent: HTMLElement, value: string, click: () => void) => {
    const element = create('button', value);
    element.type = 'button';
    listen(element, 'click', click);
    parent.append(element);
    cleanups.push(() => element.remove());
    return element;
  };
  const field = (
    parent: HTMLElement,
    title: string,
    control: HTMLInputElement | HTMLSelectElement,
  ) => {
    const element = create('label', title);
    element.append(control);
    parent.append(element);
    cleanups.push(() => element.remove());
  };
  const select = (
    parent: HTMLElement,
    title: string,
    options: readonly (readonly [string, string])[],
    initial: string,
  ) => {
    const element = create('select');
    for (const [value, name] of options) {
      const option = create('option', name);
      option.value = value;
      element.append(option);
    }
    element.value = initial;
    field(parent, title, element);
    return element;
  };
  const input = (
    parent: HTMLElement,
    title: string,
    type: 'range' | 'number',
    min: number,
    max: number,
    step: number,
    value: number,
  ) => {
    const element = create('input');
    Object.assign(element, {
      type,
      min: String(min),
      max: String(max),
      step: String(step),
      value: String(value),
    });
    field(parent, title, element);
    return element;
  };
  for (const note of root.querySelectorAll<HTMLElement>('.pg-no-script-note')) {
    note.hidden = true;
    cleanups.push(() => {
      note.hidden = false;
    });
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stopMotions: (() => void)[] = [];
  const motionByFigure = new Map<string, () => void>();
  const stopAll = () => {
    for (const stop of stopMotions) stop();
  };
  listen(document, 'visibilitychange', () => {
    if (document.hidden) stopAll();
  });
  listen(window, 'pagehide', stopAll);
  listen(reduced, 'change', () => {
    if (reduced.matches) stopAll();
  });
  cleanups.push(stopAll);

  const routes = find('pg-route-controls');
  if (routes) {
    routes.setAttribute('aria-label', label('route'));
    const buttons = new Map<keyof typeof routeCopy, HTMLButtonElement>();
    const show = (mode: keyof typeof routeCopy) => {
      const data = routeCopy[mode];
      for (const [key, element] of buttons)
        element.setAttribute('aria-pressed', String(key === mode));
      const path = find('pg-route-path'),
        observations = find('pg-route-observation');
      if (path)
        path.replaceChildren(
          ...data.nodes.map(([title, description, endpoint]) => {
            const node = create('div');
            node.className = 'pg-route-node';
            const detail = create('small', description[locale]),
              address = create('span', endpoint[locale]);
            address.className = 'pg-mono';
            node.append(create('strong', title[locale]), detail, address);
            return node;
          }),
        );
      if (observations)
        observations.replaceChildren(
          ...data.observers.flatMap(([title, description]) => [
            create('p', title[locale]),
            create('p', description[locale]),
          ]),
        );
      put('pg-route-summary', data.summary[locale]);
    };
    for (const mode of ['direct', 'vpn', 'multi'] as const)
      buttons.set(
        mode,
        button(routes, label(mode), () => show(mode)),
      );
    show('vpn');
  }
  const tunnel = find('pg-tunnel-controls');
  if (tunnel) {
    let down = false;
    const toggle = button(tunnel, label('tunnelDown'), () => {
      down = !down;
      toggle.setAttribute('aria-pressed', String(down));
      toggle.textContent = label(down ? 'tunnelUp' : 'tunnelDown');
      const state = tunnelCopy[down ? 'down' : 'up'];
      for (const [i, id] of [
        'pg-wg-state',
        'pg-tunnel-explain',
        'pg-tunnel-status',
      ].entries())
        put(id, state[i]?.[locale] ?? '');
      find('pg-transport')?.classList.toggle('pg-tunnel-down', down);
    });
    toggle.setAttribute('aria-pressed', 'false');
    const note = create('span', label('simulationOnly'));
    tunnel.append(note);
    cleanups.push(() => note.remove());
  }
  const trace = find('pg-trace-controls');
  if (trace) {
    const mode = select(
      trace,
      label('traceMode'),
      (['same', 'other', 'aggregate'] as const).map((key) => [key, label(key)]),
      'same',
    );
    const lag = input(trace, label('lag'), 'range', 0, 6, 1, 0);
    lag.setAttribute('aria-describedby', 'pg-trace-limit');
    let timer: ReturnType<typeof setInterval> | undefined;
    const cursor = find('pg-trace-cursor'),
      line = find('pg-trace-cursor-line');
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
      play.textContent = label('playTrace');
    };
    const setCursor = (fraction: number) => {
      const x = (62 + Math.min(1, Math.max(0, fraction)) * 674).toFixed(2);
      cursor?.style.setProperty('visibility', 'visible');
      line?.setAttribute('d', `M${x} 40L${x} 335`);
    };
    const play = button(trace, label('playTrace'), () => {
      if (timer !== undefined) {
        stop();
        put('pg-trace-clock', label('stopped'));
        return;
      }
      if (reduced.matches) {
        setCursor(1);
        put('pg-trace-clock', label('reduced'));
        return;
      }
      const started = performance.now();
      play.textContent = label('stopTrace');
      setCursor(0);
      timer = setInterval(() => {
        const fraction = Math.min(1, (performance.now() - started) / 5000);
        setCursor(fraction);
        put(
          'pg-trace-clock',
          text(
            `示意時間：${(fraction * 20).toFixed(1)} / 20.0 s`,
            `Illustrative time: ${(fraction * 20).toFixed(1)} / 20.0 s`,
            `模式時間：${(fraction * 20).toFixed(1)} / 20.0 s`,
          ),
        );
        if (fraction >= 1) stop();
      }, 50);
    });
    const pauseTrace = () => {
      if (timer !== undefined) {
        stop();
        put('pg-trace-clock', label('stopped'));
      }
    };
    stopMotions.push(pauseTrace);
    motionByFigure.set('pg-trace-figure', pauseTrace);
    const update = () => {
      stop();
      const name = mode.value;
      if (name !== 'same' && name !== 'other' && name !== 'aggregate') return;
      const data = traceView(name, lag.valueAsNumber),
        seconds = (data.lag * traceWindowSeconds).toFixed(1);
      lag.setAttribute('aria-valuetext', `${seconds} s`);
      find('pg-trace-y')?.setAttribute('d', tracePath(data.y, 225));
      put(
        'pg-trace-correlation',
        data.correlation === null
          ? label('undefined')
          : `${data.correlation.toFixed(3)} (${label('noProbability')})`,
      );
      put('pg-trace-clock', `${label('notPlayed')} · ${seconds} s`);
      cursor?.style.setProperty('visibility', 'hidden');
      put(
        'pg-trace-svg-desc',
        text(
          `合成教學資料：40 個半秒時間窗，共用 0–320 KiB/s 縱軸。出口模式：${label(name)}；向前對齊 ${seconds} 秒。r 是特徵相似度，並非配對機率。`,
          `Synthetic teaching data: 40 half-second windows and a shared 0–320 KiB/s scale. Egress mode: ${label(name)}; aligned ${seconds} seconds earlier. r measures feature similarity, not matching probability.`,
          `教育用の合成データ：0.5 秒の時間窓が 40 個、縦軸は共通の 0～320 KiB/s。出口モード：${label(name)}。${seconds} 秒前に合わせる。r は特徴の類似度であり、対応する確率ではない。`,
        ),
      );
    };
    listen(mode, 'change', update);
    listen(lag, 'input', update);
    update();
  }
  const base = find('pg-base-controls');
  if (base) {
    const n = select(
      base,
      label('n'),
      [1001, 10001, 100001, 1000001].map((value) => [
        String(value),
        value.toLocaleString('en-US'),
      ]),
      '1000001',
    );
    const fpr = select(
      base,
      label('fpr'),
      [
        ['0.001', '0.1% (10⁻³)'],
        ['0.0001', '0.01% (10⁻⁴)'],
        ['0.00001', '0.001% (10⁻⁵)'],
        ['0.000001', '0.0001% (10⁻⁶)'],
      ],
      '0.00001',
    );
    const tpr = input(base, label('tpr'), 'range', 10, 100, 5, 90);
    const update = () => {
      const result = candidatePrecision(
        Number(n.value),
        Number(fpr.value),
        tpr.valueAsNumber / 100,
      );
      if (!result) return;
      const percent = (result.ppv ?? 0) * 100;
      tpr.setAttribute('aria-valuetext', `${tpr.value}%`);
      put('pg-base-tp', result.tp.toFixed(2));
      put(
        'pg-base-fp',
        result.fp.toLocaleString(locale === 'zh-hant' ? 'zh-TW' : locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
      put(
        'pg-base-ppv',
        result.ppv === null ? label('undefined') : `${percent.toFixed(2)}%`,
      );
      find('pg-base-share')?.style.setProperty('width', `${percent}%`);
      find('pg-base-bar')?.setAttribute(
        'aria-label',
        text(
          `被標記候選中的模型比例：真配對 ${percent.toFixed(2)}%，錯誤候選 ${(100 - percent).toFixed(2)}%。`,
          `Model proportions among flagged candidates: true matches ${percent.toFixed(2)}%, false candidates ${(100 - percent).toFixed(2)}%.`,
          `検出された候補に占めるモデル上の割合：真の対応 ${percent.toFixed(2)}%、誤った候補 ${(100 - percent).toFixed(2)}%。`,
        ),
      );
    };
    listen(n, 'change', update);
    listen(fpr, 'change', update);
    listen(tpr, 'input', update);
    update();
  }
  const mix = find('pg-mix-controls');
  if (mix) {
    let stage = 2,
      timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      clearTimeout(timer);
      timer = undefined;
      play.textContent = label('playMix');
    };
    const show = (value: number) => {
      stage = value;
      const data = mixCopy[value];
      if (!data) return;
      put('pg-mix-center-label', data.center[locale]);
      put('pg-mix-output-label', data.label[locale]);
      const output = find('pg-mix-output');
      if (output && value === 2)
        output.replaceChildren(
          ...['C₁', 'A₁', 'D', 'B₁', 'A₂'].map((token) => {
            const span = create('span', token);
            span.className = 'pg-mix-token';
            return span;
          }),
        );
      else put('pg-mix-output', data.output[locale]);
      put('pg-mix-status', data.text[locale]);
      next.textContent = label(stage === 2 ? 'first' : 'next');
    };
    const next = button(mix, label('first'), () => {
      stop();
      show((stage + 1) % 3);
    });
    const play = button(mix, label('playMix'), () => {
      if (timer !== undefined) {
        stop();
        return;
      }
      if (reduced.matches) {
        show(2);
        put('pg-mix-status', `${mixCopy[2].text[locale]} ${label('reduced')}`);
        return;
      }
      show(0);
      play.textContent = label('pause');
      const advance = () => {
        show(stage + 1);
        if (stage < 2) timer = setTimeout(advance, 1500);
        else stop();
      };
      timer = setTimeout(advance, 1500);
    });
    button(mix, label('reset'), () => {
      stop();
      show(0);
    });
    stopMotions.push(stop);
    motionByFigure.set('pg-mix-figure', stop);
    show(2);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries)
        if (!entry.isIntersecting) motionByFigure.get(entry.target.id)?.();
    });
    for (const id of ['pg-trace-figure', 'pg-mix-figure']) {
      const element = find(id);
      if (element) observer.observe(element);
    }
    cleanups.push(() => observer.disconnect());
  }
  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}
