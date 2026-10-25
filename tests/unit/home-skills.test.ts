import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { loader } from '../../src/app/page.tsx';
import { Readme } from '../../src/features/home/Readme.tsx';
import { dictionaries, locales } from '../../src/i18n/index.ts';
import { loadProfile } from '../../src/lib/content.server.ts';
import { profileSchema } from '../../src/lib/schema.ts';

const series = 'https://ithelp.ithome.com.tw/users/20130205/ironman/3517';

describe('approved skill cards and complete résumé', () => {
  it.each(locales)(
    '%s renders six cards, research limits and working sources without jump CTAs',
    (locale) => {
      const data = loader({
        params: { '*': locale },
      } as unknown as LoaderFunctionArgs);
      if (data.view.kind !== 'home') throw new Error('Expected home');
      const profile = data.view.profile;
      const html = renderToStaticMarkup(
        createElement(Readme, { view: data.view, locale }),
      );
      expect(html.match(/class="capability"/g)).toHaveLength(6);
      expect(html.match(/class="capability-tools"/g)).toHaveLength(6);
      expect(html).not.toContain('href="#experience"');
      expect(html).not.toContain('Rust');
      expect(html).toContain(`href="${series}"`);
      expect(html).toContain(dictionaries[locale].competenciesCaveat);
      expect(profile.competencies.flatMap((card) => card.tools)).not.toContain(
        'Kafka',
      );
      expect(profile.competencies.flatMap((card) => card.tools)).not.toContain(
        'EKS',
      );
      const roles = profile.experience;
      expect(roles.map((entry) => entry.id)).toEqual([
        'naganuma',
        'trend-micro',
        'kkstream',
        'tiantang',
        'ntut',
        'ntsh-competition',
      ]);
      expect(
        roles
          .filter((entry) => entry.kind === 'work')
          .map((entry) =>
            entry.details.reduce(
              (count, group) => count + group.items.length,
              0,
            ),
          ),
      ).toEqual([24, 12, 6]);
      expect(roles.find((entry) => entry.id === 'ntut')).toMatchObject({
        startDate: '2016',
        endDate: '2020',
        current: false,
      });
      expect(
        roles.find((entry) => entry.id === 'ntsh-competition'),
      ).toMatchObject({
        kind: 'award',
        startDate: '2015',
        endDate: null,
        current: false,
      });
      expect(html).toContain('https://www.nkust.edu.tw/p/404-1000-8221.php');
      expect(html).toContain(
        'https://www.ntsh.ntct.edu.tw/ischool/publish_page/6/?cid=191',
      );
      // Native disclosures preserve all work details without requiring hydration.
      expect(
        html.match(/<details class="ln timeline-details fold">/g),
      ).toHaveLength(3);
      expect(html).toContain(dictionaries[locale].showAllWork(24));
    },
  );

  it('accepts source precision without inventing months and rejects malformed dates', () => {
    const profile = loadProfile();
    expect(profileSchema.safeParse(profile).success).toBe(true);
    for (const date of ['2016-00', '2016-13', '2016-01-01', '16']) {
      const candidate = structuredClone(profile);
      candidate.experience[0]!.startDate = date;
      expect(profileSchema.safeParse(candidate).success).toBe(false);
    }
  });
});
