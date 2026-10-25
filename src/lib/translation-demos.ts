import type { Locale } from '../i18n/index.ts';
import {
  lookaheadMargins,
  readingMultipliers,
  type ReadingDirection,
  type ReadingLevel,
} from './article-demo-models.ts';
import { demoLabels } from './translation-demo-copy.ts';
export function enhanceTranslationDemos(
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
  for (const note of root.querySelectorAll<HTMLElement>('.tg-no-script-note')) {
    note.hidden = true;
    cleanups.push(() => {
      note.hidden = false;
    });
  }
  const look = find('tg-lookahead-controls');
  if (look) {
    const localOnly = create('p', label('localOnly'));
    look.append(localOnly);
    cleanups.push(() => localOnly.remove());
    const level = select(
      look,
      label('level'),
      (['idle', 'reading', 'fast'] as const).map((key) => [key, label(key)]),
      'reading',
    );
    const direction = select(
      look,
      label('direction'),
      (['down', 'up'] as const).map((key) => [key, label(key)]),
      'down',
    );
    const height = input(look, label('height'), 'number', 1, 4000, 1, 800),
      margin = input(look, label('base'), 'number', 0, 10000, 1, 1000);
    const update = () => {
      const state = level.value,
        dir = direction.value;
      if (
        !['idle', 'reading', 'fast'].includes(state) ||
        !['up', 'down'].includes(dir)
      )
        return;
      const result = lookaheadMargins(
          state as ReadingLevel,
          dir as ReadingDirection,
          height.valueAsNumber,
          margin.valueAsNumber,
        ),
        registration = lookaheadMargins(
          state as ReadingLevel,
          dir as ReadingDirection,
          height.valueAsNumber,
          margin.valueAsNumber,
          0.5,
        );
      if (
        !height.checkValidity() ||
        !margin.checkValidity() ||
        !result ||
        !registration
      ) {
        put('tg-look-status', label('invalid'));
        return;
      }
      const ahead = dir === 'down' ? 'bottom' : 'top',
        behind = dir === 'down' ? 'top' : 'bottom';
      put('tg-look-top', `${result.top} px`);
      put('tg-look-bottom', `${result.bottom} px`);
      put('tg-look-ahead', `${result[ahead]} px`);
      put('tg-look-registration', `${registration[ahead]} px`);
      put('tg-look-behind', `${result[behind]} px`);
      put(
        'tg-look-top-role',
        dir === 'down'
          ? text(
              '上方 · 閱讀後方',
              'Above · behind the reading direction',
              '上側・閲覧方向の後方',
            )
          : text(
              '上方 · 閱讀前方',
              'Above · ahead of the reading direction',
              '上側・閲覧方向の前方',
            ),
      );
      put(
        'tg-look-bottom-role',
        dir === 'down'
          ? text(
              '下方 · 閱讀前方',
              'Below · ahead of the reading direction',
              '下側・閲覧方向の前方',
            )
          : text(
              '下方 · 閱讀後方',
              'Below · behind the reading direction',
              '下側・閲覧方向の後方',
            ),
      );
      put(
        'tg-look-height-label',
        `${label('height')} = ${height.valueAsNumber} px`,
      );
      const multiplier = readingMultipliers[state as ReadingLevel];
      put(
        'tg-look-status',
        margin.valueAsNumber === 0
          ? label('zero')
          : text(
              `${label(state as ReadingLevel)}：前方 ${multiplier} 個畫面高度；段落註冊多 0.5 個畫面高度。兩者仍受設定邊距與 10000px 上限影響。`,
              `${label(state as ReadingLevel)}: ${multiplier} viewport heights ahead, plus 0.5 for paragraph registration. Both remain subject to the configured margin and 10000px cap.`,
              `${label(state as ReadingLevel)}：前方 ${multiplier} 画面分。段落登録はさらに 0.5 画面分先行する。どちらにも設定したマージンと 10000px の上限が適用される。`,
            ),
      );
    };
    for (const control of [level, direction, height, margin])
      listen(control, 'input', update);
    update();
  }
  for (const container of root.querySelectorAll<HTMLElement>(
    '.tg-svg-scroll',
  )) {
    const svg = container.querySelector('svg'),
      head = container
        .closest('figure')
        ?.querySelector<HTMLElement>('.tg-figure-head');
    if (!svg || !head) continue;
    const urls = new Set<string>();
    const download = button(head, label('download'), () => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      const originals = [svg, ...svg.querySelectorAll('*')],
        copies = [clone, ...clone.querySelectorAll('*')];
      const properties = [
        'fill',
        'stroke',
        'stroke-width',
        'stroke-dasharray',
        'stroke-linejoin',
        'stroke-linecap',
        'font-family',
        'font-size',
        'font-weight',
        'text-anchor',
      ];
      for (const [i, original] of originals.entries()) {
        const copy = copies[i];
        if (!copy) continue;
        const style = getComputedStyle(original);
        for (const property of properties)
          copy.setAttribute(property, style.getPropertyValue(property));
      }
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(clone)], {
          type: 'image/svg+xml;charset=utf-8',
        }),
      );
      urls.add(url);
      const link = create('a');
      link.href = url;
      link.download = `translation-${svg.id || 'diagram'}-${locale}.svg`;
      document.body.append(link);
      link.click();
      link.remove();
      // Revoke on a timer and on teardown; exports cannot leak object URLs indefinitely.
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        urls.delete(url);
      }, 1500);
      cleanups.push(() => clearTimeout(timer));
    });
    download.setAttribute(
      'aria-label',
      `${label('download')}: ${svg.querySelector('title')?.textContent ?? ''}`,
    );
    cleanups.push(() => {
      for (const url of urls) URL.revokeObjectURL(url);
    });
  }
  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}
