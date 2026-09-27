import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/index.ts';
import { loadProfile } from '../../src/lib/content.server.ts';
import { localize } from '../../src/lib/localize.ts';
import brand from '../../data/brand-assets.json' with { type: 'json' };
import aboutMap from '../../data/migration/about-sections.json' with { type: 'json' };

// UI/UX spec v2.1 §4.3 and the package's design-tokens.css (semantic-dark.css blob 0b6fe8d).
const reference: Record<string, string> = {
  background: '#0b1020',
  surface: '#111a2b',
  'surface-raised': '#172337',
  'surface-selected': '#162c43',
  text: '#e6edf7',
  'text-secondary': '#b8c5d8',
  'text-muted': '#94a3b8',
  'action-primary': '#67d8ef',
  'action-hover': '#91e4f5',
  'action-ink': '#0b1020',
  focus: '#67d8ef',
  link: '#82aaff',
  'status-info': '#82aaff',
  'entity-kind': '#c099ff',
  'entity-file': '#5dd9c1',
  'status-success': '#7bd88f',
  'status-warning': '#f3c969',
  'status-danger': '#ff7a90',
  'control-border': '#657893',
  // Local additions, not reference values; the stylesheet labels them as such.
  'border-decorative': '#27364a',
  'overlay-scrim': '#0b1020b3',
  // Editor workbench layers (owner direction 2026-09-27), also local additions.
  chrome: '#070b16',
  sidebar: '#0a0f1d',
  'tab-inactive': '#090e1b',
  gutter: '#5b6b86',
  'syntax-marker': '#7a8aa6',
  'entity-folder': '#e0b565',
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
    expect(css).toMatch(
      /Local additions, not reference values: --color-border-decorative and\s+\* --color-overlay-scrim/,
    );
    expect(css).toMatch(/Editor workbench layers \(owner direction 2026-09-27/);
  });
  it('keep text, actions and entity colours above 4.5:1 on their surfaces', () => {
    for (const role of [
      'text',
      'text-secondary',
      'text-muted',
      'link',
      'entity-kind',
      'entity-file',
      'status-warning',
      'status-danger',
      'status-success',
    ])
      for (const surface of [
        'background',
        'surface',
        'surface-raised',
        'surface-selected',
        'chrome',
        'sidebar',
      ])
        expect(
          contrast(reference[role] ?? '', reference[surface] ?? ''),
          `${role} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(
        reference['action-ink'] ?? '',
        reference['action-primary'] ?? '',
      ),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(reference['action-ink'] ?? '', reference['action-hover'] ?? ''),
    ).toBeGreaterThanOrEqual(4.5);
    // Control boundaries and the focus ring are non-text indicators: 3:1.
    expect(
      contrast(reference['control-border'] ?? '', reference.background ?? ''),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrast(reference.focus ?? '', reference.background ?? ''),
    ).toBeGreaterThanOrEqual(3);
    // Markdown markers are read as text; line numbers are decoration but stay visible.
    for (const surface of ['background', 'surface', 'chrome'])
      expect(
        contrast(reference['syntax-marker'] ?? '', reference[surface] ?? ''),
      ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(reference.gutter ?? '', reference.background ?? ''),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrast(reference['entity-folder'] ?? '', reference.sidebar ?? ''),
    ).toBeGreaterThanOrEqual(4.5);
    // The status line's mode chip keeps dark ink on both mode colours.
    expect(
      contrast(
        reference['action-ink'] ?? '',
        reference['status-success'] ?? '',
      ),
    ).toBeGreaterThanOrEqual(4.5);
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
