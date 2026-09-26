import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  renderMarkdown,
  slugifyHeading,
} from '../../src/lib/markdown.server.ts';
import { estimateReadingMinutes } from '../../src/lib/reading-time.ts';

const render = (markdown: string) => renderMarkdown(markdown, { locale: 'en' });

describe('Markdown trust boundary', () => {
  it('strips scripts, event handlers, SVG, iframes and dangerous URLs', () => {
    const { html } = render(
      '## Safe\n\n<script>alert(1)</script><iframe src="https://evil.invalid"></iframe><svg onload="alert(1)"></svg><img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29) [external](//evil.invalid) [plain](http://example.com) [good](https://example.com)',
    );
    expect(html).not.toMatch(
      /<script|iframe|<svg|<img|onerror|javascript:|href="\/\/|href="http:/,
    );
    expect(html).toContain('href="https://example.com"');
  });
  it('drops ids, styles and remote images an author injects as raw HTML', () => {
    const { html } = render(
      '## Title\n\n<h2 id="main">Injected</h2><span id="search-input" style="color:red" class="callout" onclick="x()">raw</span><img src="https://evil.test/p.png" alt="x"><a href="#title" id="comments">x</a>',
    );
    expect(html).not.toMatch(
      /id="main"|id="search-input"|id="comments"|style=|onclick|evil\.test/,
    );
    expect(html).toContain('<span>raw</span>');
  });
  it('keeps code inert and preserves tables with header scope in a scroll region', () => {
    const result = render(
      '```html\n<script>alert(1)</script>\n```\n\n| Key | Value |\n| :-- | --: |\n| A | B |',
    );
    // Highlighted markup is escaped text wrapped in spans; no element is created.
    expect(result.html).toContain(
      '&lt;<span class="tok-keyword">script</span>&gt;',
    );
    expect(result.html).not.toMatch(/<script/);
    expect(result.html).toMatch(
      /<div class="table-scroll" role="region" tabindex="0" aria-label="Table"><table>/,
    );
    expect(result.html).toContain(
      '<th scope="col" class="align-left">Key</th>',
    );
    expect(result.html).toContain('<td class="align-right">B</td>');
  });
  it('decodes display entities without turning content into executable markup', () => {
    const result = render('## Platform &amp; API\n\nA &lt; B');
    expect(result.headings[0]?.text).toBe('Platform & API');
    expect(result.text).toContain('A < B');
    expect(result.html).toContain('&amp;');
  });
  it('bounds untrusted document size', () => {
    expect(() => render('a'.repeat(500001))).toThrow('size limit');
  });
});

describe('stable heading anchors', () => {
  it('uses explicit ids, published anchors, then deterministic slugs', () => {
    const result = renderMarkdown(
      '## Intro {#intro}\n\n## 工程原則\n\n## Repeated\n\n## Repeated\n\n## Main',
      {
        locale: 'zh-hant',
        publishedAnchors: [{ id: 'prin-h', text: '工程原則' }],
      },
    );
    expect(result.headings.map((heading) => heading.id)).toEqual([
      'intro',
      'prin-h',
      'repeated',
      'repeated-2',
      // Page chrome owns #main, so the heading gets a stable suffix instead.
      'main-2',
    ]);
    expect(result.headings[0]?.text).toBe('Intro');
    expect(result.html).not.toContain('{#intro}');
  });
  it('keeps inserted headings from renumbering published ones', () => {
    const anchors = [
      { id: 'section-2', text: 'Second' },
      { id: 'section-3', text: 'Third' },
    ];
    const before = renderMarkdown('## Second\n\n## Third', {
      locale: 'en',
      publishedAnchors: anchors,
    });
    const after = renderMarkdown(
      '## New first\n\n## Second\n\n## Inserted\n\n## Third',
      {
        locale: 'en',
        publishedAnchors: anchors,
      },
    );
    const idOf = (result: typeof before, text: string) =>
      result.headings.find((heading) => heading.text === text)?.id;
    expect(idOf(after, 'Second')).toBe(idOf(before, 'Second'));
    expect(idOf(after, 'Third')).toBe(idOf(before, 'Third'));
  });
  it('gives non-Latin headings ASCII ids that stay stable', () => {
    expect(slugifyHeading('量化與推論')).toMatch(/^h-[a-z0-9]+$/);
    expect(slugifyHeading('量化與推論')).toBe(slugifyHeading('量化與推論'));
    expect(slugifyHeading('LLM 架構')).toBe('llm');
  });
});

