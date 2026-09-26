export type SortMode = 'relevance' | 'latest';
export type LibraryState = {
  q: string;
  topic: string | null;
  type: string | null;
  tags: string[];
  sort: SortMode | null;
  page: number;
};
export type KnownFilters = {
  topics: readonly string[];
  types: readonly string[];
  tags: readonly string[];
};
export type FilterablePost = {
  topics: readonly string[];
  contentType: string;
  tagIds: readonly string[];
};

export const libraryLimits = { query: 160, tags: 5, pageSize: 12 } as const;
export const emptyLibraryState: LibraryState = {
  q: '',
  topic: null,
  type: null,
  tags: [],
  sort: null,
  page: 1,
};

/** Parses shareable Library state; unknown values are dropped rather than trusted. */
export function parseLibraryState(
  params: URLSearchParams,
  known: KnownFilters,
): LibraryState {
  const q = (params.get('q') ?? '').slice(0, libraryLimits.query);
  const topic = params.get('topic');
  const type = params.get('type');
  const tags = [...new Set(params.getAll('tag'))]
    .filter((tag) => known.tags.includes(tag))
    .slice(0, libraryLimits.tags);
  const sort = params.get('sort');
  const page = Number(params.get('page') ?? '1');
  return {
    q,
    topic: topic && known.topics.includes(topic) ? topic : null,
    type: type && known.types.includes(type) ? type : null,
    tags,
    sort: sort === 'relevance' || sort === 'latest' ? sort : null,
    page: Number.isSafeInteger(page) && page > 1 ? page : 1,
  };
}

/** Serializes in a stable order and omits defaults so shared URLs stay short. */
export function serializeLibraryState(state: LibraryState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set('q', state.q.slice(0, libraryLimits.query));
  if (state.topic) params.set('topic', state.topic);
  if (state.type) params.set('type', state.type);
  for (const tag of state.tags) params.append('tag', tag);
  if (state.sort && state.sort !== defaultSort(state))
    params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  return params;
}

export function defaultSort(state: Pick<LibraryState, 'q'>): SortMode {
  return state.q.trim() ? 'relevance' : 'latest';
}
export function effectiveSort(state: LibraryState): SortMode {
  return state.sort ?? defaultSort(state);
}

/** Different dimensions combine with AND; several tags match ANY of them. */
export function matchesFilters(
  post: FilterablePost,
  state: LibraryState,
): boolean {
  return (
    (!state.topic || post.topics.includes(state.topic)) &&
    (!state.type || post.contentType === state.type) &&
    (state.tags.length === 0 ||
      state.tags.some((tag) => post.tagIds.includes(tag)))
  );
}

/** The same semantics expressed with Pagefind's explicit `any` operator. */
export function pagefindFilters(state: LibraryState): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  if (state.topic) filters['topic'] = state.topic;
  if (state.type) filters['type'] = state.type;
  if (state.tags.length) filters['tag'] = { any: [...state.tags] };
  return filters;
}

export function toggleTag(state: LibraryState, tag: string): LibraryState {
  const tags = state.tags.includes(tag)
    ? state.tags.filter((item) => item !== tag)
    : [...state.tags, tag].slice(0, libraryLimits.tags);
  return { ...state, tags, page: 1 };
}

export function paginate<T>(items: readonly T[], page: number) {
  const totalPages = Math.max(
    1,
    Math.ceil(items.length / libraryLimits.pageSize),
  );
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * libraryLimits.pageSize;
  return {
    items: items.slice(start, start + libraryLimits.pageSize),
    page: current,
    totalPages,
  };
}
