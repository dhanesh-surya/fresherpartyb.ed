import { useCallback, useEffect, useState } from 'react';
import { CardLightboxModal } from './components/CardLightboxModal';
import {
  CelebrationBurst,
  type CelebrationBurstPayload,
} from './components/CelebrationBurst';
import { EventDetailsPanel } from './components/EventDetailsPanel';
import { InvitationCardStage } from './components/InvitationCardStage';
import { JuniorLoginScreen } from './components/JuniorLoginScreen';
import { SeniorAdminDashboard } from './components/SeniorAdminDashboard';
import { SiteFooter } from './components/SiteFooter';
import { ThankYouSection } from './components/ThankYouSection';
import { TopBar } from './components/TopBar';
import type {
  EditableEventConfig,
  ThankYouRecord,
  ThankYouStatus,
} from './types/invitation';
import {
  COLLEGE_LOGO_PATH,
  DEFAULT_EVENT_CONFIG,
  normalizeJuniorName,
} from './utils/invitationLogic';
import {
  adminDeleteJuniorClient,
  adminUpsertJuniorClient,
  fetchEventConfig,
  fetchLedger,
  loginJunior,
  resetEventConfig,
  saveEventConfig,
  submitThankYou,
} from './utils/thankYouClient';

const STORAGE_KEY = 'bed_fresher_junior_name';
const SENIOR_STORAGE_KEY = 'bed_fresher_senior_admin';

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

  const [seniorAdminName, setSeniorAdminName] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = window.localStorage.getItem(SENIOR_STORAGE_KEY);
    if (!saved) return null;
    const validated = normalizeJuniorName(saved);
    return validated.valid ? validated.name : null;
  });

  const [records, setRecords] = useState<ThankYouRecord[]>([]);
  const [eventConfig, setEventConfig] = useState<EditableEventConfig>(
    DEFAULT_EVENT_CONFIG
  );
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingThankYou, setIsSendingThankYou] = useState(false);
  const [isAdminBusy, setIsAdminBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [thankYouError, setThankYouError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [celebrationBurst, setCelebrationBurst] =
    useState<CelebrationBurstPayload | null>(null);

  const triggerBurst = useCallback(
    (mode: 'login' | 'thankyou', label?: string) => {
      const nextId = Date.now();
      setCelebrationBurst({ id: nextId, mode, label });
      window.setTimeout(() => {
        setCelebrationBurst((current) =>
          current?.id === nextId ? null : current
        );
      }, 2400);
    },
    []
  );

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

  useEffect(() => {
    void fetchEventConfig().then(setEventConfig);
  }, []);

  const handleLogin = useCallback(
    async (name: string) => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const payload = await loginJunior(name);
        const resolvedName = payload.currentRecord?.name ?? name;
        window.localStorage.setItem(STORAGE_KEY, resolvedName);
        window.localStorage.removeItem(SENIOR_STORAGE_KEY);
        setSeniorAdminName(null);
        setJuniorName(resolvedName);
        setRecords(payload.records);
        setThankYouError(null);
        triggerBurst(
          'login',
          `🎊 Welcome to ${eventConfig.eventTitle}, ${resolvedName}! 🎉`
        );
      } catch (err) {
        setLoginError(
          err instanceof Error ? err.message : 'Unable to open invitation.'
        );
      } finally {
        setIsLoggingIn(false);
      }
    },
    [eventConfig.eventTitle, triggerBurst]
  );

  useEffect(() => {
    if (seniorAdminName) {
      void loadLedger(null);
      return;
    }
    if (!juniorName) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      void loginJunior(juniorName).then((payload) => {
        setRecords(payload.records);
      });
      return;
    }
    void loadLedger(juniorName);
  }, [juniorName, seniorAdminName, loadLedger]);

  const handleSendThankYou = async () => {
    if (!juniorName) return;
    setIsSendingThankYou(true);
    setThankYouError(null);
    try {
      const payload = await submitThankYou(juniorName);
      setRecords(payload.records);
      triggerBurst('thankyou', `💖 Thank You sent by ${juniorName}! ❤️`);
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

  const handleSeniorLogin = (seniorName: string) => {
    window.localStorage.setItem(SENIOR_STORAGE_KEY, seniorName);
    window.localStorage.removeItem(STORAGE_KEY);
    setJuniorName(null);
    setSeniorAdminName(seniorName);
  };

  const handleExitSeniorAdmin = () => {
    window.localStorage.removeItem(SENIOR_STORAGE_KEY);
    setSeniorAdminName(null);
  };

  const handleAdminUpsertJunior = async (input: {
    targetId?: string;
    name: string;
    hits: number;
    status: ThankYouStatus;
  }) => {
    setIsAdminBusy(true);
    try {
      const payload = await adminUpsertJuniorClient(input);
      setRecords(payload.records);
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleAdminDeleteJunior = async (targetId: string) => {
    setIsAdminBusy(true);
    try {
      const payload = await adminDeleteJuniorClient(targetId);
      setRecords(payload.records);
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleSaveConfig = async (next: EditableEventConfig) => {
    setIsAdminBusy(true);
    try {
      const saved = await saveEventConfig(next);
      setEventConfig(saved);
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleResetConfig = async () => {
    setIsAdminBusy(true);
    try {
      const reset = await resetEventConfig();
      setEventConfig(reset);
    } finally {
      setIsAdminBusy(false);
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#FDF8F5] text-[#2B1820]">
      <TopBar
        juniorName={juniorName}
        seniorAdminName={seniorAdminName}
        onSwitchJunior={handleSwitchJunior}
        onExitSeniorAdmin={handleExitSeniorAdmin}
      />

      <CelebrationBurst burst={celebrationBurst} />

      {seniorAdminName ? (
        <main>
          <SeniorAdminDashboard
            adminName={seniorAdminName}
            records={records}
            eventConfig={eventConfig}
            isBusy={isAdminBusy}
            onUpsertJunior={handleAdminUpsertJunior}
            onDeleteJunior={handleAdminDeleteJunior}
            onSaveEventConfig={handleSaveConfig}
            onResetEventConfig={handleResetConfig}
            onExitAdmin={handleExitSeniorAdmin}
          />
          <div className="mx-auto max-w-[1200px] px-6 pb-8">
            <SiteFooter
              rightSummary={`${eventConfig.eventTitle} · ${eventConfig.organizedBy}`}
            />
          </div>
        </main>
      ) : !juniorName ? (
        <JuniorLoginScreen
          eventConfig={eventConfig}
          onLogin={handleLogin}
          onSeniorLogin={handleSeniorLogin}
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
                  {eventConfig.eventTitle}
                </p>
                <p className="text-xs font-medium text-[#5C3A45] sm:text-sm">
                  {eventConfig.organizedBy}
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-[#6E4B56] tabular-nums">
              {eventConfig.dateDisplay} · {eventConfig.venueDisplay}
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <InvitationCardStage
                juniorName={juniorName}
                eventConfig={eventConfig}
                onExpandCard={() => setIsLightboxOpen(true)}
              />
            </div>

            <div className="lg:col-span-7">
              <EventDetailsPanel
                juniorName={juniorName}
                eventConfig={eventConfig}
              />
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

          <SiteFooter
            rightSummary={`${eventConfig.eventTitle} · ${eventConfig.organizedBy} · ${eventConfig.dateDisplay} · ${eventConfig.venueDisplay}`}
          />
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
