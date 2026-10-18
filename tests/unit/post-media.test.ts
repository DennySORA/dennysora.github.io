import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  htmlLang,
  localeNames,
  locales,
  type Locale,
} from '../../src/i18n/index.ts';
import {
  checkPostMediaMarkup,
  parsePostVtt,
  postMediaUrl,
  resolvePostSubtitles,
} from '../../src/lib/post-media.server.ts';
import {
  postMediaFileSchema,
  postMediaSchema,
  type PostMediaFile,
} from '../../src/lib/schema.ts';

const id = 'media-fixture';
const prefix = `/content-assets/posts/${id}/`;
const repository =
  'https://huggingface.co/datasets/DennySORA/dennysora-site-media';
const video: PostMediaFile = {
  path: `posts/${id}/media/demo.mp4`,
  revision: 'a'.repeat(40),
  bytes: 2048,
  sha256: 'b'.repeat(64),
  width: 1280,
  height: 720,
  seconds: 2,
  audioTracks: 1,
  subtitles: true,
};
const vtt = [
  'WEBVTT',
  '',
  '00:00:00.000 --> 00:00:01.250',
  '開啟設定 &amp; 確認',
  '',
  '00:00:01.250 --> 00:00:02.000',
  'Choose &lt;設定&gt;',
  '次へ進みます。',
  '',
].join('\n');
const roots: string[] = [];

function subtitleFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'post-media-'));
  roots.push(root);
  const directory = join(root, 'article');
  mkdirSync(join(directory, 'media'), { recursive: true });
  for (const locale of locales)
    writeFileSync(join(directory, `media/demo.${locale}.vtt`), vtt);
  return directory;
}

function track(locale: Locale, currentLocale: Locale): string {
  return `<track kind="subtitles" src="${prefix}media/demo.${locale}.vtt" srclang="${htmlLang[locale]}" label="${localeNames[locale]}"${locale === currentLocale ? ' default' : ''}>`;
}

