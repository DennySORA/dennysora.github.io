import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { join, normalize, relative, sep } from 'node:path';
import { htmlLang, localeNames, locales, type Locale } from '../i18n/index.ts';
import {
  postMediaFileSchema,
  postMediaRepository,
  postMediaSchema,
  safeId,
  type PostMediaFile,
} from './schema.ts';

export function loadPostMedia() {
  const bytes = readFileSync(join(process.cwd(), 'data/post-media.json'));
  if (bytes.length > 500_000)
    throw new Error('Post media registry exceeds limit');
  return postMediaSchema.parse(JSON.parse(bytes.toString()) as unknown);
}

/** Draft metadata may be incomplete; no placeholder can become a public URL. */
export function postMediaUrl(input: PostMediaFile): string {
  const file = postMediaFileSchema.parse(input);
  if (
    /^0+$/.test(file.revision) ||
    /^0+$/.test(file.sha256) ||
    file.bytes === 0 ||
    file.width === 0 ||
    file.height === 0 ||
    file.seconds === 0 ||
    file.audioTracks === 0 ||
    (file.subtitles && file.audioTracks !== 1)
  )
    throw new Error(`Post media still has placeholder metadata: ${file.path}`);
  return `${postMediaRepository}/resolve/${file.revision}/${file.path}`;
}

