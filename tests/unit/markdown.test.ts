import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  renderMarkdown,
  slugifyHeading,
} from '../../src/lib/markdown.server.ts';
import { estimateReadingMinutes } from '../../src/lib/reading-time.ts';
import { htmlLang, locales } from '../../src/i18n/index.ts';
import { readImageSize } from '../../src/lib/image-size.server.ts';
import type { PostMediaFile } from '../../src/lib/schema.ts';

const render = (markdown: string) => renderMarkdown(markdown, { locale: 'en' });

describe('local video draft boundary', () => {
  const directory = mkdtempSync(join(tmpdir(), 'article-video-'));
  afterAll(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, 'demo.mp4'), 'local video fixture');
  copyFileSync('assets/logo-hero.webp', join(directory, 'demo.webp'));
  symlinkSync(join(directory, 'demo.mp4'), join(directory, 'alias.mp4'));
  const assets = { directory, urlPrefix: '/content-assets/posts/fixture/' };
  const preview = (text: string) =>
    renderMarkdown(text, {
      locale: 'en',
      assets: { ...assets, allowLocalVideos: true },
    });
  it('requires opt-in and creates a controlled, labelled player with a poster', () => {
    const text = '![A short workflow](./demo.mp4 "Watch the workflow")';
    expect(() => renderMarkdown(text, { locale: 'en', assets })).toThrow(
      'draft previews',
    );
    const result = preview(text);
    expect(result.html).toContain('<video controls playsinline preload="none"');
    expect(result.html).toContain('aria-label="A short workflow"');
    expect(result.html).toContain(
      'poster="/content-assets/posts/fixture/demo.webp"',
    );
    expect(result.html).toContain(
      '<figcaption>Watch the workflow</figcaption>',
    );
    expect(result.previewVideos).toHaveLength(1);
    expect(result.images).toHaveLength(1);
    expect(result.html).not.toMatch(/autoplay|loop|onerror/);
  });
  it('rejects external, escaped, linked, missing, unlabelled and inline videos', () => {
    for (const text of [
      '![x](https://example.test/demo.mp4)',
      '![x](../demo.mp4)',
      '![x](%2E%2E/demo.mp4)',
      '![x](./alias.mp4)',
      '![x](./missing.mp4)',
      '![](./demo.mp4)',
      'Inline ![x](./demo.mp4)',
    ])
      expect(() => preview(text)).toThrow();
    const raw = preview(
      '<video src="https://example.test/demo.mp4" autoplay onplay="alert(1)"><source src="x"></video>',
    );
    expect(raw.html).not.toMatch(/<video|<source|autoplay|onplay/);
    expect(raw.previewVideos).toEqual([]);
  });
});

describe('registered article video and subtitle rendering', () => {
  const directory = mkdtempSync(join(tmpdir(), 'registered-article-video-'));
  afterAll(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, 'media'));
  const poster = join(directory, 'media/demo.webp');
  copyFileSync('assets/logo-hero.webp', poster);
  for (const locale of locales)
    writeFileSync(
      join(directory, `media/demo.${locale}.vtt`),
      `WEBVTT\n\n00:00:00.000 --> 00:00:01.000\n${locale} demonstration\n`,
    );
  const media: PostMediaFile = {
    path: 'posts/fixture/media/demo.mp4',
    revision: 'a'.repeat(40),
    bytes: 100,
    sha256: 'b'.repeat(64),
    ...readImageSize(poster),
    seconds: 1,
    audioTracks: 1,
    subtitles: true,
  };
  const assets = {
    directory,
    urlPrefix: '/content-assets/posts/fixture/',
    postMedia: { id: 'fixture', files: [media] },
  };
  const markdown = '![Workflow demonstration](./media/demo.mp4)';
  it('streams registered media without a local MP4 and emits native localized tracks', () => {
    for (const locale of locales) {
      const result = renderMarkdown(markdown, { locale, assets });
      expect(result.html).toContain(`/resolve/${media.revision}/${media.path}`);
      expect(result.html).toContain(`srclang="${htmlLang[locale]}" label=`);
      expect(result.html.match(/ default>/g)).toHaveLength(1);
      expect(result.html).toMatch(
        new RegExp(`srclang="${htmlLang[locale]}" label="[^"]+" default>`),
      );
      expect(result.previewVideos).toEqual([]);
      expect(result.subtitles.map((asset) => asset.url)).toEqual(
        locales.map(
          (language) =>
            `/content-assets/posts/fixture/media/demo.${language}.vtt`,
        ),
      );
      expect(result.images).toHaveLength(1);
      expect(result.html).not.toMatch(/crossorigin|autoplay|<source/);
    }
    for (const change of [
      { path: 'posts/another/media/demo.mp4' },
      { revision: '0'.repeat(40) },
      { width: media.width + 1 },
    ])
      expect(() =>
        renderMarkdown(markdown, {
          locale: 'en',
          assets: {
            ...assets,
            postMedia: { id: 'fixture', files: [{ ...media, ...change }] },
          },
        }),
      ).toThrow();
  });
  it('keeps local draft media and subtitles isolated while rejecting authored tracks', () => {
    writeFileSync(join(directory, 'media/demo.mp4'), 'local draft fixture');
    const draft = { ...media, revision: '0'.repeat(40), seconds: 0 };
    const preview = renderMarkdown(markdown, {
      locale: 'ja',
      assets: {
        ...assets,
        allowLocalVideos: true,
        postMedia: { id: 'fixture', files: [draft] },
      },
    });
    expect(preview.html).toContain(
      'src="/content-assets/posts/fixture/media/demo.mp4"',
    );
    expect(preview.previewVideos).toHaveLength(1);
    expect(preview.subtitles).toHaveLength(3);
    expect(() =>
      renderMarkdown(markdown, {
        locale: 'ja',
        assets: {
          ...assets,
          postMedia: { id: 'fixture', files: [draft] },
        },
      }),
    ).toThrow('placeholder');
    const raw = renderMarkdown(
      '<track kind="subtitles" src="https://evil.test/x.vtt" default>',
      { locale: 'en', assets },
    );
    expect(raw.html).not.toContain('<track');
    expect(raw.subtitles).toEqual([]);
  });
});

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
