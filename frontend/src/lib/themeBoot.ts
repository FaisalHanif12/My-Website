import { THEME_COLOR, THEME_KEY } from '@/lib/motion';

/**
 * The inline <head> script that runs before first paint (render it with
 * <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} /> in the root layout).
 *
 * 1. Theme boot, exactly the reference L12-16: the stored fh-theme (read inside try/catch), else
 *    prefers-color-scheme once (no live listener), written to data-theme on <html>.
 * 2. The `js` class on <html> (reference L3226, the first thing in <body>). Every "hidden until
 *    revealed" rule is scoped to .js, so it must be there before paint.
 * 3. Orchestrator decision: a dark first visit also sets meta[name=theme-color] to the dark colour
 *    (browser chrome only; the reference only does this on toggle, L5009). Light keeps the server
 *    value. Every theme-color meta is updated, and if none is parsed yet it retries at
 *    DOMContentLoaded.
 */
export const THEME_BOOT_SCRIPT =
  `(function(){var t=null;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}` +
  `if(!t){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}` +
  `var d=document.documentElement;d.setAttribute('data-theme',t);d.classList.add('js');` +
  `if(t==='dark'){var c=function(){var m=document.querySelectorAll('meta[name=theme-color]');` +
  `for(var i=0;i<m.length;i++)m[i].setAttribute('content','${THEME_COLOR.dark}');return m.length};` +
  `if(!c())document.addEventListener('DOMContentLoaded',c)}})();`;