function player(file: PostMediaFile, locale: Locale): string {
  const name = file.path
    .split('/')
    .at(-1)
    ?.replace(/\.mp4$/, '');
  const tracks = file.subtitles
    ? locales.map((language) => track(language, locale)).join('')
    : '';
  return `<video controls playsinline preload="none" src="${repository}/resolve/${file.revision}/${file.path}" poster="${prefix}media/${name}.webp" width="${file.width}" height="${file.height}" aria-label="示範操作">${tracks}</video>`;
}

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('article media contract', () => {
  it('parses plain UTF-8 cues in milliseconds through the final duration boundary', () => {
    const expected = [
      { start: 0, end: 1250 },
      { start: 1250, end: 2000 },
    ];
    expect(parsePostVtt(Buffer.from(vtt), 2.0009)).toEqual(expected);
    // A local preview has no measured final-video duration yet.
    expect(parsePostVtt(Buffer.from(vtt))).toEqual(expected);
  });

  it('rejects malformed, overlapping, out-of-duration and non-plain subtitle cues', () => {
    const invalid: Array<[string, Uint8Array]> = [
      ['header', Buffer.from(vtt.replace('WEBVTT', 'WEBVTT metadata'))],
      ['empty cues', Buffer.from('WEBVTT\n\n')],
      [
        'minute range',
        Buffer.from(vtt.replace('00:00:00.000', '00:60:00.000')),
      ],
      [
        'zero duration',
        Buffer.from(vtt.replace('00:00:01.250', '00:00:00.000')),
      ],
      [
        'overlap',
        Buffer.from(
          vtt.replace(
            '00:00:01.250 --> 00:00:02.000',
            '00:00:01.249 --> 00:00:02.000',
          ),
        ),
      ],
      [
        'past final millisecond',
        Buffer.from(vtt.replace('00:00:02.000', '00:00:02.001')),
      ],
      ['markup', Buffer.from(vtt.replace('開啟設定', '<b>開啟設定</b>'))],
      ['unescaped ampersand', Buffer.from(vtt.replace('&amp;', '&'))],
      [
        'cue identifier',
        Buffer.from(vtt.replace('WEBVTT\n\n', 'WEBVTT\n\ncue-1\n')),
      ],
      [
        'style block',
        Buffer.from(
          vtt.replace(
            'WEBVTT\n\n',
            'WEBVTT\n\nSTYLE\n::cue { color: red }\n\n',
          ),
        ),
      ],
      ['invalid UTF-8', new Uint8Array([0xff, 0xfe])],
    ];
    for (const [name, bytes] of invalid)
      expect(() => parsePostVtt(bytes, 2.0009), name).toThrow();
  });

  it('resolves all three same-origin subtitle editions without reading a video', () => {
    const directory = subtitleFixture();
    const result = resolvePostSubtitles(directory, prefix, 'media/demo.mp4', 2);
    expect(result).toEqual(
      locales.map((locale) => ({
        source: join(realpathSync(directory), `media/demo.${locale}.vtt`),
        url: `${prefix}media/demo.${locale}.vtt`,
        locale,
      })),
    );
  });

  it('rejects escaping or linked subtitle paths, incomplete editions and incompatible timelines', () => {
    const invalid: Array<{
      name: string;
      mutate?: (directory: string) => void;
      path?: string;
      urlPrefix?: string;
    }> = [
      { name: 'path escape', path: '../media/demo.mp4' },
      { name: 'foreign origin', urlPrefix: 'https://foreign.invalid/' },
      { name: 'protocol-relative origin', urlPrefix: '//foreign.invalid/' },
      {
        name: 'linked subtitle',
        mutate(directory) {
          const file = join(directory, 'media/demo.en.vtt');
          rmSync(file);
          symlinkSync(join(directory, 'media/demo.ja.vtt'), file);
        },
      },
      {
        name: 'linked parent directory',
        mutate(directory) {
          renameSync(join(directory, 'media'), join(directory, 'actual-media'));
          symlinkSync(
            join(directory, 'actual-media'),
            join(directory, 'media'),
          );
        },
      },
      {
        name: 'missing edition',
        mutate: (directory) => rmSync(join(directory, 'media/demo.ja.vtt')),
      },
      {
        name: 'different timeline',
        mutate: (directory) =>
          writeFileSync(
            join(directory, 'media/demo.en.vtt'),
            vtt.replace('00:00:02.000', '00:00:01.999'),
          ),
      },
      {
        name: 'oversize UTF-8 file',
        mutate: (directory) =>
          writeFileSync(
            join(directory, 'media/demo.ja.vtt'),
            vtt.replace('次へ進みます。', 'あ'.repeat(34_000)),
          ),
      },
    ];
    for (const { name, mutate, path, urlPrefix } of invalid) {
      const directory = subtitleFixture();
      mutate?.(directory);
      expect(
        () =>
          resolvePostSubtitles(
            directory,
            urlPrefix ?? prefix,
            path ?? 'media/demo.mp4',
            2,
          ),
        name,
      ).toThrow();
    }
  });

  it('limits the registry to article media and prevents placeholders from becoming public URLs', () => {
    const registry = {
      checkedAt: '2026-10-18',
      note: 'Synthetic completed-video fixture.',
      repository,
      files: [video],
    };
    expect(postMediaSchema.parse(registry).files).toEqual([video]);
    expect(postMediaUrl(postMediaFileSchema.parse(video))).toBe(
      `${repository}/resolve/${'a'.repeat(40)}/posts/${id}/media/demo.mp4`,
    );
    for (const invalid of [
      { ...registry, repository: 'https://foreign.invalid/dataset' },
      { ...registry, files: [video, video] },
      {
        ...registry,
        files: [{ ...video, path: 'notes/fixture/media/demo.mp4' }],
      },
      {
        ...registry,
        files: [{ ...video, path: `posts/${id}/../media/demo.mp4` }],
      },
    ])
      expect(postMediaSchema.safeParse(invalid).success).toBe(false);

    // Draft metadata may be stored; the publication boundary must reject it.
    const incomplete: Array<[string, Partial<PostMediaFile>]> = [
      ['revision', { revision: '0'.repeat(40) }],
      ['hash', { sha256: '0'.repeat(64) }],
      ['bytes', { bytes: 0 }],
      ['width', { width: 0 }],
      ['height', { height: 0 }],
      ['duration', { seconds: 0 }],
      ['missing narrated audio', { audioTracks: 0 }],
      ['ambiguous narrated audio', { audioTracks: 2 }],
    ];
    for (const [name, patch] of incomplete)
      expect(() => postMediaUrl({ ...video, ...patch }), name).toThrow();
  });

  it('accepts native players with the current-locale default and an unsubtitled showcase', () => {
    const showcase: PostMediaFile = {
      ...video,
      path: `posts/${id}/media/showcase.mp4`,
    };
    delete showcase.subtitles;
    expect(() => postMediaUrl({ ...showcase, audioTracks: 0 })).toThrow();
    for (const locale of locales)
      expect(() =>
        checkPostMediaMarkup(
          id,
          locale,
          player(video, locale) + player(showcase, locale),
          [video, showcase],
        ),
      ).not.toThrow();
  });

  it('rejects foreign or eager media, arbitrary attributes and incomplete or misplaced tracks', () => {
    const html = player(video, 'en');
    const invalid: Array<[string, string]> = [
      ['foreign video', html.replace(repository, 'https://foreign.invalid')],
      ['eager fetch', html.replace('preload="none"', 'preload="auto"')],
      ['missing controls', html.replace(' controls', '')],
      ['wrong poster', html.replace('demo.webp', 'other.webp')],
      ['wrong dimensions', html.replace('width="1280"', 'width="1"')],
      [
        'arbitrary attribute',
        html.replace('<video ', '<video onplay="alert(1)" '),
      ],
      [
        'foreign subtitle',
        html.replace(
          `${prefix}media/demo.ja.vtt`,
          'https://foreign.invalid/demo.ja.vtt',
        ),
      ],
      [
        'multiple defaults',
        html.replace('label="日本語">', 'label="日本語" default>'),
      ],
      ['wrong current locale', player(video, 'ja')],
      ['missing subtitle', html.replace(track('ja', 'en'), '')],
      ['missing all subtitles', html.replace(/<track\b[^>]*>/g, '')],
      ['orphan subtitle', html + track('ja', 'en')],
    ];
    for (const [name, markup] of invalid)
      expect(
        () => checkPostMediaMarkup(id, 'en', markup, [video]),
        name,
      ).toThrow();
  });
});
