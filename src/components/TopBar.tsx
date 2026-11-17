import { LogOut } from 'lucide-react';

interface TopBarProps {
  juniorName: string | null;
  onSwitchJunior: () => void;
}

export function TopBar({ juniorName, onSwitchJunior }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E8D5C8] bg-[#FDF8F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-[#7B1633] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
        >
          B.Ed. Second Year
        </a>

        {juniorName ? (
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