describe('code, formulas, figures, notes and callouts', () => {
  it('highlights known languages at build time with classes only', () => {
    const { html } = render(
      '```rust title="src/main.rs"\nfn main() { let s = "x"; } // done\n```',
    );
    expect(html).toContain(
      '<span class="code-label" data-entity="file">src/main.rs</span>',
    );
    expect(html).toContain('<span class="tok-keyword">fn</span>');
    expect(html).toContain('<span class="tok-string">&quot;x&quot;</span>');
    expect(html).toContain('data-language="rust"');
    expect(html).not.toContain('style=');
  });
  it('leaves text diagrams and unknown languages as escaped plain text', () => {
    const text = render('```text\nA -> B\n```').html;
    expect(text).toContain('>TEXT</span>');
    expect(text).not.toContain('tok-');
    const unknown = render('```cobol\nMOVE A TO B <x>\n```').html;
    expect(unknown).toContain('MOVE A TO B &lt;x&gt;');
    expect(unknown).not.toContain('data-language');
  });
  it('renders inline and display math with accessible MathML', () => {
    const result = render(
      'Energy $E = mc^2$ and money $5 or $6.\n\n$$\n\\sqrt{x^2} = |x|\n$$',
    );
    expect(result.hasMath).toBe(true);
    expect(result.html).toContain(
      '<math xmlns="http://www.w3.org/1998/Math/MathML">',
    );
    expect(result.html).toContain(
      '<annotation encoding="application/x-tex">E = mc^2</annotation>',
    );
    expect(result.html).toContain('money $5 or $6.');
    expect(result.html).toMatch(
      /<div class="math-block" role="region" tabindex="0" aria-label="Math">/,
    );
    // Stretchy radicals keep their bounded SVG, including case-sensitive viewBox.
    expect(result.html).toMatch(/<svg[^>]*viewBox="0 0 400000/);
  });
  it('shows escaped source instead of errors and never trusts links or HTML in formulas', () => {
    const { html } = render(
      '$$\n\\frac{\n$$\n\n$\\href{javascript:alert(1)}{x}$ $\\htmlClass{evil}{x}$',
    );
    expect(html).toContain(
      '<div class="math-error" role="note"><code>\\frac{</code>',
    );
    expect(html).toContain('This formula could not be rendered.');
    expect(html).not.toMatch(/ParseError|<a |href=|class="evil"/);
  });
  it('bounds formula size', () => {
    const { html } = render(`$$\n${'x+'.repeat(1100)}x\n$$`);
    expect(html).toContain('math-error');
  });
  it('renders footnotes with back references', () => {
    const { html } = render('Claim[^1].\n\n[^1]: Source.');
    expect(html).toContain(
      '<a id="footnote-ref-1" href="#footnote-1" data-footnote-ref aria-describedby="footnote-label">1</a>',
    );
    expect(html).toContain('<li id="footnote-1">');
    expect(html).toContain('aria-label="Back to reference 1"');
  });
  it('renders only the supported callout kinds', () => {
    const { html } = render(
      '> [!WARNING]\n> Check **this**.\n\n> [!DANGER]\n> Plain quote.',
    );
    expect(html).toContain(
      '<aside class="callout callout-warning" role="note" aria-label="Warning">',
    );
    expect(html).toContain('<strong>this</strong>');
    expect(html).toContain('<blockquote>');
  });
});

describe('article images', () => {
  const directory = mkdtempSync(join(tmpdir(), 'markdown-images-'));
  mkdirSync(join(directory, 'images'));
  copyFileSync('assets/favicon.png', join(directory, 'images/diagram.png'));
  afterAll(() => rmSync(directory, { recursive: true, force: true }));
  const assets = { directory, urlPrefix: '/content-assets/posts/fixture/' };
  it('reserves space and keeps real alt text and captions', () => {
    const result = renderMarkdown(
      '![Cache hierarchy](./images/diagram.png "Measured layers")',
      {
        locale: 'en',
        assets,
      },
    );
    expect(result.html).toContain(
      '<figure><img src="/content-assets/posts/fixture/images/diagram.png" alt="Cache hierarchy" width="128" height="128" loading="lazy" decoding="async" /><figcaption>Measured layers</figcaption></figure>',
    );
    expect(result.images).toHaveLength(1);
  });
  it('rejects remote, escaping, missing-alt and unsupported images', () => {
    for (const markdown of [
      '![Remote](https://example.com/x.png)',
      '![Escape](../secret.png)',
      '![](./images/diagram.png)',
      '![Vector](./images/diagram.svg)',
    ])
      expect(
        () => renderMarkdown(markdown, { locale: 'en', assets }),
        markdown,
      ).toThrow();
    expect(() => render('![Profile](./images/diagram.png)')).toThrow(
      'only supported in article content',
    );
  });
});

describe('reading time', () => {
  it('counts CJK by character, Latin by word, and code separately', () => {
    expect(
      estimateReadingMinutes({
        prose: '字'.repeat(900),
        codeLines: 0,
        formulas: 0,
      }),
    ).toBe(2);
    expect(
      estimateReadingMinutes({
        prose: 'word '.repeat(440),
        codeLines: 0,
        formulas: 0,
      }),
    ).toBe(2);
    expect(
      estimateReadingMinutes({ prose: 'short', codeLines: 0, formulas: 0 }),
    ).toBe(1);
    expect(
      estimateReadingMinutes({ prose: 'short', codeLines: 120, formulas: 0 }),
    ).toBe(3);
  });
});
