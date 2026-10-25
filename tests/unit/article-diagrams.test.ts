import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { diagramScale } from '../../src/lib/article-diagrams.ts';

describe('reader diagram sizing', () => {
  it('fits the complete fixed canvas without enlarging or losing its layout ratio', () => {
    for (const available of [280, 738, 880, 960, 1200]) {
      const scale = diagramScale(available, 960);
      expect(960 * scale).toBeLessThanOrEqual(available);
      expect(scale).toBeLessThanOrEqual(1);
      expect((1552 * scale) / (960 * scale)).toBeCloseTo(1552 / 960);
    }
    expect(diagramScale(0, 960)).toBe(1);
    expect(diagramScale(738, 0)).toBe(1);
  });
  it('does not force article SVGs wider than the reader', () => {
    for (const [file, selector] of [
      ['translation-guide', '.translation-guide .tg-svg-scroll svg'],
      ['network-guide', '.network-guide .np-diagram-scroll > svg'],
      ['privacy-guide', '.privacy-guide .pg-diagram'],
    ]) {
      const css = readFileSync(`src/styles/${file}.css`, 'utf8');
      const rule = css.slice(css.indexOf(`${selector} {`)).split('}')[0];
      expect(rule).toContain('min-width: 0;');
      expect(rule).toContain('width: 100%;');
      expect(rule).toContain('height: auto;');
    }
  });
});
