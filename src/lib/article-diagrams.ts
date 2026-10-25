import type { Locale } from '../i18n/index.ts';
import { paths } from '../components/Icon.tsx';

/** Preserve the authored coordinate system while making the whole diagram visible. */
export function diagramScale(available: number, authored: number): number {
  return available > 0 && authored > 0 && Number.isFinite(available + authored)
    ? Math.min(1, available / authored)
    : 1;
}

export function enhanceArticleDiagrams(root: HTMLElement, locale: Locale) {
  const labels = {
    'zh-hant': { expand: '放大閱讀', fit: '顯示全圖' },
    en: { expand: 'Read full size', fit: 'Fit diagram' },
    ja: { expand: '拡大して読む', fit: '全体を表示' },
  }[locale];
  const cleanups: (() => void)[] = [];
  for (const viewport of root.querySelectorAll<HTMLElement>(
    '.tg-dfd-scroll,.tg-svg-scroll,.np-diagram-scroll,.pg-figure-viewport',
  )) {
    const diagram = viewport.querySelector<HTMLElement | SVGSVGElement>(
      ':scope > .tg-dfd-canvas,:scope > svg',
    );
    const heading = viewport
      .closest('figure')
      ?.querySelector('.tg-figure-head,.np-figure-head,.pg-figure-head');
    if (!diagram || !heading) continue;
    const svg = diagram instanceof SVGSVGElement;
    const width = svg ? diagram.viewBox.baseVal.width : diagram.offsetWidth;
    if (!(width > 0)) continue;
    viewport.style.setProperty('--diagram-width', `${width}px`);
    const resize = () => {
      if (!svg)
        viewport.style.setProperty(
          '--diagram-scale',
          String(diagramScale(viewport.clientWidth, width)),
        );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    resize();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'article-diagram-toggle';
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [name, value] of Object.entries({
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.6',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      class: 'icon',
    }))
      icon.setAttribute(name, value);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paths['arrow-up-right']);
    icon.append(path);
    const label = document.createElement('span');
    label.textContent = labels.expand;
    button.append(icon, label);
    button.setAttribute('aria-pressed', 'false');
    const toggle = () => {
      const expanded = viewport.toggleAttribute('data-diagram-expanded');
      button.setAttribute('aria-pressed', String(expanded));
      label.textContent = expanded ? labels.fit : labels.expand;
      if (!expanded) viewport.scrollLeft = 0;
    };
    button.addEventListener('click', toggle);
    heading.append(button);
    cleanups.push(() => {
      observer.disconnect();
      button.removeEventListener('click', toggle);
      button.remove();
      viewport.removeAttribute('data-diagram-expanded');
      viewport.style.removeProperty('--diagram-width');
      viewport.style.removeProperty('--diagram-scale');
    });
  }
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
