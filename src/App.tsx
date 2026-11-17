import { useCallback, useEffect, useState } from 'react';
import { CardLightboxModal } from './components/CardLightboxModal';
import { EventDetailsPanel } from './components/EventDetailsPanel';
import { InvitationCardStage } from './components/InvitationCardStage';
import { JuniorLoginScreen } from './components/JuniorLoginScreen';
import { ThankYouSection } from './components/ThankYouSection';
import { TopBar } from './components/TopBar';
import type { ThankYouRecord } from './types/invitation';
import {
  COLLEGE_BRAND,
  COLLEGE_LOGO_PATH,
  EVENT_INFO,
  normalizeJuniorName,
} from './utils/invitationLogic';
import {
  fetchLedger,
  loginJunior,
  submitThankYou,
} from './utils/thankYouClient';

const STORAGE_KEY = 'bed_fresher_junior_name';

export default function App() {
  const [juniorName, setJuniorName] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'Aarav Sharma';
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const validated = normalizeJuniorName(saved);
    return validated.valid ? validated.name : null;
  });

  const [records, setRecords] = useState<ThankYouRecord[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingThankYou, setIsSendingThankYou] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [thankYouError, setThankYouError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const loadLedger = useCallback(async (activeName: string | null) => {
    setIsLoadingLedger(true);
    try {
      const data = await fetchLedger(activeName);
      setRecords(data.records);
      setThankYouError(null);
    } catch (err) {
      setThankYouError(
        err instanceof Error ? err.message : 'Unable to load status ledger.'
      );
    } finally {
      setIsLoadingLedger(false);
    }
  }, []);

  const handleLogin = useCallback(async (name: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const payload = await loginJunior(name);
      const resolvedName = payload.currentRecord?.name ?? name;
      window.localStorage.setItem(STORAGE_KEY, resolvedName);
      setJuniorName(resolvedName);
      setRecords(payload.records);
      setThankYouError(null);
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Unable to open invitation.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  useEffect(() => {
    if (!juniorName) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      void handleLogin(juniorName);
      return;
    }
    void loadLedger(juniorName);
  }, [juniorName, handleLogin, loadLedger]);

  const handleSendThankYou = async () => {
    if (!juniorName) return;
    setIsSendingThankYou(true);
    setThankYouError(null);
    try {
      const payload = await submitThankYou(juniorName);
      setRecords(payload.records);
    } catch (err) {
      setThankYouError(
        err instanceof Error ? err.message : 'Could not save Thank You hit.'
      );
    } finally {
      setIsSendingThankYou(false);
    }
  };

  const handleSwitchJunior = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setJuniorName(null);
    setLoginError(null);
    setThankYouError(null);
  };

  return (
    <div id="top" className="min-h-screen bg-[#FDF8F5] text-[#2B1820]">
      <TopBar juniorName={juniorName} onSwitchJunior={handleSwitchJunior} />

      {!juniorName ? (
        <JuniorLoginScreen
          onLogin={handleLogin}
          isSubmitting={isLoggingIn}
          serverError={loginError}
        />
      ) : (
        <main className="mx-auto max-w-[1200px] px-6 py-8 lg:py-10">
          <div className="mb-8 flex flex-col items-center gap-3 border-b border-[#E8D5C8] pb-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <img
                src={COLLEGE_LOGO_PATH}
                alt="Chaitanya College Education, Pamgarh Emblem"
                referrerPolicy="no-referrer"
                className="h-14 w-14 object-contain shrink-0"
              />
              <div>
                <p className="font-display text-xl font-bold text-[#7B1633] sm:text-2xl">
                  {COLLEGE_BRAND.eventTitle}
                </p>
                <p className="text-xs font-medium text-[#5C3A45] sm:text-sm">
                  {COLLEGE_BRAND.organizedBy}
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-[#6E4B56] tabular-nums">
              {EVENT_INFO.dateDisplay} · {EVENT_INFO.venueDisplay}
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <InvitationCardStage
                juniorName={juniorName}
                onExpandCard={() => setIsLightboxOpen(true)}
              />
            </div>

            <div className="lg:col-span-7">
              <EventDetailsPanel juniorName={juniorName} />
            </div>
          </div>

          <ThankYouSection
            juniorName={juniorName}
            records={records}
            isLoading={isLoadingLedger}
            isSending={isSendingThankYou}
            errorMessage={thankYouError}
            onSendThankYou={handleSendThankYou}
          />

          <footer className="mt-14 border-t border-[#E8D5C8] pt-6 text-center text-xs text-[#6E4B56]">
            <p>
              {COLLEGE_BRAND.eventTitle} · {COLLEGE_BRAND.organizedBy} ·{' '}
              {EVENT_INFO.dateDisplay} · {EVENT_INFO.venueDisplay}
            </p>
            <p className="mt-1.5">
              Developed by{' '}
              <a
                href="https://dnstechsupport.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7B1633] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
              >
                dnstechsupport.com
              </a>
            </p>
          </footer>
        </main>
      )}

      {juniorName && (
        <CardLightboxModal
          isOpen={isLightboxOpen}
          juniorName={juniorName}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
