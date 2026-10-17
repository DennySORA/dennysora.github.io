import type { Locale } from '../../i18n/index.ts';
import { collectionToolCopy } from './note-tool-copy.ts';

// Progressive enhancement only: no requests of its own, storage or telemetry.
// The static markup already shows every photo guide and each tool's default
// result, and a grid's extra audio loads only once the reader plays its video.

/** Hyperfocal distance H = f²/(N·c) + f; focused at H, the near limit is H/2 (all mm). */
export function hyperfocal(focal: number, aperture: number, coc: number) {
  const h = (focal * focal) / (aperture * coc) + focal;
  return { h, near: h / 2 };
}

/** An ND filter of n stops multiplies the exposure time by 2ⁿ at the same aperture and ISO. */
export function ndExposure(seconds: number, stops: number) {
  const factor = 2 ** stops;
  return { factor, seconds: seconds * factor };
}

export function enhanceCollectionNote(
  root: HTMLElement,
  locale: Locale = 'zh-hant',
): () => void {
  const t = collectionToolCopy[locale];
  const abort = new AbortController();
  const { signal } = abort;
  const get = <T extends Element = HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`);
  const set = (id: string, text: string) => {
    const el = get(id);
    if (el) el.textContent = text;
  };
  const listen = (id: string, event: string, callback: () => void) =>
    get(id)?.addEventListener(event, callback, { signal });

  // Photo guides: one toggle per photo, plus layer switches for the whole note.
  const toggles = Array.from(
    root.querySelectorAll<HTMLButtonElement>('button[data-guides]'),
  );
  const showGuides = (button: HTMLButtonElement, shown: boolean) => {
    button.setAttribute('aria-pressed', String(shown));
    // The overlay is an <svg>, which has no `hidden` property: set the attribute.
    get<SVGSVGElement>(button.dataset['guides'] ?? '')?.toggleAttribute(
      'hidden',
      !shown,
    );
  };
  for (const button of toggles)
    button.addEventListener(
      'click',
      () => showGuides(button, button.getAttribute('aria-pressed') !== 'true'),
      { signal },
    );
  const layers = () => {
    root.toggleAttribute(
      'data-hide-thirds',
      get<HTMLInputElement>('pg-thirds')?.checked === false,
    );
    root.toggleAttribute(
      'data-hide-marks',
      get<HTMLInputElement>('pg-marks')?.checked === false,
    );
  };
  listen('pg-thirds', 'change', layers);
  listen('pg-marks', 'change', layers);
  listen('pg-guides-reset', 'click', () => {
    for (const id of ['pg-thirds', 'pg-marks']) {
      const box = get<HTMLInputElement>(id);
      if (box) box.checked = true;
    }
    for (const button of toggles) showGuides(button, true);
    layers();
  });

  // Hyperfocal distance from the chosen focal length, aperture and blur circle.
  const hyper = () => {
    const value = (id: string) => Number(get<HTMLSelectElement>(id)?.value);
    const { h, near } = hyperfocal(
      value('pg-focal'),
      value('pg-aperture'),
      value('pg-coc'),
    );
    if (!Number.isFinite(h)) return;
    set('pg-hyper', `${(h / 1000).toFixed(2)} m`);
    set('pg-near', t.near((near / 1000).toFixed(2)));
  };
  for (const id of ['pg-focal', 'pg-aperture', 'pg-coc'])
    listen(id, 'change', hyper);
  // A restored form state may differ from the static default result.
  if (get('pg-hyper')) hyper();

  // ND exposure time, assuming accurate stops at an unchanged aperture and ISO.
  const nd = () => {
    const base = Number(get<HTMLSelectElement>('pg-shutter')?.value);
    const stops = Number(get<HTMLSelectElement>('pg-stops')?.value);
    if (!Number.isFinite(base) || !Number.isFinite(stops)) return;
    const { factor, seconds } = ndExposure(base, stops);
    set(
      'pg-nd-time',
      seconds < 60
        ? `${seconds.toFixed(2)} s`
        : `${(seconds / 60).toFixed(2)} min`,
    );
    set('pg-nd-factor', `×${factor.toLocaleString('en-US')}`);
  };
  for (const id of ['pg-shutter', 'pg-stops']) listen(id, 'change', nd);
  if (get('pg-nd-time')) nd();

  // Photo index: optionally show only the photos marked for revision.
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-grade]'));
  const archive = () => {
    const only = get<HTMLInputElement>('pg-archive-filter')?.checked === true;
    let shown = 0;
    for (const card of cards) {
      card.hidden = only && card.dataset['grade'] !== 'revise';
      if (!card.hidden) shown++;
    }
    set('pg-archive-count', t.archiveCount(shown, cards.length));
  };
  if (cards.length) {
    listen('pg-archive-filter', 'change', archive);
    archive();
  }
  if (get('pg-thirds')) layers();

  // Comparison grids: one video, one audio track per tile. The video's own
  // track is the top-left tile; another tile's <audio> follows the video while
  // the video is muted. Nothing loads before the reader presses play.
  for (const grid of root.querySelectorAll<HTMLElement>('[data-grid]')) {
    const video = grid.querySelector('video');
    if (!video) continue;
    const tracks = new Map(
      Array.from(
        grid.querySelectorAll<HTMLAudioElement>('audio[data-tile]'),
        (audio) => [Number(audio.dataset['tile']), audio] as const,
      ),
    );
    const buttons = Array.from(
      grid.querySelectorAll<HTMLButtonElement>('button[data-audio]'),
    );
    let active = 0;
    const sync = () => {
      const audio = tracks.get(active);
      if (!audio) return;
      if (Math.abs(audio.currentTime - video.currentTime) > 0.12)
        audio.currentTime = video.currentTime;
      audio.playbackRate = video.playbackRate;
      audio.volume = video.volume;
      if (video.paused) audio.pause();
      else if (audio.paused) audio.play().catch(() => undefined);
    };
    const select = (tile: number) => {
      active = tile;
      for (const audio of tracks.values()) audio.pause();
      video.muted = tile !== 0;
      for (const button of buttons)
        button.setAttribute(
          'aria-pressed',
          String(Number(button.dataset['audio']) === tile),
        );
      sync();
    };
    for (const name of ['play', 'pause', 'seeked', 'timeupdate', 'ratechange'])
      video.addEventListener(name, sync, { signal });
    // Unmuting in the player returns to the video's own track, so two tracks
    // never play at once.
    video.addEventListener(
      'volumechange',
      () => {
        if (!video.muted && active !== 0) select(0);
        else sync();
      },
      { signal },
    );
    for (const button of buttons)
      button.addEventListener(
        'click',
        () => select(Number(button.dataset['audio'])),
        { signal },
      );
  }

  // Content tabs: without JavaScript every panel shows and the tab row is a
  // table of contents. Here it becomes an ARIA tablist that shows one panel;
  // the URL keeps the open tab, so a link or a reload returns to it.
  const tabs = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('[data-tabs] a[href^="#"]'),
  );
  const panelOf = (tab: HTMLAnchorElement) =>
    Array.from(root.querySelectorAll<HTMLElement>('.sn-tabpanel')).find(
      (panel) => `#${panel.id}` === tab.hash,
    );
  const showTab = (index: number) =>
    tabs.forEach((tab, at) => {
      tab.setAttribute('aria-selected', String(at === index));
      tab.tabIndex = at === index ? 0 : -1;
      const panel = panelOf(tab);
      if (panel) panel.hidden = at !== index;
    });
  const openTab = (index: number, focus: boolean) => {
    const tab = tabs[index];
    if (!tab) return;
    showTab(index);
    if (focus) tab.focus();
    history.replaceState(history.state, '', tab.hash);
    // Start the new panel at its top when the page is scrolled past it.
    const panel = panelOf(tab);
    if (panel && panel.getBoundingClientRect().top < 0)
      panel.scrollIntoView({ block: 'start' });
  };
  tabs[0]?.parentElement?.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    const panel = panelOf(tab);
    tab.setAttribute('role', 'tab');
    if (panel) {
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
    }
    tab.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        openTab(index, false);
      },
      { signal },
    );
    tab.addEventListener(
      'keydown',
      (event) => {
        const next = {
          ArrowRight: index + 1,
          ArrowLeft: index - 1,
          Home: 0,
          End: tabs.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        openTab((next + tabs.length) % tabs.length, true);
      },
      { signal },
    );
  });
  if (tabs.length) showTab(0);

  // A link into a folded section opens it, and a filtered card comes back.
  const openHash = () => {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const el = Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(
      (node) => node.id === id,
    );
    if (!el) return;
    // A link into another tab opens that tab first.
    const panel = el.closest<HTMLElement>('.sn-tabpanel');
    const tab = panel ? tabs.findIndex((item) => panelOf(item) === panel) : -1;
    if (tab >= 0) showTab(tab);
    if (el.closest<HTMLElement>('[data-grade]')?.hidden) {
      const filter = get<HTMLInputElement>('pg-archive-filter');
      if (filter) filter.checked = false;
      archive();
    }
    let node: HTMLElement | null = el;
    while (node && node !== root) {
      if (node instanceof HTMLDetailsElement) node.open = true;
      node = node.parentElement;
    }
    el.scrollIntoView({ block: 'start' });
  };
  window.addEventListener('hashchange', openHash, { signal });
  if (location.hash) openHash();
  return () => {
    abort.abort();
    for (const audio of root.querySelectorAll('audio')) audio.pause();
    root.removeAttribute('data-hide-thirds');
    root.removeAttribute('data-hide-marks');
  };
}
