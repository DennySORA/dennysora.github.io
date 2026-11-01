import { describe, expect, it } from 'vitest';
import { locales } from '../../src/i18n/index.ts';
import { loadThought } from '../../src/lib/thoughts.server.ts';

describe('Build your own wheels paragraph formatting', () => {
  it.each(locales)('renders seven readable paragraphs in %s', (locale) => {
    const article = loadThought(locale, 'build-your-own-wheels');
    expect(article).not.toBeNull();
    expect(article!.body.html.match(/<p>/g)).toHaveLength(7);
    expect(article!.body.html.match(/<\/p>/g)).toHaveLength(7);
    expect(article!.body.html).not.toMatch(/<pre|<code|<br/);
  });
});
