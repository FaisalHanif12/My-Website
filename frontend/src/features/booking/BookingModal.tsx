'use client';

import { useCallback, useEffect, useRef } from 'react';

import { BOOKING_MODAL_ID, type BookingPayload } from '@/components/providers/ModalProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import {
  BOOKING_COPY as C,
  BOOKING_EXPECT,
  BOOKING_PLATFORMS,
  BOOKING_SESSIONS,
} from '@/content/booking';
import { getReducedMotion } from '@/hooks/useReducedMotion';

import { initBooking, type BookingController } from './initBooking';

/** The required-field mark, like `<span class="ct-req" aria-hidden="true">*</span>`. */
function Req() {
  return (
    <span className="ct-req" aria-hidden="true">
      {C.requiredMark}
    </span>
  );
}

/** The (Optional) tag. */
function Opt({ children = C.steps.optional }: { children?: string }) {
  return <span className="ct-opt-tag">{children}</span>;
}

function NextButton() {
  return (
    <button type="button" className="btn btn--primary" data-bk-next="">
      {C.steps.next} <Icon name="i-arrow-right" aria-hidden="true" />
    </button>
  );
}

function BackButton() {
  return (
    <button type="button" className="btn btn--ghost" data-bk-prev="">
      <Icon name="i-arrow-left" aria-hidden="true" />
      {C.steps.back}
    </button>
  );
}

/**
 * The booking modal (reference L4609-4834, script L6322-6704): a pick screen, the three step panes
 * and the done screen. The markup is server rendered exactly like the reference; `initBooking`
 * fills the zone list, calendar, slots and recap and runs the flow. `[data-book]` buttons open it
 * through the modal provider with a `{ type }` payload.
 */
