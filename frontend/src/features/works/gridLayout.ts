/**
 * The editorial grid layout of the Works page (reference works.js plan() and layout(), L7601-7630),
 * as a pure function so the server renders the same layout the script would produce, and the script
 * reuses it when a filter changes the visible cards.
 *
 * A 12 column grid: a trio, a 7/5 pair, a trio, a 5/7 pair ... The PureBody card (data-hero) always
 * comes first at full width, and the featured card is moved into the first 7 column slot.
 */

export interface LayoutInput {
  /** data-hero: the PureBody card, first and full width. */
  hero: boolean;
  /** data-feat: the featured card, moved into a 7 column slot. */
  feat: boolean;
}

export interface Placement {
  /** --span (columns of 12). */
  span: number;
  /** .is-wide on the cell and .wk-card--wide on its card. */
  wide: boolean;
  /** .is-big (a 7 column card). */
  big: boolean;
  /** .is-p5 (a 5 column card). */
  p5: boolean;
  /** .is-odd (the last card of an odd count). */
  odd: boolean;
}

export interface GridLayout {
  /** Input indexes in DOM order. */
  order: number[];
  /** Placement of order[k], same length. */
  place: Placement[];
}

/** plan(n): the column spans for n cards below the hero (L7601-7612). 'w' is one full width card. */
export function plan(n: number): Array<number | 'w'> {
  const rows: Array<Array<number | 'w'>> = [];
  let rem = n;
  let k = 0;
  while (rem > 0) {
    if (rem === 1) {
      rows.push(['w']);
      rem = 0;
    } else if (rem === 2) {
      rows.push(k % 4 === 3 ? [5, 7] : [7, 5]);
      rem = 0;
    } else if (rem === 4) {
      rows.push([7, 5], [5, 7]);
      rem = 0;
    } else if (k % 2 === 0) {
      rows.push([4, 4, 4]);
      rem -= 3;
    } else {
      rows.push(k % 4 === 1 ? [7, 5] : [5, 7]);
      rem -= 2;
    }
    k++;
  }
  return rows.flat();
}

/** layout(vis): order and placements for the visible cards (L7613-7629). */
export function layoutGrid(vis: readonly LayoutInput[]): GridLayout {
  const hero = vis.map((_, i) => i).filter((i) => vis[i].hero);
  const rest = vis.map((_, i) => i).filter((i) => !vis[i].hero);
  const spans = plan(rest.length);
  let fi = -1;
  rest.forEach((idx, i) => {
    if (vis[idx].feat) fi = i;
  });
  const slot = spans.indexOf(7);
  if (fi > -1 && slot > -1 && spans[fi] !== 7) {
    const f = rest.splice(fi, 1)[0];
    rest.splice(slot, 0, f);
  }
  const order = hero.concat(rest);
  const place: Placement[] = [
    ...hero.map(() => ({ span: 12, wide: true, big: false, p5: false, odd: false })),
    ...rest.map((_, i) => {
      const s = spans[i];
      return {
        span: s === 'w' ? 12 : s,
        wide: s === 'w',
        big: s === 7,
        p5: s === 5,
        odd: rest.length % 2 === 1 && i === rest.length - 1,
      };
    }),
  ];
  return { order, place };
}

/**
 * The per row reveal delay (L7638): walking the cards in DATA order, every card starts at column
 * rowX of 12, and its delay is round(rowX / 12 * 3) * 90 ms, so a row cascades left to right.
 * `spanOf(i)` is the --span the layout gave card i.
 */
export function rowDelays(count: number, spanOf: (i: number) => number): number[] {
  let rowX = 0;
  return Array.from({ length: count }, (_, i) => {
    const d = Math.round((rowX / 12) * 3) * 90;
    rowX = (rowX + (spanOf(i) || 4)) % 12;
    return d;
  });
}
