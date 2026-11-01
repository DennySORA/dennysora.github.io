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
    'zh-hant': {
      expand: '放大閱讀',
      fallback: '視窗未開啟？點此在新視窗開啟',
      window: '在獨立視窗開啟全尺寸圖表',
    },
    en: {
      expand: 'Read full size',
      fallback: 'Window did not open? Open in a new window',
      window: 'Open full-size diagram in a separate window',
    },
    ja: {
      expand: '拡大して読む',
      fallback: '開かない場合は新しいウィンドウで開く',
      window: '原寸の図を独立したウィンドウで開く',
    },
  }[locale];
  const cleanups: (() => void)[] = [];
  for (const viewport of root.querySelectorAll<HTMLElement>(
    '.tg-dfd-scroll,.tg-svg-scroll,.np-diagram-scroll,.pg-figure-viewport,.vp-diagram-scroller',
  )) {
    const diagram = viewport.querySelector<HTMLElement | SVGSVGElement>(
      ':scope > .tg-dfd-canvas,:scope > svg',
    );
    const heading = viewport
      .closest('figure')
      ?.querySelector(
        '.tg-figure-head,.np-figure-head,.pg-figure-head,figcaption',
      );
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
    button.setAttribute('aria-label', labels.window);
    const figure = viewport.closest('figure');
    if (!figure) continue;
    const copy = figure.cloneNode(true) as HTMLElement;
    const copiedViewport = copy.querySelector<HTMLElement>(
      '.tg-dfd-scroll,.tg-svg-scroll,.np-diagram-scroll,.pg-figure-viewport,.vp-diagram-scroller',
    );
    copiedViewport?.setAttribute('data-diagram-expanded', '');
    copiedViewport?.style.setProperty('--diagram-scale', '1');
    let context: HTMLElement = copy;
    for (
      let ancestor = figure.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      const wrapper = document.createElement('div');
      wrapper.className = `${ancestor.className} diagram-window-context`;
      wrapper.append(context);
      context = wrapper;
      if (ancestor === root) break;
    }
    const stylesheets = [
      ...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ]
      .map(({ href }) => href)
      .filter((href) => new URL(href).origin === location.origin);
    const blob = new Blob(
      [
        diagramWindowDocument(
          locale,
          heading.textContent?.trim() || labels.expand,
          stylesheets,
          context.outerHTML,
        ),
      ],
      { type: 'text/html' },
    );
    const url = URL.createObjectURL(blob);
    const fallback = document.createElement('a');
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.className = 'article-diagram-toggle';
    fallback.textContent = labels.fallback;
    fallback.hidden = true;
    const open = () => {
      // noopener intentionally returns no Window handle, even on success.
      // Always expose an ordinary link rather than misdiagnose popup blocking.
      window.open(
        url,
        '_blank',
        'popup=yes,noopener,noreferrer,width=1200,height=850,resizable=yes,scrollbars=yes',
      );
      fallback.hidden = false;
    };
    button.addEventListener('click', open);
    heading.append(button, fallback);
    cleanups.push(() => {
      observer.disconnect();
      button.removeEventListener('click', open);
      fallback.remove();
      URL.revokeObjectURL(url);
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

/** Only sanitized, already-rendered article markup is passed by the enhancer. */
export function diagramWindowDocument(
  locale: Locale,
  title: string,
  stylesheets: string[],
  markup: string,
): string {
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character]!,
    );
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https:; font-src https:; img-src https: data:; base-uri 'none'; form-action 'none'"><title>${escape(title)}</title>${stylesheets.map((href) => `<link rel="stylesheet" href="${escape(href)}">`).join('')}<style>body{margin:0;overflow:auto}.diagram-window-context{width:max-content!important;min-width:100%;max-width:none!important}.diagram-window{padding:24px;width:max-content;min-width:100%;box-sizing:border-box}.diagram-window figure{max-width:none}.diagram-window [data-diagram-expanded]{max-width:none;overflow:visible}</style></head><body><main class="diagram-window">${markup}</main></body></html>`;
}
