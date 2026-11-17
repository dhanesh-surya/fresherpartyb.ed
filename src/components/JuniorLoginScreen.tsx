import { ArrowRight, GraduationCap } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EVENT_INFO, normalizeJuniorName } from '../utils/invitationLogic';

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
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-[1200px] items-center px-6 py-12 lg:py-16">
      <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7B1633]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>{EVENT_INFO.organiser}</span>
          </div>

          <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-[#2B1820] [text-wrap:balance]">
            Enter your good name Junior
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5C3A45]">
            A personal invitation to the <strong className="font-semibold text-[#7B1633]">Fresher Party</strong> awaits inside. Sign in with your name to view the card, event timings, formal dress code, and send your Thank You to the seniors.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6E4B56]">
            <span>{EVENT_INFO.dateDisplay}</span>
            <span aria-hidden="true">·</span>
            <span>{EVENT_INFO.timeDisplay}</span>
            <span aria-hidden="true">·</span>
            <span>{EVENT_INFO.venueDisplay}</span>
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
    </main>
  );
}
