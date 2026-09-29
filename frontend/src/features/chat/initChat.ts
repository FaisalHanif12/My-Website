/**
 * The chat widget script (reference contact.js chat(), L6709-7016): the floating button with its
 * one-time nudge, the panel, the greeting, the message log, suggestion chips, action buttons and
 * the typing indicator.
 *
 * Answers: with NEXT_PUBLIC_API_URL set the message goes to POST /api/chat (the reference's
 * `FH_HOOKS.chatEndpoint`, 12 second timeout) and any failure falls back to the local keyword
 * answers; without it the local answers are used. Action buttons open the booking modal or move
 * through the page router.
 */
import {
  CHAT_GREETING,
  CHAT_START_CHIPS,
  CHAT_UI,
  type ChatAction,
  type ChatReply,
} from '@/content/chat-knowledge';
import { getFinePointer } from '@/hooks/useFinePointer';
import { API_ENABLED, postChat, type ChatTurn } from '@/lib/api';
import { pageOfId, type PageId } from '@/lib/routes';
import { esc } from '@/lib/strings';

import { fromText, inline, localReply, plain } from './chatEngine';

export interface ChatEnv {
  reduce: boolean;
  /** FH.openBooking(type) with the chat button as the focus return target. */
  openBooking: (type: 'quick' | 'deep', returnFocus: HTMLElement) => void;
  /** FH.go(target). */
  go: (target: string) => void;
  /** The page shown right now (FH.current), or null. */
  currentPage: () => PageId | null;
}

interface BotMessage extends HTMLElement {
  __acts?: ChatAction[];
}

/** Session flag of the one-time nudge (L7007). */
const NUDGE_KEY = 'ct-nudged';

