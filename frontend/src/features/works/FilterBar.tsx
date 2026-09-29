import type { FilterDef } from '@/content/projects';

/**
 * The segmented filter (reference makeFilter markup, L7484-7486): the sliding indicator, then one
 * button per filter with its label and the count chip. The first button is pressed. The script
 * (wkShared.makeFilter) moves the indicator and reacts to clicks.
 */
export function FilterBar({
  id,
  ariaLabel,
  filters,
  counts,
  countAriaLabel,
}: {
  id: string;
  ariaLabel: string;
  filters: readonly FilterDef<string>[];
  /** Number of items per filter key ('all' is the total). */
  counts: Readonly<Record<string, number>>;
  countAriaLabel: (n: number) => string;
}) {
  return (
    <div className="wk-filter" id={id} role="group" aria-label={ariaLabel}>
      <span className="wk-filter__ind" aria-hidden="true"></span>
      {filters.map((f, i) => (
        <button
          type="button"
          className="wk-fbtn"
          data-k={f.key}
          aria-pressed={i === 0 ? 'true' : 'false'}
          key={f.key}
        >
          {f.label}
          <span className="wk-fbtn__n" aria-label={countAriaLabel(counts[f.key] ?? 0)}>
            {counts[f.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Items per filter key, with 'all' as the total (reference L7483). */
export function countByKey<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = { all: items.length };
  items.forEach((it) => {
    const k = keyOf(it);
    counts[k] = (counts[k] ?? 0) + 1;
  });
  return counts;
}
