import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/index.ts';
import { loadProfile } from '../../src/lib/content.server.ts';
import { localize } from '../../src/lib/localize.ts';
import brand from '../../data/brand-assets.json' with { type: 'json' };
import aboutMap from '../../data/migration/about-sections.json' with { type: 'json' };

// docs/DESIGN.md §2: Noir Workbench canonical roles mapped into the site's
// token names, plus the marked local editor-syntax additions.
const reference: Record<string, string> = {
  chrome: '#080c12',
  sidebar: '#080c12',
  'tab-inactive': '#080c12',
  background: '#0c1118',
  surface: '#131c27',
  'surface-raised': '#1b2736',
  'surface-overlay': '#233246',
  'surface-selected': '#233d59',
  'border-subtle': '#253141',
  'border-decorative': '#35465c',
  'border-strong': '#526780',
  'control-border': '#8193ad',
  text: '#e6edf5',
  'text-secondary': '#b8c5d6',
  'text-muted': '#a0b0c5',
  'text-disabled': '#748299',
  'action-primary': '#8ab8f5',
  'action-hover': '#a2cbff',
  'action-active': '#6ea0e4',
  'action-ink': '#08111e',
  link: '#96c3ff',
  focus: '#b2d5ff',
  'status-info': '#91c6ff',
  'entity-kind': '#ccafff',
  'entity-file': '#83d8cf',
  'entity-folder': '#91c6ff',
  'status-success': '#9bd2ac',
  'status-warning': '#edca8b',
  'status-danger': '#ffa8a1',
  'danger-fill': '#ffaaa5',
  gutter: '#5f6f86',
  'syntax-marker': '#8593a8',
  'syntax-constant': '#f2b48a',
  'overlay-scrim': '#000000ad',
};

function luminance(hex: string) {
  const channels = [1, 3, 5].map(
    (index) => parseInt(hex.slice(index, index + 2), 16) / 255,
  );
  const [r = 0, g = 0, b = 0] = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(foreground: string, background: string) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}
const pair = (foreground: string, background: string) =>
  contrast(reference[foreground] ?? '', reference[background] ?? '');

describe('semantic dark tokens', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf8');
  const tokens = Object.fromEntries(
    [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6,8});/g)].map(
      (match): [string, string] => [match[1] ?? '', match[2] ?? ''],
    ),
  );
  it('match the specified values exactly and in one theme owner', () => {
    expect(tokens).toEqual(reference);
    expect(css).toContain('@theme static');
    expect(css).toMatch(/Owner direction 2026-10-04/);
    expect(css).toMatch(
      /Local additions, not canonical values: --color-entity-folder,\s+\* --color-gutter, --color-syntax-marker, --color-syntax-constant and\s+\* --color-overlay-scrim/,
    );
  });
  it('keep text, actions and entity colours above 4.5:1 on every surface', () => {
    for (const role of [
      'text',
      'text-secondary',
      'text-muted',
      'link',
      'status-info',
      'entity-kind',
      'entity-file',
      'entity-folder',
      'status-warning',
      'status-danger',
      'status-success',
      'syntax-constant',
    ])
      for (const surface of [
        'chrome',
        'background',
        'surface',
        'surface-raised',
        'surface-overlay',
        'surface-selected',
      ])
        expect(
          pair(role, surface),
          `${role} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
    // Dark ink on every light fill: primary, its hover and pressed states,
    // the INSERT and VISUAL mode chips and the danger chip.
    for (const fill of [
      'action-primary',
      'action-hover',
      'action-active',
      'status-success',
      'entity-kind',
      'danger-fill',
    ])
      expect(pair('action-ink', fill), `ink on ${fill}`).toBeGreaterThanOrEqual(
        4.5,
      );
    // Control boundaries and the focus ring are non-text indicators: 3:1.
    for (const surface of ['chrome', 'background', 'surface-selected']) {
      expect(pair('control-border', surface)).toBeGreaterThanOrEqual(3);
      expect(pair('focus', surface)).toBeGreaterThanOrEqual(3);
    }
    // Markdown markers are read as text; line numbers are decoration but stay visible.
    for (const surface of ['background', 'surface', 'chrome']) {
      expect(pair('syntax-marker', surface)).toBeGreaterThanOrEqual(4.5);
      expect(pair('gutter', surface)).toBeGreaterThanOrEqual(3);
    }
  });
});

// PNG keeps its size in IHDR; an extended (VP8X) WebP stores canvas size minus one.
function dimensions(bytes: Buffer): [number, number] {
  if (bytes.toString('ascii', 12, 16) === 'VP8X')
    return [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe('brand assets', () => {
  it('are the recorded repository files, unchanged', () => {
    for (const asset of brand.assets) {
      const bytes = readFileSync(asset.path);
      const blob = createHash('sha1')
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest('hex');
      expect(blob, asset.path).toBe(asset.gitBlob);
      expect(bytes.length, asset.path).toBe(asset.bytes);
      expect(dimensions(bytes), asset.path).toEqual([
        asset.width,
        asset.height,
      ]);
    }
    expect(
      brand.assets.find((asset) => asset.path === 'assets/logo_full.png')
        ?.published,
    ).toBe(false);
  });
});

describe('structured About content', () => {
  const profile = loadProfile();
  it('preserves every published résumé item in every language', () => {
    for (const locale of locales) {
      const text = JSON.stringify(localize(profile, locale));
      const source = readFileSync(`content/profile/${locale}.md`, 'utf8');
      const items = [...source.matchAll(/^- (.+)$/gm)].map(
        (match) => match[1]?.trim() ?? '',
      );
      expect(items.length).toBeGreaterThan(60);
      for (const item of items)
        expect(text, `${locale}: ${item}`).toContain(
          JSON.stringify(item).slice(1, -1),
        );
    }
  });
  it('maps every former section to a new home and records what was withheld', () => {
    const anchors = aboutMap.sections.map((section) => section.legacyAnchor);
    expect(anchors).toEqual([
      'skills-h',
      'exp-h',
      'edu-h',
      'depth-h',
      'beyond-h',
      'proj-h',
      'comm-h',
      'notes-h',
    ]);
    const withheld = aboutMap.sections.flatMap((section) =>
      'withheld' in section ? section.withheld : [],
    );
    const published = JSON.stringify(profile.record.openSource);
    for (const item of withheld) expect(published).not.toContain(item.item);
    expect(JSON.stringify(profile)).not.toMatch(/★|v[1-4]\.0\.0/);
  });
  it('labels skills only with evidenced levels and keeps study apart from work', () => {
    for (const competency of profile.competencies)
      expect(competency.tools.length).toBeLessThanOrEqual(6);
    const study = profile.experience.find((entry) => entry.id === 'naganuma');
    expect(study).toMatchObject({
      kind: 'education',
      current: true,
      endDate: null,
    });
    expect(
      profile.experience
        .filter((entry) => entry.kind === 'work')
        .every((entry) => entry.endDate),
    ).toBe(true);
  });
});
