/**
 * The Contact page script, the part after the hero (reference contact.js L6176-6317): the Lahore
 * clock chip on the map card, and the contact form with its validation, the send button states, the
 * submit flow and the done panel.
 *
 * Submit: with NEXT_PUBLIC_API_URL set the message goes to POST /api/contact (the reference's
 * `FH_HOOKS.onContact`); without it the reference mailto flow runs (`viaMail`).
 */
import {
  contactFormCopy,
  contactFormMessages,
  contactFormRules,
  contactMailBody,
  contactMailSubject,
  type ContactMailData,
} from '@/content/contact';
import { API_ENABLED, postContact, type ContactBudget, type ContactProjectType } from '@/lib/api';
import { openMail } from '@/lib/mailto';
import { EMAIL_RE, pad } from '@/lib/strings';
import { morphHeight, wait } from '@/lib/viewMotion';

export interface ContactEnv {
  reduce: boolean;
  toast: (message: string) => void;
}

type Dispose = () => void;

export function initContact(root: HTMLElement, env: ContactEnv): Dispose {
  const { reduce } = env;
  const disposers: Dispose[] = [];
  const add = (d: Dispose) => disposers.push(d);
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
  };
  const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = root) =>
    r.querySelector<E>(s);
  const $$ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = root) =>
    Array.from(r.querySelectorAll<E>(s));

  /* ---- the Lahore clock chip on the map card (L6176-6186) ---- */
  const clockEl = $('#ct-clock');
  if (clockEl) {
    let fmt: Intl.DateTimeFormat | null = null;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      });
    } catch {
      /* no Intl */
    }
    const tick = () => {
      const d = new Date();
      if (fmt) clockEl.textContent = fmt.format(d);
      else {
        const u = new Date(d.getTime() + 5 * 3600e3);
        clockEl.textContent =
          pad(u.getUTCHours()) + ':' + pad(u.getUTCMinutes()) + ':' + pad(u.getUTCSeconds());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    add(() => clearInterval(id));
  }

  /* ---- the contact form (L6188-6317) ---- */
  const form = $<HTMLFormElement>('#ct-form');
  if (form) {
    const inner = $('#ct-form-inner')!;
    const done = $('#ct-done')!;
    const send = $<HTMLButtonElement>('#ct-send')!;
    const status = $('#ct-form-status')!;
    type Key = 'name' | 'email' | 'phone' | 'details';
    const f: Record<Key | 'company', HTMLInputElement & HTMLTextAreaElement> = {
      name: $('#ct-name') as HTMLInputElement & HTMLTextAreaElement,
      email: $('#ct-email') as HTMLInputElement & HTMLTextAreaElement,
      phone: $('#ct-phone') as HTMLInputElement & HTMLTextAreaElement,
      company: $('#ct-company') as HTMLInputElement & HTMLTextAreaElement,
      details: $('#ct-details') as HTMLInputElement & HTMLTextAreaElement,
    };
    const typeGroup = $('#ct-type')!;
    const typeErr = $('#ct-type-err')!;
    const countN = $('#ct-details-n')!;
    const count = $('#ct-details-count')!;
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    const startedAt = Date.now();
    let busy = false;
    const m = contactFormMessages;
    const E = m.errors;

    const rules: Record<Key, (v: string) => string> = {
      name(v) {
        v = v.trim();
        if (!v) return E.nameEmpty;
        if (v.length < contactFormRules.nameMin) return E.nameShort;
        return '';
      },
      email(v) {
        v = v.trim();
        if (!v) return E.emailEmpty;
        if (!EMAIL_RE.test(v)) return E.emailBad;
        return '';
      },
      phone(v) {
        v = v.trim();
        if (v && !contactFormRules.phonePattern.test(v)) return E.phoneBad;
        return '';
      },
      details(v) {
        v = v.trim();
        if (!v) return E.detailsEmpty;
        if (v.length < contactFormRules.detailsMin) return E.detailsShort;
        return '';
      },
    };
    const setErr = (input: HTMLElement, msg: string) => {
      const err = document.getElementById(input.id + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
    };
    const check = (key: Key) => {
      const msg = rules[key](f[key].value);
      setErr(f[key], msg);
      return !msg;
    };
    const typeValue = () => {
      const r = $<HTMLInputElement>('input[name="type"]:checked', form);
      return r ? r.value : '';
    };
    const checkType = () => {
      const ok = !!typeValue();
      typeGroup.classList.toggle('is-invalid', !ok);
      $$<HTMLInputElement>('input[name="type"]', form).forEach((r) =>
        r.setAttribute('aria-invalid', ok ? 'false' : 'true'),
      );
      typeErr.textContent = ok ? '' : E.type;
      return ok;
    };
    (Object.keys(rules) as Key[]).forEach((k) => {
      const el = f[k];
      listen(el, 'blur', () => {
        if (el.value.trim() || el.dataset.touched) check(k);
        el.dataset.touched = '1';
      });
      listen(el, 'input', () => {
        if (el.getAttribute('aria-invalid') === 'true') check(k);
      });
    });
    $$<HTMLInputElement>('input[name="type"]', form).forEach((r) => {
      listen(r, 'change', () => {
        if (typeGroup.classList.contains('is-invalid')) checkType();
      });
    });
    const updateCount = () => {
      const n = f.details.value.length;
      countN.textContent = String(n);
      count.classList.toggle('is-near', n > contactFormCopy.detailsNearAt);
    };
    listen(f.details, 'input', updateCount);
    updateCount();

    /* focus line draws out from where the field was clicked */
    $$('.ct-input', form).forEach((inp) => {
      const line = inp.parentElement?.querySelector<HTMLElement>('.ct-field__line');
      if (!line) return;
      listen(inp, 'pointerdown', ((e: PointerEvent) => {
        const r = inp.getBoundingClientRect();
        line.style.setProperty(
          '--ox',
          Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)).toFixed(1) + '%',
        );
      }) as EventListener);
      listen(inp, 'blur', () => timeout(() => line.style.removeProperty('--ox'), 400));
    });
    /* option cards fill from the pointer (or the icon for keyboard users) */
    $$('.ct-opt', form).forEach((o) => {
      const box = $('.ct-opt__box', o)!;
      listen(o, 'pointerdown', ((e: PointerEvent) => {
        const r = box.getBoundingClientRect();
        box.style.setProperty('--cx', (e.clientX - r.left).toFixed(0) + 'px');
        box.style.setProperty('--cy', (e.clientY - r.top).toFixed(0) + 'px');
      }) as EventListener);
      listen($('input', o)!, 'keydown', () => {
        box.style.removeProperty('--cx');
        box.style.removeProperty('--cy');
      });
    });

    let w0 = 0;
    const setSend = (state: 'idle' | 'load' | 'ok') => {
      if (state === 'idle') {
        send.removeAttribute('data-state');
        send.style.width = '';
        send.disabled = false;
        w0 = 0;
        return;
      }
      if (!w0) {
        w0 = send.offsetWidth;
        send.style.width = w0 + 'px';
        void send.offsetWidth;
      }
      send.dataset.state = state;
      send.disabled = state === 'load';
      send.style.width = state === 'load' ? '58px' : Math.max(w0, 150) + 'px';
    };

    const showDone = (viaMail: boolean, d: ContactMailData) => {
      const first = d.name.trim().split(/\s+/)[0];
      $('#ct-done-title')!.textContent = contactFormCopy.done.title(first);
      $('#ct-done-msg')!.textContent = viaMail
        ? contactFormCopy.done.mailMessage
        : contactFormCopy.done.message(d.email);
      $('#ct-mail-direct')!.hidden = !viaMail;
      const r = form.getBoundingClientRect();
      void morphHeight(
        form,
        () => {
          inner.hidden = true;
          done.hidden = false;
          done.classList.remove('is-drawn');
          void done.offsetWidth;
          done.classList.add('is-drawn');
        },
        700,
      );
      if (r.top < 0) window.scrollBy({ top: r.top - 24, behavior: reduce ? 'auto' : 'smooth' });
      timeout(() => $('#ct-done-title')!.focus({ preventScroll: true }), reduce ? 0 : 400);
    };

    listen(form, 'submit', (e) => {
      e.preventDefault();
      if (busy) return;
      const keys: Key[] = ['name', 'email', 'phone', 'details'];
      const okAll = keys.map(check);
      const okType = checkType();
      const firstBad = (['name', 'email', 'phone'] as const).filter((_, i) => !okAll[i])[0];
      if (firstBad || !okType || !okAll[3]) {
        const target = firstBad
          ? f[firstBad]
          : !okType
            ? $('input[name="type"]', form)!
            : f.details;
        target.focus();
        if (target.scrollIntoView)
          target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        status.textContent = m.status.invalid;
        return;
      }
      const b = $<HTMLInputElement>('input[name="budget"]:checked', form);
      const data: ContactMailData = {
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        company: f.company.value.trim(),
        projectType: typeValue(),
        budget: b ? b.value : '',
        details: f.details.value.trim(),
      };
      busy = true;
      form.setAttribute('aria-busy', 'true');
      setSend('load');
      status.textContent = m.status.sending;
      const viaMail = !API_ENABLED;
      let job: Promise<unknown>;
      if (viaMail) {
        openMail(contactMailSubject(data), contactMailBody(data));
        job = wait(850);
      } else {
        job = Promise.all([
          postContact({
            ...data,
            projectType: data.projectType as ContactProjectType,
            budget: data.budget as ContactBudget,
            website: honeypot?.value ?? '',
            startedAt,
          }),
          wait(500),
        ]);
      }
      void job
        .then(() => {
          $('.ct-send__ok span', form)!.textContent = viaMail
            ? contactFormCopy.send.okMail
            : contactFormCopy.send.okSent;
          setSend('ok');
          status.textContent = viaMail ? m.status.mail : m.status.sent;
          env.toast(viaMail ? m.toasts.mail : m.toasts.sent);
          return wait(900).then(() => showDone(viaMail, data));
        })
        .catch(() => {
          setSend('idle');
          env.toast(m.toasts.failed);
          status.textContent = m.status.failed;
        })
        .then(() => {
          busy = false;
          form.removeAttribute('aria-busy');
        });
    });

    const again = $('#ct-again');
    if (again) {
      listen(again, 'click', () => {
        form.reset();
        updateCount();
        (Object.keys(f) as Array<keyof typeof f>).forEach((k) => {
          setErr(f[k], '');
          delete f[k].dataset.touched;
        });
        typeGroup.classList.remove('is-invalid');
        typeErr.textContent = '';
        $$<HTMLInputElement>('input[name="type"]', form).forEach((r) =>
          r.removeAttribute('aria-invalid'),
        );
        setSend('idle');
        void morphHeight(
          form,
          () => {
            done.hidden = true;
            inner.hidden = false;
          },
          700,
        ).then(() => f.name.focus({ preventScroll: true }));
      });
    }
  }

  return () => {
    while (disposers.length) disposers.pop()?.();
  };
}
