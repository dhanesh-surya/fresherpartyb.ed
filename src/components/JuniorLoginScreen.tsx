import { ArrowRight, GraduationCap } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  COLLEGE_BRAND,
  COLLEGE_LOGO_PATH,
  EVENT_INFO,
  normalizeJuniorName,
} from '../utils/invitationLogic';

interface JuniorLoginScreenProps {
  onLogin: (name: string) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;
}

export function JuniorLoginScreen({
  onLogin,
  isSubmitting,
  serverError,
}: JuniorLoginScreenProps) {
  const [nameInput, setNameInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = normalizeJuniorName(nameInput);
    if (!result.valid) {
      setValidationError(result.error);
      return;
    }
    setValidationError(null);
    await onLogin(result.name);
  };

  const activeError = validationError ?? serverError;

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8 lg:py-12">
      <section
        aria-label="College event masthead"
        className="mb-10 flex flex-col items-center border-b border-[#E8D5C8] pb-8 text-center"
      >
        {!logoFailed ? (
          <img
            src={COLLEGE_LOGO_PATH}
            alt="Chaitanya College Education, Pamgarh Emblem"
            referrerPolicy="no-referrer"
            onError={() => setLogoFailed(true)}
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D8B9A6] bg-white text-[#7B1633]">
            <GraduationCap className="h-9 w-9" aria-hidden="true" />
          </div>
        )}

        <p className="mt-4 font-display text-3xl font-bold tracking-tight text-[#7B1633] sm:text-4xl [text-wrap:balance]">
          {COLLEGE_BRAND.eventTitle}
        </p>
        <p className="mt-1.5 max-w-2xl text-sm font-semibold text-[#4E2F39] sm:text-base [text-wrap:balance]">
          {COLLEGE_BRAND.organizedBy}
        </p>
      </section>

      <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7B1633]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>{EVENT_INFO.organiser}</span>
          </div>

          <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-[#2B1820] [text-wrap:balance]">
            Enter your good name Junior
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5C3A45]">
            A personal invitation to the <strong className="font-semibold text-[#7B1633]">Fresher Party</strong> awaits inside. Sign in with your name to view the card, event timings, formal dress code, and send your Thank You to the seniors.
          </p>

          <div className="mt-6">
            <mark className="relative inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 overflow-hidden rounded-md bg-gradient-to-r from-[#F9DFC7] via-[#F7D3DE] to-[#F9DFC7] px-3.5 py-1.5 text-sm font-semibold text-[#5B1025] shadow-xs tabular-nums">
              <span
                aria-hidden="true"
                className="animate-highlight-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
              <span className="relative">{EVENT_INFO.dateDisplay}</span>
              <span aria-hidden="true" className="relative text-[#8C5B2B]">
                ·
              </span>
              <span className="relative">{EVENT_INFO.timeDisplay}</span>
              <span aria-hidden="true" className="relative text-[#8C5B2B]">
                ·
              </span>
              <span className="relative">{EVENT_INFO.venueDisplay}</span>
            </mark>
          </div>
        </div>

        <div className="lg:col-span-6">
          <form
            id="junior-login-form"
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-[#E8D5C8] bg-white p-8 shadow-sm sm:p-10"
          >
            <p className="text-xs font-semibold text-[#8C5B2B]">
              {EVENT_INFO.kicker}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#2B1820]">
              Fresher Party Guest Pass
            </h2>

            <div className="mt-6">
              <label
                htmlFor="junior-name-input"
                className="block text-sm font-semibold text-[#2B1820]"
              >
                Enter your good name Junior
              </label>
              <input
                id="junior-name-input"
                name="juniorName"
                type="text"
                autoComplete="name"
                autoFocus
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Riya Sharma"
                aria-invalid={Boolean(activeError)}
                aria-describedby={activeError ? 'junior-name-error' : undefined}
                className="mt-2 w-full rounded-xl border border-[#D8B9A6] bg-[#FDF8F5] px-4 py-3 text-base text-[#2B1820] placeholder:text-[#9E7D86] transition-colors duration-150 focus:border-[#7B1633] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1633]/20"
              />
              {activeError ? (
                <p
                  id="junior-name-error"
                  role="alert"
                  className="mt-2 text-sm font-medium text-[#B42318]"
                >
                  {activeError}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[#6E4B56]">
                  Your name personalizes the invitation card and records your Thank You status.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B1633] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#621028] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
            >
              <span>{isSubmitting ? 'Opening Invitation...' : 'Open Invitation'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      <footer className="mt-14 border-t border-[#E8D5C8] pt-6 text-center text-xs text-[#6E4B56]">
        <span>{COLLEGE_BRAND.eventTitle}</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>
          Developed by{' '}
          <a
            href="https://dnstechsupport.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#7B1633] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
          >
            dnstechsupport.com
          </a>
        </span>
      </footer>
    </main>
  );
}
