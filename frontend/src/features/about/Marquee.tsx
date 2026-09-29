import { Fragment } from 'react';

import { marqueeAriaLabel, marqueeItems } from '@/content/about';

/**
 * div.ab-marquee (reference L3466-3479): a screen reader list, and the visual track with the item
 * set twice so the loop is seamless. Every second item is a serif span, every item is followed by
 * an empty <i>. The drift is driven by initAbout (which adds is-js).
 */
export function Marquee() {
  const set = (
    <div className="ab-marquee__set">
      {marqueeItems.map((item) => (
        <Fragment key={item.label}>
          <span className={item.serif ? 'serif' : undefined}>{item.label}</span>
          <i></i>
        </Fragment>
      ))}
    </div>
  );
  return (
    <div className="ab-marquee" aria-label={marqueeAriaLabel}>
      <ul className="sr-only">
        {marqueeItems.map((item) => (
          <li key={item.label}>{item.label}</li>
        ))}
      </ul>
      <div className="ab-marquee__track" aria-hidden="true">
        {set}
        {set}
      </div>
    </div>
  );
}
