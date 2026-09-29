import { Reveal } from '@/components/motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { budgets, contactFormCopy, projectTypes } from '@/content/contact';

const c = contactFormCopy;

/** The check mark on an option card (span.ct-opt__tick). */
function Tick() {
  return (
    <span className="ct-opt__tick" aria-hidden="true">
      <Icon name="i-check" />
    </span>
  );
}

/** One floating label field with its icon, focus line and error line (reference L4501-4535). */
function Field({
  id,
  name,
  type,
  label,
  required,
  maxLength,
  autoComplete,
  inputMode,
  icon,
  error,
}: {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel';
  label: string;
  required: boolean;
  maxLength: number;
  autoComplete: string;
  inputMode?: 'email' | 'tel';
  icon: IconName;
  error: boolean;
}) {
  return (
    <div className="ct-field">
      <input
        className="ct-input"
        id={id}
        name={name}
        type={type}
        placeholder={c.placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-required={required ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        maxLength={maxLength}
      />
      <label className="ct-flabel" htmlFor={id}>
        {label}
        {required ? (
          <>
            {' '}
            <span className="ct-req" aria-hidden="true">
              {c.requiredMark}
            </span>
          </>
        ) : null}
      </label>
      <Icon name={icon} className="ct-field__ic" aria-hidden="true" />
      <span className="ct-field__line" aria-hidden="true"></span>
      {error ? <p className="ct-err" id={`${id}-err`}></p> : null}
    </div>
  );
}

/**
 * form.ct-form (reference L4494-4593): the fields, the two option groups, the details box with its
 * counter, the send button with its three states, the notes and the done panel. Server markup; the
 * script (initContact.ts) validates, sends and swaps in the done panel.
 *
 * The honeypot `website` field is off screen, hidden from assistive technology and not focusable, so
 * the form looks and behaves exactly like the reference (API_CONTRACT.md: spam protection).
 */
export function ContactForm() {
  const f = c.fields;
  return (
    <Reveal as="form" className="card ct-form" id="ct-form" noValidate>
      <div className="ct-form__inner" id="ct-form-inner">
        <div className="ct-form__head">
          <span className="icon-tile">
            <Icon name={c.headIcon as IconName} />
          </span>
          <div>
            <h3 className="ct-form__title">{c.title}</h3>
            <p className="ct-form__sub">{c.sub}</p>
          </div>
        </div>

        <div className="ct-fields">
          <Field
            id="ct-name"
            name="name"
            type="text"
            label={f.name.label}
            required
            maxLength={f.name.maxLength}
            autoComplete="name"
            icon="i-user"
            error
          />
          <Field
            id="ct-email"
            name="email"
            type="email"
            label={f.email.label}
            required
            maxLength={f.email.maxLength}
            autoComplete="email"
            inputMode="email"
            icon="i-mail"
            error
          />
          <Field
            id="ct-phone"
            name="phone"
            type="tel"
            label={f.phone.label}
            required={false}
            maxLength={f.phone.maxLength}
            autoComplete="tel"
            inputMode="tel"
            icon="i-phone"
            error
          />
          <Field
            id="ct-company"
            name="company"
            type="text"
            label={f.company.label}
            required={false}
            maxLength={f.company.maxLength}
            autoComplete="organization"
            icon="i-building"
            error={false}
          />
        </div>

        <fieldset className="ct-group" id="ct-type" aria-describedby="ct-type-err">
          <legend className="ct-legend">
            {c.typeLegend}{' '}
            <span className="ct-req" aria-hidden="true">
              {c.requiredMark}
            </span>
          </legend>
          <div className="ct-opts ct-opts--type">
            {projectTypes.map((t) => (
              <label className="ct-opt" key={t.value}>
                <input type="radio" name="type" value={t.value} aria-describedby="ct-type-err" />
                <span className="ct-opt__box">
                  <span className="ct-opt__ic">
                    <Icon name={t.icon as IconName} />
                  </span>
                  <span className="ct-opt__t">{t.title}</span>
                  <span className="ct-opt__s">{t.subtitle}</span>
                  <Tick />
                </span>
              </label>
            ))}
          </div>
          <p className="ct-err" id="ct-type-err"></p>
        </fieldset>

        <fieldset className="ct-group" id="ct-budget">
          <legend className="ct-legend">{c.budgetLegend}</legend>
          <div className="ct-opts ct-opts--budget">
            {budgets.map((b) => (
              <label className="ct-opt ct-opt--b" key={b.value}>
                <input type="radio" name="budget" value={b.value} />
                <span className="ct-opt__box">
                  <span className="ct-opt__amt">{b.amount}</span>
                  <span className="ct-opt__s">{b.subtitle}</span>
                  <Tick />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="ct-field ct-field--area">
          <div className="ct-field__box">
            <textarea
              className="ct-input"
              id="ct-details"
              name="details"
              rows={6}
              placeholder={c.placeholder}
              maxLength={f.details.maxLength}
              required
              aria-required="true"
              aria-describedby="ct-details-err ct-details-count"
            ></textarea>
            <label className="ct-flabel" htmlFor="ct-details">
              {f.details.label}{' '}
              <span className="ct-req" aria-hidden="true">
                {c.requiredMark}
              </span>
            </label>
            <span className="ct-field__line" aria-hidden="true"></span>
          </div>
          <div className="ct-field__foot">
            <p className="ct-err" id="ct-details-err"></p>
            <span className="ct-count mono" id="ct-details-count" aria-live="off">
              <span id="ct-details-n">0</span>
              {c.counterSuffix}
            </span>
          </div>
        </div>

        <div className="ct-submit">
          <button type="submit" className="btn btn--primary ct-send" id="ct-send">
            <span className="ct-send__in ct-send__idle">
              <span>{c.send.idle}</span>
              <Icon name={c.send.idleIcon as IconName} aria-hidden="true" />
            </span>
            <span className="ct-send__in ct-send__load" aria-hidden="true">
              <span className="ct-spin"></span>
            </span>
            <span className="ct-send__in ct-send__ok" aria-hidden="true">
              <Icon name={c.send.okIcon as IconName} aria-hidden="true" />
              <span>{c.send.okDefault}</span>
            </span>
          </button>
          <ul className="ct-notes">
            {c.notes.map((n) => (
              <li key={n.text}>
                <Icon name={n.icon as IconName} aria-hidden="true" />
                {n.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="sr-only" id="ct-form-status" role="status" aria-live="polite"></p>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="ct-done" id="ct-done" hidden>
        <svg className="ct-check" viewBox="0 0 88 88" aria-hidden="true">
          <circle className="ct-check__ring" cx="44" cy="44" r="38" />
          <circle className="ct-check__c" cx="44" cy="44" r="38" />
          <path className="ct-check__p" d="M29 45.5l10 10 20-22" />
        </svg>
        <h3 className="ct-done__t" id="ct-done-title" tabIndex={-1}>
          {c.done.titleDefault}
        </h3>
        <p className="ct-done__p" id="ct-done-msg"></p>
        <div className="ct-done__actions">
          <button type="button" className="btn btn--primary" id="ct-again">
            <Icon name={c.done.again.icon as IconName} aria-hidden="true" />
            {c.done.again.label}
          </button>
          <a className="btn btn--ghost" id="ct-mail-direct" href={c.done.direct.href}>
            <Icon name={c.done.direct.icon as IconName} aria-hidden="true" />
            {c.done.direct.label}
          </a>
        </div>
      </div>
    </Reveal>
  );
}