/** A nonempty regular file strictly inside this article, without symlink hops. */
export function postAssetFile(directory: string, path: string): string {
  if (/^[a-z][a-z0-9+.-]*:|^[/\\]|[?#\\]/i.test(path))
    throw new Error('Post media must use an article-relative file');
  const base = realpathSync(directory);
  const file = normalize(join(base, path));
  if (!file.startsWith(base + sep))
    throw new Error('Post media escaped its article');
  let current = base;
  for (const part of relative(base, file).split(sep)) {
    current = join(current, part);
    if (lstatSync(current).isSymbolicLink())
      throw new Error('Post media paths cannot contain symlinks');
  }
  const stat = lstatSync(file);
  if (!stat.isFile() || stat.size === 0)
    throw new Error('Post media must be a nonempty regular file');
  return file;
}

type CueTime = { start: number; end: number };
/** Deliberately small WebVTT subset for plain, non-overlapping narration. */
export function parsePostVtt(bytes: Uint8Array, seconds?: number): CueTime[] {
  if (bytes.length === 0 || bytes.length > 100_000)
    throw new Error('Subtitle file exceeds its size limit or is empty');
  const source = new TextDecoder('utf-8', {
    fatal: true,
    ignoreBOM: true,
  }).decode(bytes);
  if (
    !source.startsWith('WEBVTT\n\n') ||
    source.includes('\r') ||
    source.includes('\0')
  )
    throw new Error('Subtitles require a plain WEBVTT header and LF newlines');
  if (seconds !== undefined && (!Number.isFinite(seconds) || seconds <= 0))
    throw new Error('Subtitle duration must describe a completed video');
  const limit = seconds === undefined ? Infinity : Math.floor(seconds * 1000);
  const blocks = source.slice(8).replace(/\n+$/, '').split('\n\n');
  if (blocks.length > 500) throw new Error('Too many subtitle cues');
  let previousEnd = 0;
  return blocks.map((block) => {
    const [timing = '', ...lines] = block.split('\n');
    const match =
      /^(\d{2}):([0-5]\d):([0-5]\d)\.(\d{3}) --> (\d{2}):([0-5]\d):([0-5]\d)\.(\d{3})$/.exec(
        timing,
      );
    if (!match) throw new Error('Invalid subtitle cue timing');
    const milliseconds = (offset: number) =>
      Number(match[offset]) * 3_600_000 +
      Number(match[offset + 1]) * 60_000 +
      Number(match[offset + 2]) * 1000 +
      Number(match[offset + 3]);
    const start = milliseconds(1);
    const end = milliseconds(5);
    const text = lines.join('\n');
    if (start < previousEnd || end <= start || end > limit)
      throw new Error(
        'Subtitle cue overlaps, reverses or exceeds video duration',
      );
    if (
      lines.length === 0 ||
      lines.some((line) => !line.trim()) ||
      /<|>|&(?!(?:amp|lt|gt);)/.test(text)
    )
      throw new Error('Subtitle cues require nonempty plain text');
    previousEnd = end;
    return { start, end };
  });
}

export function resolvePostSubtitles(
  directory: string,
  urlPrefix: string,
  relativeMp4: string,
  seconds?: number,
): Array<{ source: string; url: string; locale: Locale }> {
  if (!/^\/content-assets\/posts\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(urlPrefix))
    throw new Error('Subtitles require a same-origin article asset prefix');
  if (!/^media\/[a-z0-9]+(?:-[a-z0-9]+)*\.mp4$/.test(relativeMp4))
    throw new Error('Subtitles require a registered article video path');
  let timeline: string | undefined;
  return locales.map((locale) => {
    const path = `${relativeMp4.slice(0, -4)}.${locale}.vtt`;
    const source = postAssetFile(directory, path);
    const cues = parsePostVtt(readFileSync(source), seconds);
    const times = JSON.stringify(cues);
    if (timeline !== undefined && times !== timeline)
      throw new Error('Subtitle editions must use the same cue timeline');
    timeline = times;
    return { source, url: urlPrefix + path, locale };
  });
}

function attributes(
  tag: string,
  name: 'video' | 'track',
  allowed: readonly string[],
) {
  const body = tag.slice(name.length + 1, -1);
  const values = new Map<string, string | null>();
  const attribute = /\s+([a-z][a-z0-9-]*)(?:="([^"]*)")?/gy;
  let cursor = 0;
  while (cursor < body.length) {
    if (!body.slice(cursor).trim()) break;
    attribute.lastIndex = cursor;
    const match = attribute.exec(body);
    const key = match?.[1];
    if (!match || !key || !allowed.includes(key) || values.has(key))
      throw new Error(`Unexpected or duplicate article ${name} attribute`);
    values.set(key, match[2] ?? null);
    cursor = attribute.lastIndex;
  }
  return values;
}

/** Check emitted article players without changing the separate notes policy. */
export function checkPostMediaMarkup(
  id: string,
  locale: Locale,
  html: string,
  files: readonly PostMediaFile[],
): void {
  safeId.parse(id);
  const recorded = new Map(
    files
      .filter((file) => file.path.startsWith(`posts/${id}/`))
      .map((file) => [postMediaUrl(file), file]),
  );
  const players = [...html.matchAll(/(<video\b[^>]*>)([\s\S]*?)<\/video>/g)];
  if (players.length !== (html.match(/<video\b/gi) ?? []).length)
    throw new Error('Malformed article video');
  let trackCount = 0;
  for (const [, tag = '', body = ''] of players) {
    const attrs = attributes(tag, 'video', [
      'controls',
      'playsinline',
      'preload',
      'src',
      'poster',
      'width',
      'height',
      'aria-label',
    ]);
    const file = recorded.get(attrs.get('src') ?? '');
    if (!file) throw new Error('Unrecorded article video');
    const relativeMp4 = file.path.slice(`posts/${id}/`.length);
    const prefix = `/content-assets/posts/${id}/`;
    if (
      attrs.get('controls') !== null ||
      attrs.get('playsinline') !== null ||
      attrs.get('preload') !== 'none' ||
      !attrs.get('aria-label')?.trim() ||
      attrs.get('poster') !== `${prefix}${relativeMp4.slice(0, -4)}.webp` ||
      attrs.get('width') !== String(file.width) ||
      attrs.get('height') !== String(file.height)
    )
      throw new Error('Unsafe or mis-sized article video');
    const tracks = [...body.matchAll(/<track\b[^>]*>/g)];
    if (body.replace(/<track\b[^>]*>/g, '').trim())
      throw new Error('Unexpected article video content');
    if (tracks.length !== (file.subtitles ? locales.length : 0))
      throw new Error('Article video has missing or unexpected subtitles');
    const seen = new Set<Locale>();
    for (const [track] of tracks) {
      const fields = attributes(track, 'track', [
        'kind',
        'src',
        'srclang',
        'label',
        'default',
      ]);
      const language = locales.find(
        (item) => fields.get('srclang') === htmlLang[item],
      );
      if (
        !language ||
        seen.has(language) ||
        fields.get('kind') !== 'subtitles' ||
        fields.get('label') !== localeNames[language] ||
        fields.get('src') !==
          `${prefix}${relativeMp4.slice(0, -4)}.${language}.vtt` ||
        fields.has('default') !== (language === locale) ||
        (fields.has('default') && fields.get('default') !== null)
      )
        throw new Error('Unsafe or incorrectly selected article subtitle');
      seen.add(language);
    }
    trackCount += tracks.length;
  }
  if (trackCount !== (html.match(/<track\b/gi) ?? []).length)
    throw new Error('Subtitle track outside an article video');
}
