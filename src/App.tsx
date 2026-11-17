import { useCallback, useEffect, useState } from 'react';
import { CardLightboxModal } from './components/CardLightboxModal';
import { EventDetailsPanel } from './components/EventDetailsPanel';
import { InvitationCardStage } from './components/InvitationCardStage';
import { JuniorLoginScreen } from './components/JuniorLoginScreen';
import { ThankYouSection } from './components/ThankYouSection';
import { TopBar } from './components/TopBar';
import type { ThankYouRecord } from './types/invitation';
import { EVENT_INFO, normalizeJuniorName } from './utils/invitationLogic';
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
        <main className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
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
            {EVENT_INFO.organiser} · {EVENT_INFO.dateDisplay} ·{' '}
            {EVENT_INFO.venueDisplay}
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
