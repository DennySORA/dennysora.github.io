import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  diagramScale,
  diagramWindowDocument,
} from '../../src/lib/article-diagrams.ts';

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

describe('full-size diagram window', () => {
  it('preserves markup and locale while escaping the window title and stylesheet URL', () => {
    const markup =
      '<figure><svg viewBox="0 0 960 600"><text>Original diagram</text></svg></figure>';
    for (const locale of ['zh-hant', 'en', 'ja'] as const) {
      const html = diagramWindowDocument(
        locale,
        '<script>alert(1)</script>',
        ['https://dennysora.me/assets/site.css?x="test"'],
        markup,
      );
      expect(html).toContain(`<html lang="${locale}">`);
      expect(html).toContain(markup);
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(html).toContain('&quot;test&quot;');
      expect(html).toContain("default-src 'none'");
      expect(html).not.toContain('<script>');
    }
  });
  it('opens only on a click and provides a safe ordinary fallback link', () => {
    const source = readFileSync('src/lib/article-diagrams.ts', 'utf8');
    expect(source).toContain("button.addEventListener('click', open)");
    expect(source).toContain('popup=yes,noopener,noreferrer');
    expect(source).toContain("fallback.rel = 'noopener noreferrer'");
    expect(source).toContain('fallback.hidden = false');
    expect(source).toContain('URL.revokeObjectURL(url)');
    expect(source).not.toContain('viewport.toggleAttribute');
    expect(source).not.toContain('aria-pressed');
  });
});