/** Runs the widget in `root` (#ct-chat). Returns the function that stops it. */
export function initChat(root: HTMLElement, env: ChatEnv): () => void {
  const { reduce } = env;
  const disposers: Array<() => void> = [];
  const add = (d: () => void) => disposers.push(d);
  const listen = (
    target: EventTarget,
    type: string,
    fn: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions | boolean,
  ) => {
    target.addEventListener(type, fn, opts);
    add(() => target.removeEventListener(type, fn, opts));
  };
  const timeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    add(() => clearTimeout(id));
    return id;
  };
  const need = <E extends HTMLElement>(s: string): E => {
    const found = root.querySelector<E>(s);
    if (!found) throw new Error('Chat markup is missing ' + s);
    return found;
  };

  const fab = need<HTMLButtonElement>('#ct-chat-fab');
  const panel = need('#ct-chat-panel');
  const log = need('#ct-chat-log');
  const form = need<HTMLFormElement>('#ct-chat-form');
  const input = need<HTMLInputElement>('#ct-chat-input');
  const xBtn = need<HTMLButtonElement>('#ct-chat-x');
  const history: ChatTurn[] = [];
  let greeted = false;
  let isOpen = false;
  let busy = false;
  let typingEl: HTMLElement | null = null;
  let active = true;

  /* ---- rendering (L6874-6905) ---- */
  const scrollLog = () => {
    log.scrollTop = log.scrollHeight;
  };
  function addUser(text: string) {
    const m = document.createElement('div');
    m.className = 'ct-msg ct-msg--me';
    m.innerHTML =
      '<div class="ct-bubble"><span class="sr-only">' +
      esc(CHAT_UI.srYou) +
      '</span>' +
      esc(text) +
      '</div>';
    log.appendChild(m);
    scrollLog();
  }
  function addBot(r: ChatReply): BotMessage {
    const m: BotMessage = document.createElement('div');
    m.className = 'ct-msg ct-msg--bot';
    let h = '<div class="ct-bubble"><span class="sr-only">' + esc(CHAT_UI.srAssistant) + '</span>';
    (r.p || []).forEach((p) => {
      h += '<p>' + inline(p) + '</p>';
    });
    if (r.list) h += '<ul>' + r.list.map((li) => '<li>' + inline(li) + '</li>').join('') + '</ul>';
    (r.p2 || []).forEach((p) => {
      h += '<p>' + inline(p) + '</p>';
    });
    h += '</div>';
    if (r.acts && r.acts.length) {
      h +=
        '<div class="ct-acts">' +
        r.acts
          .map((a, i) => {
            const cls = 'ct-act' + (a.ghost ? ' ct-act--ghost' : '');
            const ic = '<svg class="i" aria-hidden="true"><use href="#' + a.icon + '"/></svg>';
            if (a.href)
              return (
                '<a class="' +
                cls +
                '" href="' +
                esc(a.href) +
                '"' +
                (a.download ? ' download' : '') +
                (a.ext || a.download ? ' target="_blank" rel="noopener"' : '') +
                '>' +
                ic +
                esc(a.label) +
                '</a>'
              );
            return (
              '<button type="button" class="' +
              cls +
              '" data-act="' +
              i +
              '">' +
              ic +
              esc(a.label) +
              '</button>'
            );
          })
          .join('') +
        '</div>';
    }
    if (r.chips && r.chips.length) {
      h +=
        '<div class="ct-chips" role="group" aria-label="' +
        esc(CHAT_UI.chipsLabel) +
        '">' +
        r.chips
          .map((c) => '<button type="button" class="ct-chip">' + esc(c) + '</button>')
          .join('') +
        '</div>';
    }
    m.innerHTML = h;
    m.__acts = r.acts || [];
    log.appendChild(m);
    scrollLog();
    return m;
  }
  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'ct-typing';
    typingEl.setAttribute('aria-hidden', 'true');
    typingEl.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(typingEl);
    scrollLog();
  }
  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  /* ---- answer engine (L6918-6934) ---- */
  async function getReply(text: string): Promise<ChatReply> {
    if (!API_ENABLED) return localReply(text);
    try {
      const r = fromText(await postChat({ message: text, history: history.slice(-12) }));
      const lr = localReply(text);
      if (lr.acts) r.acts = lr.acts;
      return r;
    } catch {
      return localReply(text);
    }
  }
  function send(raw: string) {
    const text = String(raw || '').trim();
    if (!text || busy) return;
    busy = true;
    log.querySelectorAll('.ct-chips').forEach((c) => c.classList.add('ct-chips--used'));
    addUser(text);
    history.push({ role: 'user', content: text });
    input.value = '';
    const t0 = Date.now();
    timeout(showTyping, reduce ? 0 : 220);
    void getReply(text).then((r) => {
      if (!active) return;
      const min = reduce ? 0 : Math.min(1300, 650 + text.length * 8);
      timeout(
        () => {
          hideTyping();
          addBot(r);
          history.push({ role: 'assistant', content: plain(r) });
          busy = false;
        },
        Math.max(0, min - (Date.now() - t0)),
      );
    });
  }
  function greet() {
    greeted = true;
    const day = document.createElement('div');
    day.className = 'ct-chat__day';
    day.setAttribute('aria-hidden', 'true');
    day.textContent = CHAT_UI.day;
    log.appendChild(day);
    showTyping();
    timeout(
      () => {
        hideTyping();
        const r: ChatReply = { p: [CHAT_GREETING], chips: CHAT_START_CHIPS };
        addBot(r);
        history.push({ role: 'assistant', content: plain(r) });
      },
      reduce ? 0 : 650,
    );
  }

  /* ---- actions (L6957-6981) ---- */
  /** Moves through the page router, then runs `after` once the page has settled. */
  function goTo(id: string, after?: () => void) {
    const pg = pageOfId(id);
    const cur = env.currentPage();
    const cross = !!(pg && cur && pg !== cur);
    env.go(id);
    if (after) timeout(after, reduce ? 60 : cross ? 2700 : 900);
  }
  function runAct(a: ChatAction) {
    if (a.act === 'book') {
      close(false);
      env.openBooking(a.type === 'deep' ? 'deep' : 'quick', fab);
      return;
    }
    if (a.act === 'form') {
      close(false);
      goTo('ct-form', () => {
        document.getElementById('ct-name')?.focus({ preventScroll: true });
      });
      return;
    }
    if (a.act === 'scroll' && a.target) {
      if (window.innerWidth < 1024) close(false);
      goTo(a.target.replace(/^#/, ''));
    }
  }
  listen(log, 'click', (e) => {
    const t = e.target as Element;
    const c = t.closest('.ct-chip');
    if (c) {
      send(c.textContent ?? '');
      return;
    }
    const b = t.closest<HTMLElement>('[data-act]');
    if (b) {
      const m = b.closest<BotMessage>('.ct-msg');
      const a = m?.__acts?.[+(b.dataset.act ?? -1)];
      if (a) runAct(a);
    }
  });
  listen(form, 'submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

  /* ---- one-time nudge (L7006-7015) ---- */
  const nudged = () => {
    try {
      sessionStorage.setItem(NUDGE_KEY, '1');
    } catch {
      /* storage blocked */
    }
  };

  /* ---- open / close (L6983-7004) ---- */
  function open() {
    if (isOpen) return;
    isOpen = true;
    root.classList.add('is-open', 'is-read');
    root.classList.remove('is-nudge');
    panel.removeAttribute('inert');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', CHAT_UI.fabCloseLabel);
    nudged();
    if (!greeted) greet();
    timeout(
      () => {
        (getFinePointer() ? input : xBtn).focus({ preventScroll: true });
      },
      reduce ? 0 : 160,
    );
  }
  function close(focusFab: boolean) {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('is-open');
    panel.setAttribute('inert', '');
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', CHAT_UI.fabOpenLabel);
    if (focusFab) fab.focus({ preventScroll: true });
  }
  listen(fab, 'click', () => {
    if (isOpen) close(true);
    else open();
  });
  panel.setAttribute('data-native-scroll', '');
  listen(xBtn, 'click', () => close(true));
  listen(document, 'keydown', (e) => {
    if (
      (e as KeyboardEvent).key === 'Escape' &&
      isOpen &&
      !document.querySelector('.fh-modal.is-open')
    )
      close(true);
  });

  let seen = false;
  try {
    seen = sessionStorage.getItem(NUDGE_KEY) === '1';
  } catch {
    /* storage blocked */
  }
  if (!seen) {
    timeout(() => {
      if (isOpen || document.querySelector('.fh-modal.is-open')) return;
      root.classList.add('is-nudge');
      nudged();
      timeout(() => root.classList.remove('is-nudge'), 5200);
    }, 6000);
  }

  return () => {
    active = false;
    while (disposers.length) disposers.pop()?.();
  };
}