export function BookingModal() {
  const controller = useRef<BookingController | null>(null);
  const pending = useRef<BookingPayload | null>(null);
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  });

  useEffect(() => {
    const root = document.getElementById(BOOKING_MODAL_ID);
    if (!root) return;
    const ctl = initBooking(root, {
      reduce: getReducedMotion(),
      toast: (message) => toastRef.current(message),
    });
    controller.current = ctl;
    if (pending.current) {
      ctl.open(pending.current.type);
      pending.current = null;
    }
    return () => {
      ctl.dispose();
      controller.current = null;
    };
  }, []);

  const onOpen = useCallback((payload: unknown) => {
    const type = (payload as BookingPayload | undefined)?.type === 'deep' ? 'deep' : 'quick';
    if (controller.current) controller.current.open(type);
    else pending.current = { type };
  }, []);

  return (
    <Modal
      id={BOOKING_MODAL_ID}
      className="ct-bk"
      labelledBy="ct-bk-t1"
      closeLabel={C.closeLabel}
      panelProps={{ className: 'ct-bk__panel' }}
      onOpen={onOpen}
    >
      <p className="sr-only" id="ct-bk-live" role="status" aria-live="polite"></p>
      <div className="ct-bk__stage" id="ct-bk-stage">
        {/* Screen A: pick a session */}
        <section className="ct-bk__screen" data-screen="pick">
          <header className="ct-bk__head">
            <span className="eyebrow">{C.pick.eyebrow}</span>
            <h2 className="ct-bk__title" id="ct-bk-t1">
              {C.pick.titleA}
              <span className="serif grad-text">{C.pick.titleB}</span>
            </h2>
            <p className="ct-bk__lead">{C.pick.lead}</p>
          </header>

          <div className="ct-bk__pick">
            <div className="ct-bk__main">
              <fieldset className="ct-bk__types">
                <legend className="sr-only">{C.pick.typesLegend}</legend>
                {BOOKING_SESSIONS.map((s) => (
                  <label className="ct-sess" key={s.id}>
                    <input type="radio" name="ct-bk-type" value={s.id} />
                    <span className="ct-sess__box">
                      <span className="ct-sess__top">
                        <span className="ct-sess__ic">
                          <Icon name={s.icon} />
                        </span>
                        <span className="ct-sess__dur mono">{s.dur}</span>
                        <span className="ct-sess__radio" aria-hidden="true"></span>
                      </span>
                      <span className="ct-sess__name">{s.name}</span>
                      <span className="ct-sess__price">
                        <b>${s.price}</b>
                        {C.pick.perSession}
                      </span>
                      <span className="ct-sess__desc">{s.desc}</span>
                      <span className="ct-sess__list">
                        {s.features.map((f) => (
                          <span key={f}>
                            <Icon name="i-check" aria-hidden="true" />
                            {f}
                          </span>
                        ))}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="ct-bk__count">
                <div className="ct-bk__count-txt">
                  <span className="ct-bk__label" id="ct-bk-n-label">
                    {C.pick.countLabel}
                  </span>
                  <span className="ct-bk__hint">{C.pick.countHint}</span>
                </div>
                <div className="ct-stepper" role="group" aria-labelledby="ct-bk-n-label">
                  <button
                    type="button"
                    className="ct-stepper__b"
                    data-bk-step="-1"
                    aria-label={C.pick.removeLabel}
                  >
                    <Icon name="i-minus" />
                  </button>
                  <span className="ct-stepper__v">
                    <output id="ct-bk-n" aria-live="polite">
                      1
                    </output>
                    <span className="ct-stepper__u">{C.pick.stepperUnit}</span>
                  </span>
                  <button
                    type="button"
                    className="ct-stepper__b"
                    data-bk-step="1"
                    aria-label={C.pick.addLabel}
                  >
                    <Icon name="i-plus" />
                  </button>
                </div>
              </div>
            </div>

            <aside className="ct-bk__sum" aria-label={C.pick.summaryAria}>
              <span className="label">{C.pick.summary}</span>
              <dl className="ct-bk__dl">
                <div>
                  <dt>{C.pick.rowType}</dt>
                  <dd id="ct-bk-s-type">{BOOKING_SESSIONS[0].name}</dd>
                </div>
                <div>
                  <dt>{C.pick.rowPrice}</dt>
                  <dd id="ct-bk-s-price">${BOOKING_SESSIONS[0].price}</dd>
                </div>
                <div>
                  <dt>{C.pick.rowCount}</dt>
                  <dd id="ct-bk-s-n">1</dd>
                </div>
              </dl>
              <div className="ct-bk__total">
                <span>{C.pick.total}</span>
                <strong className="ct-bk__total-v" id="ct-bk-s-total">
                  ${BOOKING_SESSIONS[0].price}
                </strong>
              </div>
              <button type="button" className="btn btn--primary ct-bk__go" id="ct-bk-go">
                {C.pick.go} <Icon name="i-arrow-right" aria-hidden="true" />
              </button>
              <p className="ct-bk__fine">
                <Icon name="i-calendar" aria-hidden="true" />
                {C.pick.fine}
              </p>
            </aside>
          </div>

          <div className="ct-bk__expect">
            <h3 className="ct-bk__h3">{C.pick.expectTitle}</h3>
            <ul className="ct-bk__elist">
              {BOOKING_EXPECT.map((x) => (
                <li key={x.title}>
                  <span className="icon-tile icon-tile--soft">
                    <Icon name={x.icon} />
                  </span>
                  <div>
                    <strong>{x.title}</strong>
                    <p>{x.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Screen B: 3 steps */}
        <section className="ct-bk__screen" data-screen="steps" hidden>
          <header className="ct-bk__head ct-bk__head--steps">
            <button type="button" className="ct-bk__change" id="ct-bk-change">
              <Icon name="i-arrow-left" aria-hidden="true" />
              <span>{C.steps.change}</span>
            </button>
            <h2 className="ct-bk__title ct-bk__title--sm" id="ct-bk-t2">
              {C.steps.titleA}
              <span className="serif grad-text">{C.steps.titleB}</span>
            </h2>
            <p className="ct-bk__lead">{C.steps.lead}</p>
          </header>

          <div className="ct-bk__flow">
            <div className="ct-bk__col">
              <div className="ct-steps">
                <div className="ct-steps__line" aria-hidden="true">
                  <span className="ct-steps__fill" id="ct-steps-fill"></span>
                </div>
                <ol className="ct-steps__list" aria-label={C.steps.progressAria}>
                  {C.steps.labels.map((label, i) => (
                    <li className="ct-steps__i" data-si={i + 1} key={label}>
                      <span className="ct-steps__n">
                        <span>{i + 1}</span>
                        <Icon name="i-check" />
                      </span>
                      <span className="ct-steps__l">{label}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="ct-bk__panes" id="ct-bk-panes">
                {/* Step 1 */}
                <div className="ct-pane" data-pane="1">
                  <h3 className="ct-pane__t">{C.steps.p1.title}</h3>
                  <div className="ct-bf">
                    <label className="ct-bf__l" htmlFor="ct-bk-email">
                      {C.steps.p1.email} <Req />
                    </label>
                    <div className="ct-bf__row">
                      <div className="ct-bf__wrap">
                        <input
                          className="ct-bf__in"
                          id="ct-bk-email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          placeholder={C.steps.p1.emailPh}
                          required
                          aria-required="true"
                          aria-describedby="ct-bk-email-hint ct-bk-email-err"
                        />
                        <span className="ct-bf__ok" aria-hidden="true">
                          <Icon name="i-check-circle" />
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--ghost ct-bf__verify"
                        id="ct-bk-verify"
                      >
                        {C.steps.p1.verify}
                      </button>
                    </div>
                    <p className="ct-bf__hint" id="ct-bk-email-hint">
                      <Icon name="i-video" aria-hidden="true" />
                      <span>{C.steps.p1.emailHint}</span>
                    </p>
                    <p className="ct-err" id="ct-bk-email-err" aria-live="polite"></p>
                  </div>
                  <div className="ct-bf">
                    <label className="ct-bf__l" htmlFor="ct-bk-name">
                      {C.steps.p1.name} <Req />
                    </label>
                    <input
                      className="ct-bf__in"
                      id="ct-bk-name"
                      type="text"
                      autoComplete="name"
                      placeholder={C.steps.p1.namePh}
                      required
                      aria-required="true"
                      aria-describedby="ct-bk-name-err"
                    />
                    <p className="ct-err" id="ct-bk-name-err"></p>
                  </div>
                  <div className="ct-bf__two">
                    <div className="ct-bf">
                      <label className="ct-bf__l" htmlFor="ct-bk-phone">
                        {C.steps.p1.phone} <Opt />
                      </label>
                      <input
                        className="ct-bf__in"
                        id="ct-bk-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder={C.steps.p1.phonePh}
                        aria-describedby="ct-bk-phone-hint"
                      />
                      <p className="ct-bf__hint" id="ct-bk-phone-hint">
                        <span>{C.steps.p1.phoneHint}</span>
                      </p>
                    </div>
                    <div className="ct-bf">
                      <label className="ct-bf__l" htmlFor="ct-bk-company">
                        {C.steps.p1.company} <Opt />
                      </label>
                      <input
                        className="ct-bf__in"
                        id="ct-bk-company"
                        type="text"
                        autoComplete="organization"
                        placeholder={C.steps.p1.companyPh}
                        aria-describedby="ct-bk-company-hint"
                      />
                      <p className="ct-bf__hint" id="ct-bk-company-hint">
                        <span>{C.steps.p1.companyHint}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ct-pane__nav">
                    <span></span>
                    <NextButton />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="ct-pane" data-pane="2" hidden>
                  <h3 className="ct-pane__t">{C.steps.p2.title}</h3>
                  <div className="ct-sched">
                    <div className="ct-bf ct-bf--cal">
                      <span className="ct-bf__l" id="ct-cal-label">
                        {C.steps.p2.date} <Req /> <Opt>{C.steps.p2.dateTag}</Opt>
                      </span>
                      <div
                        className="ct-cal"
                        id="ct-cal"
                        role="group"
                        aria-labelledby="ct-cal-label"
                        aria-describedby="ct-bk-date-err"
                      >
                        <div className="ct-cal__head">
                          <button
                            type="button"
                            className="ct-cal__nav"
                            data-cal="-1"
                            aria-label={C.steps.p2.prevMonth}
                          >
                            <Icon name="i-arrow-left" />
                          </button>
                          <span
                            className="ct-cal__month"
                            id="ct-cal-month"
                            aria-live="polite"
                          ></span>
                          <button
                            type="button"
                            className="ct-cal__nav"
                            data-cal="1"
                            aria-label={C.steps.p2.nextMonth}
                          >
                            <Icon name="i-arrow-right" />
                          </button>
                        </div>
                        <div className="ct-cal__dow" aria-hidden="true">
                          {C.steps.p2.dow.map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                        </div>
                        <div className="ct-cal__grid" id="ct-cal-grid"></div>
                      </div>
                      <p className="ct-err" id="ct-bk-date-err"></p>
                    </div>
                    <div className="ct-sched__side">
                      <div className="ct-bf">
                        <label className="ct-bf__l" htmlFor="ct-bk-tz">
                          {C.steps.p2.tz} <Req />
                        </label>
                        <div className="ct-select">
                          <select className="ct-bf__in" id="ct-bk-tz"></select>
                          <Icon name="i-globe" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="ct-bf">
                        <span className="ct-bf__l" id="ct-slots-label">
                          {C.steps.p2.slots} <Req />
                        </span>
                        <div
                          className="ct-slots"
                          id="ct-slots"
                          role="radiogroup"
                          aria-labelledby="ct-slots-label"
                          aria-describedby="ct-slots-hint ct-bk-slot-err"
                        ></div>
                        <p className="ct-bf__hint" id="ct-slots-hint">
                          <Icon name="i-clock" aria-hidden="true" />
                          <span>{C.steps.p2.slotsHint}</span>
                        </p>
                        <p className="ct-err" id="ct-bk-slot-err"></p>
                      </div>
                    </div>
                  </div>
                  <div className="ct-pane__nav">
                    <BackButton />
                    <NextButton />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="ct-pane" data-pane="3" hidden>
                  <h3 className="ct-pane__t">{C.steps.p3.title}</h3>
                  <fieldset className="ct-bf ct-bf--set" aria-describedby="ct-bk-plat-err">
                    <legend className="ct-bf__l">
                      {C.steps.p3.platform} <Req />
                    </legend>
                    <div className="ct-plats">
                      {BOOKING_PLATFORMS.map((p) => (
                        <label className="ct-plat" key={p.value}>
                          <input type="radio" name="ct-bk-plat" value={p.value} />
                          <span className="ct-plat__box">
                            <span className="ct-plat__ic">
                              <Icon name={p.icon} />
                            </span>
                            <span>
                              <strong>{p.title}</strong>
                              <small>{p.sub}</small>
                            </span>
                            <span className="ct-plat__dot" aria-hidden="true"></span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="ct-err" id="ct-bk-plat-err"></p>
                  </fieldset>
                  <div className="ct-bf">
                    <label className="ct-bf__l" htmlFor="ct-bk-notes">
                      {C.steps.p3.notes} <Opt />
                    </label>
                    <textarea
                      className="ct-bf__in ct-bf__ta"
                      id="ct-bk-notes"
                      rows={3}
                      maxLength={C.steps.p3.notesMax}
                      placeholder={C.steps.p3.notesPh}
                      aria-describedby="ct-bk-notes-hint"
                    ></textarea>
                    <p className="ct-bf__hint" id="ct-bk-notes-hint">
                      <span>{C.steps.p3.notesHint}</span>
                    </p>
                  </div>
                  <div className="ct-order" aria-label={C.steps.p3.orderAria}>
                    <span className="label">{C.steps.p3.order}</span>
                    <dl className="ct-recap-dl" data-recap=""></dl>
                  </div>
                  <div className="ct-pane__nav">
                    <BackButton />
                    <button
                      type="button"
                      className="btn btn--primary ct-bk__complete"
                      id="ct-bk-complete"
                    >
                      <span className="ct-bk__cl">{C.steps.p3.complete}</span>
                      <span className="ct-spin" aria-hidden="true"></span>
                      <Icon name="i-check" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="ct-recap" aria-label={C.steps.recapAria}>
              <div className="ct-recap__head">
                <span className="ct-recap__ic" id="ct-recap-ic">
                  <Icon name={BOOKING_SESSIONS[0].icon} />
                </span>
                <div>
                  <strong id="ct-recap-name">{BOOKING_SESSIONS[0].name}</strong>
                  <span className="mono" id="ct-recap-dur">
                    {BOOKING_SESSIONS[0].dur}
                  </span>
                </div>
              </div>
              <dl className="ct-recap-dl" data-recap="short"></dl>
            </aside>
          </div>
        </section>

        {/* Screen C: done */}
        <section className="ct-bk__screen ct-bk__done" data-screen="done" hidden>
          <svg className="ct-check ct-check--lg" viewBox="0 0 88 88" aria-hidden="true">
            <circle className="ct-check__ring" cx="44" cy="44" r="38" />
            <circle className="ct-check__c" cx="44" cy="44" r="38" />
            <path className="ct-check__p" d="M29 45.5l10 10 20-22" />
          </svg>
          <h2 className="ct-bk__title ct-bk__title--sm" id="ct-bk-t3" tabIndex={-1}>
            {C.done.titleDefault}
          </h2>
          <p className="ct-bk__lead ct-bk__done-p" id="ct-bk-done-msg"></p>
          <div className="ct-bk__ticket" id="ct-bk-ticket"></div>
          <div className="ct-bk__done-actions">
            <button type="button" className="btn btn--primary" id="ct-bk-again">
              <Icon name="i-calendar" aria-hidden="true" />
              {C.done.again}
            </button>
            <a className="btn btn--ghost" href={C.done.supportHref}>
              <Icon name="i-mail" aria-hidden="true" />
              {C.done.support}
            </a>
          </div>
        </section>
      </div>
    </Modal>
  );
}
