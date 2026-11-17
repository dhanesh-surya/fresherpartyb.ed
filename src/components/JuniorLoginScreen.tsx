import { ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { EditableEventConfig } from '../types/invitation';
import {
  COLLEGE_LOGO_PATH,
  normalizeJuniorName,
  verifySeniorCredentials,
} from '../utils/invitationLogic';
import { SiteFooter } from './SiteFooter';

interface JuniorLoginScreenProps {
  eventConfig: EditableEventConfig;
  onLogin: (name: string) => Promise<void>;
  onSeniorLogin: (seniorName: string) => void;
  isSubmitting: boolean;
  serverError: string | null;
}

export function JuniorLoginScreen({
  eventConfig,
  onLogin,
  onSeniorLogin,
  isSubmitting,
  serverError,
}: JuniorLoginScreenProps) {
  const [loginMode, setLoginMode] = useState<'junior' | 'senior'>('junior');
  const [nameInput, setNameInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const [seniorName, setSeniorName] = useState('');
  const [seniorPasscode, setSeniorPasscode] = useState('');
  const [seniorError, setSeniorError] = useState<string | null>(null);

  const handleJuniorSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = normalizeJuniorName(nameInput);
    if (!result.valid) {
      setValidationError(result.error);
      return;
    }
    setValidationError(null);
    await onLogin(result.name);
  };

  const handleSeniorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const check = verifySeniorCredentials(seniorName, seniorPasscode);
    if (!check.valid) {
      setSeniorError(check.error);
      return;
    }
    setSeniorError(null);
    onSeniorLogin(check.name);
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
          {eventConfig.eventTitle}
        </p>
        <p className="mt-1.5 max-w-2xl text-sm font-semibold text-[#4E2F39] sm:text-base [text-wrap:balance]">
          {eventConfig.organizedBy}
        </p>
      </section>

      <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7B1633]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>{eventConfig.organiser}</span>
          </div>

          <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-[#2B1820] [text-wrap:balance]">
            Enter your good name Junior
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5C3A45]">
            A personal invitation to the{' '}
            <strong className="font-semibold text-[#7B1633]">
              {eventConfig.title}
            </strong>{' '}
            awaits inside. Sign in with your name to view the card, event timings, formal dress code, and send your Thank You to the seniors.
          </p>

          <div className="mt-6">
            <mark className="relative inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 overflow-hidden rounded-md bg-gradient-to-r from-[#F9DFC7] via-[#F7D3DE] to-[#F9DFC7] px-3.5 py-1.5 text-sm font-semibold text-[#5B1025] shadow-xs tabular-nums">
              <span
                aria-hidden="true"
                className="animate-highlight-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
              <span className="relative">{eventConfig.dateDisplay}</span>
              <span aria-hidden="true" className="relative text-[#8C5B2B]">
                ·
              </span>
              <span className="relative">{eventConfig.timeDisplay}</span>
              <span aria-hidden="true" className="relative text-[#8C5B2B]">
                ·
              </span>
              <span className="relative">{eventConfig.venueDisplay}</span>
            </mark>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div
            id="junior-login-form"
            className="rounded-2xl border border-[#E8D5C8] bg-white p-8 shadow-sm sm:p-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1E4DC] pb-4">
              <div>
                <p className="text-xs font-semibold text-[#8C5B2B]">
                  {loginMode === 'junior'
                    ? eventConfig.kicker
                    : 'Department Admin Access'}
                </p>
                <h2 className="mt-0.5 font-display text-2xl font-semibold text-[#2B1820]">
                  {loginMode === 'junior'
                    ? 'Fresher Party Guest Pass'
                    : 'Senior Login (Admin)'}
                </h2>
              </div>

              <div
                role="tablist"
                aria-label="Login mode"
                className="inline-flex items-center gap-1 rounded-lg border border-[#E8D5C8] bg-[#FDF8F5] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMode === 'junior'}
                  onClick={() => setLoginMode('junior')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    loginMode === 'junior'
                      ? 'bg-[#7B1633] text-white'
                      : 'text-[#5C3A45] hover:text-[#2B1820]'
                  }`}
                >
                  Junior Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMode === 'senior'}
                  onClick={() => setLoginMode('senior')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    loginMode === 'senior'
                      ? 'bg-[#7B1633] text-white'
                      : 'text-[#5C3A45] hover:text-[#2B1820]'
                  }`}
                >
                  Senior Login
                </button>
              </div>
            </div>

            {loginMode === 'junior' ? (
              <form onSubmit={handleJuniorSubmit} noValidate className="mt-6">
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
                  aria-describedby={
                    activeError ? 'junior-name-error' : undefined
                  }
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B1633] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#621028] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
                >
                  <span>
                    {isSubmitting ? 'Opening Invitation...' : 'Open Invitation'}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSeniorSubmit} noValidate className="mt-6">
                <div>
                  <label
                    htmlFor="senior-name-input"
                    className="block text-sm font-semibold text-[#2B1820]"
                  >
                    Senior / Organizer Name
                  </label>
                  <input
                    id="senior-name-input"
                    type="text"
                    value={seniorName}
                    onChange={(e) => {
                      setSeniorName(e.target.value);
                      if (seniorError) setSeniorError(null);
                    }}
                    placeholder="e.g. Dhanesh (B.Ed. Second Year)"
                    className="mt-1.5 w-full rounded-xl border border-[#D8B9A6] bg-[#FDF8F5] px-4 py-3 text-base text-[#2B1820] placeholder:text-[#9E7D86] focus:border-[#7B1633] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1633]/20"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="senior-passcode-input"
                    className="block text-sm font-semibold text-[#2B1820]"
                  >
                    Senior Passcode
                  </label>
                  <input
                    id="senior-passcode-input"
                    type="password"
                    value={seniorPasscode}
                    onChange={(e) => {
                      setSeniorPasscode(e.target.value);
                      if (seniorError) setSeniorError(null);
                    }}
                    placeholder="Enter Senior passcode"
                    className="mt-1.5 w-full rounded-xl border border-[#D8B9A6] bg-[#FDF8F5] px-4 py-3 text-base text-[#2B1820] placeholder:text-[#9E7D86] focus:border-[#7B1633] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1633]/20"
                  />
                  {seniorError ? (
                    <p
                      role="alert"
                      className="mt-2 text-sm font-medium text-[#B42318]"
                    >
                      {seniorError}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-[#6E4B56]">
                      Authorized B.Ed. Second Year organizers only. Manage signed-in Juniors, Thank You hits, schedule, and dress code.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B1633] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#621028] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Open Senior Admin</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <SiteFooter
        rightSummary={`${eventConfig.eventTitle} · ${eventConfig.dateDisplay} · ${eventConfig.venueDisplay}`}
      />
    </main>
  );
}
