/** Build-time gating: no draft-specific text is emitted in public lazy chunks. */
export function articleDemoPublication(
  posts: readonly {
    id: string;
    locales: Record<string, { publication: string } | undefined>;
  }[],
) {
  const published = (id: string) =>
    posts.some(
      (post) =>
        post.id === id &&
        Object.values(post.locales).some(
          (edition) => edition?.publication === 'published',
        ),
    );
  return {
    privacy: published('p2p-privacy-boundaries'),
    translation: published('browser-translation-architecture'),
  };
}
