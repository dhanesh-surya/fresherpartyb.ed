import { GraduationCap, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { COLLEGE_BRAND, COLLEGE_LOGO_PATH } from '../utils/invitationLogic';

interface TopBarProps {
  juniorName: string | null;
  seniorAdminName: string | null;
  onSwitchJunior: () => void;
  onExitSeniorAdmin: () => void;
}

export function TopBar({
  juniorName,
  seniorAdminName,
  onSwitchJunior,
  onExitSeniorAdmin,
}: TopBarProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E8D5C8] bg-[#FDF8F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 sm:gap-8 sm:px-6">
        <a
          href="#top"
          className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight text-[#7B1633] whitespace-nowrap shrink-0 sm:gap-2.5 sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
        >
          {!logoFailed ? (
            <img
              src={COLLEGE_LOGO_PATH}
              alt="Chaitanya College Education, Pamgarh logo"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
              className="h-8 w-8 object-contain shrink-0"
            />
          ) : (
            <GraduationCap className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <span>{COLLEGE_BRAND.shortName}</span>
        </a>

        {seniorAdminName ? (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onExitSeniorAdmin}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D8B9A6] bg-white px-4 py-2 text-xs font-semibold text-[#2B1820] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#7B1633] hover:text-[#7B1633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Exit Senior Admin</span>
            </button>
          </div>
        ) : juniorName ? (
          <>
            <nav
              aria-label="Invitation sections"
              className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5C3A45]"
            >
              <a
                href="#invitation-card"
                className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#7B1633] hover:underline underline-offset-4"
              >
                Invitation
              </a>
              <a
                href="#event-details"
                className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#7B1633] hover:underline underline-offset-4"
              >
                Event Details
              </a>
              <a
                href="#dress-code"
                className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#7B1633] hover:underline underline-offset-4"
              >
                Dress Code
              </a>
              <a
                href="#thank-you-wall"
                className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#7B1633] hover:underline underline-offset-4"
              >
                Thank You Status
              </a>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onSwitchJunior}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D8B9A6] bg-white px-4 py-2 text-xs font-semibold text-[#2B1820] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#7B1633] hover:text-[#7B1633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Switch Junior</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#junior-login-form"
              className="rounded-lg bg-[#7B1633] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#621028] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
            >
              Junior Login
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
