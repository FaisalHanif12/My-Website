import { curtainNum, pageById } from '@/content/site';

/**
 * The page transition curtain (reference L3301-3305). Server markup, hidden until the transition
 * provider drives it: it writes #curtainNum and #curtainTitle for the target page and toggles
 * is-on, is-in and is-out on #curtain (CSS L310-333). The static text is only the placeholder the
 * reference ships with; it is rewritten before every transition.
 */
export function Curtain() {
  const placeholder = pageById('profile');
  return (
    <div className="curtain" id="curtain" aria-hidden="true">
      <div className="curtain__layer curtain__layer--a"></div>
      <div className="curtain__layer curtain__layer--b"></div>
      <div className="curtain__label">
        <div className="curtain__inner">
          <span className="curtain__num" id="curtainNum">
            {curtainNum(placeholder)}
          </span>
          <span style={{ overflow: 'hidden', display: 'block', padding: '0 .1em .08em' }}>
            <span className="curtain__title" id="curtainTitle">
              {placeholder.title}
            </span>
          </span>
          <span className="curtain__bar"></span>
        </div>
      </div>
    </div>
  );
}
